import { streamText, StreamData } from 'ai';
import { agentTools } from './lib/tools';
import { llm } from './lib/openrouter';

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are a helpful shopping assistant for Cozip store.
You help customers find products, track orders, manage their cart, and answer questions about the store.

STORE POLICIES:
- All prices are in Pakistani Rupees (PKR / Rs).
- Delivery charge: Rs 250 flat rate. FREE delivery on orders above Rs 2,000.
- Payment methods: Cash on Delivery (COD) or Stripe (card).
- COD orders include a 4% government tax on (subtotal + delivery charge). Stripe/card orders have no tax.
- Estimated delivery: 5 business days.

RULES:
- ALWAYS use tools to get real data. Never invent product names, prices, order numbers, or stock levels.
- For ANY product search or recommendation request, call the search_products or get_recommendations tool.
- For order inquiries, ALWAYS call track_order — never guess order status.
- For cart actions, call modify_cart. Always confirm the action was successful before telling the user.
- For shipping/returns/refund questions, call answer_faq first.
- Keep responses concise, friendly, and under 3 sentences unless showing a product list.
- When showing products, format each as: **Name** — Rs [Price] ([category])
- If a user is not logged in (no user_id in context), tell them to log in for cart/order features.
- NEVER wrap your response in XML tags like <response>, <thinking>, or similar. Just write the response directly.
- Use markdown formatting: **bold** for emphasis, bullet lists for multiple items.`;

// ---------------------------------------------------------------------------
// CORS headers (for local dev + cross-origin requests)
// ---------------------------------------------------------------------------
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ---------------------------------------------------------------------------
// Edge runtime for low-latency streaming
// Note: tool executions that use @xenova/transformers (vector search) will
// automatically fall back to keyword search when running on Edge — the
// try/catch in agentTools.search_products handles this gracefully.
// ---------------------------------------------------------------------------
// Run on Node.js runtime (not Edge) — tools use @xenova/transformers which
// requires Node built-ins (fs, path, etc.) unavailable in Edge runtime.
export const config = { runtime: 'nodejs' };

export default async function POST(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const streamData = new StreamData();

  try {
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.messages)) {
      streamData.close();
      return new Response(JSON.stringify({ error: 'Invalid request body — messages[] required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const { messages, userId, cartItemIds } = body as {
      messages: import('ai').CoreMessage[];
      userId?: string;
      cartItemIds?: string[];
    };

    // Inject user context into system prompt so the LLM knows login state
    const systemWithContext = userId
      ? `${SYSTEM_PROMPT}\n\nCURRENT USER: logged in (user_id: ${userId}).${
          cartItemIds?.length
            ? ` Cart item IDs: ${cartItemIds.join(', ')}.`
            : ' Cart is empty.'
        }`
      : `${SYSTEM_PROMPT}\n\nCURRENT USER: not logged in. Remind them to log in for cart and order features.`;

    // Keep only the last 10 messages to reduce token usage
    const trimmedMessages = messages.slice(-10);

    const result = streamText({
      model: llm,
      system: systemWithContext,
      messages: trimmedMessages,
      tools: agentTools,
      maxSteps: 3,
      maxTokens: 512,
      temperature: 0.3, // lower = faster, more deterministic
      onError: ({ error }) => {
        console.error('[api/chat] streamText error:', error);
      },
      onFinish: async ({ steps }) => {
        try {
          // Walk every step's tool results looking for CART_UPDATED events
          for (const step of steps) {
            for (const toolResult of (step as { toolResults?: { result: unknown }[] }).toolResults ?? []) {
              const res = toolResult.result as Record<string, unknown> | null;
              if (res?.__event === 'CART_UPDATED') {
                streamData.append({ type: 'CART_UPDATED', ...res });
              }
            }
          }
        } catch (err) {
          console.error('[api/chat] onFinish error:', err);
        } finally {
          streamData.close();
        }
      },
    });

    return result.toDataStreamResponse({ data: streamData, headers: CORS_HEADERS });
  } catch (e) {
    const err = e as Error;
    console.error('[api/chat] Error:', err.message);
    streamData.close();
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}
