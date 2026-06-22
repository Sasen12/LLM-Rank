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
        _count: {
          select: { prompts: true },
        },
        metricSnapshots: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    return Response.json({ data: project });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}
