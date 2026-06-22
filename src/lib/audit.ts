export interface AnalysisResult {
  title: string;
  metaDescription: string;
  h1: string;
  headingHierarchy: string[];
  canonicalUrl: string;
  hasRobotsTxt: boolean;
  hasSitemapXml: boolean;
  hasLlmsTxt: boolean;
  hasJsonLd: boolean;
  hasOpenGraph: boolean;
  hasPricingSignal: boolean;
  hasComparisonSignal: boolean;
  hasCaseStudySignal: boolean;
  hasFaqSignal: boolean;
  hasDocsSignal: boolean;
  hasProductUseCaseSignal: boolean;
  textToHtmlRatio: number;
  wordCount: number;
  internalLinksCount: number;
  externalLinksCount: number;
  isSpaWarning: boolean;
  hasEntityMentions: boolean;
  competitorComparisonReadiness: number;
}

interface AuditScores {
  crawlabilityScore: number;
  technicalScore: number;
  contentDepthScore: number;
  entityClarityScore: number;
  citationReadinessScore: number;
  overallScore: number;
}

interface Finding {
  issue: string;
  whyMatters: string;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  action: string;
  relatedPrompts: string[];
}

export function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }
  normalized = normalized.replace(/\/+$/, '');
  return normalized;
}

export async function fetchUrlSafely(
  url: string,
  timeout: number = 10000
): Promise<{ html: string | null; error: string | null }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; LLMRankAuditBot/1.0; +https://llmrank.ai)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      return {
        html: null,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const html = await response.text();
    return { html, error: null };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unknown fetch error';
    return { html: null, error: message };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchRobotsTxt(
  domain: string
): Promise<{ exists: boolean; content: string | null }> {
  const url = `https://${domain}/robots.txt`;
  const { html, error } = await fetchUrlSafely(url);
  if (error || !html) {
    return { exists: false, content: null };
  }
  return { exists: true, content: html.slice(0, 5000) };
}

export async function fetchSitemap(
  domain: string
): Promise<{ exists: boolean; urls: string[] }> {
  const urls: string[] = [];
  const locations = [
    `https://${domain}/sitemap.xml`,
    `https://${domain}/sitemap_index.xml`,
  ];

  for (const url of locations) {
    const { html, error } = await fetchUrlSafely(url);
    if (!error && html) {
      const urlMatches = html.match(/<loc>(.*?)<\/loc>/g);
      if (urlMatches) {
        for (const m of urlMatches) {
          const loc = m.replace(/<\/?loc>/g, '');
          urls.push(loc);
        }
      }
      if (urls.length > 0) break;
    }
  }

  return { exists: urls.length > 0, urls: urls.slice(0, 500) };
}

export async function fetchLlmsTxt(
  domain: string
): Promise<{ exists: boolean; content: string | null }> {
  const url = `https://${domain}/llms.txt`;
  const { html, error } = await fetchUrlSafely(url);
  if (error || !html) {
    return { exists: false, content: null };
  }
  return { exists: true, content: html.slice(0, 10000) };
}

