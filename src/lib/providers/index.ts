import { Provider, ProviderConfig } from './types';
import { MockProvider } from './mock';
import { openaiProvider } from './openai';
import { anthropicProvider } from './anthropic';
import { googleProvider } from './google';
import { perplexityProvider } from './perplexity';

export const providerConfigs: Record<string, ProviderConfig> = {
  openai: { name: 'openai', displayName: 'ChatGPT', enabled: true },
  anthropic: { name: 'anthropic', displayName: 'Claude', enabled: true },
  google: { name: 'google', displayName: 'Gemini', enabled: true },
  perplexity: { name: 'perplexity', displayName: 'Perplexity', enabled: true },
  google_ai_overview: { name: 'google_ai_overview', displayName: 'Google AI Overviews', enabled: true },
  copilot: { name: 'copilot', displayName: 'Copilot', enabled: true },
};

const realProviders: Provider[] = [
  openaiProvider,
  anthropicProvider,
  googleProvider,
  perplexityProvider,
];

const mockProviders: Provider[] = Object.entries(providerConfigs)
  .filter(([key]) => key !== 'google_ai_overview' && key !== 'copilot')
  .map(
    ([, config]) =>
      new MockProvider({
        ...config,
        enabled: true,
      })
  );

export const availableProviders: Provider[] = [...realProviders, ...mockProviders];

export function getProvider(name: string): Provider | undefined {
  return availableProviders.find((p) => p.name === name);
}

function canUseRealProvider(name: string): boolean {
  if (name === 'openai') return !!process.env.OPENAI_API_KEY;
  if (name === 'anthropic') return !!process.env.ANTHROPIC_API_KEY;
  if (name === 'google') return !!process.env.GOOGLE_API_KEY;
  if (name === 'perplexity') return !!process.env.PERPLEXITY_API_KEY;
  return false;
}

export function getActiveProvider(name: string): Provider {
  const config = providerConfigs[name];
  if (!config) throw new Error(`Unknown provider: ${name}`);

  if (canUseRealProvider(name)) {
    const real = realProviders.find(p => p.name === name);
    if (real) return real;
  }

  const mock = mockProviders.find(p => p.name === name);
  if (mock) return mock;

  return new MockProvider({ ...config, enabled: true });
}

export const activeProviders: Provider[] = Object.entries(providerConfigs)
  .filter(([, config]) => config.enabled)
  .map(([key]) => getActiveProvider(key));
