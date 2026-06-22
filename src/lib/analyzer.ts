const POSITIVE_KEYWORDS = [
  'great', 'excellent', 'powerful', 'best', 'leading', 'top',
  'outstanding', 'exceptional', 'superior', 'fantastic', 'amazing',
  'impressive', 'remarkable', 'perfect', 'ideal', 'recommended',
  'recommend', 'standout', 'top-notch', 'robust', 'comprehensive',
];

const NEGATIVE_KEYWORDS = [
  'limited', 'lacking', 'weak', 'poor', 'expensive', 'inferior',
  'disappointing', 'lacks', 'outdated', 'difficult', 'complicated',
  'overpriced', 'underwhelming', 'inadequate', 'insufficient',
  'subpar', 'mediocre', 'unreliable', 'buggy', 'incomplete',
];

const REVIEW_DOMAINS = new Set([
  'g2.com', 'capterra.com', 'trustradius.com', 'getapp.com',
  'softwareadvice.com', 'saasworthy.com', 'peerspot.com',
  'pcmag.com', 'zdnet.com', 'stackshare.io',
]);

const ANALYST_DOMAINS = new Set([
  'forrester.com', 'gartner.com', 'idc.com',
]);

const NEWS_DOMAINS = new Set([
  'techcrunch.com', 'cnbc.com', 'businessinsider.com',
  'venturebeat.com', 'informationweek.com', 'cio.com',
]);

export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s)]+/g;
  const matches = text.match(urlRegex);
  return matches || [];
}

export function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function detectMentions(
  text: string,
  brandName: string,
  competitors: { name: string; domain: string }[]
): { name: string; type: 'target' | 'competitor' | 'thirdParty'; count: number; rankPosition: number }[] {
  const mentions: {
    name: string;
    type: 'target' | 'competitor' | 'thirdParty';
    count: number;
    rankPosition: number;
  }[] = [];

  const textLower = text.toLowerCase();
  const brandLower = brandName.toLowerCase();

  const brandRank = detectRank(text, brandName);
  let brandCount = 0;
  let pos = 0;
  while ((pos = textLower.indexOf(brandLower, pos)) !== -1) {
    brandCount++;
    pos += brandLower.length;
  }

  if (brandCount > 0) {
    mentions.push({
      name: brandName,
      type: 'target',
      count: brandCount,
      rankPosition: brandRank,
    });
  }

  for (const comp of competitors) {
    const compLower = comp.name.toLowerCase();
    let compCount = 0;
    let cp = 0;
    while ((cp = textLower.indexOf(compLower, cp)) !== -1) {
      compCount++;
      cp += compLower.length;
    }
    if (compCount > 0) {
      mentions.push({
        name: comp.name,
        type: 'competitor',
        count: compCount,
        rankPosition: 0,
      });
    }
  }

  return mentions;
}

export function detectSentiment(
  text: string,
  targetMentioned: boolean,
  rank: number
): 'positive' | 'neutral' | 'negative' {
  if (!targetMentioned) return 'neutral';

  const textLower = text.toLowerCase();

  const positiveCount = POSITIVE_KEYWORDS.filter((kw) => textLower.includes(kw)).length;
  const negativeCount = NEGATIVE_KEYWORDS.filter((kw) => textLower.includes(kw)).length;

  if (rank > 0 && rank <= 2 && positiveCount > negativeCount) return 'positive';
  if (rank >= 4 && negativeCount > positiveCount) return 'negative';
  if (positiveCount > negativeCount + 1) return 'positive';
  if (negativeCount > positiveCount + 1) return 'negative';

  return 'neutral';
}

export function detectRank(text: string, brandName: string): number {
  const lines = text.split('\n');
  const numberedListRegex = /^\s*(\d+)[.)]\s*\*{0,2}(.*?)\*{0,2}\s*$/im;

  for (const line of lines) {
    const match = line.match(numberedListRegex);
    if (match) {
      const content = match[2].toLowerCase();
      const brandLower = brandName.toLowerCase();
      if (content.includes(brandLower)) {
        return parseInt(match[1], 10);
      }
    }
  }

  const listRegex = /\*\*(\d+)\.\s+\*{0,2}(.*?)\*{0,2}\s*/gi;
  let listMatch;
  while ((listMatch = listRegex.exec(text)) !== null) {
    const content = listMatch[2].toLowerCase();
    if (content.includes(brandName.toLowerCase())) {
      return parseInt(listMatch[1], 10);
    }
  }

  const bulletRankRegex = new RegExp(
    `(?:rank|position|#|place)\\s*[#:\\s]*(\\d+)[\\s.)]*.*?${escapeRegex(brandName)}`,
    'i'
  );
  const brMatch = text.match(bulletRankRegex);
  if (brMatch) return parseInt(brMatch[1], 10);

  const reverseRankRegex = new RegExp(
    `${escapeRegex(brandName)}.*?(?:ranks|is|comes)\\s*(?:at\\s*)?(?:#|number\\s*|position\\s*)?(\\d+)`,
    'i'
  );
  const rrMatch = text.match(reverseRankRegex);
  if (rrMatch) return parseInt(rrMatch[1], 10);

  return 0;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function calculateConfidence(mentionsCount: number, citationsCount: number): number {
  let score = 50;
  score += Math.min(mentionsCount * 5, 25);
  score += Math.min(citationsCount * 4, 20);
  return Math.min(Math.round(score), 99);
}

export function classifySourceType(domain: string): string {
  const d = domain.replace(/^www\./, '');
  if (REVIEW_DOMAINS.has(d)) return 'review';
  if (ANALYST_DOMAINS.has(d)) return 'analyst';
  if (NEWS_DOMAINS.has(d)) return 'news';
  return 'other';
}

export function generateSummary(text: string): string {
  const sentences = text
    .split('.')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length === 0) return '';

  const first = sentences[0] + '.';
  if (sentences.length === 1) return first;

  const second = sentences[1] + '.';
  const combined = `${first} ${second}`;

  if (combined.length > 300) {
    return combined.slice(0, 297) + '...';
  }

  return combined;
}
