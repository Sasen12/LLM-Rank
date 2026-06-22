import { Provider, ProviderConfig, ProviderResult, ProviderContext } from './types';

const config: ProviderConfig = {
  name: 'anthropic',
  displayName: 'Claude',
  enabled: false,
};

/**
 * REAL IMPLEMENTATION NOTES:
 * - Provider: Anthropic (Claude)
 * - API: Anthropic Messages API (https://api.anthropic.com/v1/messages)
 * - Auth: x-api-key header via ANTHROPIC_API_KEY env var
 * - Model: claude-sonnet-4-20250514 or claude-3-5-sonnet-20241022
 * - Endpoint: POST https://api.anthropic.com/v1/messages
 * - Rate limits: Check Anthropic docs
 * - Streaming: Optional, use SSE
 *
 * Steps to enable:
 * 1. Set ANTHROPIC_API_KEY in .env
 * 2. Change enabled to true
 * 3. Update runPrompt to call Anthropic API
 * 4. Parse response to extract mentions, citations, sentiment
 * 5. Use analyzer.ts helpers for extraction
 */
export const anthropicProvider: Provider = {
  name: 'anthropic',
  displayName: 'Claude',
  async runPrompt(prompt: string, context: ProviderContext): Promise<ProviderResult> {
    throw new Error('Anthropic provider is not enabled. See comments in src/lib/providers/anthropic.ts');
  },
};
