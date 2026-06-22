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
    });

    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    const responses = await db.aIResponse.findMany({
      where: {
        scan: { projectId },
      },
      include: {
        prompt: true,
        detectedMentions: true,
        citations: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'id', 'model', 'promptText', 'funnelStage', 'responseSummary',
      'targetMentioned', 'targetRecommended', 'targetRank',
      'sentiment', 'confidence', 'mentions', 'citations', 'createdAt',
    ];

    const csvRows = [headers.join(',')];

    for (const r of responses) {
      const mentionsStr = r.detectedMentions
        .map((m) => `${m.name}(${m.type}:${m.count})`)
        .join('; ');

      const citationsStr = r.citations
        .map((c) => c.domain)
        .join('; ');

      const values = [
        r.id,
        r.model,
        r.prompt?.text ?? '',
        r.prompt?.funnelStage ?? '',
        r.responseSummary,
        r.targetMentioned ? 'Yes' : 'No',
        r.targetRecommended ? 'Yes' : 'No',
        r.targetRank,
        r.sentiment,
        r.confidence,
        mentionsStr,
        citationsStr,
        r.createdAt.toISOString(),
      ];

      const escaped = values.map((v) => {
        const s = String(v ?? '').replace(/"/g, '""');
        return `"${s}"`;
      });
      csvRows.push(escaped.join(','));
    }

    const csv = csvRows.join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="scan-results-${projectId}.csv"`,
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to export results' }, { status: 500 });
  }
}
