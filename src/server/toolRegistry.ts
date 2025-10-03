import type { ToolExecution, ToolContext, ToolExecutionResult } from '../tools/types.js';

export class ToolRegistry {
  private readonly tools = new Map<string, ToolExecution<unknown, unknown>>();

  register<TInput, TResult>(tool: ToolExecution<TInput, TResult>): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool with name ${tool.name} is already registered`);
    }
    this.tools.set(tool.name, tool as ToolExecution<unknown, unknown>);
  }

  list(): string[] {
    return Array.from(this.tools.keys());
  }

  async execute<TResult>(name: string, input: unknown, context?: ToolContext): Promise<ToolExecutionResult<TResult>> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} is not registered`);
    }

    const parsed = tool.schema.safeParse(input);
    if (!parsed.success) {
      throw new Error(`Invalid input for tool ${name}: ${parsed.error.message}`);
    }

    const start = Date.now();
    const result = (await tool.execute(parsed.data, context)) as TResult;
    const latencyMs = Date.now() - start;
    return { toolName: name, result, latencyMs };
  }
}
