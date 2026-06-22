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

    const prompts = await db.prompt.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    const headers = ['id', 'text', 'funnelStage', 'persona', 'intent', 'tags', 'createdAt'];
    const csvRows = [headers.join(',')];

    for (const prompt of prompts) {
      const values = headers.map((h) => {
        const val = (prompt as Record<string, unknown>)[h] ?? '';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csv = csvRows.join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="prompts-${projectId}.csv"`,
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to export prompts' }, { status: 500 });
  }
}
