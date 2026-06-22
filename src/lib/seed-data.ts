export const DEMO_BRAND = 'Northstar CRM';
export const DEMO_DOMAIN = 'northstarcrm.example';
export const DEMO_CATEGORY = 'CRM for B2B SaaS sales teams';
export const DEMO_AUDIENCE = 'Seed to Series B SaaS companies';

export const DEMO_COMPETITORS = [
  { name: 'Salesforce', domain: 'salesforce.com' },
  { name: 'HubSpot', domain: 'hubspot.com' },
  { name: 'Pipedrive', domain: 'pipedrive.com' },
  { name: 'Zoho CRM', domain: 'zoho.com' },
  { name: 'Freshworks', domain: 'freshworks.com' },
  { name: 'Copper', domain: 'copper.com' },
  { name: 'Keap', domain: 'keap.com' },
  { name: 'Microsoft Dynamics', domain: 'microsoft.com' },
];

export const DEMO_PROMPTS = [
  {
    id: 'prompt-001',
    text: 'What are the best CRM platforms for B2B SaaS startups in 2025?',
    funnelStage: 'awareness',
    persona: 'founder',
    intent: 'research',
  },
  {
    id: 'prompt-002',
    text: 'Compare top CRM solutions for early-stage SaaS companies with sales teams under 50 people.',
    funnelStage: 'consideration',
    persona: 'vp_sales',
    intent: 'comparison',
  },
  {
    id: 'prompt-003',
    text: 'Which CRM has the best pipeline management features for B2B sales?',
    funnelStage: 'consideration',
    persona: 'sales_manager',
    intent: 'feature_comparison',
  },
  {
    id: 'prompt-004',
    text: 'What is the most affordable CRM for a 25-person B2B SaaS startup?',
    funnelStage: 'decision',
    persona: 'founder',
    intent: 'pricing',
  },
  {
    id: 'prompt-005',
    text: 'Recommend a CRM with strong HubSpot and Salesforce integration capabilities.',
    funnelStage: 'consideration',
    persona: 'cto',
    intent: 'integration_check',
  },
  {
    id: 'prompt-006',
    text: 'What CRM do venture-backed B2B SaaS companies typically use?',
    funnelStage: 'awareness',
    persona: 'investor',
    intent: 'market_research',
  },
  {
    id: 'prompt-007',
    text: 'How does Northstar CRM compare to Salesforce for a 40-person sales team?',
    funnelStage: 'decision',
    persona: 'vp_sales',
    intent: 'comparison',
  },
  {
    id: 'prompt-008',
    text: 'Top 5 CRM tools for SaaS startups with AI-powered sales features.',
    funnelStage: 'awareness',
    persona: 'cto',
    intent: 'feature_research',
  },
  {
    id: 'prompt-009',
    text: 'Which CRM platform offers the best ROI for B2B SaaS companies under $10M ARR?',
    funnelStage: 'decision',
    persona: 'founder',
    intent: 'roi_analysis',
  },
  {
    id: 'prompt-010',
    text: 'Reviews and ratings for Northstar CRM on G2 and Capterra.',
    funnelStage: 'decision',
    persona: 'sales_manager',
    intent: 'social_proof',
  },
  {
    id: 'prompt-011',
    text: 'Best CRM for managing enterprise B2B sales pipelines with multiple stakeholders.',
    funnelStage: 'consideration',
    persona: 'sales_manager',
    intent: 'capability_check',
  },
  {
    id: 'prompt-012',
    text: 'What are the most important features to look for in a B2B SaaS CRM?',
    funnelStage: 'awareness',
    persona: 'founder',
    intent: 'education',
  },
  {
    id: 'prompt-013',
    text: 'Compare pricing for Salesforce, HubSpot, Pipedrive, and Northstar CRM.',
    funnelStage: 'decision',
    persona: 'founder',
    intent: 'pricing_comparison',
  },
  {
    id: 'prompt-014',
    text: 'Which CRM has the best automated lead scoring for B2B SaaS?',
    funnelStage: 'consideration',
    persona: 'vp_sales',
    intent: 'feature_comparison',
  },
  {
    id: 'prompt-015',
    text: 'Is Northstar CRM suitable for a Series A SaaS company scaling from 30 to 100 employees?',
    funnelStage: 'decision',
    persona: 'founder',
    intent: 'suitability_check',
  },
  {
    id: 'prompt-016',
    text: 'What CRM integrations are essential for B2B SaaS companies using Slack, HubSpot, and Stripe?',
    funnelStage: 'consideration',
    persona: 'cto',
    intent: 'technical_evaluation',
  },
  {
    id: 'prompt-017',
    text: 'Best CRM for sales teams that need advanced reporting and forecasting.',
    funnelStage: 'consideration',
    persona: 'vp_sales',
    intent: 'feature_research',
  },
  {
    id: 'prompt-018',
    text: 'How does Northstar CRM handle deal tracking and pipeline visibility?',
    funnelStage: 'decision',
    persona: 'sales_manager',
    intent: 'capability_check',
  },
  {
    id: 'prompt-019',
    text: 'What CRM do Y Combinator startups use most frequently?',
    funnelStage: 'awareness',
    persona: 'founder',
    intent: 'market_research',
  },
  {
    id: 'prompt-020',
    text: 'Compare customer support quality and onboarding for leading CRM platforms.',
    funnelStage: 'decision',
    persona: 'sales_manager',
    intent: 'support_comparison',
  },
  {
    id: 'prompt-021',
    text: 'Which CRM offers the best mobile experience for field sales teams?',
    funnelStage: 'consideration',
    persona: 'vp_sales',
    intent: 'feature_comparison',
  },
  {
    id: 'prompt-022',
    text: 'Northstar CRM vs HubSpot vs Pipedrive: detailed feature comparison for B2B SaaS.',
    funnelStage: 'decision',
    persona: 'founder',
    intent: 'direct_comparison',
  },
  {
    id: 'prompt-023',
    text: 'What are the hidden costs of implementing a CRM for a 50-person SaaS company?',
    funnelStage: 'awareness',
    persona: 'founder',
    intent: 'education',
  },
  {
    id: 'prompt-024',
    text: 'Top-rated CRMs for B2B SaaS according to G2 reviews in 2025.',
    funnelStage: 'awareness',
    persona: 'sales_manager',
    intent: 'social_proof',
  },
  {
    id: 'prompt-025',
    text: 'Which CRM platform has the strongest AI and machine learning capabilities for sales?',
    funnelStage: 'consideration',
    persona: 'cto',
    intent: 'feature_research',
  },
];

export function getDemoPromptTexts(): string[] {
  return DEMO_PROMPTS.map((p) => p.text);
}

export function getDemoPromptById(id: string) {
  return DEMO_PROMPTS.find((p) => p.id === id) || null;
}

export function generateDemoContext() {
  return {
    brandName: DEMO_BRAND,
    domain: DEMO_DOMAIN,
    productCategory: DEMO_CATEGORY,
    shortDescription: `Northstar CRM is a modern CRM platform built specifically for B2B SaaS companies. It helps sales teams track deals, manage pipelines, and close more revenue with AI-powered insights.`,
    targetAudience: DEMO_AUDIENCE,
    competitors: DEMO_COMPETITORS,
  };
}
