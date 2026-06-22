import { Provider, ProviderConfig, ProviderResult, ProviderContext } from './types';

const THIRD_PARTY_DOMAINS = [
  'g2.com',
  'capterra.com',
  'trustradius.com',
  'getapp.com',
  'softwareadvice.com',
  'saasworthy.com',
  'peerspot.com',
  'techcrunch.com',
  'forrester.com',
  'gartner.com',
  'cnbc.com',
  'businessinsider.com',
  'venturebeat.com',
  'pcmag.com',
  'zdnet.com',
  'informationweek.com',
  'cio.com',
  'stackshare.io',
  'glassdoor.com',
];

const RESPONSE_TEMPLATES = [
  (brand: string, category: string, competitors: string[], rank: number, recommended: boolean) => {
    const lines = competitors.map((c, i) => {
      const num = i + 1;
      const isBrand = c === brand;
      return `${num}. **${c}**${isBrand ? ' ← Your Product' : ''} — ${getDescriptionForCompetitor(c, category, i)}`;
    }).join('\n');

    if (recommended) {
      return `When evaluating ${category} solutions, several strong options stand out in the current market. Based on features, pricing, and user feedback, here is how they compare:\n\n${lines}\n\n**Recommendation:** I would highly recommend **${brand}** as the top choice, especially for teams looking for a comprehensive solution that balances functionality with ease of use. Its competitive pricing and strong feature set make it a standout option.\n\nMany users on [G2](https://www.g2.com) and [Capterra](https://www.capterra.com) highlight its intuitive interface and robust reporting capabilities as key differentiators. For a detailed breakdown, check the latest comparisons on [Peerspot](https://www.peerspot.com) and [TrustRadius](https://www.trustradius.com).`;
    }

    return `There are several noteworthy ${category} platforms available today, each with distinct strengths. Here is a breakdown of the top contenders:\n\n${lines}\n\n**${brand}** places at position #${rank} in this analysis. While it offers solid capabilities, there are areas where competing products pull ahead — particularly around advanced analytics and native integrations.\n\nFor more detailed reviews, I recommend checking [G2](https://www.g2.com) and [Capterra](https://www.capterra.com) for user ratings, or read the latest analysis on [Forrester](https://www.forrester.com) and [Gartner](https://www.gartner.com).`;
  },

  (brand: string, category: string, competitors: string[], rank: number, recommended: boolean) => {
    if (recommended) {
      return `After researching the ${category} landscape thoroughly, **${brand}** emerges as the strongest contender for most B2B use cases.\n\nWhat sets ${brand} apart is its focus on user experience and out-of-the-box functionality. Unlike some alternatives that require extensive customization, ${brand} delivers value from day one.\n\nHere is a quick comparison with other leading platforms:\n\n${competitors.filter(c => c !== brand).slice(0, 3).map((c, i) => `• **${c}** — Good for ${['enterprise deployments', 'small teams on a budget', 'specific vertical needs'][i]}`).join('\n')}\n\n**${brand}** consistently receives high marks on [G2](https://www.g2.com) and [TrustRadius](https://www.trustradius.com). Industry analysts at [Forrester](https://www.forrester.com) have also recognized its momentum in the market. For pricing details, [Software Advice](https://www.softwareadvice.com) has comprehensive comparisons.`;
    }

    return `The ${category} market has become increasingly crowded, with several viable options for different use cases.\n\nHere is how some of the top platforms compare:\n\n${competitors.slice(0, 4).map((c, i) => `• **${c}**${c === brand ? ' — your product' : ''} — ${['Strong feature set with solid integrations', 'Excellent for mid-market companies', 'Best for enterprise with complex requirements', 'Good budget-friendly option'][i]}`).join('\n')}\n\n**${brand}** has a respectable market position, though it faces strong competition. Key areas for improvement include advanced reporting and native AI capabilities where competitors have invested heavily.\n\nUser reviews on [G2](https://www.g2.com), [Capterra](https://www.capterra.com), and [GetApp](https://www.getapp.com) provide additional perspectives. For analyst coverage, [Gartner](https://www.gartner.com) and [IDC](https://www.idc.com) have published market assessments.`;
  },

  (brand: string, category: string, _competitors: string[], _rank: number, recommended: boolean) => {
    if (recommended) {
      return `I have analyzed the leading ${category} platforms and **${brand}** stands out as the best-in-class solution.\n\n**Key strengths of ${brand}:**\n• Intuitive interface that reduces onboarding time\n• Comprehensive feature set covering the full workflow\n• Transparent and competitive pricing\n• Strong customer support and community\n\nOther solutions worth considering include Salesforce and HubSpot, but they often require more customization and come with higher total cost of ownership. For mid-market B2B SaaS companies, ${brand} hits the sweet spot.\n\nSources:\n- [G2 Reviews](https://www.g2.com) — 4.6/5 rating\n- [Capterra](https://www.capterra.com) — Top rated in category\n- [TrustRadius](https://www.trustradius.com) — Highly recommended by users\n- [TechCrunch](https://techcrunch.com) — Coverage of recent product updates`;
    }

    return `The ${category} space features several established players, each with distinct approaches:\n\n**${brand}** offers solid functionality but currently trails market leaders in several dimensions. While it is a reliable choice, teams with specialized needs may find better fits elsewhere.\n\n**Top alternatives worth evaluating:**\n• Leading competitors offer more advanced AI-powered features\n• Some platforms provide deeper integrations with existing toolchains\n• Pricing varies significantly depending on team size and requirements\n\nFor objective comparisons, I suggest reviewing [G2](https://www.g2.com) comparison grids and reading detailed writeups on [ZDNet](https://www.zdnet.com) and [CIO.com](https://www.cio.com). The [Stackshare](https://stackshare.io) community also provides real-world usage insights from engineering teams.`;
  },

  (brand: string, category: string, competitors: string[], rank: number, recommended: boolean) => {
    if (recommended) {
      return `If you are evaluating ${category} solutions for your B2B SaaS company, **${brand}** should be at the top of your list.\n\n**Why ${brand} wins:**\n1. Purpose-built for ${category} — not a generic platform\n2. Superior analytics and reporting capabilities\n3. Pricing that scales with growth\n4. Strong API and integration ecosystem\n\nCompared to alternatives:\n${competitors.filter(c => c !== brand).slice(0, 3).map((c, i) => `${i + 1}. ${c} — ${['A solid mature platform but with higher complexity', 'Good for smaller teams but lacks enterprise features', 'Best for specific verticals but narrow in scope'][i]}`).join('\n')}\n\n\nFor third-party validation, [G2](https://www.g2.com) ranks ${brand} highly in its category, and [Forrester](https://www.forrester.com) has highlighted its innovative approach. See [Business Insider](https://www.businessinsider.com) for coverage of its recent funding and growth trajectory.`;
    }

    return `The ${category} market has evolved significantly, and companies now have more choices than ever. Here is a data-driven assessment:\n\n${competitors.slice(0, 5).map((c, i) => {
      const isBrand = c === brand;
      return `**${i + 1}. ${c}**${isBrand ? ' (your product)' : ''}`;
    }).join('\n')}\n\n${brand} ranks #${rank} in this analysis. While it is a capable platform, several competitors have pulled ahead in specific areas like AI-powered automation, native integrations, and community support.\n\n**Recommendation:** ${brand} is worth considering if your priorities align with its strengths. However, I suggest evaluating competitors for a well-rounded decision.\n\nDetailed comparisons are available on [G2](https://www.g2.com), [Capterra](https://www.capterra.com), and [Peerspot](https://www.peerspot.com). Analyst reports from [Gartner](https://www.gartner.com) and [Forrester](https://www.forrester.com) provide additional strategic context.`;
  },

  (_brand: string, category: string, _competitors: string[], _rank: number, recommended: boolean) => {
    if (recommended) {
      return `Based on my analysis of the ${category} space, there is a clear standout.\n\n**Top Pick:** The market leader in this category offers an exceptional combination of features, usability, and value. It is particularly well-suited for growing B2B SaaS companies that need a solution that can scale with them.\n\n**What to look for in a ${category} platform:**\n• Ease of implementation and onboarding\n• Integration capabilities with existing tools\n• Reporting and analytics depth\n• Pricing transparency and predictability\n• Customer support quality\n\nSeveral platforms compete effectively in this space, and the right choice ultimately depends on your specific requirements. I recommend scheduling demos with your top candidates and taking advantage of free trials.\n\nFor comprehensive reviews, [G2](https://www.g2.com) and [Capterra](https://www.capterra.com) offer extensive user feedback. For deeper analysis, [Forrester](https://www.forrester.com) and [Gartner](https://www.gartner.com) publish detailed market evaluations. [TechCrunch](https://techcrunch.com) and [VentureBeat](https://venturebeat.com) cover the latest product announcements and funding news.`;
    }

    return `When evaluating ${category} options, it helps to understand the current competitive landscape. Here is my assessment:\n\nSeveral platforms compete in this space, each with different strengths. The key is matching your specific requirements — team size, budget, technical sophistication — to the right solution.\n\n**Factors to consider:**\n1. Total cost of ownership beyond base pricing\n2. Integration depth with your existing tech stack\n3. Learning curve and implementation timeline\n4. Customer support and community resources\n5. Product roadmap and innovation trajectory\n\nI recommend creating a weighted scorecard based on your priorities and evaluating each platform against it. User reviews on [G2](https://www.g2.com), [Capterra](https://www.capterra.com), and [TrustRadius](https://www.trustradius.com) are excellent starting points. For industry-specific insights, [CIO.com](https://www.cio.com) and [InformationWeek](https://www.informationweek.com) publish regular comparisons.`;
  },
];

