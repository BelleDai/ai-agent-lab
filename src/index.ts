import { ToolRegistry } from './server/toolRegistry.js';
import { ToolHttpServer } from './server/httpServer.js';
import { weatherTool } from './tools/weatherTool.js';
import { ragQaTool } from './tools/ragQaTool.js';
import { FunctionCallingOrchestrator } from './openai/functionCalling.js';
import { OpenAIClient } from './openai/client.js';
import { McpServer } from './mcp/server.js';
import { McpClient } from './mcp/client.js';
import { toolSelectionTemplate } from './prompts/templates.js';
import { PromptOrchestrator } from './prompts/orchestrator.js';

async function bootstrap() {
  const registry = new ToolRegistry();
  registry.register(weatherTool);
  registry.register(ragQaTool);

  const server = new ToolHttpServer({ port: 8080, registry });
  await server.start();
  console.log('Tool HTTP server listening on port 8080');

  const openaiClient = new OpenAIClient();
  const functionOrchestrator = new FunctionCallingOrchestrator(openaiClient);

  const promptOrchestrator = new PromptOrchestrator({ template: toolSelectionTemplate, client: openaiClient });
  const selection = await promptOrchestrator.run({ request: 'What is the weather in Taipei?', tools: registry.list() });
  console.log('Suggested tool selection prompt output:', selection);

  const toolResult = await functionOrchestrator.registerAndCall({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Use function calling when users ask about the weather.' },
      { role: 'user', content: 'Can you tell me the weather in Taipei in metric units?' },
    ],
    tool: weatherTool,
  });
  console.log('Function call result:', toolResult);

  const mcpServer = new McpServer(registry);
  const mcpClient = new McpClient(mcpServer);
  mcpClient.on('reply', (reply) => {
    console.log('MCP reply received:', reply);
  });
  mcpClient.on('error', (error) => {
    console.error('MCP error', error);
  });
  await mcpClient.callTools(
    [
      {
        name: 'get_weather',
        arguments: { city: 'Taipei', unit: 'metric' },
      },
    ],
    {
      conversationId: 'demo-conv',
    },
  );
}

bootstrap().catch((error) => {
  console.error('Bootstrap error:', error);
  process.exitCode = 1;
});
