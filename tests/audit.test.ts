import { describe, it, expect } from 'vitest';
import { scoreGeoAudit } from '../src/lib/audit';

describe('scoreGeoAudit', () => {
  it('returns scores for a complete analysis', () => {
    const analysis = {
      title: 'Test Page',
      metaDescription: 'A test page description',
      h1: 'Welcome',
      headingHierarchy: ['h1', 'h2', 'h2', 'h3'],
      canonicalUrl: 'https://example.com',
      hasRobotsTxt: true,
      hasSitemapXml: true,
      hasLlmsTxt: false,
      hasJsonLd: true,
      hasOpenGraph: true,
      hasPricingSignal: false,
      hasComparisonSignal: false,
      hasCaseStudySignal: false,
      hasFaqSignal: true,
      hasDocsSignal: true,
      hasProductUseCaseSignal: true,
      textToHtmlRatio: 0.35,
      wordCount: 1500,
      internalLinksCount: 25,
      externalLinksCount: 5,
      isSpaWarning: false,
      hasEntityMentions: true,
      competitorComparisonReadiness: 0,
    };

    const scores = scoreGeoAudit(analysis);
    expect(scores.crawlabilityScore).toBeGreaterThan(0);
    expect(scores.technicalScore).toBeGreaterThan(0);
    expect(scores.contentDepthScore).toBeGreaterThan(0);
    expect(scores.entityClarityScore).toBeGreaterThan(0);
    expect(scores.citationReadinessScore).toBeGreaterThanOrEqual(0);
    expect(scores.overallScore).toBeGreaterThan(0);
    expect(scores.overallScore).toBeLessThanOrEqual(100);
  });

  it('returns low scores for minimal analysis', () => {
    const analysis = {
      title: '',
      metaDescription: '',
      h1: '',
      headingHierarchy: [],
      canonicalUrl: '',
      hasRobotsTxt: false,
      hasSitemapXml: false,
      hasLlmsTxt: false,
      hasJsonLd: false,
      hasOpenGraph: false,
      hasPricingSignal: false,
      hasComparisonSignal: false,
      hasCaseStudySignal: false,
      hasFaqSignal: false,
      hasDocsSignal: false,
      hasProductUseCaseSignal: false,
      textToHtmlRatio: 0.05,
      wordCount: 50,
      internalLinksCount: 0,
      externalLinksCount: 0,
      isSpaWarning: true,
      hasEntityMentions: false,
      competitorComparisonReadiness: 0,
    };

    const scores = scoreGeoAudit(analysis);
    expect(scores.overallScore).toBeLessThan(30);
  });
});
