import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';
import { ToolRegistry } from '../server/toolRegistry.js';
import type { ToolExecutionResult } from '../tools/types.js';
import type { AgentReply, InputContext, ToolCall } from './protocol.js';

export class McpServer extends EventEmitter {
  constructor(private readonly registry: ToolRegistry) {
    super();
  }

  async handleToolCalls(context: InputContext, toolCalls: ToolCall[]): Promise<void> {
    const responses: ToolExecutionResult<unknown>[] = [];
    for (const call of toolCalls) {
      try {
        const response = await this.registry.execute(call.name, call.arguments ?? {}, { requestId: call.id });
        responses.push(response);
      } catch (error) {
        this.emit('error', error as Error);
        responses.push({
          toolName: call.name,
          result: { error: (error as Error).message },
          latencyMs: 0,
        });
      }
    }

    const reply: AgentReply = {
      id: randomUUID(),
      content: 'Tool execution completed',
      toolResponses: responses.map((response) => ({
        toolName: response.toolName,
        payload: response.result,
        latencyMs: response.latencyMs,
      })),
      followUp: {
        requiresUserInput: false,
      },
    };

    this.emit('reply', reply);
  }
}
