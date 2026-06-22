export interface ProviderResult {
  model: string;
  responseText: string;
  responseSummary: string;
  targetMentioned: boolean;
  targetRecommended: boolean;
  targetRank: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  detectedMentions: {
    name: string;
    type: 'target' | 'competitor' | 'thirdParty';
    count: number;
    rankPosition: number;
  }[];
  citations: {
    url: string;
    domain: string;
    sourceType: string;
    isTargetDomain: boolean;
    isCompetitorDomain: boolean;
  }[];
}

export interface ProviderConfig {
  name: string;
  displayName: string;
  enabled: boolean;
}

export interface Provider {
  name: string;
  displayName: string;
  runPrompt(prompt: string, context: ProviderContext): Promise<ProviderResult>;
}

export interface ProviderContext {
  brandName: string;
  domain: string;
  productCategory: string;
  shortDescription: string;
  targetAudience: string;
  competitors: { name: string; domain: string }[];
}
