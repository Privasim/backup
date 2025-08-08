import type { OpenRouterClient } from '@/lib/openrouter/client';

type Msg = { role: 'system' | 'user' | 'assistant'; content: string };

interface GenerateParams {
  client: OpenRouterClient;
  model: string;
  messages: Msg[];
  onChunk: (chunk: string) => void;
  signal?: AbortSignal;
}

export async function generatePlanStream({ client, model, messages, onChunk, signal }: GenerateParams) {
  await client.chat({
    model,
    messages,
    max_tokens: 2000,
  }, { stream: true, onChunk, signal });
}
