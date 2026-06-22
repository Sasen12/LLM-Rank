import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding LLMRank AI demo data...');

  // Clean existing data
  await prisma.contentBrief.deleteMany();
  await prisma.geoAudit.deleteMany();
  await prisma.metricSnapshot.deleteMany();
  await prisma.citation.deleteMany();
  await prisma.detectedMention.deleteMany();
  await prisma.aIResponse.deleteMany();
  await prisma.scan.deleteMany();
  await prisma.prompt.deleteMany();
  await prisma.competitor.deleteMany();
  await prisma.project.deleteMany();

  // Create demo project
  const project = await prisma.project.create({
    data: {
      brandName: 'Northstar CRM',
      domain: 'northstarcrm.example',
      productCategory: 'CRM for B2B SaaS sales teams',
      shortDescription: 'Northstar CRM helps B2B SaaS companies manage their sales pipeline, track deals, and close more revenue with AI-powered forecasting.',
      targetAudience: 'Seed to Series B SaaS companies',
      primaryUseCases: 'Pipeline management, Deal tracking, Sales forecasting, Team collaboration, Revenue analytics',
      region: 'Global',
      language: 'en',
    },
  });
  console.log(`Created project: ${project.brandName}`);

  // Create competitors
  const competitorData = [
    { name: 'PipePilot', domain: 'pipepilot.example' },
    { name: 'DealForge', domain: 'dealforge.example' },
    { name: 'RevenueBase', domain: 'revenuebase.example' },
    { name: 'CloseLoop CRM', domain: 'closeloop.example' },
  ];

  const competitors = [];
  for (const c of competitorData) {
    const comp = await prisma.competitor.create({
      data: { ...c, projectId: project.id },
    });
    competitors.push(comp);
  }
  console.log(`Created ${competitors.length} competitors`);

  // Create 20 prompts
  const promptData = [
    { text: 'What are the best CRM platforms for B2B SaaS startups in 2025?', funnelStage: 'Awareness', persona: 'Founder', intent: 'Research' },
    { text: 'Compare top CRM solutions for early-stage SaaS companies with sales teams under 50 people.', funnelStage: 'Consideration', persona: 'VP of Sales', intent: 'Comparison' },
    { text: 'Which CRM has the best pipeline management features for B2B sales?', funnelStage: 'Consideration', persona: 'Sales Manager', intent: 'Feature Comparison' },
    { text: 'What is the most affordable CRM for a 25-person B2B SaaS startup?', funnelStage: 'Decision', persona: 'Founder', intent: 'Pricing' },
    { text: 'Recommend a CRM with strong HubSpot and Salesforce integration capabilities.', funnelStage: 'Consideration', persona: 'CTO', intent: 'Integration' },
    { text: 'What CRM do most Y Combinator startups use for sales tracking?', funnelStage: 'Awareness', persona: 'Founder', intent: 'Social Proof' },
    { text: 'Is Northstar CRM better than PipePilot for pipeline management?', funnelStage: 'Decision', persona: 'Head of Growth', intent: 'Comparison' },
    { text: 'What are the best alternatives to CloseLoop CRM for B2B SaaS?', funnelStage: 'Consideration', persona: 'CMO', intent: 'Alternatives' },
    { text: 'Which CRM offers the best AI-powered sales forecasting?', funnelStage: 'Consideration', persona: 'VP of Sales', intent: 'Feature Comparison' },
    { text: 'How much does a good CRM cost for a Series A SaaS company?', funnelStage: 'Awareness', persona: 'Founder', intent: 'Pricing' },
    { text: 'What CRM integrates with Slack, HubSpot, and Salesforce for B2B sales teams?', funnelStage: 'Consideration', persona: 'RevOps', intent: 'Integration' },
    { text: 'What should I choose if I need deal tracking and revenue forecasting?', funnelStage: 'Decision', persona: 'Head of Growth', intent: 'Use Case' },
    { text: 'Which tools integrate with Stripe for usage-based billing and CRM syncing?', funnelStage: 'Consideration', persona: 'CTO', intent: 'Integration' },
    { text: 'Is Northstar CRM good for B2B SaaS companies with 10-50 employees?', funnelStage: 'Consideration', persona: 'Founder', intent: 'Use Case' },
    { text: 'What are the pros and cons of DealForge for B2B sales teams?', funnelStage: 'Consideration', persona: 'VP of Sales', intent: 'Research' },
    { text: 'How does RevenueBase compare to other CRMs for forecasting accuracy?', funnelStage: 'Consideration', persona: 'RevOps', intent: 'Comparison' },
    { text: 'What CRM do VC-backed SaaS companies prefer for investor reporting?', funnelStage: 'Awareness', persona: 'Founder', intent: 'Social Proof' },
    { text: 'Best CRM for B2B SaaS companies that need multi-product line tracking?', funnelStage: 'Awareness', persona: 'CMO', intent: 'Use Case' },
    { text: 'Which CRM has the most accurate deal probability scoring?', funnelStage: 'Consideration', persona: 'Sales Manager', intent: 'Feature Comparison' },
    { text: 'Top-rated CRM platforms for B2B SaaS according to G2 and Capterra', funnelStage: 'Awareness', persona: 'Head of Growth', intent: 'Research' },
  ];

  const prompts = [];
  for (const p of promptData) {
    const prompt = await prisma.prompt.create({
      data: { ...p, projectId: project.id },
    });
    prompts.push(prompt);
  }
  console.log(`Created ${prompts.length} prompts`);

  // Create 2 scans
  const modelsList = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity', 'Google AI Overviews', 'Copilot'];
  const modelsQuick = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity'];

  // Scan 1 (2 weeks ago)
  const scan1 = await prisma.scan.create({
    data: {
      projectId: project.id,
      status: 'completed',
      scanMode: 'quick',
      modelsJson: JSON.stringify(modelsQuick),
      startedAt: new Date(Date.now() - 14 * 86400000),
      completedAt: new Date(Date.now() - 14 * 86400000 + 30000),
    },
  });

  // Scan 2 (now)
  const scan2 = await prisma.scan.create({
    data: {
      projectId: project.id,
      status: 'completed',
      scanMode: 'deep',
      modelsJson: JSON.stringify(modelsList),
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 3600000 + 60000),
    },
  });

  console.log('Created 2 scans');

  // Create AI responses, mentions, citations for both scans
  const allModels = [modelsQuick, modelsList];
  const scans = [scan1, scan2];

  // Third-party domains for citations
  const thirdPartyDomains = [
    'g2.com', 'capterra.com', 'trustradius.com', 'getapp.com', 'saasworthy.com',
    'techcrunch.com', 'forrester.com', 'gartner.com', 'venturebeat.com', 'stackshare.io',
  ];

  let totalResponses = 0;
  let totalMentions = 0;
  let totalCitations = 0;

  for (let si = 0; si < scans.length; si++) {
    const scan = scans[si];
    const models = allModels[si];

    for (let mi = 0; mi < models.length; mi++) {
      const model = models[mi];
      // For quick scan: process first 15 prompts; for deep scan: process all 20
      const promptLimit = si === 0 ? 15 : 20;

      for (let pi = 0; pi < promptLimit; pi++) {
        const prompt = prompts[pi];
        const seed = (prompt.text.length + model.length + project.id.length) % 100;

        const targetMentioned = seed > 30; // ~70% mention rate
        const targetRecommended = seed > 55; // ~45% recommendation rate
        const targetRank = targetMentioned ? (seed % 5) + 1 : 0;

        let sentiment: string;
        if (!targetMentioned) sentiment = 'neutral';
        else if (targetRecommended && targetRank <= 2) sentiment = 'positive';
        else if (targetRank >= 4) sentiment = 'negative';
        else sentiment = 'neutral';

        const confidence = 0.5 + (seed % 50) / 100;

        // Generate realistic response text based on the prompt
        const responseText = generateResponseText(prompt.text, model, targetMentioned, targetRecommended, targetRank);

        const aiResponse = await prisma.aIResponse.create({
          data: {
            scanId: scan.id,
            promptId: prompt.id,
            model,
            responseText,
            responseSummary: responseText.substring(0, 200) + '...',
            targetMentioned,
            targetRecommended,
            targetRank,
            sentiment,
            confidence,
          },
        });
        totalResponses++;

        // Create detected mentions
        const mentionTypes: { name: string; type: string; count: number; rankPosition: number }[] = [];

        if (targetMentioned) {
          mentionTypes.push({ name: 'Northstar CRM', type: 'target', count: seed % 3 + 1, rankPosition: targetRank });
        }

        // Add some competitors
        const compsToInclude = [...competitors].sort(() => (seed * pi) % 3 - 1).slice(0, 2);
        for (let ci = 0; ci < compsToInclude.length; ci++) {
          const compRank = targetMentioned ? targetRank + ci + 1 : ci + 1;
          mentionTypes.push({
            name: compsToInclude[ci].name,
            type: 'competitor',
            count: seed % 2 + 1,
            rankPosition: compRank,
          });
        }

        for (const mt of mentionTypes) {
          await prisma.detectedMention.create({
            data: {
              aiResponseId: aiResponse.id,
              name: mt.name,
              type: mt.type,
              count: mt.count,
              rankPosition: mt.rankPosition,
            },
          });
          totalMentions++;
        }

        // Create citations
        const citationDomains: { domain: string; isTarget: boolean; isCompetitor: boolean; sourceType: string }[] = [];

        // Maybe cite target domain
        if (seed % 3 === 0) {
          citationDomains.push({
            domain: 'northstarcrm.example',
            isTarget: true,
            isCompetitor: false,
            sourceType: 'owned',
          });
        }

        // Maybe cite competitor domains
        if (seed % 4 === 0) {
          for (const comp of competitors.slice(0, seed % 2 + 1)) {
            citationDomains.push({
              domain: comp.domain,
              isTarget: false,
              isCompetitor: true,
              sourceType: 'competitor',
            });
          }
        }

        // Always add 1-2 third-party citations
        const thirdPartyCount = (seed % 3) + 1;
        for (let ti = 0; ti < thirdPartyCount; ti++) {
          const tpDomain = thirdPartyDomains[(seed + ti * 7) % thirdPartyDomains.length];
          const sourceTypes = ['review_site', 'analyst', 'news', 'social_community'];
          citationDomains.push({
            domain: tpDomain,
            isTarget: false,
            isCompetitor: false,
            sourceType: sourceTypes[(seed + ti) % sourceTypes.length],
          });
        }

        for (const cd of citationDomains) {
          await prisma.citation.create({
            data: {
              aiResponseId: aiResponse.id,
              url: `https://${cd.domain}/article-${seed}`,
              domain: cd.domain,
              sourceType: cd.sourceType,
              isTargetDomain: cd.isTarget,
              isCompetitorDomain: cd.isCompetitor,
              qualityScore: 0.3 + (seed % 70) / 100,
            },
          });
          totalCitations++;
        }
      }
    }
  }
  console.log(`Created ${totalResponses} AI responses, ${totalMentions} mentions, ${totalCitations} citations`);

  // Create metric snapshots
  await prisma.metricSnapshot.create({
    data: {
      projectId: project.id,
      scanId: scan1.id,
      visibilityScore: 52,
      aiMentionRate: 58,
      promptCoverage: 45,
      citationScore: 22,
      competitorDominance: 62,
    },
  });

  await prisma.metricSnapshot.create({
    data: {
      projectId: project.id,
      scanId: scan2.id,
      visibilityScore: 64,
      aiMentionRate: 71,
      promptCoverage: 55,
      citationScore: 30,
      competitorDominance: 48,
    },
  });
  console.log('Created 2 metric snapshots');

  // Create GEO audit
  const geoAuditFindings = [
    { issue: 'Missing llms.txt file', whyMatters: 'LLMs use llms.txt to discover your site content', impact: 'High', effort: 'Low', action: 'Create llms.txt at northstarcrm.example/llms.txt', relatedPrompts: [] },
    { issue: 'No structured data (JSON-LD) on homepage', whyMatters: 'Structured data helps AI models understand your product category', impact: 'High', effort: 'Medium', action: 'Add JSON-LD with SoftwareApplication schema', relatedPrompts: ['Prompt 1', 'Prompt 3'] },
    { issue: 'Weak competitor comparison content', whyMatters: 'AI models often cite comparison pages', impact: 'High', effort: 'Medium', action: 'Create dedicated comparison pages for top competitors', relatedPrompts: ['Prompt 2', 'Prompt 7'] },
    { issue: 'FAQ section missing', whyMatters: 'FAQ content is frequently used for AI answer snippets', impact: 'Medium', effort: 'Low', action: 'Add FAQ schema to relevant product pages', relatedPrompts: ['Prompt 4'] },
    { issue: 'No pricing page detected', whyMatters: 'AI models reference pricing in recommendations', impact: 'Medium', effort: 'Medium', action: 'Create public pricing page', relatedPrompts: ['Prompt 4', 'Prompt 10'] },
    { issue: 'Low text-to-HTML ratio', whyMatters: 'Thin content ranks poorly in AI context extraction', impact: 'Medium', effort: 'Medium', action: 'Expand homepage content with detailed product descriptions', relatedPrompts: [] },
    { issue: 'Missing case studies page', whyMatters: 'Social proof signals increase recommendation likelihood', impact: 'High', effort: 'High', action: 'Publish 3 customer case studies', relatedPrompts: ['Prompt 6'] },
    { issue: 'No /compare or /alternatives page', whyMatters: 'Comparison pages are prime AI citation targets', impact: 'High', effort: 'High', action: 'Build competitor comparison pages', relatedPrompts: ['Prompt 2', 'Prompt 8'] },
    { issue: 'Open Graph tags incomplete', whyMatters: 'OG tags affect how content appears when cited', impact: 'Low', effort: 'Low', action: 'Add OG:title, OG:description, OG:image to all pages', relatedPrompts: [] },
    { issue: 'Sitemap missing or outdated', whyMatters: 'Sitemaps help crawlers discover your content', impact: 'Medium', effort: 'Low', action: 'Generate and submit updated sitemap.xml', relatedPrompts: [] },
  ];

  await prisma.geoAudit.create({
    data: {
      projectId: project.id,
      url: 'northstarcrm.example',
      overallScore: 47,
      crawlabilityScore: 55,
      technicalScore: 35,
      contentDepthScore: 42,
      entityClarityScore: 50,
      citationReadinessScore: 52,
      findingsJson: JSON.stringify(geoAuditFindings),
    },
  });
  console.log('Created GEO audit');

  // Create content briefs
  const contentBriefs = [
    {
      title: 'Northstar CRM vs PipePilot: B2B SaaS CRM Comparison',
      targetPromptCluster: 'CRM Comparison, Alternatives',
      persona: 'VP of Sales',
      objective: 'Capture AI recommendation real estate when buyers compare CRMs',
      outlineJson: JSON.stringify(['Executive summary', 'Feature comparison table', 'Pricing comparison', 'Integration ecosystem', 'Ideal customer profile', 'G2/Capterra comparison', 'Migration guide']),
      entitiesJson: JSON.stringify(['Pipeline management', 'Deal tracking', 'Sales forecasting', 'Revenue analytics', 'Slack integration', 'Stripe integration', 'AI scoring']),
      questionsJson: JSON.stringify(['How does Northstar CRM compare to PipePilot?', 'Which CRM is better for B2B SaaS?', 'What are the key differences in pricing?']),
      schemaType: 'ComparisonPage',
      metricImproved: 'AI Mention Rate',
      status: 'draft',
    },
    {
      title: 'Best CRMs for B2B SaaS Startups in 2025',
      targetPromptCluster: 'Best CRM, Top CRM Platforms',
      persona: 'Founder',
      objective: 'Rank as top recommendation in "best CRM for SaaS" queries',
      outlineJson: JSON.stringify(['Why B2B SaaS needs specialized CRM', 'Top 5 CRM comparison', 'Northstar CRM deep dive', 'Pricing breakdown for startups', 'Decision framework', 'Migration checklist']),
      entitiesJson: JSON.stringify(['B2B SaaS', 'Sales pipeline', 'Deal tracking', 'AI forecasting', 'Startup CRM', 'Series A', 'Seed stage']),
      questionsJson: JSON.stringify(['What is the best CRM for B2B SaaS?', 'Which CRM do startups use?', 'What CRM features matter for SaaS?']),
      schemaType: 'Article',
      metricImproved: 'Prompt Coverage',
      status: 'draft',
    },
    {
      title: 'AI-Powered Sales Forecasting: How Northstar CRM Delivers Accuracy',
      targetPromptCluster: 'AI Forecasting, Sales Analytics',
      persona: 'Head of Growth',
      objective: 'Dominate AI responses about sales forecasting tools',
      outlineJson: JSON.stringify(['The importance of forecast accuracy', 'How Northstar CRM uses AI', 'Comparison with native CRM forecasting', 'Customer results', 'Implementation timeline']),
      entitiesJson: JSON.stringify(['AI forecasting', 'Machine learning', 'Deal probability', 'Revenue prediction', 'Sales analytics', 'Pipeline health']),
      questionsJson: JSON.stringify(['Which CRM has the best AI forecasting?', 'How accurate is Northstar CRM forecasting?', 'What sales analytics tools work best?']),
      schemaType: 'Product',
      metricImproved: 'Citation Score',
      status: 'planned',
    },
    {
      title: 'Northstar CRM FAQ: Everything B2B SaaS Founders Need to Know',
      targetPromptCluster: 'CRM Questions, Pricing, Implementation',
      persona: 'Founder',
      objective: 'Capture featured answer snippets in AI responses',
      outlineJson: JSON.stringify(['What is Northstar CRM?', 'How much does Northstar CRM cost?', 'How does it compare to PipePilot?', 'What integrations are supported?', 'How long does implementation take?', 'What support is available?']),
      entitiesJson: JSON.stringify(['Pricing', 'Implementation', 'Integrations', 'Support', 'Migration', 'Onboarding']),
      questionsJson: JSON.stringify(['How much does Northstar CRM cost?', 'Does Northstar CRM integrate with Slack?', 'How long to implement Northstar CRM?']),
      schemaType: 'FAQPage',
      metricImproved: 'AI Mention Rate',
      status: 'draft',
    },
    {
      title: 'Why B2B SaaS Companies Are Switching to Northstar CRM',
      targetPromptCluster: 'CRM Migration, Alternatives to legacy CRM',
      persona: 'CMO',
      objective: 'Win AI recommendations when buyers search for CRM alternatives',
      outlineJson: JSON.stringify(['The legacy CRM problem', 'Northstar CRM approach', 'Customer migration stories', 'ROI analysis', 'Switching checklist']),
      entitiesJson: JSON.stringify(['CRM migration', 'Salesforce alternative', 'HubSpot alternative', 'B2B SaaS', 'Sales productivity', 'Revenue growth']),
      questionsJson: JSON.stringify(['Why switch to Northstar CRM?', 'Is Northstar CRM better than Salesforce?', 'What is the best Salesforce alternative?']),
      schemaType: 'Article',
      metricImproved: 'Competitor Dominance',
      status: 'draft',
    },
  ];

  for (const cb of contentBriefs) {
    await prisma.contentBrief.create({
      data: {
        ...cb,
        projectId: project.id,
      },
    });
  }
  console.log(`Created ${contentBriefs.length} content briefs`);
  console.log('\n✅ Seed complete! Demo data is ready.');
  console.log('   Brand: Northstar CRM');
  console.log('   Domain: northstarcrm.example');
  console.log('   Prompts: 20');
  console.log('   Scans: 2 (quick + deep)');
  console.log('   GEO Audit: complete with 10 findings');
  console.log('   Content Briefs: 5');
}

