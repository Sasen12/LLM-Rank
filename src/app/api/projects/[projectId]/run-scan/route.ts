import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod/v4';
import { getActiveProvider } from '@/lib/providers';
import {
  detectMentions,
  detectSentiment,
  detectRank,
  calculateConfidence,
  generateSummary,
  extractUrls,
  extractDomain,
  classifySourceType,
} from '@/lib/analyzer';
import {
  calculateAiMentionRate,
  calculatePromptCoverage,
  calculateCitationScore,
  calculateCompetitorDominance,
  calculateVisibilityScore,
} from '@/lib/metrics';

const scanSchema = z.object({
  models: z.array(z.string()).min(1),
  promptCount: z.number().optional(),
  scanMode: z.enum(['quick', 'deep']).optional().default('quick'),
});

async function runProviderPrompt(
  providerName: string,
  promptText: string,
  context: {
    brandName: string;
    domain: string;
    productCategory: string;
    shortDescription: string;
    targetAudience: string;
    competitors: { name: string; domain: string }[];
  }
) {
  try {
    const provider = getActiveProvider(providerName);
    return await provider.runPrompt(promptText, context);
  } catch (err) {
    console.warn(`Provider "${providerName}" failed, skipping:`, err);
    return null;
  }
}

async function batchPromises<T>(
  items: T[],
  fn: (item: T) => Promise<unknown>,
  concurrency: number = 10
): Promise<void> {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    batches.push(items.slice(i, i + concurrency));
  }

  for (const batch of batches) {
    await Promise.all(batch.map((item) => fn(item)));
  }
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

    const body = await request.json();
    const parsed = scanSchema.parse(body);

    const promptQuery: { projectId: string } = { projectId };
    let prompts = await db.prompt.findMany({
      where: promptQuery,
      orderBy: { createdAt: 'asc' },
    });

    if (prompts.length === 0) {
      return Response.json({ error: 'No prompts found for this project. Generate prompts first.' }, { status: 400 });
    }

    if (parsed.promptCount && parsed.promptCount < prompts.length) {
      prompts = prompts.slice(0, parsed.promptCount);
    }

    const scan = await db.scan.create({
      data: {
        projectId,
        status: 'running',
        scanMode: parsed.scanMode,
        modelsJson: JSON.stringify(parsed.models),
        startedAt: new Date(),
      },
    });

    const competitors = project.competitors.map((c) => ({
      name: c.name,
      domain: c.domain,
    }));

    const providerContext = {
      brandName: project.brandName,
      domain: project.domain,
      productCategory: project.productCategory,
      shortDescription: project.shortDescription,
      targetAudience: project.targetAudience,
      competitors,
    };

    const tasks: { model: string; promptId: string; promptText: string }[] = [];

    for (const model of parsed.models) {
      for (const prompt of prompts) {
        tasks.push({ model, promptId: prompt.id, promptText: prompt.text });
      }
    }

    const totalTasks = tasks.length;
    const results: {
      scanId: string;
      promptId: string;
      model: string;
      responseText: string;
      responseSummary: string;
      targetMentioned: boolean;
      targetRecommended: boolean;
      targetRank: number;
      sentiment: string;
      confidence: number;
      mentions: { name: string; type: string; count: number; rankPosition: number }[];
      citations: { url: string; domain: string; sourceType: string; isTargetDomain: boolean; isCompetitorDomain: boolean }[];
    }[] = [];

    await batchPromises(tasks, async (task) => {
      const providerResult = await runProviderPrompt(task.model, task.promptText, providerContext);

      if (!providerResult) {
        return;
      }

      const mentions = providerResult.detectedMentions.map((m) => ({
        name: m.name,
        type: m.type,
        count: m.count,
        rankPosition: m.rankPosition,
      }));

      const citations = providerResult.citations.map((c) => ({
        url: c.url,
        domain: c.domain,
        sourceType: c.sourceType,
        isTargetDomain: c.isTargetDomain,
        isCompetitorDomain: c.isCompetitorDomain,
      }));

      results.push({
        scanId: scan.id,
        promptId: task.promptId,
        model: providerResult.model,
        responseText: providerResult.responseText,
        responseSummary: providerResult.responseSummary,
        targetMentioned: providerResult.targetMentioned,
        targetRecommended: providerResult.targetRecommended,
        targetRank: providerResult.targetRank,
        sentiment: providerResult.sentiment,
        confidence: providerResult.confidence,
        mentions,
        citations,
      });
    }, 10);

    const allMentions: {
      name: string;
      type: string;
      count: number;
      rankPosition: number;
    }[] = [];
    const allCitations: {
      url: string;
      domain: string;
      sourceType: string;
      isTargetDomain: boolean;
      isCompetitorDomain: boolean;
    }[] = [];

    for (const result of results) {
      const aiResponse = await db.aIResponse.create({
        data: {
          scanId: result.scanId,
          promptId: result.promptId,
          model: result.model,
          responseText: result.responseText,
          responseSummary: result.responseSummary,
          targetMentioned: result.targetMentioned,
          targetRecommended: result.targetRecommended,
          targetRank: result.targetRank,
          sentiment: result.sentiment,
          confidence: result.confidence,
          detectedMentions: {
            create: result.mentions.map((m) => ({
              name: m.name,
              type: m.type,
              count: m.count,
              rankPosition: m.rankPosition,
            })),
          },
          citations: {
            create: result.citations.map((c) => ({
              url: c.url,
              domain: c.domain,
              sourceType: c.sourceType,
              isTargetDomain: c.isTargetDomain,
              isCompetitorDomain: c.isCompetitorDomain,
              qualityScore: c.isTargetDomain ? 0.8 : c.isCompetitorDomain ? 0.3 : 0.5,
            })),
          },
        },
      });

      allMentions.push(...result.mentions);
      allCitations.push(...result.citations);
    }

    const aiMentionRate = calculateAiMentionRate(
      results.map((r) => ({ targetMentioned: r.targetMentioned }))
    );

    const promptCoverage = calculatePromptCoverage(
      results.map((r) => ({ targetMentioned: r.targetMentioned, promptId: r.promptId }))
    );

    const citationScore = calculateCitationScore(
      allCitations.map((c) => ({ isTargetDomain: c.isTargetDomain }))
    );

    const competitorDominance = calculateCompetitorDominance(
      allMentions.map((m) => ({ type: m.type as 'target' | 'competitor', count: m.count }))
    );

    const visibilityScore = calculateVisibilityScore(
      aiMentionRate,
      promptCoverage,
      citationScore,
      competitorDominance
    );

    const metricSnapshot = await db.metricSnapshot.create({
      data: {
        projectId,
        scanId: scan.id,
        visibilityScore,
        aiMentionRate,
        promptCoverage,
        citationScore,
        competitorDominance,
      },
    });

    await db.scan.update({
      where: { id: scan.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    return Response.json({
      data: {
        scanId: scan.id,
        status: 'completed',
        totalPrompts: prompts.length,
        totalModels: parsed.models.length,
        totalResponses: results.length,
        totalTasks,
        metrics: metricSnapshot,
        summary: {
          visibilityScore,
          aiMentionRate,
          promptCoverage,
          citationScore,
          competitorDominance,
        },
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error(error);
    return Response.json({ error: 'Failed to run scan' }, { status: 500 });
  }
}
