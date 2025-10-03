import { z } from 'zod';

export const InputContextSchema = z.object({
  conversationId: z.string(),
  userId: z.string().optional(),
  locale: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type InputContext = {
  conversationId: string;
  userId?: string;
  locale?: string;
  metadata?: Record<string, unknown>;
};

export const ToolCallSchema = z.object({
  id: z.string(),
  name: z.string(),
  arguments: z.record(z.string(), z.any()).optional(),
  timestamp: z.string().optional(),
});

export type ToolCall = {
  id: string;
  name: string;
  arguments?: Record<string, unknown>;
  timestamp?: string;
};

export const AgentReplySchema = z.object({
  id: z.string(),
  content: z.string(),
  toolResponses: z
    .array(
      z.object({
        toolName: z.string(),
        payload: z.any(),
        latencyMs: z.number(),
      }),
    )
    .optional(),
  followUp: z
    .object({
      requiresUserInput: z.boolean().default(false),
      suggestedPrompt: z.string().optional(),
    })
    .optional(),
});

export type AgentReply = {
  id: string;
  content: string;
  toolResponses?: Array<{
    toolName: string;
    payload: unknown;
    latencyMs: number;
  }>;
  followUp?: {
    requiresUserInput: boolean;
    suggestedPrompt?: string;
  };
};
