import { z } from 'zod';
import type { ToolExecution } from './types.js';
import { RagPipeline } from '../rag/pipeline.js';
import { OpenAIClient } from '../openai/client.js';

const RagQaSchema = z.object({
  question: z.string().min(3),
  context: z
    .object({
      documentPath: z.string(),
      embeddingModel: z.string(),
    })
    .optional(),
});

export type RagQaInput = {
  question: string;
  context?: {
    documentPath: string;
    embeddingModel: string;
  };
};

export interface RagQaResult {
  answer: string;
  context: string;
  citations: string[];
}

export const ragQaTool: ToolExecution<RagQaInput, RagQaResult> = {
  name: 'rag_qa',
  description: 'Perform retrieval augmented generation over a prepared document set.',
  schema: RagQaSchema,
  execute: async (input) => {
    const { question } = input;
    const client = new OpenAIClient();

    let pipeline: RagPipeline | undefined;
    if (input.context) {
      pipeline = await RagPipeline.fromDocument({
        documentPath: input.context.documentPath,
        embeddingModel: input.context.embeddingModel,
        client,
      });
    } else {
      throw new Error('RAG QA tool requires a context with documentPath and embeddingModel');
    }

    const queryResult = await pipeline.query({
      question,
      embeddingModel: input.context.embeddingModel,
    });

    const completion = await client.chatCompletion({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You answer questions using the provided context. Respond concisely.' },
        { role: 'user', content: `Context:\n${queryResult.context}\n\nQuestion: ${question}` },
      ],
    });

    const answer = completion.choices.at(0)?.message.content ?? 'No answer generated';
    return {
      answer,
      context: queryResult.context,
      citations: queryResult.topMatches,
    } satisfies RagQaResult;
  },
};
