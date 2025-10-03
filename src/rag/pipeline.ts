import { OpenAIClient } from '../openai/client.js';
import { loadDocument } from './documentLoader.js';
import { simpleSemanticChunk } from './chunker.js';
import { embedChunks, InMemoryVectorStore, VectorStore } from './vectorStore.js';

export interface RagBuildOptions {
  documentPath: string;
  embeddingModel: string;
  store?: VectorStore;
  chunkSize?: number;
  overlap?: number;
}

export interface RagQueryOptions {
  question: string;
  topK?: number;
  embeddingModel: string;
}

export class RagPipeline {
  private readonly vectorStore: VectorStore;
  private readonly client: OpenAIClient;
  private readonly embeddingModel: string;

  private constructor(options: { store: VectorStore; client: OpenAIClient; embeddingModel: string }) {
    this.vectorStore = options.store;
    this.client = options.client;
    this.embeddingModel = options.embeddingModel;
  }

  static async fromDocument(options: RagBuildOptions & { client?: OpenAIClient }): Promise<RagPipeline> {
    const { documentPath, chunkSize, overlap, embeddingModel } = options;
    const client = options.client ?? new OpenAIClient();
    const store = options.store ?? new InMemoryVectorStore();

    const document = await loadDocument(documentPath);
    const chunks = simpleSemanticChunk(document.text, { chunkSize, overlap });
    const embeddings = await embedChunks({
      client,
      model: embeddingModel,
      chunks: chunks.map((chunk) => ({
        id: chunk.id,
        text: chunk.text,
        metadata: {
          startIndex: chunk.startIndex,
          endIndex: chunk.endIndex,
          source: documentPath,
        },
      })),
    });

    store.upsert(embeddings);

    const pipeline = new RagPipeline({ store, client, embeddingModel });
    pipeline.warnings.push(...document.warnings);
    return pipeline;
  }

  readonly warnings: string[] = [];

  async query(options: RagQueryOptions): Promise<{ context: string; topMatches: string[] }> {
    const embedding = await embedChunks({
      client: this.client,
      model: options.embeddingModel ?? this.embeddingModel,
      chunks: [
        {
          id: 'query',
          text: options.question,
        },
      ],
    });

    const [queryVector] = embedding;
    if (!queryVector) {
      throw new Error('Failed to compute query embedding');
    }

    const results = await this.vectorStore.search(queryVector.embedding, { topK: options.topK ?? 3 });
    const context = results.map((result, index) => `#${index + 1} (score=${result.score.toFixed(3)}):\n${result.text}`).join('\n\n');
    return { context, topMatches: results.map((result) => result.text) };
  }
}
