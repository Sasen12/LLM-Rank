import { describe, it, expect } from 'vitest';
import {
  extractUrls,
  extractDomain,
  detectMentions,
  detectSentiment,
  detectRank,
  calculateConfidence,
} from '../src/lib/analyzer';

const competitors = [
  { name: 'PipePilot', domain: 'pipepilot.example' },
  { name: 'DealForge', domain: 'dealforge.example' },
];

describe('extractUrls', () => {
  it('returns empty array for text with no URLs', () => {
    expect(extractUrls('Just plain text')).toEqual([]);
  });

  it('extracts https URLs', () => {
    const text = 'Check out https://example.com and https://test.com/page';
    const urls = extractUrls(text);
    expect(urls).toContain('https://example.com');
    expect(urls).toContain('https://test.com/page');
  });

  it('extracts URLs with parentheses', () => {
    const text = 'Visit (https://example.com) for more.';
    const urls = extractUrls(text);
    expect(urls).toContain('https://example.com');
  });
});

describe('extractDomain', () => {
  it('extracts domain from simple URL', () => {
    expect(extractDomain('https://example.com/page')).toBe('example.com');
  });

  it('extracts domain with subdomain', () => {
    expect(extractDomain('https://blog.example.com/page')).toBe('blog.example.com');
  });
});

describe('detectMentions', () => {
  it('returns empty when no brands mentioned', () => {
    const text = 'This is about general CRM features.';
    expect(detectMentions(text, 'Northstar CRM', competitors)).toEqual([]);
  });

  it('detects target brand mention', () => {
    const text = 'Northstar CRM is a great platform for B2B SaaS.';
    const mentions = detectMentions(text, 'Northstar CRM', competitors);
    expect(mentions.some(m => m.type === 'target')).toBe(true);
  });

  it('detects competitor mention', () => {
    const text = 'PipePilot offers similar features at a higher price.';
    const mentions = detectMentions(text, 'Northstar CRM', competitors);
    expect(mentions.some(m => m.name === 'PipePilot' && m.type === 'competitor')).toBe(true);
  });

  it('detects multiple mentions', () => {
    const text = 'Northstar CRM is better than PipePilot. DealForge is also an option.';
    const mentions = detectMentions(text, 'Northstar CRM', competitors);
    expect(mentions.length).toBeGreaterThanOrEqual(2);
  });
});

describe('detectSentiment', () => {
  it('returns positive for recommended brands', () => {
    expect(detectSentiment('Excellent platform, highly recommended', true, 1)).toBe('positive');
  });

  it('returns negative for not recommended', () => {
    expect(detectSentiment('Limited features, expensive pricing', true, 5)).toBe('negative');
  });

  it('returns neutral when not mentioned', () => {
    expect(detectSentiment('Some generic text', false, 0)).toBe('neutral');
  });
});

describe('detectRank', () => {
  it('returns 0 for no mention', () => {
    expect(detectRank('Just some text', 'Northstar CRM')).toBe(0);
  });

  it('detects rank 1 in numbered list', () => {
    const text = 'Here are my top picks:\n1. Northstar CRM\n2. PipePilot\n3. DealForge';
    expect(detectRank(text, 'Northstar CRM')).toBe(1);
  });

  it('detects rank 2 in numbered list', () => {
    const text = 'Best CRMs:\n1. PipePilot\n2. Northstar CRM\n3. DealForge';
    expect(detectRank(text, 'Northstar CRM')).toBe(2);
  });
});

describe('calculateConfidence', () => {
  it('returns default score of 50 for no signals', () => {
    expect(calculateConfidence(0, 0)).toBe(50);
  });

  it('returns high confidence with many signals', () => {
    expect(calculateConfidence(5, 5)).toBeGreaterThan(85);
  });

  it('returns value between 0 and 99', () => {
    const confidence = calculateConfidence(3, 2);
    expect(confidence).toBeGreaterThanOrEqual(0);
    expect(confidence).toBeLessThanOrEqual(99);
  });
});
