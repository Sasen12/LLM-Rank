import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { DEMO_PROMPTS } from '@/lib/seed-data';

const FUNNEL_STAGES = ['awareness', 'consideration', 'decision'];
const PERSONAS = ['founder', 'vp_sales', 'sales_manager', 'cto', 'investor'];
const INTENTS = [
  'research', 'comparison', 'feature_comparison', 'pricing',
  'integration_check', 'market_research', 'roi_analysis', 'social_proof',
  'capability_check', 'education', 'pricing_comparison', 'suitability_check',
  'technical_evaluation', 'feature_research', 'support_comparison',
  'direct_comparison',
];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generatePromptTemplates(
  brandName: string,
  category: string,
  audience: string,
  competitors: { name: string; domain: string }[],
  count: number
) {
  const templates: string[] = [];

  const awarenessTemplates = [
    `What are the best ${category} platforms for ${audience} in 2025?`,
    `Top 5 ${category} tools for growing ${audience}.`,
    `What is ${brandName} and how does it help ${audience}?`,
    `Which ${category} solutions are most popular among ${audience}?`,
    `What features should I look for in a ${category} platform for my ${audience} team?`,
    `How is AI transforming ${category} for ${audience}?`,
    `What are the latest trends in ${category} for ${audience}?`,
    `Why do ${audience} need a dedicated ${category} platform?`,
  ];

  const considerationTemplates = [
    `Compare ${brandName} vs ${competitors[0]?.name || 'leading alternatives'} for ${audience}.`,
    `How does ${brandName} compare to ${competitors[1]?.name || 'other solutions'} in terms of features?`,
    `What are the pros and cons of ${brandName} for ${audience}?`,
    `Detailed comparison of ${brandName} and ${competitors[2]?.name || 'top competitors'} for ${category}.`,
    `Which ${category} has the best integration ecosystem for ${audience}?`,
    `Compare pricing for ${brandName}, ${competitors.slice(0, 3).map((c) => c.name).join(', ')}.`,
    `How does ${brandName} handle pipeline management compared to ${competitors[0]?.name || 'alternatives'}?`,
    `What do users say about ${brandName} on G2 and Capterra?`,
  ];

  const decisionTemplates = [
    `Is ${brandName} the right ${category} for a ${audience} company scaling from 30 to 100 employees?`,
    `${brandName} vs ${competitors[0]?.name || 'alternatives'}: which is better for ${audience}?`,
    `What is the ROI of implementing ${brandName} for ${audience}?`,
    `Best ${category} for ${audience} with advanced reporting needs.`,
    `Which ${category} offers the best value for ${audience} on a budget?`,
    `Top-rated ${category} platforms according to ${audience} reviews in 2025.`,
    `Which ${category} has the strongest AI capabilities for ${audience}?`,
    `${brandName} pricing review: is it worth it for ${audience}?`,
    `How does ${brandName} ensure data security and compliance for ${audience}?`,
    `What is the implementation timeline for ${brandName} at a ${audience} company?`,
  ];

  const allTemplates = [
    ...awarenessTemplates.map((t) => ({ text: t, funnelStage: 'awareness' })),
    ...considerationTemplates.map((t) => ({ text: t, funnelStage: 'consideration' })),
    ...decisionTemplates.map((t) => ({ text: t, funnelStage: 'decision' })),
  ];

  const shuffled = shuffleArray(allTemplates);

  const result: {
    text: string;
    funnelStage: string;
    persona: string;
    intent: string;
    tags: string;
  }[] = [];

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const template = shuffled[i];
    const persona = PERSONAS[i % PERSONAS.length];
    const intent = INTENTS[i % INTENTS.length];

    result.push({
      text: template.text,
      funnelStage: template.funnelStage,
      persona,
      intent,
      tags: `${template.funnelStage},${persona},${intent}`,
    });
  }

  return result;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { competitors: true },
    });

    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    const promptTemplates = generatePromptTemplates(
      project.brandName,
      project.productCategory,
      project.targetAudience,
      project.competitors.map((c) => ({ name: c.name, domain: c.domain })),
      20
    );

    const prompts = await db.$transaction(
      promptTemplates.map((pt) =>
        db.prompt.create({
          data: {
            projectId,
            text: pt.text,
            funnelStage: pt.funnelStage,
            persona: pt.persona,
            intent: pt.intent,
            tags: pt.tags,
          },
        })
      )
    );

    return Response.json({ data: prompts }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to generate prompts' }, { status: 500 });
  }
}
