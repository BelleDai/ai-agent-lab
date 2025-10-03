import { z } from 'zod';
import type { ToolExecution } from './types.js';

const WeatherSchema = z.object({
  city: z.string().min(1, 'City is required'),
  unit: z.enum(['metric', 'imperial']).default('metric'),
});

export type WeatherInput = {
  city: string;
  unit?: 'metric' | 'imperial';
};

export interface WeatherResult {
  city: string;
  temperature: number;
  unit: 'metric' | 'imperial';
  condition: string;
  source: 'stubbed';
}

export const weatherTool: ToolExecution<WeatherInput, WeatherResult> = {
  name: 'get_weather',
  description: 'Lookup the current weather for a city. Returns stubbed data for demos.',
  schema: WeatherSchema,
  execute: async (input) => {
    const unit = input.unit ?? 'metric';
    const base = unit === 'metric' ? 20 : 68;
    const variation = Math.sin(input.city.length) * 5;
    const temperature = Math.round((base + variation) * 10) / 10;
    const condition = Math.abs(variation) > 2 ? 'Cloudy' : 'Sunny';

    return {
      city: input.city,
      temperature,
      unit,
      condition,
      source: 'stubbed',
    } satisfies WeatherResult;
  },
};
