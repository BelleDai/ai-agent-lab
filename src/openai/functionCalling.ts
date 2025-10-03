import { z } from 'zod';
import { OpenAIClient, ChatMessage, ToolCall } from './client.js';
import type { ToolExecution } from '../tools/types.js';

export interface FunctionCallResult<TOutput> {
  toolCall: ToolCall;
  output: TOutput;
}

export class FunctionCallingOrchestrator {
  constructor(private readonly client: OpenAIClient) {}

  async registerAndCall<TInput, TOutput>(options: {
    model: string;
    messages: ChatMessage[];
    tool: ToolExecution<TInput, TOutput>;
  }): Promise<FunctionCallResult<TOutput> | null> {
    const { model, messages, tool } = options;
    const params = {
      model,
      messages,
      functions: [
        {
          name: tool.name,
          description: tool.description,
          parameters: tool.schema.toJSON(),
        },
      ],
      function_call: 'auto' as const,
    };

    const response = await this.client.chatCompletion(params);
    const firstChoice = response.choices.at(0);
    const toolCall = firstChoice?.message.tool_calls?.at(0);
    if (!toolCall) {
      return null;
    }

    const args = JSON.parse(toolCall.function.arguments ?? '{}');
    const parsed = tool.schema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Failed to parse tool arguments: ${parsed.error.message}`);
    }

    const output = await tool.execute(parsed.data);
    return { toolCall, output };
  }
}

export const StringOrNumber = z.union([z.string(), z.number()]);
