import { AIResponse, DetectedMention, Citation } from '@prisma/client';

export function calculateAiMentionRate(
  responses: Pick<AIResponse, 'targetMentioned'>[]
): number {
  if (responses.length === 0) return 0;
  const mentioned = responses.filter((r) => r.targetMentioned).length;
  return Math.round((mentioned / responses.length) * 100);
}

export function calculatePromptCoverage(
  responses: Pick<AIResponse, 'targetMentioned' | 'promptId'>[]
): number {
  const promptIds = new Set(responses.map((r) => r.promptId));
  if (promptIds.size === 0) return 0;
  const coveredPrompts = new Set(
    responses.filter((r) => r.targetMentioned).map((r) => r.promptId)
  );
  return Math.round((coveredPrompts.size / promptIds.size) * 100);
}

export function calculateCitationScore(
  citations: Pick<Citation, 'isTargetDomain'>[]
): number {
  if (citations.length === 0) return 0;
  const targetCitations = citations.filter((c) => c.isTargetDomain).length;
  return Math.round((targetCitations / citations.length) * 100);
}

export function calculateCompetitorDominance(
  mentions: Pick<DetectedMention, 'type' | 'count'>[]
): number {
  const targetMentions = mentions
    .filter((m) => m.type === 'target')
    .reduce((s, m) => s + m.count, 0);
  const competitorMentions = mentions
    .filter((m) => m.type === 'competitor')
    .reduce((s, m) => s + m.count, 0);
  const total = targetMentions + competitorMentions;
  if (total === 0) return 0;
  return Math.round((competitorMentions / Math.max(1, total)) * 100);
}

export function calculateVisibilityScore(
  aiMentionRate: number,
  promptCoverage: number,
  citationScore: number,
  competitorDominance: number
): number {
  return Math.round(
    aiMentionRate * 0.35 +
      promptCoverage * 0.25 +
      citationScore * 0.25 +
      (100 - competitorDominance) * 0.15
  );
}
