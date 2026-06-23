'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  ScanEye,
  FileBarChart,
  Settings,
  SearchX,
  Eye,
  MessageSquare,
  Crosshair,
  Link2,
  TrendingUp,
  ChevronDown,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Lightbulb,
  Brain,
  Sparkles,
  Bot,
  Orbit,
  Globe,
  Monitor,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { cn } from '@/lib/utils'

const MODELS = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity', 'Google AI Overviews', 'Copilot']

const MODEL_COLORS: Record<string, string> = {
  ChatGPT: '#6366f1',
  Gemini: '#8b5cf6',
  Claude: '#a78bfa',
  Perplexity: '#c084fc',
  'Google AI Overviews': '#818cf8',
  Copilot: '#4f46e5',
}

const MODEL_ICONS: Record<string, typeof Brain> = {
  ChatGPT: Brain,
  Gemini: Sparkles,
  Claude: Bot,
  Perplexity: Orbit,
  'Google AI Overviews': Globe,
  Copilot: Monitor,
}

const ease = [0.16, 1, 0.3, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
}

const chartGrid = { strokeDasharray: '3 3', stroke: 'var(--color-border)' } as const
const chartAxis = { fill: 'var(--color-muted)', fontSize: 11 }
const chartAxisLine = { stroke: 'var(--color-border)' }
const chartTooltip = {
  contentStyle: {
    background: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    color: 'var(--color-foreground)',
    fontSize: '12px',
  } as React.CSSProperties,
  labelStyle: { color: 'var(--color-foreground)', fontWeight: 600 } as React.CSSProperties,
}
const chartLegend = { fontSize: '11px', color: 'var(--color-muted)' }

type NavItem = {
  label: string
  icon: typeof LayoutDashboard
  active: boolean
  href: string
}

type ProjectShape = {
  id: string
  brandName: string
  domain: string
  createdAt: string
}

type MentionShape = {
  id: string
  name: string
  type: string
  count: number
}

type AiResponseShape = {
  id: string
  promptId: string
  model: string
  sentiment: string
  targetMentioned: boolean
  targetRecommended: boolean
  detectedMentions: MentionShape[]
}

type ScanShape = {
  id: string
  status: string
  scanMode: string
  models: string[]
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  metricSnapshots: {
    visibilityScore: number
    aiMentionRate: number
    promptCoverage: number
    citationScore: number
    competitorDominance: number
    createdAt: string
  }[]
  aiResponses: AiResponseShape[]
}

type ReportData = {
  project: ProjectShape
  competitors: { id: string; name: string; domain: string }[]
  latestMetrics: {
    visibilityScore: number
    aiMentionRate: number
    promptCoverage: number
    citationScore: number
    competitorDominance: number
    createdAt: string
  } | null
  latestScan: {
    id: string
    status: string
    scanMode: string
    models: string[]
    startedAt: string | null
    completedAt: string | null
    createdAt: string
    responses: {
      total: number
      byModel: Record<string, number>
      bySentiment: Record<string, number>
      targetMentioned: number
      targetRecommended: number
    }
  } | null
  scans: ScanShape[]
}

