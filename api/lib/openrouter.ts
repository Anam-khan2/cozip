import { createGroq } from '@ai-sdk/groq';

// Do NOT throw at module load time — a module-level throw causes
// FUNCTION_INVOCATION_FAILED before any error response can be sent.
// The missing-key error surfaces naturally when streamText tries to call the API.
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY ?? '',
});

// llama-3.1-8b-instant: 30,000 TPM (vs 12,000 for 70b), fast, supports tool calling
export const MODEL_ID = process.env.GROQ_MODEL ?? 'llama-3.1-8b-instant';

/**
 * Pre-configured LLM instance ready for use with the Vercel AI SDK.
 *
 * Usage:
 *   import { llm } from '../lib/openrouter';
 *   const result = await generateText({ model: llm, prompt: '...' });
 */
export const llm = groq(MODEL_ID);
