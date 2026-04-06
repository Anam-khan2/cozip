import { pipeline, env } from '@xenova/transformers';

// Server environment — download models on cold start, no browser cache
env.allowRemoteModels = true;
env.useBrowserCache = false;

let embeddingModel: ReturnType<typeof pipeline> | null = null;

export async function getEmbeddingModel() {
  if (!embeddingModel) {
    console.log('[Embeddings] Loading all-MiniLM-L6-v2 model…');
    embeddingModel = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embeddingModel;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  console.log('[Embeddings] generating for:', text.slice(0, 50));
  const model = await getEmbeddingModel();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data as Float32Array);
}
