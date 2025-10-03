import { getEnv } from '../config/env.js';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
};

type FunctionCall = {
  name: string;
  arguments: string;
};

type ToolCall = {
  id: string;
  type: 'function';
  function: FunctionCall;
};

type ChatCompletionResponse = {
  id: string;
  choices: Array<{
    finish_reason: string | null;
    index: number;
    message: ChatMessage & { tool_calls?: ToolCall[] };
  }>;
};

type EmbeddingResponse = {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
};

export interface ChatCompletionParams {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  functions?: Array<{
    name: string;
    description?: string;
    parameters: unknown;
  }>;
  function_call?: 'auto' | 'none' | { name: string };
  max_tokens?: number;
}

export interface EmbeddingParams {
  model: string;
  input: string[];
}

export class OpenAIClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(options?: { apiKey?: string; baseUrl?: string }) {
    const apiKey = options?.apiKey ?? getEnv('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required to use OpenAIClient');
    }
    this.apiKey = apiKey;
    this.baseUrl = options?.baseUrl ?? getEnv('OPENAI_BASE_URL', { optional: true }) ?? 'https://api.openai.com/v1';
  }

  async chatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI chat completion failed: ${response.status} ${errorText}`);
    }

    return (await response.json()) as ChatCompletionResponse;
  }

  async createEmbedding(params: EmbeddingParams): Promise<EmbeddingResponse> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI embedding failed: ${response.status} ${errorText}`);
    }

    return (await response.json()) as EmbeddingResponse;
  }
}

export type { ChatMessage, FunctionCall, ToolCall };
