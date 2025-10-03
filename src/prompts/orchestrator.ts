import { OpenAIClient } from '../openai/client.js';
import { PromptTemplate } from './templates.js';

export interface PromptOrchestratorOptions {
  template: PromptTemplate;
  client?: OpenAIClient;
  model?: string;
}

export class PromptOrchestrator {
  private readonly template: PromptTemplate;
  private readonly client: OpenAIClient;
  private readonly model: string;

  constructor(options: PromptOrchestratorOptions) {
    this.template = options.template;
    this.client = options.client ?? new OpenAIClient();
    this.model = options.model ?? 'gpt-4o-mini';
  }

  async run(input: Record<string, unknown>): Promise<string> {
    this.validate(input);

    const response = await this.client.chatCompletion({
      model: this.model,
      messages: [
        { role: 'system', content: this.template.system },
        { role: 'user', content: this.template.user(input) },
      ],
      temperature: 0,
    });

    return response.choices.at(0)?.message.content ?? '';
  }

  private validate(input: Record<string, unknown>): void {
    const validations = this.template.guardrails?.validations ?? [];
    for (const rule of validations) {
      const value = input[rule.field];
      if (!rule.validator(value)) {
        throw new Error(`Prompt validation failed for field ${rule.field}: ${rule.message}`);
      }
    }
  }
}