function extractMetaContent(html: string, name: string): string {
  const patterns = [
    new RegExp(
      `<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']\\s*/?>`,
      'i'
    ),
    new RegExp(
      `<meta\\s+property=["']og:${name}["']\\s+content=["']([^"']*)["']\\s*/?>`,
      'i'
    ),
    new RegExp(
      `<meta\\s+content=["']([^"']*)["']\\s+name=["']${name}["']\\s*/?>`,
      'i'
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }

  return '';
}

function extractCanonical(html: string): string {
  const match = html.match(
    /<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']\s*\/?>/i
  );
  return match ? match[1] : '';
}

function hasOpenGraphTags(html: string): boolean {
  return /<meta\s+property=["']og:/i.test(html);
}

function hasJsonLd(html: string): boolean {
  return /<script\s+type=["']application\/ld\+json["']/i.test(html);
}

function countSignal(html: string, keywords: string[]): boolean {
  const lower = html.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

function countWords(html: string): number {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : html;
  const text = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(/\s+/).length;
}

function countInternalLinks(html: string, domain: string): number {
  const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>/gi;
  let count = 0;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    if (
      href.startsWith('/') ||
      href.startsWith(`https://${domain}`) ||
      href.startsWith(`http://${domain}`)
    ) {
      count++;
    }
  }
  return count;
}

function countExternalLinks(html: string, domain: string): number {
  const linkRegex = /<a[^>]*href=["'](https?:\/\/[^"']*)["'][^>]*>/gi;
  let count = 0;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    if (
      !href.startsWith(`https://${domain}`) &&
      !href.startsWith(`http://${domain}`)
    ) {
      count++;
    }
  }
  return count;
}

function extractHeadingHierarchy(html: string): string[] {
  const headings: string[] = [];
  for (let i = 1; i <= 6; i++) {
    const regex = new RegExp(`<h${i}[^>]*>([^<]*)<\\/h${i}>`, 'gi');
    let match;
    while ((match = regex.exec(html)) !== null) {
      headings.push(`h${i}: ${match[1].trim()}`);
    }
  }
  return headings;
}

function isSpaPattern(html: string): boolean {
  const lower = html.toLowerCase();
  return (
    lower.includes('<div id="root">') ||
    lower.includes('<div id="app">') ||
    lower.includes('<div id="__next">') ||
    lower.includes('<div id="gatsby-focus-wrapper">') ||
    (lower.includes('<script') && lower.includes('react') && !lower.includes('<main'))
  );
}

function calculateTextToHtmlRatio(html: string): number {
  const textLen = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().length;
  if (html.length === 0) return 0;
  return Math.round((textLen / html.length) * 100);
}

export async function analyzeHtml(
  html: string,
  url: string
): Promise<AnalysisResult> {
  const domain = extractDomain(url);
  const lower = html.toLowerCase();

  return {
    title: extractMetaContent(html, 'title') || '',
    metaDescription: extractMetaContent(html, 'description') || '',
    h1: extractMetaContent(html, 'h1') || '',
    headingHierarchy: extractHeadingHierarchy(html),
    canonicalUrl: extractCanonical(html),
    hasRobotsTxt: false,
    hasSitemapXml: false,
    hasLlmsTxt: false,
    hasJsonLd: hasJsonLd(html),
    hasOpenGraph: hasOpenGraphTags(html),
    hasPricingSignal: countSignal(lower, ['pricing', 'plans', 'subscription', 'try free', 'buy now', 'get started']),
    hasComparisonSignal: countSignal(lower, ['vs ', 'compare', 'alternative', 'versus', 'comparison']),
    hasCaseStudySignal: countSignal(lower, ['case study', 'customer story', 'success story', 'how we']),
    hasFaqSignal: countSignal(lower, ['faq', 'frequently asked', 'common questions']),
    hasDocsSignal: countSignal(lower, ['documentation', 'docs', 'developer guide', 'api reference']),
    hasProductUseCaseSignal: countSignal(lower, ['use case', 'by role', 'for teams', 'solutions']),
    textToHtmlRatio: calculateTextToHtmlRatio(html),
    wordCount: countWords(html),
    internalLinksCount: countInternalLinks(html, domain),
    externalLinksCount: countExternalLinks(html, domain),
    isSpaWarning: isSpaPattern(html),
    hasEntityMentions: countSignal(lower, ['best ', 'top ', 'leading ', 'award']),
    competitorComparisonReadiness: calculateComparisonReadiness(lower),
  };
}

function calculateComparisonReadiness(lower: string): number {
  let score = 0;
  if (countSignal(lower, ['vs ', 'compare', 'alternative'])) score += 25;
  if (countSignal(lower, ['features', 'capabilities', 'integrations'])) score += 20;
  if (countSignal(lower, ['pricing', 'plans'])) score += 15;
  if (countSignal(lower, ['documentation', 'docs', 'guide'])) score += 15;
  if (countSignal(lower, ['case study', 'testimonial', 'review'])) score += 15;
  if (countSignal(lower, ['faq', 'common questions'])) score += 10;
  return Math.min(score, 100);
}

function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function scoreGeoAudit(analysis: AnalysisResult): AuditScores {
  let crawlabilityScore = 0;
  if (analysis.hasRobotsTxt) crawlabilityScore += 40;
  if (analysis.hasSitemapXml) crawlabilityScore += 40;
  crawlabilityScore += analysis.canonicalUrl ? 20 : 0;

  let technicalScore = 0;
  if (analysis.hasJsonLd) technicalScore += 25;
  if (analysis.hasOpenGraph) technicalScore += 25;
  if (!analysis.isSpaWarning) technicalScore += 25;
  technicalScore += Math.min(Math.round(analysis.textToHtmlRatio / 2), 25);

  let contentDepthScore = 0;
  if (analysis.hasDocsSignal) contentDepthScore += 20;
  if (analysis.hasCaseStudySignal) contentDepthScore += 20;
  if (analysis.hasFaqSignal) contentDepthScore += 15;
  if (analysis.hasProductUseCaseSignal) contentDepthScore += 15;
  if (analysis.wordCount > 500) contentDepthScore += 15;
  if (analysis.headingHierarchy.length > 3) contentDepthScore += 15;

  let entityClarityScore = 0;
  if (analysis.title) entityClarityScore += 15;
  if (analysis.metaDescription) entityClarityScore += 15;
  if (analysis.h1) entityClarityScore += 10;
  if (analysis.hasEntityMentions) entityClarityScore += 20;
  entityClarityScore += Math.min(analysis.headingHierarchy.length * 5, 25);
  entityClarityScore += analysis.hasOpenGraph ? 15 : 0;

  let citationReadinessScore = 0;
  if (analysis.hasPricingSignal) citationReadinessScore += 20;
  if (analysis.hasComparisonSignal) citationReadinessScore += 25;
  citationReadinessScore += Math.min(analysis.internalLinksCount * 2, 20);
  citationReadinessScore += analysis.externalLinksCount > 0 ? 10 : 0;
  citationReadinessScore += analysis.competitorComparisonReadiness > 50 ? 25 : 0;

  const overallScore = Math.round(
    crawlabilityScore * 0.2 +
      technicalScore * 0.2 +
      contentDepthScore * 0.25 +
      entityClarityScore * 0.2 +
      citationReadinessScore * 0.15
  );

  return {
    crawlabilityScore: Math.min(crawlabilityScore, 100),
    technicalScore: Math.min(technicalScore, 100),
    contentDepthScore: Math.min(contentDepthScore, 100),
    entityClarityScore: Math.min(entityClarityScore, 100),
    citationReadinessScore: Math.min(citationReadinessScore, 100),
    overallScore: Math.min(overallScore, 100),
  };
}

export function createFindings(
  analysis: AnalysisResult,
  scores: AuditScores
): Finding[] {
  const findings: Finding[] = [];

  if (!analysis.hasRobotsTxt) {
    findings.push({
      issue: 'Missing robots.txt file',
      whyMatters: 'Search engines and AI crawlers use robots.txt to discover allowed pages. Without it, crawlers may miss key pages or waste crawl budget.',
      impact: 'High',
      effort: 'Low',
      action: 'Create a robots.txt file at /robots.txt pointing to your sitemap and allowing LLM crawlers.',
      relatedPrompts: [
        'What is [brand]?',
        'Best [category] tools for [audience]',
      ],
    });
  }

  if (!analysis.hasSitemapXml) {
    findings.push({
      issue: 'Missing XML sitemap',
      whyMatters: 'Sitemaps help AI crawlers discover all important pages on your site. Without one, deep content pages may go unnoticed.',
      impact: 'High',
      effort: 'Low',
      action: 'Generate and submit an XML sitemap. Most CMS platforms support this natively.',
      relatedPrompts: [
        'Compare [brand] vs competitors',
        'Best [category] for [use case]',
      ],
    });
  }

  if (!analysis.hasJsonLd) {
    findings.push({
      issue: 'No structured data (JSON-LD) found',
      whyMatters: 'Structured data helps AI models understand your product entities, features, and relationships. It powers rich snippets and entity recognition.',
      impact: 'High',
      effort: 'Medium',
      action: 'Implement JSON-LD structured data for SoftwareApplication, Product, and FAQ schemas.',
      relatedPrompts: [
        'What is [brand]?',
        '[brand] features and pricing',
      ],
    });
  }

  if (!analysis.hasOpenGraph) {
    findings.push({
      issue: 'Missing Open Graph tags',
      whyMatters: 'OG tags control how your content appears when shared on social platforms and some AI training data sources.',
      impact: 'Medium',
      effort: 'Low',
      action: 'Add Open Graph meta tags for title, description, image, and url to all pages.',
      relatedPrompts: ['Best CRMs for B2B SaaS', '[category] tools compared'],
    });
  }

  if (!analysis.hasPricingSignal) {
    findings.push({
      issue: 'No clear pricing page detected',
      whyMatters: 'AI models frequently cite pricing information in buying recommendations. Transparent pricing increases the chances of being included in AI comparisons.',
      impact: 'High',
      effort: 'Medium',
      action: 'Create a dedicated pricing page with clear tier information. Consider adding a pricing calculator.',
      relatedPrompts: [
        'Affordable [category] for [audience]',
        '[brand] pricing vs competitors',
      ],
    });
  }

  if (!analysis.hasComparisonSignal) {
    findings.push({
      issue: 'No comparison or versus content found',
      whyMatters: 'AI models often generate comparison content. Having official comparison pages increases your chances of being cited in "vs" queries.',
      impact: 'High',
      effort: 'Medium',
      action: 'Create comparison pages comparing your product against top competitors.',
      relatedPrompts: [
        '[brand] vs [competitor]',
        'Best [category] comparison 2025',
      ],
    });
  }

  if (!analysis.hasCaseStudySignal) {
    findings.push({
      issue: 'No case studies or customer stories detected',
      whyMatters: 'AI models cite real-world usage examples to support recommendations. Case studies provide credible third-party validation.',
      impact: 'Medium',
      effort: 'High',
      action: 'Publish 3-5 detailed case studies with measurable results from real customers.',
      relatedPrompts: [
        'Best [category] for [use case]',
        '[brand] reviews and testimonials',
      ],
    });
  }

  if (scores.contentDepthScore < 50) {
    findings.push({
      issue: 'Insufficient content depth for AI citation',
      whyMatters: 'AI models favor detailed, comprehensive content. Pages with more words and structured headings are more likely to be referenced.',
      impact: 'Medium',
      effort: 'High',
      action: 'Expand your content with detailed feature pages, guides, and use-case specific content. Aim for 1000+ words on key pages.',
      relatedPrompts: [
        'How does [brand] work?',
        'Comprehensive guide to [category]',
      ],
    });
  }

  if (!analysis.hasDocsSignal) {
    findings.push({
      issue: 'No documentation or developer resources found',
      whyMatters: 'AI models often reference documentation for technical accuracy. Documentation improves credibility and citation potential.',
      impact: 'Medium',
      effort: 'High',
      action: 'Create a documentation section with API references, integration guides, and technical specs.',
      relatedPrompts: [
        '[brand] API documentation',
        'How to integrate [brand]',
      ],
    });
  }

  if (analysis.isSpaWarning) {
    findings.push({
      issue: 'Single Page Application (SPA) architecture detected',
      whyMatters: 'SPAs can be harder for AI crawlers to render and index, potentially causing content to be missed.',
      impact: 'Medium',
      effort: 'High',
      action: 'Implement server-side rendering (SSR) or static site generation (SSG) for key pages. Ensure critical content is in the initial HTML.',
      relatedPrompts: ['What is [brand]?', '[brand] features'],
    });
  }

  if (!analysis.hasProductUseCaseSignal) {
    findings.push({
      issue: 'No use-case-specific product pages found',
      whyMatters: 'AI models answer specific queries about use cases. Dedicated pages increase relevance for targeted prompts.',
      impact: 'Low',
      effort: 'Medium',
      action: 'Create pages targeting specific use cases and buyer personas (e.g., "for sales teams", "for startups").',
      relatedPrompts: [
        'Best [category] for [specific use case]',
        '[brand] for [audience]',
      ],
    });
  }

  return findings;
}

export function getDemoAuditData() {
  const analysis: AnalysisResult = {
    title: 'Northstar CRM — CRM Platform for B2B SaaS Sales Teams',
    metaDescription: 'Northstar CRM helps B2B SaaS companies manage pipelines, close deals, and predict revenue. Built for seed to Series B teams that need a CRM that scales.',
    h1: 'CRM Built for B2B SaaS Growth',
    headingHierarchy: [
      'h1: CRM Built for B2B SaaS Growth',
      'h2: Why Northstar CRM',
      'h2: Key Features',
      'h3: Pipeline Management',
      'h3: AI-Powered Forecasting',
      'h3: Integration Ecosystem',
      'h2: Pricing Plans',
      'h2: Compare Northstar vs Alternatives',
      'h3: Northstar vs Salesforce',
      'h3: Northstar vs HubSpot',
      'h2: Case Studies',
      'h2: Frequently Asked Questions',
      'h2: Get Started',
    ],
    canonicalUrl: 'https://northstarcrm.example.com',
    hasRobotsTxt: true,
    hasSitemapXml: true,
    hasLlmsTxt: false,
    hasJsonLd: true,
    hasOpenGraph: true,
    hasPricingSignal: true,
    hasComparisonSignal: true,
    hasCaseStudySignal: true,
    hasFaqSignal: true,
    hasDocsSignal: false,
    hasProductUseCaseSignal: true,
    textToHtmlRatio: 18,
    wordCount: 2450,
    internalLinksCount: 47,
    externalLinksCount: 12,
    isSpaWarning: false,
    hasEntityMentions: true,
    competitorComparisonReadiness: 85,
  };

  const scores = scoreGeoAudit(analysis);
  const findings = createFindings(analysis, scores);

  return { analysis, scores, findings };
}
