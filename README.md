# LLMRank AI

**AI Search Visibility & Generative Engine Optimization (GEO) Platform for B2B SaaS Companies**

LLMRank AI helps SaaS companies understand and improve how they appear in AI search and AI recommendation engines such as ChatGPT, Gemini, Claude, Perplexity, Google AI Overviews, and Copilot.

## 🚀 What This Prototype Does

- **AI Visibility Scanning** — Run prompts across multiple AI models to see if and how your brand appears
- **Competitor Intelligence** — Track share of voice, find prompt gaps, and analyze competitor positioning
- **Citation Tracking** — Discover which sources AI models cite and earn more citations
- **GEO Website Audit** — Get a full AI-readiness audit with prioritized technical and content fixes
- **AI Content Briefs** — Receive data-driven content briefs designed for AI recommendation capture
- **Polished Reporting** — Exportable reports with metrics, charts, and action plans

## 📋 Prerequisites

- Node.js 18+
- npm

## 🛠️ Installation

```bash
npm install
```

## 💾 Database Setup

```bash
# Push the Prisma schema to SQLite
npm run db:push

# Seed with demo data (creates "Northstar CRM" demo project)
npm run db:seed
```

## 🏃 Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Running Tests

```bash
npm test
```

## 📦 Other Commands

```bash
npm run build        # Production build
npm run lint         # Lint check
npm run typecheck    # TypeScript check
npm run db:reset     # Reset database (push + seed)
```

## 🎯 Demo Data

After seeding, you'll have a pre-populated demo project:

- **Brand:** Northstar CRM
- **Domain:** northstarcrm.example
- **Category:** CRM for B2B SaaS sales teams
- **Competitors:** PipePilot, DealForge, RevenueBase, CloseLoop CRM
- **20 prompts** across Awareness, Consideration, and Decision stages
- **2 completed scans** with AI responses from ChatGPT, Gemini, Claude, Perplexity
- **Full GEO audit** with 10 prioritized findings
- **5 content briefs** ready for planning
- **2 metric snapshots** showing visibility trend

Visit the landing page → click "Run Free AI Visibility Report" → or go directly to `/dashboard`.

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx              # Public landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles & theme
│   ├── onboarding/
│   │   └── page.tsx          # Multi-step onboarding
│   ├── dashboard/
│   │   └── page.tsx          # Main dashboard
│   ├── projects/
│   │   └── [projectId]/
│   │       └── page.tsx      # Project detail with 8 tabs
│   └── api/
│       └── projects/
│           ├── route.ts      # CRUD projects
│           └── [projectId]/
│               ├── route.ts           # Get project
│               ├── generate-prompts/route.ts
│               ├── run-scan/route.ts
│               ├── geo-audit/route.ts
│               ├── report/route.ts
│               └── export/
│                   ├── prompts.csv/route.ts
│                   ├── results.csv/route.ts
│                   └── report.json/route.ts
├── lib/
│   ├── db.ts                 # Prisma client
│   ├── metrics.ts            # Metric calculations
│   ├── analyzer.ts           # AI response parser
│   ├── audit.ts              # Website audit engine
│   ├── utils.ts              # Utility functions
│   ├── seed-data.ts          # Demo data templates
│   └── providers/
│       ├── types.ts          # Provider interfaces
│       ├── mock.ts           # Mock AI provider
│       ├── index.ts          # Provider registry
│       ├── openai.ts         # Stub (ChatGPT)
│       ├── anthropic.ts      # Stub (Claude)
│       ├── google.ts         # Stub (Gemini)
│       └── perplexity.ts     # Stub (Perplexity)
prisma/
├── schema.prisma             # Database schema
├── seed.ts                   # Demo data seeder
└── dev.db                    # SQLite database (auto-created)
tests/
├── metrics.test.ts           # Metrics unit tests
├── analyzer.test.ts          # Analyzer unit tests
└── audit.test.ts             # Audit unit tests
```

## 🤖 How the Mock Provider Works

The mock AI provider generates deterministic, synthetic responses. It:

1. Creates a hash seed from `prompt text + model name + brand name`
2. Uses the seed to deterministically choose:
   - Whether the target brand is mentioned (~70% of responses)
   - Whether the target is recommended (~45% of responses)
   - What rank the target appears in (1-5)
   - Sentiment (positive/neutral/negative) based on rank
   - Which competitors to include alongside the target
   - Which third-party domains to cite (from a pool of 20+ real review/analyst sites)
3. Generates realistic-sounding response text

Results are deterministic — same prompt + model + brand always produces the same response.

## 📏 Metrics

| Metric | Formula | What It Measures |
|--------|---------|-----------------|
| AI Mention Rate | brand mentions / total responses × 100 | How often AI mentions your brand |
| Prompt Coverage | unique prompts with mention / total prompts × 100 | Breadth of visibility across buyer questions |
| Citation Score | your domain citations / total citations × 100 | Authority weight in AI responses |
| Competitor Dominance | competitor mentions / total mentions × 100 | Risk metric; lower is better |
| Visibility Score | weighted composite of above 4 | Overall AI visibility health (0-100) |

## ⚠️ What's Simulated

- **All AI model responses** are generated by the mock provider
- No real calls to ChatGPT, Gemini, Claude, or any AI API
- Website audit fetches real URLs but falls back to demo data gracefully
- Content briefs are pre-defined templates, not AI-generated
- No user authentication, billing, or team management

## 🔧 What's Needed for Production

1. **Real Provider Integrations** — Replace mock.ts with API calls to:
   - OpenProvider API (ChatGPT) — See `src/lib/providers/openai.ts`
   - Anthropic API (Claude) — See `src/lib/providers/anthropic.ts`
   - Google AI API (Gemini) — See `src/lib/providers/google.ts`
   - Perplexity API — See `src/lib/providers/perplexity.ts`
2. **Scheduled Scans** — Background jobs (Bull/Redis or similar)
3. **User Authentication** — Auth0, Clerk, or NextAuth
4. **Team Workspaces** — Multi-user collaboration
5. **Billing** — Stripe integration
6. **PDF Export** — PDF report generation
7. **CMS Integrations** — Direct publishing to Webflow, WordPress, Contentful
8. **GA4/GSC Data Import** — Correlate AI visibility with web analytics
9. **Agency White-Label Reports** — Custom branding for agencies

## 📄 License

MIT — For prototype and evaluation purposes only.