function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getChange(
  current: number,
  previous: number
): { value: number; direction: 'up' | 'down' | 'flat' } {
  if (!previous) return { value: 0, direction: 'flat' }
  const diff = current - previous
  const pct = Math.round((diff / previous) * 100)
  return {
    value: Math.abs(pct),
    direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat',
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-success/10 text-success border-success/20'
    case 'running':
      return 'bg-primary/10 text-primary border-primary/20'
    case 'failed':
      return 'bg-danger/10 text-danger border-danger/20'
    default:
      return 'bg-muted/10 text-muted border-muted/20'
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<ProjectShape[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [report, setReport] = useState<ReportData | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/projects')
        const json = await res.json()
        const list: ProjectShape[] = json.data || []
        setProjects(list)
        if (list.length > 0) {
          setSelectedProjectId(list[0].id)
        }
      } catch {
        console.error('Failed to fetch projects')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!selectedProjectId) return
    let cancelled = false
    async function fetchReport() {
      try {
        const res = await fetch(`/api/projects/${selectedProjectId}/report`)
        const json = await res.json()
        if (!cancelled) setReport(json.data)
      } catch {
        console.error('Failed to fetch report')
      }
    }
    fetchReport()
    return () => {
      cancelled = true
    }
  }, [selectedProjectId])

  const latestScanData = report?.scans?.[0]

  const trendData = (report?.scans || [])
    .slice()
    .reverse()
    .map((scan) => {
      const ms = scan.metricSnapshots?.[0]
      return {
        date: formatDate(scan.createdAt),
        score: ms?.visibilityScore ?? 0,
        mentionRate: ms?.aiMentionRate ?? 0,
        coverage: ms?.promptCoverage ?? 0,
      }
    })

  const competitorMentions: Record<string, number> = {}
  let targetMentionsTotal = 0
  for (const resp of latestScanData?.aiResponses || []) {
    for (const m of resp.detectedMentions) {
      if (m.type === 'competitor') {
        competitorMentions[m.name] = (competitorMentions[m.name] || 0) + m.count
      } else if (m.type === 'target') {
        targetMentionsTotal += m.count
      }
    }
  }

  const barFillColors = ['#6366f1', '#818cf8', '#a5b4fc', '#4f46e5', '#c7d2fe', '#e0e7ff']

  const barChartData = [
    {
      name: report?.project?.brandName || 'Your Brand',
      mentions: targetMentionsTotal,
      fill: barFillColors[0],
    },
    ...Object.entries(competitorMentions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count], i) => ({
        name,
        mentions: count,
        fill: barFillColors[i + 1] || barFillColors[barFillColors.length - 1],
      })),
  ]

  const modelPerformance = MODELS.map((modelName) => {
    const responses =
      latestScanData?.aiResponses?.filter((r) => r.model === modelName) || []
    const total = responses.length
    const mentioned = responses.filter((r) => r.targetMentioned).length
    const positive = responses.filter((r) => r.sentiment === 'positive').length
    const neutral = responses.filter((r) => r.sentiment === 'neutral').length
    const negative = responses.filter((r) => r.sentiment === 'negative').length

    let dominantSentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
    if (positive > neutral && positive > negative) dominantSentiment = 'positive'
    else if (negative > positive && negative > neutral) dominantSentiment = 'negative'

    return {
      name: modelName,
      mentionRate: total > 0 ? Math.round((mentioned / total) * 100) : 0,
      total,
      positive,
      neutral,
      negative,
      scanned: total > 0,
      dominantSentiment,
    }
  })

  const metrics = report?.latestMetrics
  const previousMetrics = report?.scans?.[1]?.metricSnapshots?.[0]

  const metricCards = metrics
      ? [
          {
            label: 'AI Visibility Score',
            value: metrics.visibilityScore,
            suffix: '',
            icon: Eye,
            color: '#6366f1',
            bgClass: 'bg-primary/10',
            textClass: 'text-primary',
            change: previousMetrics
              ? getChange(metrics.visibilityScore, previousMetrics.visibilityScore)
              : null,
          },
          {
            label: 'AI Mention Rate',
            value: metrics.aiMentionRate,
            suffix: '%',
            icon: MessageSquare,
            color: '#818cf8',
            bgClass: 'bg-primary/10',
            textClass: 'text-primary-light',
            change: previousMetrics
              ? getChange(metrics.aiMentionRate, previousMetrics.aiMentionRate)
              : null,
          },
          {
            label: 'Prompt Coverage',
            value: metrics.promptCoverage,
            suffix: '%',
            icon: Crosshair,
            color: '#a5b4fc',
            bgClass: 'bg-primary/10',
            textClass: 'text-primary-light',
            change: previousMetrics
              ? getChange(metrics.promptCoverage, previousMetrics.promptCoverage)
              : null,
          },
          {
            label: 'Citation Score',
            value: metrics.citationScore,
            suffix: '%',
            icon: Link2,
            color: '#4f46e5',
            bgClass: 'bg-primary/10',
            textClass: 'text-primary',
            change: previousMetrics
              ? getChange(metrics.citationScore, previousMetrics.citationScore)
              : null,
          },
          {
            label: 'Competitor Dominance',
            value: metrics.competitorDominance,
            suffix: '%',
            icon: TrendingUp,
          color: '#ef4444',
          bgClass: 'bg-danger/10',
          textClass: 'text-danger',
          lowerIsBetter: true,
          change: previousMetrics
            ? getChange(metrics.competitorDominance, previousMetrics.competitorDominance)
            : null,
        },
      ]
    : []

  const recentScans = (report?.scans || []).slice(0, 10).map((scan) => {
    const mentionRate =
      scan.aiResponses.length > 0
        ? Math.round(
            (scan.aiResponses.filter((r) => r.targetMentioned).length /
              scan.aiResponses.length) *
              100
          )
        : 0
    const modelCount = scan.models.length
    const uniquePrompts = new Set(scan.aiResponses.map((r) => r.promptId)).size
    return {
      id: scan.id,
      date: scan.createdAt,
      modelCount,
      promptCount: scan.aiResponses.length > 0 ? uniquePrompts : 0,
      status: scan.status,
      mentionRate,
    }
  })

  const recommendations: {
    icon: typeof Lightbulb
    text: string
    impact: 'High' | 'Medium'
    details: string
  }[] = []

  if (metrics) {
    if (metrics.aiMentionRate < 50) {
      recommendations.push({
        icon: MessageSquare,
        text: `Increase AI mention rate (${metrics.aiMentionRate}%). Optimize brand mentions for your category related queries.`,
        impact: 'High',
        details: '#',
      })
    }
    if (metrics.promptCoverage < 50) {
      recommendations.push({
        icon: Crosshair,
        text: `Expand prompt coverage (${metrics.promptCoverage}%). Create content that answers more buyer questions across the funnel.`,
        impact: 'High',
        details: '#',
      })
    }
    if (metrics.competitorDominance > 40) {
      recommendations.push({
        icon: TrendingUp,
        text: `Competitors dominate ${metrics.competitorDominance}% of AI conversations. Focus on differentiation and unique value props.`,
        impact: 'High',
        details: '#',
      })
    }
    if (metrics.citationScore < 30) {
      recommendations.push({
        icon: Link2,
        text: `Improve citation score (${metrics.citationScore}%). Strengthen domain authority and produce more link-worthy content.`,
        impact: 'Medium',
        details: '#',
      })
    }
    if (metrics.visibilityScore < 60) {
      recommendations.push({
        icon: Eye,
        text: `Overall visibility score is ${metrics.visibilityScore}. Run a comprehensive GEO audit to identify improvement areas.`,
        impact: 'High',
        details: '#',
      })
    }
  }

  if (recommendations.length === 0) {
    recommendations.push({
      icon: Lightbulb,
      text: 'Your AI visibility is on track. Schedule regular scans to maintain and improve your position.',
      impact: 'Medium',
      details: '#',
    })
  }

  const navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, active: true, href: '/dashboard' },
    { label: 'Projects', icon: FolderKanban, active: false, href: '/dashboard/projects' },
    { label: 'Scans', icon: ScanEye, active: false, href: '/dashboard/scans' },
    { label: 'Reports', icon: FileBarChart, active: false, href: '/dashboard/reports' },
    { label: 'Settings', icon: Settings, active: false, href: '/dashboard/settings' },
  ]

  return (
    <div className="flex h-screen bg-background text-foreground">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={cn([
          'fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r border-border bg-sidebar transition-transform duration-200 lg:static lg:translate-x-0',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ])}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <span className="text-sm font-bold text-primary">L</span>
          </div>
          <span className="text-lg font-bold tracking-tight">
            LLMRank <span className="text-primary">AI</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={cn([
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                item.active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-card-hover hover:text-foreground',
              ])}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <a
            href="/onboarding"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark"
          >
            <ScanEye className="h-4 w-4" />
            Run Free Scan
          </a>
        </div>
      </aside>

      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card lg:hidden"
        aria-label="Open menu"
      >
        <LayoutDashboard className="h-4 w-4" />
      </button>

      <main className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingState />
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : !report ? (
          <LoadingState />
        ) : (
          <DashboardContent
            report={report}
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            metricCards={metricCards}
            trendData={trendData}
            barChartData={barChartData}
            modelPerformance={modelPerformance}
            recentScans={recentScans}
            recommendations={recommendations}
            latestScanData={latestScanData}
          />
        )}
      </main>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted">Loading dashboard...</p>
      </div>
    </div>
  )
}

