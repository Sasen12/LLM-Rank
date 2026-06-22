import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod/v4';

const createProjectSchema = z.object({
  brandName: z.string().min(1),
  domain: z.string().min(1).refine(
    (val) => /^(https?:\/\/)?([\w-]+\.)+[\w-]+/.test(val),
    'Invalid domain format'
  ),
  productCategory: z.string().min(1),
  shortDescription: z.string().optional().default(''),
  targetAudience: z.string().optional().default(''),
  primaryUseCases: z.string().optional().default(''),
  region: z.string().optional().default(''),
  language: z.string().optional().default('en'),
  competitors: z.array(
    z.object({
      name: z.string().min(1),
      domain: z.string().optional().default(''),
    })
  ).optional().default([]),
});

export async function GET() {
  try {
    const projects = await db.project.findMany({
      include: {
        competitors: true,
        metricSnapshots: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ data: projects });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createProjectSchema.parse(body);

    const project = await db.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          brandName: parsed.brandName,
          domain: parsed.domain,
          productCategory: parsed.productCategory,
          shortDescription: parsed.shortDescription,
          targetAudience: parsed.targetAudience,
          primaryUseCases: parsed.primaryUseCases,
          region: parsed.region,
          language: parsed.language,
          competitors: {
            create: parsed.competitors.map((c) => ({
              name: c.name,
              domain: c.domain ?? '',
            })),
          },
        },
        include: {
          competitors: true,
        },
      });
      return created;
    });

    return Response.json({ data: project }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error(error);
    return Response.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