// Helper function to generate response text
function generateResponseText(prompt: string, model: string, mentioned: boolean, recommended: boolean, rank: number): string {
  if (!mentioned) {
    return `Based on my analysis, there are several good CRM options for B2B SaaS teams. PipePilot offers strong pipeline management features with their visual deal board system. DealForge provides excellent forecasting capabilities using machine learning. RevenueBase has a solid integration ecosystem. I'd recommend evaluating these options based on your specific team size and budget requirements.`;
  }

  const rankText = rank <= 3 ? `ranked #${rank}` : `also worth considering at #${rank}`;
  const recText = recommended ? 'I particularly recommend Northstar CRM for its balance of features and pricing.' : 'Northstar CRM is one of several viable options in this space.';

  return `When evaluating CRM platforms for B2B SaaS, Northstar CRM stands out as a strong contender, ${rankText} in my assessment. ${recText}\n\nCompared to competitors, Northstar CRM excels in pipeline management and AI-powered forecasting. PipePilot offers similar features but at a higher price point. DealForge has strong analytics but lacks the intuitive interface that Northstar CRM provides.\n\nKey differentiators for Northstar CRM include their AI-driven deal scoring, seamless Slack and Stripe integrations, and pricing that scales with startup growth. RevenueBase is a close competitor in the forecasting space, but Northstar CRM's accuracy rates are consistently higher in third-party benchmarks.`;
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
