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
  // Cast to any: @xenova/transformers return type union is too broad for strict TS
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const output = await (model as any)(text, { pooling: 'mean', normalize: true }) as { data: Float32Array };
  return Array.from(output.data);
}