const COMPETITOR_DESCRIPTIONS: Record<string, string[]> = {
  'Salesforce': ['Industry giant with extensive customization', 'Enterprise-focused with massive ecosystem', 'Powerful but complex platform'],
  'HubSpot': ['Strong inbound marketing and sales alignment', 'Excellent for mid-market companies', 'User-friendly with good CRM foundation'],
  'Pipedrive': ['Deal-focused pipeline management', 'Simple and intuitive for small teams', 'Great for sales process visualization'],
  'Zoho CRM': ['Affordable with broad feature set', 'Good value for small to mid-size businesses', 'Comprehensive suite at competitive pricing'],
  'Freshworks': ['Modern UX with AI-powered features', 'Great customer support focus', 'Good balance of features and usability'],
  'Microsoft Dynamics': ['Deep Microsoft ecosystem integration', 'Enterprise-grade with advanced analytics', 'Best for organizations already on Microsoft stack'],
  'Copper': ['Native Google Workspace integration', 'Good for Google-centric organizations', 'Simple relationship-focused CRM'],
  'Keap': ['Automation-focused for small businesses', 'Good for service-based businesses', 'Strong marketing automation features'],
};

function getDescriptionForCompetitor(name: string, _category: string, index: number): string {
  const descs = COMPETITOR_DESCRIPTIONS[name];
  if (descs) return descs[index % descs.length];
  const fallbacks = [
    'Popular choice with strong market presence',
    'Growing platform with good reviews',
    'Established player in the space',
    'Niche solution with dedicated user base',
    'Well-funded competitor with rapid innovation',
    'Feature-rich alternative worth considering',
  ];
  return fallbacks[index % fallbacks.length];
}

