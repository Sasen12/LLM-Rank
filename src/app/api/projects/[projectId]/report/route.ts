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
          take: 1,
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

    const latestMetrics = project.metricSnapshots[0] || null;

    const latestScan = project.scans[0] || null;
    const responses = latestScan?.aiResponses || [];

    const responseSummary = {
      total: responses.length,
      byModel: groupBy(responses, 'model'),
      bySentiment: groupBy(responses, 'sentiment'),
      targetMentioned: responses.filter((r) => r.targetMentioned).length,
      targetRecommended: responses.filter((r) => r.targetRecommended).length,
    };

    const scansWithSummary = project.scans.map((scan) => ({
      ...scan,
      models: JSON.parse(scan.modelsJson || '[]'),
      responseSummary: {
        total: scan.aiResponses.length,
        targetMentioned: scan.aiResponses.filter((r) => r.targetMentioned).length,
        targetRecommended: scan.aiResponses.filter((r) => r.targetRecommended).length,
      },
    }));

    const report = {
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
      latestMetrics,
      latestScan: latestScan
        ? {
            id: latestScan.id,
            status: latestScan.status,
            scanMode: latestScan.scanMode,
            models: JSON.parse(latestScan.modelsJson || '[]'),
            startedAt: latestScan.startedAt,
            completedAt: latestScan.completedAt,
            createdAt: latestScan.createdAt,
            responses: responseSummary,
          }
        : null,
      scans: scansWithSummary,
      geoAudits: project.geoAudits.map((audit) => ({
        ...audit,
        findings: JSON.parse(audit.findingsJson || '[]'),
      })),
      contentBriefs: project.contentBriefs,
      prompts: project.prompts,
    };

    return Response.json({ data: report });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

function groupBy<T extends Record<string, unknown>>(arr: T[], key: string): Record<string, number> {
  return arr.reduce(
    (acc, item) => {
      const val = String(item[key]);
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}
