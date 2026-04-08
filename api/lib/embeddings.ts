// @xenova/transformers uses onnxruntime-node (native binary) which is 137 MB
// and crashes Vercel Lambda. We ONLY load it in local dev.
// On Vercel the function always returns null → tools fall back to keyword search.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let embeddingModel: any | null = null;

export async function generateEmbedding(text: string): Promise<number[] | null> {
  // On Vercel / Lambda, skip entirely — no native binaries available
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return null;
  }

  try {
    if (!embeddingModel) {
      // Build the module name at runtime so bundlers (nft/webpack/esbuild)
      // cannot statically resolve it and pull in the 137 MB native binary.
      const modName = ['@xenova', 'transformers'].join('/');
      const mod = await (Function('m', 'return import(m)')(modName) as Promise<any>);
      mod.env.allowRemoteModels = true;
      mod.env.useBrowserCache = false;
      console.log('[Embeddings] Loading all-MiniLM-L6-v2 model…');
      embeddingModel = await mod.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }

    console.log('[Embeddings] generating for:', text.slice(0, 50));
    const output = await embeddingModel(text, { pooling: 'mean', normalize: true }) as { data: Float32Array };
    return Array.from(output.data);
  } catch (err) {
    console.warn('[Embeddings] Failed to generate embedding, will use keyword fallback:', (err as Error).message);
    return null;
  }
}
