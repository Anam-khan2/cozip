import { createOpenAI } from '@ai-sdk/openai';

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('Missing OPENROUTER_API_KEY environment variable.');
}

/**
 * OpenAI-compatible provider pointed at OpenRouter.
 * Model is configured via OPENROUTER_MODEL env var (default: "openrouter/auto").
 * The free tier uses models with a `:free` suffix on OpenRouter, e.g.
 * "meta-llama/llama-3.1-8b-instruct:free". Setting OPENROUTER_MODEL=openrouter/auto
 * lets OpenRouter pick the best available model automatically.
 */
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://cozip.vercel.app',
    'X-Title': 'Cozip',
  },
});

export const MODEL_ID = process.env.OPENROUTER_MODEL ?? 'openrouter/auto';

/**
 * Pre-configured LLM instance ready for use with the Vercel AI SDK.
 *
 * Usage:
 *   import { llm } from '../lib/openrouter';
 *   const result = await generateText({ model: llm, prompt: '...' });
 */
export const llm = openrouter(MODEL_ID);