function EmptyState() {
  const router = useRouter()
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="relative mx-auto max-w-md text-center">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <SearchX className="h-10 w-10 text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">No projects yet</h2>
        <p className="mb-8 leading-relaxed text-muted">
          Run your first AI visibility scan to see how your brand appears across
          AI search engines.
        </p>
        <button
          onClick={() => router.push('/onboarding')}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark"
        >
          Start Your First Scan
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function DashboardContent({
  report,
  projects,
  selectedProjectId,
  onSelectProject,
  metricCards,
  trendData,
  barChartData,
  modelPerformance,
  recentScans,
  recommendations,
  latestScanData,
}: {
  report: ReportData
  projects: ProjectShape[]
  selectedProjectId: string | null
  onSelectProject: (id: string) => void
  metricCards: {
    label: string
    value: number
    suffix: string
    icon: typeof Eye
    color: string
    bgClass: string
    textClass: string
    lowerIsBetter?: boolean
    change: { value: number; direction: 'up' | 'down' | 'flat' } | null
  }[]
  trendData: { date: string; score: number; mentionRate: number; coverage: number }[]
  barChartData: { name: string; mentions: number; fill: string }[]
  modelPerformance: {
    name: string
    mentionRate: number
    total: number
    positive: number
    neutral: number
    negative: number
    scanned: boolean
    dominantSentiment: 'positive' | 'neutral' | 'negative'
  }[]
  recentScans: {
    id: string
    date: string
    modelCount: number
    promptCount: number
    status: string
    mentionRate: number
  }[]
  recommendations: {
    icon: typeof Lightbulb
    text: string
    impact: 'High' | 'Medium'
    details: string
  }[]
  latestScanData: ScanShape | undefined
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="p-6 sm:p-8 lg:p-10"
    >
      <Header
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={onSelectProject}
        brandName={report.project.brandName}
      />

      {!latestScanData ? (
        <NoScanData />
      ) : (
        <>
          <MetricCardsGrid cards={metricCards} />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <ChartsRow trendData={trendData} barChartData={barChartData} />
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <ModelPerformanceGrid models={modelPerformance} />
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <RecentScansTable scans={recentScans} projectId={report.project.id} />
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <RecommendationsSection items={recommendations} />
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

function Header({
  projects,
  selectedProjectId,
  onSelectProject,
  brandName,
}: {
  projects: ProjectShape[]
  selectedProjectId: string | null
  onSelectProject: (id: string) => void
  brandName: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          AI visibility overview for{' '}
          <span className="font-medium text-foreground">{brandName}</span>
        </p>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex w-56 items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-card-hover"
        >
          <span className="truncate">
            {projects.find((p) => p.id === selectedProjectId)?.brandName ||
              brandName}
          </span>
          <ChevronDown
            className={cn([
              'h-4 w-4 shrink-0 text-muted transition-transform',
              open && 'rotate-180',
            ])}
          />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-border bg-card py-1 shadow-xl">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p.id)
                    setOpen(false)
                  }}
                  className={cn([
                    'w-full px-4 py-2.5 text-left text-sm transition-colors',
                    p.id === selectedProjectId
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted hover:bg-card-hover hover:text-foreground',
                  ])}
                >
                  {p.brandName}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function NoScanData() {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <ScanEye className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">No scan data yet</h3>
      <p className="mb-6 max-w-sm text-sm text-muted">
        Run your first scan to start tracking AI visibility metrics, model
        performance, and competitive positioning.
      </p>
      <button
        onClick={() => router.push('/onboarding')}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark"
      >
        Run Your First Scan
        <ArrowUpRight className="h-4 w-4" />
      </button>
    </div>
  )
}

function MetricCardsGrid({
  cards,
}: {
  cards: {
    label: string
    value: number
    suffix: string
    icon: typeof Eye
    color: string
    bgClass: string
    textClass: string
    lowerIsBetter?: boolean
    change: { value: number; direction: 'up' | 'down' | 'flat' } | null
  }[]
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
      }}
      className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {cards.map((card) => (
        <motion.div
          key={card.label}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
          }}
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/20"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">
              {card.label}
            </span>
            <div
              className={cn([
                'flex h-9 w-9 items-center justify-center rounded-lg',
                card.bgClass,
              ])}
            >
              <card.icon
                className="h-5 w-5"
                style={{ color: card.color }}
              />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{card.value}</span>
            {card.suffix && (
              <span className="text-sm font-medium text-muted">
                {card.suffix}
              </span>
            )}
          </div>
          {card.change && card.change.value > 0 && (
            <div className="mt-2 flex items-center gap-1">
              {card.change.direction === 'up' && (
                <ArrowUpRight
                  className={cn([
                    'h-3.5 w-3.5',
                    card.lowerIsBetter ? 'text-danger' : 'text-success',
                  ])}
                />
              )}
              {card.change.direction === 'down' && (
                <ArrowDownRight
                  className={cn([
                    'h-3.5 w-3.5',
                    card.lowerIsBetter ? 'text-success' : 'text-danger',
                  ])}
                />
              )}
              {(card.change.direction === 'up' || card.change.direction === 'down') && (
                <span
                  className={cn([
                    'text-xs font-medium',
                    card.change.direction === 'up'
                      ? card.lowerIsBetter
                        ? 'text-danger'
                        : 'text-success'
                      : card.lowerIsBetter
                        ? 'text-success'
                        : 'text-danger',
                  ])}
                >
                  {card.change.value}% vs last scan
                </span>
              )}
              {card.change.direction === 'flat' && (
                <Minus className="h-3.5 w-3.5 text-muted" />
              )}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  )
}

function ChartsRow({
  trendData,
  barChartData,
}: {
  trendData: { date: string; score: number; mentionRate: number; coverage: number }[]
  barChartData: { name: string; mentions: number; fill: string }[]
}) {
  const hasTrend = trendData.length > 0
  const hasBar = barChartData.length > 0

  return (
    <div className="mb-10 grid gap-6 lg:grid-cols-2">
      {/* Line Chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-1 text-base font-semibold">AI Visibility Trend</h3>
        <p className="mb-5 text-xs text-muted">
          Visibility score over the last {trendData.length} scan
          {trendData.length !== 1 ? 's' : ''}
        </p>
        {hasTrend ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid {...chartGrid} />
              <XAxis
                dataKey="date"
                tick={chartAxis}
                axisLine={chartAxisLine}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={chartAxis}
                axisLine={chartAxisLine}
                tickLine={false}
              />
              <Tooltip {...chartTooltip} />
              <Legend wrapperStyle={chartLegend} />
              <Line
                type="monotone"
                dataKey="score"
                name="Visibility Score"
                stroke="#059669"
                strokeWidth={2}
                dot={{ fill: '#059669', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="mentionRate"
                name="Mention Rate"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="coverage"
                name="Prompt Coverage"
                stroke="#14b8a6"
                strokeWidth={2}
                dot={{ fill: '#14b8a6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted">
            No trend data available
          </div>
        )}
      </div>

      {/* Bar Chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-1 text-base font-semibold">Brand vs Competitors</h3>
        <p className="mb-5 text-xs text-muted">
          Total mentions detected in AI responses
        </p>
        {hasBar ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barChartData}>
              <CartesianGrid {...chartGrid} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--color-muted)', fontSize: 10 }}
                axisLine={chartAxisLine}
                tickLine={false}
              />
              <YAxis
                tick={chartAxis}
                axisLine={chartAxisLine}
                tickLine={false}
              />
              <Tooltip {...chartTooltip} />
              <Legend wrapperStyle={chartLegend} />
              <Bar
                dataKey="mentions"
                name="Mentions"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              >
                {barChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted">
            No competitor data available
          </div>
        )}
      </div>
    </div>
  )
}

function ModelPerformanceGrid({
  models,
}: {
  models: {
    name: string
    mentionRate: number
    total: number
    positive: number
    neutral: number
    negative: number
    scanned: boolean
    dominantSentiment: 'positive' | 'neutral' | 'negative'
  }[]
}) {
  return (
    <div className="mb-10">
      <h3 className="mb-6 text-base font-semibold">Model Performance</h3>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {models.map((model) => {
          const IconComponent = MODEL_ICONS[model.name] || Brain
          const sentimentDotColor =
            model.dominantSentiment === 'positive'
              ? 'bg-success'
              : model.dominantSentiment === 'negative'
                ? 'bg-danger'
                : 'bg-warning'

          return (
            <div
              key={model.name}
              className={cn([
                'rounded-xl border bg-card p-4 transition-colors',
                model.scanned ? 'border-border' : 'border-border/50 opacity-60',
              ])}
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${MODEL_COLORS[model.name]}15`,
                  }}
                >
                  <IconComponent
                    className="h-5 w-5"
                    style={{ color: MODEL_COLORS[model.name] || '#059669' }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{model.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn([
                        'inline-block h-2 w-2 rounded-full',
                        model.scanned ? sentimentDotColor : 'bg-muted',
                      ])}
                    />
                    <span className="text-xs text-muted">
                      {model.scanned ? model.dominantSentiment : 'Not scanned'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold">{model.mentionRate}%</span>
                <span className="text-xs text-muted">mention rate</span>
              </div>
              {model.scanned && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-success transition-all"
                      style={{
                        width: `${(model.positive / Math.max(1, model.total)) * 100}%`,
                      }}
                    />
                    <div
                      className="h-full rounded-full bg-warning transition-all"
                      style={{
                        width: `${(model.neutral / Math.max(1, model.total)) * 100}%`,
                      }}
                    />
                    <div
                      className="h-full rounded-full bg-danger transition-all"
                      style={{
                        width: `${(model.negative / Math.max(1, model.total)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted">{model.total}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RecentScansTable({
  scans,
  projectId,
}: {
  scans: {
    id: string
    date: string
    modelCount: number
    promptCount: number
    status: string
    mentionRate: number
  }[]
  projectId: string
}) {
  const router = useRouter()

  if (scans.length === 0) {
    return (
      <div className="mb-10">
        <h3 className="mb-4 text-base font-semibold">Recent Scans</h3>
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
          <ScanEye className="mb-3 h-8 w-8 text-muted" />
          <p className="text-sm text-muted">No scans have been run yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-10">
      <h3 className="mb-6 text-base font-semibold">Recent Scans</h3>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card-hover/50">
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted">
                Models
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted">
                Prompts
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted">
                Mention Rate
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {scans.map((scan) => (
              <tr
                key={scan.id}
                className="transition-colors hover:bg-card-hover/50"
              >
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {formatDate(scan.date)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {scan.modelCount}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {scan.promptCount}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={cn([
                      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
                      statusBadgeClass(scan.status),
                    ])}
                  >
                    {scan.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  {scan.mentionRate}%
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <button
                    onClick={() => router.push(`/projects/${projectId}`)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-card-hover hover:text-foreground"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RecommendationsSection({
  items,
}: {
  items: {
    icon: typeof Lightbulb
    text: string
    impact: 'High' | 'Medium'
    details: string
  }[]
}) {
  return (
    <div className="mb-10">
      <h3 className="mb-6 text-base font-semibold">Top Recommendations</h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/20"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-relaxed">{item.text}</p>
              <div className="mt-2 flex items-center gap-3">
                <span
                  className={cn([
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    item.impact === 'High'
                      ? 'bg-danger/10 text-danger'
                      : 'bg-warning/10 text-warning',
                  ])}
                >
                  {item.impact} Impact
                </span>
                <a
                  href={item.details}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary-light"
                >
                  View details
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
