import { Provider, ProviderConfig, ProviderResult, ProviderContext } from './types';

const config: ProviderConfig = {
  name: 'google',
  displayName: 'Gemini',
  enabled: false,
};

/**
 * REAL IMPLEMENTATION NOTES:
 * - Provider: Google (Gemini)
 * - API: Google Gemini API (https://generativelanguage.googleapis.com/v1beta/models/)
 * - Auth: API key via GOOGLE_API_KEY env var
 * - Model: gemini-2.0-flash or gemini-2.0-pro
 * - Endpoint: POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 * - Rate limits: Check Google AI docs
 * - Streaming: Optional, use SSE
 *
 * Steps to enable:
 * 1. Set GOOGLE_API_KEY in .env
 * 2. Change enabled to true
 * 3. Update runPrompt to call Gemini API
 * 4. Parse response to extract mentions, citations, sentiment
 * 5. Use analyzer.ts helpers for extraction
 */
export const googleProvider: Provider = {
  name: 'google',
  displayName: 'Gemini',
  async runPrompt(prompt: string, context: ProviderContext): Promise<ProviderResult> {
    throw new Error('Google provider is not enabled. See comments in src/lib/providers/google.ts');
  },
};
