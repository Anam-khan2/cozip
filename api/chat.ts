import { streamText, StreamData } from 'ai';
import { agentTools } from './lib/tools';
import { llm } from './lib/openrouter';

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are a helpful shopping assistant for Cozip store.
You help customers find products, track orders, manage their cart, and answer questions about the store.

RULES:
- ALWAYS use tools to get real data. Never invent product names, prices, order numbers, or stock levels.
- For ANY product search or recommendation request, call the search_products or get_recommendations tool.
- For order inquiries, ALWAYS call track_order — never guess order status.
- For cart actions, call modify_cart. Always confirm the action was successful before telling the user.
- For shipping/returns/refund questions, call answer_faq first.
- Keep responses concise, friendly, and under 3 sentences unless showing a product list.
- When showing products, format each as: [Name] — $[Price] ([category])
- If a user is not logged in (no user_id in context), tell them to log in for cart/order features.`;

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
export const config = { runtime: 'edge' };

export default async function POST(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  try {
    const { messages, userId, cartItemIds } = (await req.json()) as {
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

    const streamData = new StreamData();

    const result = streamText({
      model: llm,
      system: systemWithContext,
      messages,
      tools: agentTools,
      maxSteps: 5,
      onFinish: async ({ steps }) => {
        // Walk every step's tool results looking for CART_UPDATED events
        for (const step of steps) {
          for (const toolResult of (step as { toolResults?: { result: unknown }[] }).toolResults ?? []) {
            const res = toolResult.result as Record<string, unknown> | null;
            if (res?.__event === 'CART_UPDATED') {
              streamData.append({ type: 'CART_UPDATED', ...res });
            }
          }
        }
        streamData.close();
      },
    });

    return result.toDataStreamResponse({ data: streamData, headers: CORS_HEADERS });
  } catch (e) {
    const err = e as Error;
    console.error('[api/chat] Error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}
