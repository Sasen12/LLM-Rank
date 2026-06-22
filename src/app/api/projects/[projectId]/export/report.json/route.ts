import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        competitors: true,
        metricSnapshots: {
          orderBy: { createdAt: 'desc' },
        },
        prompts: {
          orderBy: { createdAt: 'asc' },
        },
        scans: {
          orderBy: { createdAt: 'desc' },
          include: {
            aiResponses: {
              include: {
                prompt: true,
                detectedMentions: true,
                citations: true,
              },
            },
            metricSnapshots: true,
          },
        },
        geoAudits: {
          orderBy: { createdAt: 'desc' },
        },
        contentBriefs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    const report = {
      exportedAt: new Date().toISOString(),
      project: {
        id: project.id,
        brandName: project.brandName,
        domain: project.domain,
        productCategory: project.productCategory,
        shortDescription: project.shortDescription,
        targetAudience: project.targetAudience,
        primaryUseCases: project.primaryUseCases,
        region: project.region,
        language: project.language,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      competitors: project.competitors,
      metricSnapshots: project.metricSnapshots,
      prompts: project.prompts,
      scans: project.scans.map((scan) => ({
        id: scan.id,
        status: scan.status,
        scanMode: scan.scanMode,
        models: JSON.parse(scan.modelsJson || '[]'),
        startedAt: scan.startedAt,
        completedAt: scan.completedAt,
        createdAt: scan.createdAt,
        metricSnapshots: scan.metricSnapshots,
        responses: scan.aiResponses.map((r) => ({
          id: r.id,
          model: r.model,
          promptId: r.promptId,
          promptText: r.prompt?.text ?? '',
          promptFunnelStage: r.prompt?.funnelStage ?? '',
          responseSummary: r.responseSummary,
          responseText: r.responseText,
          targetMentioned: r.targetMentioned,
          targetRecommended: r.targetRecommended,
          targetRank: r.targetRank,
          sentiment: r.sentiment,
          confidence: r.confidence,
          createdAt: r.createdAt,
          mentions: r.detectedMentions,
          citations: r.citations,
        })),
      })),
      geoAudits: project.geoAudits.map((a) => ({
        ...a,
        findings: JSON.parse(a.findingsJson || '[]'),
      })),
      contentBriefs: project.contentBriefs,
    };

    return Response.json(report, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="report-${projectId}.json"`,
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to export report' }, { status: 500 });
  }
}