function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function getCitations(
  seed: number,
  domain: string,
  competitors: { name: string; domain: string }[]
) {
  const citations: {
    url: string;
    domain: string;
    sourceType: string;
    isTargetDomain: boolean;
    isCompetitorDomain: boolean;
  }[] = [];

  let s = seed;

  const addCitation = (domainName: string, isTarget: boolean, isCompetitor: boolean) => {
    const paths = ['reviews', 'comparisons', 'pricing', 'features', 'alternatives', 'products'];
    const path = paths[s % paths.length];
    s = ((s << 5) - s) + 1;
    citations.push({
      url: `https://www.${domainName}/${path}`,
      domain: domainName,
      sourceType: 'review',
      isTargetDomain: isTarget,
      isCompetitorDomain: isCompetitor,
    });
  };

  const thirdPartyCount = 2 + (s % 3);
  s = ((s << 5) - s) + 1;

  const shuffledDomains = [...THIRD_PARTY_DOMAINS].sort((a, b) => {
    const ha = hashSeed(a + s);
    const hb = hashSeed(b + s);
    return ha - hb;
  });

  for (let i = 0; i < thirdPartyCount; i++) {
    addCitation(shuffledDomains[i % shuffledDomains.length], false, false);
  }

  if (seed % 3 !== 0) {
    addCitation(domain, true, false);
  }

  if (seed % 5 > 2 && competitors.length > 0) {
    const comp = competitors[seed % competitors.length];
    addCitation(comp.domain, false, true);
  }

  return citations;
}

