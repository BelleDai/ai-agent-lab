export type RequiredEnvKey =
  | 'OPENAI_API_KEY'
  | 'OPENAI_BASE_URL'
  | 'QDRANT_URL'
  | 'QDRANT_API_KEY'
  | 'WEAVIATE_URL'
  | 'WEAVIATE_API_KEY';

const cached: Record<string, string | undefined> = {};

export function getEnv(key: RequiredEnvKey, options?: { optional?: boolean }): string | undefined {
  if (cached[key] !== undefined) {
    return cached[key];
  }

  const value = process.env[key];
  cached[key] = value;
  if (!value && !options?.optional) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function setEnv(key: RequiredEnvKey, value: string): void {
  cached[key] = value;
  process.env[key] = value;
}
