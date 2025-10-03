import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';
import type { InputContext, ToolCall } from './protocol.js';
import { McpServer } from './server.js';

export class McpClient extends EventEmitter {
  constructor(private readonly server: McpServer) {
    super();
    this.server.on('reply', (reply) => this.emit('reply', reply));
    this.server.on('error', (error) => this.emit('error', error));
  }

  async callTools(tools: Array<Omit<ToolCall, 'id' | 'timestamp'>>, context: Partial<InputContext>): Promise<void> {
    const normalizedContext = {
      conversationId: context.conversationId ?? randomUUID(),
      ...context,
    } as InputContext;

    await this.server.handleToolCalls(
      normalizedContext,
      tools.map((tool) => ({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        ...tool,
      })),
    );
  }
}
