import { ZodSchema } from 'zod';

export interface ToolContext {
  requestId?: string;
  correlationId?: string;
  metadata?: Record<string, string>;
}

export interface ToolExecution<TInput, TResult> {
  name: string;
  description?: string;
  schema: ZodSchema<TInput>;
  execute: (input: TInput, context?: ToolContext) => Promise<TResult> | TResult;
}

export interface ToolExecutionResult<TResult> {
  toolName: string;
  result: TResult;
  latencyMs: number;
}
