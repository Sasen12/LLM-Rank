import { Provider, ProviderConfig, ProviderResult, ProviderContext } from './types';

const config: ProviderConfig = {
  name: 'perplexity',
  displayName: 'Perplexity',
  enabled: false,
};

/**
 * REAL IMPLEMENTATION NOTES:
 * - Provider: Perplexity AI
 * - API: Perplexity Chat Completions API (https://api.perplexity.ai/chat/completions)
 * - Auth: Bearer token via PERPLEXITY_API_KEY env var
 * - Model: sonar-pro or sonar
 * - Endpoint: POST https://api.perplexity.ai/chat/completions
 * - Rate limits: Check Perplexity docs
 * - Streaming: Optional, use SSE
 * - Note: Perplexity returns citations in the response object
 *
 * Steps to enable:
 * 1. Set PERPLEXITY_API_KEY in .env
 * 2. Change enabled to true
 * 3. Update runPrompt to call Perplexity API
 * 4. Parse response to extract mentions, citations, sentiment
 * 5. Use analyzer.ts helpers for extraction
 */
export const perplexityProvider: Provider = {
  name: 'perplexity',
  displayName: 'Perplexity',
  async runPrompt(prompt: string, context: ProviderContext): Promise<ProviderResult> {
    throw new Error('Perplexity provider is not enabled. See comments in src/lib/providers/perplexity.ts');
  },
};