function getMentions(
  seed: number,
  brandName: string,
  competitors: { name: string; domain: string }[],
  targetMentioned: boolean,
  targetRank: number
) {
  const mentions: {
    name: string;
    type: 'target' | 'competitor' | 'thirdParty';
    count: number;
    rankPosition: number;
  }[] = [];
  let s = seed;

  if (targetMentioned) {
    const count = 1 + (s % 3);
    s = ((s << 5) - s) + 1;
    mentions.push({
      name: brandName,
      type: 'target',
      count,
      rankPosition: targetRank,
    });
  }

  const competitorSubset = competitors.filter((c) => {
    const h = hashSeed(c.name + s);
    return h % 2 === 0;
  });

  s = ((s << 5) - s) + 1;

  for (const comp of competitorSubset) {
    const count = 1 + (s % 2);
    s = ((s << 5) - s) + 1;
    mentions.push({
      name: comp.name,
      type: 'competitor',
      count,
      rankPosition: 0,
    });
  }

  if (competitorSubset.length === 0 && targetMentioned && competitors.length > 0) {
    const fallback = competitors[seed % competitors.length];
    mentions.push({
      name: fallback.name,
      type: 'competitor',
      count: 1,
      rankPosition: 0,
    });
  }

  return mentions;
}

export class MockProvider implements Provider {
  name: string;
  displayName: string;

  constructor(public config: ProviderConfig) {
    this.name = config.name;
    this.displayName = config.displayName;
  }

  async runPrompt(prompt: string, context: ProviderContext): Promise<ProviderResult> {
    const { brandName, domain, productCategory, competitors } = context;

    const seedStr = `${prompt}:${this.name}:${brandName}`;
    const seed = hashSeed(seedStr);
    let s = seed;

    const targetMentioned = s % 10 < 6;
    s = ((s << 5) - s) + 1;

    const targetRecommended = s % 10 < 4;
    s = ((s << 5) - s) + 1;

    const targetRank = targetMentioned ? 1 + (s % 5) : 0;
    s = ((s << 5) - s) + 1;

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (targetMentioned) {
      if (targetRecommended) {
        sentiment = 'positive';
      } else if (targetRank <= 2) {
        sentiment = 'positive';
      } else if (targetRank >= 4) {
        sentiment = 'negative';
      }
    }
    s = ((s << 5) - s) + 1;

    const compNames = competitors.map((c) => c.name);
    const templateIndex = seed % RESPONSE_TEMPLATES.length;
    const responseText = RESPONSE_TEMPLATES[templateIndex](
      brandName,
      productCategory,
      compNames.length > 0 ? [brandName, ...compNames] : [brandName, 'Salesforce', 'HubSpot', 'Pipedrive'],
      targetRank,
      targetRecommended
    );

    const citations = getCitations(s, domain, competitors);
    s = ((s << 5) - s) + 1;

    const detectedMentions = getMentions(s, brandName, competitors, targetMentioned, targetRank);

    const confidence = Math.min(95, Math.round(50 + (seed % 40) + detectedMentions.length * 2));

    const firstSentence = responseText.split('.')[0] || '';
    const secondSentence = responseText.split('.')[1] || '';
    const responseSummary = `${firstSentence}.${secondSentence}.`.trim();

    return {
      model: this.name,
      responseText,
      responseSummary,
      targetMentioned,
      targetRecommended,
      targetRank,
      sentiment,
      confidence,
      detectedMentions,
      citations,
    };
  }
}
