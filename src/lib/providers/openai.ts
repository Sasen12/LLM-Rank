import { Provider, ProviderResult, ProviderContext } from './types';
import {
  detectMentions,
  detectSentiment,
  detectRank,
  calculateConfidence,
  generateSummary,
  extractUrls,
  extractDomain,
  classifySourceType,
} from '../analyzer';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o-mini';
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

function buildSystemPrompt(context: ProviderContext): string {
  const { brandName, domain, productCategory, shortDescription, targetAudience, competitors } = context;
  const compList = competitors.map(c => `- ${c.name} (${c.domain || 'no domain'})`).join('\n');

  return `You are a helpful B2B SaaS buying advisor. Answer the user's question naturally and conversationally.

When relevant, mention specific products by name. If the question is about ${productCategory} or related topics, evaluate the options including:

- **${brandName}** (${domain}) — ${shortDescription || 'A product in this category'}
${compList ? `\nCompetitors to consider:\n${compList}` : ''}

Be honest and balanced. When listing products, use a numbered format (1. Product, 2. Product, etc.). Include relevant source citations like [G2](https://www.g2.com) or [Capterra](https://www.capterra.com) where appropriate.

Keep responses concise but informative (2-4 paragraphs).`;
}

export const openaiProvider: Provider = {
  name: 'openai',
  displayName: 'ChatGPT',

  async runPrompt(prompt: string, context: ProviderContext): Promise<ProviderResult> {
    if (!OPENAI_API_KEY) {
      throw new Error(
        'OpenAI API key not configured. Set OPENAI_API_KEY in .env.local or use mock provider.'
      );
    }

    const systemPrompt = buildSystemPrompt(context);

    const response = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    const responseText: string = data.choices?.[0]?.message?.content || '';
    const responseSummary = generateSummary(responseText);

    const { brandName, domain, competitors: comps } = context;
    const detected = detectMentions(responseText, brandName, comps);
    const targetMentioned = detected.some(m => m.type === 'target');
    const targetMention = detected.find(m => m.type === 'target');
    const targetRank = targetMention ? targetMention.rankPosition : detectRank(responseText, brandName);
    const targetRecommended = targetRank > 0 && targetRank <= 2;
    const sentiment = detectSentiment(responseText, targetMentioned, targetRank);

    const urls = extractUrls(responseText);
    const citations = urls.map(url => {
      const domainName = extractDomain(url);
      return {
        url,
        domain: domainName,
        sourceType: classifySourceType(domainName),
        isTargetDomain: domainName.includes(domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '')),
        isCompetitorDomain: comps.some(c =>
          c.domain && domainName.includes(c.domain.replace(/^https?:\/\//, '').replace(/\/.*$/, ''))
        ),
      };
    });

    const confidence = calculateConfidence(detected.length, citations.length);

    return {
      model: 'openai',
      responseText,
      responseSummary,
      targetMentioned,
      targetRecommended,
      targetRank,
      sentiment,
      confidence,
      detectedMentions: detected,
      citations,
    };
  },
};
