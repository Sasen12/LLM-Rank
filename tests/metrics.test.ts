import { describe, it, expect } from 'vitest';
import {
  calculateAiMentionRate,
  calculatePromptCoverage,
  calculateCitationScore,
  calculateCompetitorDominance,
  calculateVisibilityScore,
} from '../src/lib/metrics';

describe('calculateAiMentionRate', () => {
  it('returns 0 for empty responses', () => {
    expect(calculateAiMentionRate([])).toBe(0);
  });

  it('returns 100 when all responses mention target', () => {
    const responses = [
      { targetMentioned: true },
      { targetMentioned: true },
      { targetMentioned: true },
    ];
    expect(calculateAiMentionRate(responses)).toBe(100);
  });

  it('returns 50 when half mention target', () => {
    const responses = [
      { targetMentioned: true },
      { targetMentioned: false },
    ];
    expect(calculateAiMentionRate(responses)).toBe(50);
  });

  it('returns 0 when none mention target', () => {
    const responses = [
      { targetMentioned: false },
      { targetMentioned: false },
    ];
    expect(calculateAiMentionRate(responses)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    const responses = [
      { targetMentioned: true },
      { targetMentioned: false },
      { targetMentioned: false },
    ];
    expect(calculateAiMentionRate(responses)).toBe(33);
  });
});

describe('calculatePromptCoverage', () => {
  it('returns 0 for empty responses', () => {
    expect(calculatePromptCoverage([])).toBe(0);
  });

  it('returns 100 when target mentioned for all unique prompts', () => {
    const responses = [
      { targetMentioned: true, promptId: '1' },
      { targetMentioned: true, promptId: '2' },
      { targetMentioned: true, promptId: '3' },
    ];
    expect(calculatePromptCoverage(responses)).toBe(100);
  });

  it('returns 50 when target mentioned for half of prompts', () => {
    const responses = [
      { targetMentioned: true, promptId: '1' },
      { targetMentioned: false, promptId: '2' },
      { targetMentioned: true, promptId: '1' }, // duplicate prompt, different model
      { targetMentioned: false, promptId: '2' },
    ];
    // prompt 1 covered (at least one model mentioned), prompt 2 not covered
    expect(calculatePromptCoverage(responses)).toBe(50);
  });

  it('handles multiple responses per prompt correctly', () => {
    const responses = [
      { targetMentioned: false, promptId: '1' },
      { targetMentioned: true, promptId: '1' }, // second model mentions target
      { targetMentioned: false, promptId: '2' },
    ];
    expect(calculatePromptCoverage(responses)).toBe(50);
  });
});

describe('calculateCitationScore', () => {
  it('returns 0 for empty citations', () => {
    expect(calculateCitationScore([])).toBe(0);
  });

  it('returns 100 when all citations are target domain', () => {
    const citations = [
      { isTargetDomain: true },
      { isTargetDomain: true },
    ];
    expect(calculateCitationScore(citations)).toBe(100);
  });

  it('returns 50 when half are target domain', () => {
    const citations = [
      { isTargetDomain: true },
      { isTargetDomain: false },
    ];
    expect(calculateCitationScore(citations)).toBe(50);
  });

  it('returns 0 when none are target domain', () => {
    const citations = [
      { isTargetDomain: false },
      { isTargetDomain: false },
    ];
    expect(calculateCitationScore(citations)).toBe(0);
  });
});

describe('calculateCompetitorDominance', () => {
  it('returns 0 for empty mentions', () => {
    expect(calculateCompetitorDominance([])).toBe(0);
  });

  it('returns 0 when only target mentions exist', () => {
    const mentions = [
      { type: 'target' as const, count: 5 },
    ];
    expect(calculateCompetitorDominance(mentions)).toBe(0);
  });

  it('returns 100 when only competitor mentions exist', () => {
    const mentions = [
      { type: 'competitor' as const, count: 3 },
    ];
    expect(calculateCompetitorDominance(mentions)).toBe(100);
  });

  it('returns correct percentage for mixed mentions', () => {
    const mentions = [
      { type: 'target' as const, count: 3 },
      { type: 'competitor' as const, count: 7 },
    ];
    expect(calculateCompetitorDominance(mentions)).toBe(70);
  });

  it('ignores third-party mentions', () => {
    const mentions = [
      { type: 'target' as const, count: 5 },
      { type: 'competitor' as const, count: 5 },
      { type: 'thirdParty' as const, count: 100 },
    ];
    expect(calculateCompetitorDominance(mentions)).toBe(50);
  });
});

describe('calculateVisibilityScore', () => {
  it('returns 15 for all zeros (minimum baseline)', () => {
    expect(calculateVisibilityScore(0, 0, 0, 0)).toBe(15);
  });

  it('returns 100 for perfect scores', () => {
    expect(calculateVisibilityScore(100, 100, 100, 0)).toBe(100);
  });

  it('calculates weighted score correctly', () => {
    // 70*0.35 + 50*0.25 + 40*0.25 + (100-30)*0.15
    // = 24.5 + 12.5 + 10 + 10.5 = 57.5 -> 58
    expect(calculateVisibilityScore(70, 50, 40, 30)).toBe(58);
  });

  it('handles high competitor dominance (risk)', () => {
    // Low mention rate, high competitor dominance
    const score = calculateVisibilityScore(30, 20, 10, 80);
    expect(score).toBeLessThan(50);
  });
});
