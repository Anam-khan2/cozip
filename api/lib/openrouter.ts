import { createOpenAI } from '@ai-sdk/openai';

// Do NOT throw at module load time — a module-level throw causes
// FUNCTION_INVOCATION_FAILED before any error response can be sent.
// The missing-key error surfaces naturally when streamText tries to call the API.
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY ?? '',
  headers: {
    'HTTP-Referer': 'https://cozip.vercel.app',
    'X-Title': 'Cozip',
  },
});

export const MODEL_ID = process.env.OPENROUTER_MODEL ?? 'arcee-ai/trinity-mini:free';

/**
 * Pre-configured LLM instance ready for use with the Vercel AI SDK.
 *
 * Usage:
 *   import { llm } from '../lib/openrouter';
 *   const result = await generateText({ model: llm, prompt: '...' });
 */
export const llm = openrouter(MODEL_ID);
