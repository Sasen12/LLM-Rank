import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod/v4';
import {
  normalizeUrl,
  fetchUrlSafely,
  fetchRobotsTxt,
  fetchSitemap,
  fetchLlmsTxt,
  analyzeHtml,
  scoreGeoAudit,
  createFindings,
  getDemoAuditData,
} from '@/lib/audit';

const geoAuditSchema = z.object({
  url: z.string().optional(),
});

export async function POST(
  request: NextRequest,
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

    const body = await request.json();
    const parsed = geoAuditSchema.parse(body);

    const targetUrl = parsed.url ? normalizeUrl(parsed.url) : normalizeUrl(project.domain);

    const domain = new URL(targetUrl).hostname.replace(/^www\./, '');

    const robotsResult = await fetchRobotsTxt(domain);
    const sitemapResult = await fetchSitemap(domain);
    const llmsResult = await fetchLlmsTxt(domain);

    let analysis;
    let scores;
    let findings;

    const { html, error } = await fetchUrlSafely(targetUrl);

    if (html && !error) {
      analysis = await analyzeHtml(html, targetUrl);
      analysis.hasRobotsTxt = robotsResult.exists;
      analysis.hasSitemapXml = sitemapResult.exists;
      analysis.hasLlmsTxt = llmsResult.exists;

      scores = scoreGeoAudit(analysis);
      findings = createFindings(analysis, scores);
    } else {
      const demo = getDemoAuditData();
      analysis = demo.analysis;
      scores = demo.scores;
      findings = demo.findings;
    }

    const geoAudit = await db.geoAudit.create({
      data: {
        projectId,
        url: targetUrl,
        overallScore: scores.overallScore,
        crawlabilityScore: scores.crawlabilityScore,
        technicalScore: scores.technicalScore,
        contentDepthScore: scores.contentDepthScore,
        entityClarityScore: scores.entityClarityScore,
        citationReadinessScore: scores.citationReadinessScore,
        findingsJson: JSON.stringify(findings),
      },
    });

    return Response.json({
      data: {
        ...geoAudit,
        findings: JSON.parse(geoAudit.findingsJson),
        analysis: {
          title: analysis.title,
          metaDescription: analysis.metaDescription,
          h1: analysis.h1,
          headingHierarchy: analysis.headingHierarchy,
          canonicalUrl: analysis.canonicalUrl,
          hasRobotsTxt: analysis.hasRobotsTxt,
          hasSitemapXml: analysis.hasSitemapXml,
          hasLlmsTxt: analysis.hasLlmsTxt,
          hasJsonLd: analysis.hasJsonLd,
          hasOpenGraph: analysis.hasOpenGraph,
          hasPricingSignal: analysis.hasPricingSignal,
          hasComparisonSignal: analysis.hasComparisonSignal,
          hasCaseStudySignal: analysis.hasCaseStudySignal,
          hasFaqSignal: analysis.hasFaqSignal,
          hasDocsSignal: analysis.hasDocsSignal,
          hasProductUseCaseSignal: analysis.hasProductUseCaseSignal,
          textToHtmlRatio: analysis.textToHtmlRatio,
          wordCount: analysis.wordCount,
          internalLinksCount: analysis.internalLinksCount,
          externalLinksCount: analysis.externalLinksCount,
          isSpaWarning: analysis.isSpaWarning,
          hasEntityMentions: analysis.hasEntityMentions,
          competitorComparisonReadiness: analysis.competitorComparisonReadiness,
        },
        robots: robotsResult,
        sitemap: { exists: sitemapResult.exists, urlCount: sitemapResult.urls.length },
        llms: llmsResult,
        fetchError: error,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error(error);
    return Response.json({ error: 'Failed to run GEO audit' }, { status: 500 });
  }
}
