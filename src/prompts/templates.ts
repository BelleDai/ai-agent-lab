export interface PromptTemplate {
  name: string;
  system: string;
  user: (input: Record<string, unknown>) => string;
  guardrails?: {
    validations: Array<{ field: string; validator: (value: unknown) => boolean; message: string }>;
  };
}

export const toolSelectionTemplate: PromptTemplate = {
  name: 'tool-selection',
  system:
    'You are an orchestrator that chooses which tool to call. Respond with the JSON payload {"tool":"name","arguments":{...}}.',
  user: (input) => {
    const request = input['request'];
    return `User request: ${request}\nAvailable tools: ${input['tools']}`;
  },
  guardrails: {
    validations: [
      {
        field: 'request',
        validator: (value) => typeof value === 'string' && value.length > 0,
        message: 'Request must be a non-empty string',
      },
    ],
  },
};
