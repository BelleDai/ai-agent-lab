import { OpenAIClient } from '../openai/client.js';

export interface VectorRecord {
  id: string;
  embedding: number[];
  metadata: Record<string, unknown>;
  text: string;
}

export interface VectorSearchResult extends VectorRecord {
  score: number;
}

export interface VectorStore {
  upsert(records: VectorRecord[]): Promise<void> | void;
  search(queryEmbedding: number[], options?: { topK?: number }): Promise<VectorSearchResult[]> | VectorSearchResult[];
}

export class InMemoryVectorStore implements VectorStore {
  private readonly vectors: VectorRecord[] = [];

  upsert(records: VectorRecord[]): void {
    for (const record of records) {
      const index = this.vectors.findIndex((existing) => existing.id === record.id);
      if (index >= 0) {
        this.vectors[index] = record;
      } else {
        this.vectors.push(record);
      }
    }
  }

  search(queryEmbedding: number[], options?: { topK?: number }): VectorSearchResult[] {
    const topK = options?.topK ?? 5;
    return this.vectors
      .map((record) => ({
        ...record,
        score: cosineSimilarity(queryEmbedding, record.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

export async function embedChunks(options: {
  client: OpenAIClient;
  model: string;
  chunks: Array<{ id: string; text: string; metadata?: Record<string, unknown> }>;
}): Promise<VectorRecord[]> {
  const { client, model, chunks } = options;
  const texts = chunks.map((chunk) => chunk.text);
  const response = await client.createEmbedding({ model, input: texts });

  return response.data.map((item, index) => ({
    id: chunks[index]?.id ?? `chunk-${index}`,
    embedding: item.embedding,
    metadata: chunks[index]?.metadata ?? {},
    text: chunks[index]?.text ?? '',
  } satisfies VectorRecord));
}

function cosineSimilarity(a: number[], b: number[]): number {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
