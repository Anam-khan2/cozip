// @xenova/transformers uses onnxruntime-node (native binary) which crashes
// Vercel Lambda on import. We lazy-load it only in local dev environments.
// On Vercel/Lambda the function returns null → tools fall back to keyword search.

const IS_VERCEL = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let embeddingModel: any | null = null;

export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (IS_VERCEL) {
    // Native binaries can't run in Vercel Lambda — skip and let tools use keyword fallback
    return null;
  }

  try {
    if (!embeddingModel) {
      // Dynamic import so a load failure doesn't crash the whole function
      const { pipeline, env } = await import('@xenova/transformers');
      env.allowRemoteModels = true;
      env.useBrowserCache = false;
      console.log('[Embeddings] Loading all-MiniLM-L6-v2 model…');
      embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }

    console.log('[Embeddings] generating for:', text.slice(0, 50));
    const output = await embeddingModel(text, { pooling: 'mean', normalize: true }) as { data: Float32Array };
    return Array.from(output.data);
  } catch (err) {
    console.warn('[Embeddings] Failed to generate embedding, will use keyword fallback:', (err as Error).message);
    return null;
  }
}
