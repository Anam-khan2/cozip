import { tool } from 'ai';
import { z } from 'zod';
import { supabaseAdmin } from './supabaseServer';
import { generateEmbedding } from './embeddings';

// ---------------------------------------------------------------------------
// Confirmation gate helper
// ---------------------------------------------------------------------------
// For any tool that mutates data (modify_cart), the user must explicitly
// confirm the action before it is persisted. When `confirmed !== true` the
// tool returns a CONFIRM_REQUIRED event instead of writing to the database.
// The LLM must present the confirmation prompt to the user (with Yes / No
// buttons in the UI), and only call the tool again with `confirmed: true`
// after the user approves.
// ---------------------------------------------------------------------------

export const agentTools = {
  // -------------------------------------------------------------------------
  // TOOL 1 — search_products
  // -------------------------------------------------------------------------
  search_products: tool({
    description:
      'Search for products by name, description, category, price range, or any feature. Always use this tool when user asks to find, show, browse, or look for products.',
    parameters: z.object({
      query: z.string(),
      filters: z
        .object({
          category: z.string().optional(),
          min_price: z.number().optional(),
          max_price: z.number().optional(),
          in_stock: z.boolean().optional(),
        })
        .optional(),
      limit: z.number().int().min(1).max(10).default(5),
    }),
    execute: async ({ query, filters, limit }) => {
      try {
        const embedding = await generateEmbedding(query);

        // Only attempt vector search when embeddings are available (local dev)
        if (embedding !== null) {
          const { data, error } = await supabaseAdmin.rpc('search_products_by_vector', {
            query_vector: JSON.stringify(embedding),
            similarity_threshold: 0.25,
            result_limit: limit,
            filter_category: filters?.category ?? null,
            filter_min_price: filters?.min_price ?? null,
            filter_max_price: filters?.max_price ?? null,
            filter_in_stock: filters?.in_stock ?? null,
          });

          if (!error && data && data.length > 0) {
            return { products: data, count: data.length };
          }
        }

        // Fallback: text-based search (always used on Vercel; also used when vector returns nothing)
        console.warn('[search_products] Using keyword fallback.');
        const { data: fallbackData } = await supabaseAdmin
          .from('products')
          .select('id,name,price,category,stock,images,is_featured')
          .ilike('name', `%${query}%`)
          .limit(limit);

        return { products: fallbackData ?? [], count: fallbackData?.length ?? 0, fallback: true };
      } catch (err) {
        console.error('[search_products] Error:', err);

        // Always fall back to text search on any exception
        const { data: fallbackData } = await supabaseAdmin
          .from('products')
          .select('id,name,price,category,stock,images,is_featured')
          .ilike('name', `%${query}%`)
          .limit(limit);

        return { products: fallbackData ?? [], count: fallbackData?.length ?? 0, fallback: true };
      }
    },
  }),

  // -------------------------------------------------------------------------
  // TOOL 2 — get_recommendations
  // -------------------------------------------------------------------------
  get_recommendations: tool({
    description:
      "Get product recommendations. Use when user asks for suggestions, trending items, popular products, or 'what should I buy'.",
    parameters: z.object({
      strategy: z.enum(['trending', 'new_arrivals', 'featured']).default('featured'),
      category: z.string().optional(),
      limit: z.number().int().default(4),
    }),
    execute: async ({ strategy, category, limit }) => {
      try {
        let query = supabaseAdmin
          .from('products')
          .select('id,name,price,category,stock,images,is_featured');

        if (category) query = query.ilike('category', `%${category}%`);

        if (strategy === 'featured') {
          query = query.eq('is_featured', true).gt('stock', 0);
        } else if (strategy === 'trending') {
          query = query.gt('stock', 0).order('created_at', { ascending: false });
        } else {
          // new_arrivals
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query.limit(limit);

        if (error) {
          console.error('[get_recommendations] Error:', error.message);
          return { recommendations: [], strategy, error: error.message };
        }

        return { recommendations: data ?? [], strategy };
      } catch (err) {
        console.error('[get_recommendations] Unhandled error:', err);
        return { recommendations: [], strategy };
      }
    },
  }),

  // -------------------------------------------------------------------------
  // TOOL 3 — track_order
  // -------------------------------------------------------------------------
  track_order: tool({
    description:
      'Look up order status and tracking details. Use when user mentions their order number, asks where their order is, or asks about delivery.',
    parameters: z.object({
      order_number: z
        .string()
        .optional()
        .describe('Order number like ORD-XXXXX'),
      user_id: z.string().optional(),
    }),
    execute: async ({ order_number, user_id }) => {
      try {
        if (order_number) {
          const { data, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('order_number', order_number)
            .single();

          if (error || !data) return { error: 'Order not found' };
          return { order: data };
        }

        if (user_id) {
          const { data, error } = await supabaseAdmin
            .from('orders')
            .select('order_number,status,total,created_at,items')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false })
            .limit(5);

          if (error) return { error: error.message };
          return { orders: data ?? [] };
        }

        return { error: 'Provide either order_number or user_id to look up an order.' };
      } catch (err) {
        console.error('[track_order] Unhandled error:', err);
        return { error: 'Failed to retrieve order information.' };
      }
    },
  }),

  // -------------------------------------------------------------------------
  // TOOL 4 — modify_cart
  // -------------------------------------------------------------------------
  // Confirmation gate: every mutating action requires the user to approve
  // before it is persisted. When `confirmed` is false/undefined, the tool
  // returns __event: 'CONFIRM_REQUIRED' with a human-readable question.
  // The frontend must render Yes / No buttons; only on "Yes" does the LLM
  // call this tool again with confirmed: true.
  // -------------------------------------------------------------------------
  modify_cart: tool({
    description:
      "Add items to cart, remove items from cart, or update item quantities. Use when user says 'add to cart', 'remove', 'delete from cart', or 'change quantity'. Always ask for confirmation before making changes.",
    parameters: z.object({
      action: z.enum(['add', 'remove', 'update_quantity']),
      product_id: z.string().optional(),
      quantity: z.number().int().positive().optional(),
      cart_item_id: z.string().optional(),
      user_id: z.string(),
      /** Must be true for the mutation to be persisted. Request confirmation first. */
      confirmed: z.boolean().optional(),
    }),
    execute: async ({ action, product_id, quantity, cart_item_id, user_id, confirmed }) => {
      // --- Confirmation gate ---
      if (!confirmed) {
        const actionSummary =
          action === 'add'
            ? `add ${quantity ?? 1} × product to your cart`
            : action === 'remove'
              ? 'remove this item from your cart'
              : `update the quantity to ${quantity}`;

        return {
          __event: 'CONFIRM_REQUIRED',
          question: `Do you want me to ${actionSummary}?`,
          pendingAction: { action, product_id, quantity, cart_item_id, user_id },
        };
      }

      // --- Persist the change ---
      try {
        if (action === 'add') {
          const { error } = await supabaseAdmin.from('cart_items').upsert(
            { user_id, product_id, quantity: quantity ?? 1 },
            { onConflict: 'user_id,product_id' },
          );
          if (error) return { success: false, action, error: error.message };
        } else if (action === 'remove') {
          const { error } = await supabaseAdmin
            .from('cart_items')
            .delete()
            .eq('id', cart_item_id as string)
            .eq('user_id', user_id);
          if (error) return { success: false, action, error: error.message };
        } else if (action === 'update_quantity') {
          const { error } = await supabaseAdmin
            .from('cart_items')
            .update({ quantity })
            .eq('id', cart_item_id as string)
            .eq('user_id', user_id);
          if (error) return { success: false, action, error: error.message };
        }

        // Fetch updated cart to reflect state in UI
        const { data: cartData } = await supabaseAdmin
          .from('cart_items')
          .select('id,product_id,quantity')
          .eq('user_id', user_id);

        return {
          success: true,
          action,
          __event: 'CART_UPDATED',
          updatedCart: {
            items: cartData ?? [],
            itemCount: cartData?.length ?? 0,
          },
        };
      } catch (err) {
        console.error('[modify_cart] Unhandled error:', err);
        return { success: false, action, error: 'Failed to modify cart.' };
      }
    },
  }),

  // -------------------------------------------------------------------------
  // TOOL 5 — answer_faq
  // -------------------------------------------------------------------------
  answer_faq: tool({
    description:
      'Answer questions about shipping, returns, refunds, payment, store policies, or account issues. Check the FAQ database first.',
    parameters: z.object({
      question: z.string().describe("The user's exact question"),
      topic: z
        .enum(['shipping', 'returns', 'refunds', 'payment', 'account', 'general'])
        .optional(),
    }),
    execute: async ({ question, topic }) => {
      try {
        const { data, error } = await supabaseAdmin
          .from('faqs')
          .select('question,answer')
          .limit(20);

        if (error) {
          console.error('[answer_faq] Error fetching FAQs:', error.message);
          return { answer: null, topic, allFaqs: [] };
        }

        if (!data || data.length === 0) {
          return { answer: null, topic, allFaqs: [] };
        }

        // Keyword relevance scoring — find the best matching FAQ entry
        const queryKeywords = question
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 3);

        let bestMatch: { question: string; answer: string } | null = null;
        let bestScore = 0;

        for (const faq of data) {
          const haystack = `${faq.question} ${faq.answer}`.toLowerCase();
          const score = queryKeywords.filter((kw) => haystack.includes(kw)).length;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = faq;
          }
        }

        // Only use the DB answer if at least 1 keyword matched
        const answer = bestScore > 0 ? (bestMatch?.answer ?? null) : null;

        return { answer, topic, allFaqs: data };
      } catch (err) {
        console.error('[answer_faq] Unhandled error:', err);
        return { answer: null, topic, allFaqs: [] };
      }
    },
  }),
};

export type AgentTools = typeof agentTools;
