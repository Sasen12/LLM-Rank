'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  ScanSearch,
  FileBarChart,
  Settings,
  ChevronDown,
  Search,
  TrendingUp,
  Link,
  FileSearch,
  FileText,
  Brain,
  Sparkles,
  Bot,
  Orbit,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Plus,
  Edit3,
  Trash2,
  ChevronRight,
  BarChart3,
  RefreshCw,
  Download,
  Copy,
  Printer,
  ExternalLink,
  Menu,
  X,
  Filter,
  Target,
  Globe,
  Loader2,
  Quote,
  Eye,
  EyeOff,
  Zap,
  Flag,
  HelpCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { cn, formatDate } from '@/lib/utils'

const ease = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Competitor {
  id: string
  name: string
  domain: string
}

interface MetricSnapshot {
  id: string
  visibilityScore: number
  aiMentionRate: number
  promptCoverage: number
  citationScore: number
  competitorDominance: number
  createdAt: string
}

interface Prompt {
  id: string
  text: string
  funnelStage: string
  persona: string
  intent: string
  status?: string
  createdAt: string
  updatedAt: string
}

interface Citation {
  id: string
  url: string
  domain: string
  sourceType: string
  isTargetDomain: boolean
  isCompetitorDomain: boolean
  qualityScore: number
}

interface DetectedMention {
  id: string
  name: string
  type: string
  count: number
  rankPosition: number
}

interface AIResponse {
  id: string
  scanId: string
  promptId: string
  model: string
  responseText: string
  responseSummary: string
  targetMentioned: boolean
  targetRecommended: boolean
  targetRank: number
  sentiment: string
  confidence: number
  createdAt: string
  prompt?: Prompt
  detectedMentions?: DetectedMention[]
  citations?: Citation[]
}

interface Scan {
  id: string
  status: string
  scanMode: string
  modelsJson: string
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  aiResponses?: AIResponse[]
  metricSnapshots?: MetricSnapshot[]
}

interface GeoAudit {
  id: string
  overallScore: number
  crawlabilityScore: number
  technicalScore: number
  contentDepthScore: number
  entityClarityScore: number
  citationReadinessScore: number
  findingsJson: string
  createdAt: string
  findings?: GeoAuditFinding[]
}

interface GeoAuditFinding {
  issue: string
  impact: string
  effort: string
  action: string
  category?: string
}

interface ContentBrief {
  id: string
  title: string
  targetPromptCluster: string
  persona: string
  objective: string
  status: string
  createdAt: string
}

interface Project {
  id: string
  brandName: string
  domain: string
  productCategory: string
  shortDescription: string
  targetAudience: string
  primaryUseCases: string
  region: string
  language: string
  createdAt: string
  updatedAt: string
  competitors: Competitor[]
  prompts?: Prompt[]
  scans?: Scan[]
  metricSnapshots?: MetricSnapshot[]
  geoAudits?: GeoAudit[]
  contentBriefs?: ContentBrief[]
  _count?: { prompts: number }
}

interface ReportData {
  project: Project
  competitors: Competitor[]
  latestMetrics: MetricSnapshot | null
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
  scans: Scan[]
  geoAudits: GeoAudit[]
  contentBriefs: ContentBrief[]
  prompts: Prompt[]
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', active: false },
  { label: 'Projects', icon: FolderKanban, href: '/projects', active: true },
  { label: 'Scans', icon: ScanSearch, href: '/scans', active: false },
  { label: 'Reports', icon: FileBarChart, href: '/reports', active: false },
  { label: 'Settings', icon: Settings, href: '/settings', active: false },
]

const TABS = [
  'Overview',
  'Prompts',
  'AI Responses',
  'Competitors',
  'Citations',
  'GEO Audit',
  'Content Briefs',
  'Report',
] as const

const CHART_COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6']

const STAGE_BADGE: Record<string, string> = {
  awareness: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  consideration: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  decision: 'bg-green-500/15 text-green-400 border-green-500/25',
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-500/15 text-green-400',
  inactive: 'bg-slate-500/15 text-slate-400',
  draft: 'bg-yellow-500/15 text-yellow-400',
  planned: 'bg-blue-500/15 text-blue-400',
  published: 'bg-green-500/15 text-green-400',
}

const SOURCE_BADGE: Record<string, string> = {
  blog: 'bg-blue-500/15 text-blue-400',
  documentation: 'bg-purple-500/15 text-purple-400',
  news: 'bg-amber-500/15 text-amber-400',
  social: 'bg-pink-500/15 text-pink-400',
  review: 'bg-orange-500/15 text-orange-400',
  educational: 'bg-cyan-500/15 text-cyan-400',
  official: 'bg-emerald-500/15 text-emerald-400',
  forum: 'bg-indigo-500/15 text-indigo-400',
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function ProjectPage() {
  const params = useParams<{ projectId: string }>()
  const projectId = params.projectId

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('Overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!projectId) return
    setLoading(true)
    fetch(`/api/projects/${projectId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load project')
        return r.json()
      })
      .then((json) => {
        setProject(json.data)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [projectId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            <Loader2 className="h-8 w-8 text-primary" />
          </motion.div>
          <p className="text-sm text-muted">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="h-12 w-12 text-danger" />
          <p className="text-lg font-semibold text-foreground">Failed to load project</p>
          <p className="text-sm text-muted">{error || 'Project not found'}</p>
          <motion.button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col lg:pl-64">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} project={project} />

        <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <HeaderSection project={project} />
          <TabBar tabs={TABS} active={activeTab} onSelect={setActiveTab} />
          <TabContent project={project} activeTab={activeTab} projectId={projectId} />
        </main>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn([
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ])}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <span className="text-sm font-bold text-primary">L</span>
          </div>
          <span className="text-lg font-bold tracking-tight">
            LLMRank <span className="text-primary">AI</span>
          </span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {SIDEBAR_ITEMS.map(({ label, icon: Icon, href, active }) => (
            <a
              key={label}
              href={href}
              className={cn([
                'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-card-hover hover:text-foreground',
              ])}
            >
              <Icon className="h-5 w-5" />
              {label}
            </a>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <div className="rounded-xl bg-card p-3">
            <p className="text-xs text-muted">AI Visibility Score</p>
            <p className="text-lg font-bold text-primary">Demo Mode</p>
          </div>
        </div>
      </aside>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Mobile header                                                      */
/* ------------------------------------------------------------------ */

function MobileHeader({
  onMenuClick,
  project,
}: {
  onMenuClick: () => void
  project: Project
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:hidden">
      <button
        onClick={onMenuClick}
        className="flex items-center text-muted hover:text-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
          <span className="text-xs font-bold text-primary">L</span>
        </div>
        <span className="text-sm font-bold">{project.brandName}</span>
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------ */
/*  Header section                                                     */
/* ------------------------------------------------------------------ */

function HeaderSection({ project }: { project: Project }) {
  const lastScan = getLatestScan(project)

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {project.brandName}
          </h1>
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs font-medium text-primary">
            <Globe className="h-3 w-3" />
            {project.domain}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">
          {project.productCategory}
          {lastScan && (
            <span className="ml-2">
              &middot; Last scan: {formatDate(lastScan.createdAt)}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab bar                                                            */
/* ------------------------------------------------------------------ */

function TabBar({
  tabs,
  active,
  onSelect,
}: {
  tabs: readonly string[]
  active: string
  onSelect: (tab: string) => void
}) {
  return (
    <div className="mb-6 -mx-4 overflow-x-auto border-b border-border px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <nav className="flex min-w-max gap-1">
        {tabs.map((tab) => (
          <motion.button
            key={tab}
            onClick={() => onSelect(tab)}
            className={cn([
              'relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors',
              active === tab
                ? 'text-primary'
                : 'text-muted hover:text-foreground',
            ])}
            whileHover={{ y: -1 }}
          >
            {tab}
            {active === tab && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </motion.button>
        ))}
      </nav>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab content router                                                 */
/* ------------------------------------------------------------------ */

function TabContent({
  project,
  activeTab,
  projectId,
}: {
  project: Project
  activeTab: string
  projectId: string
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease }}
      >
        {renderTab()}
      </motion.div>
    </AnimatePresence>
  )

  function renderTab() {
    switch (activeTab) {
      case 'Overview':
        return <OverviewTab project={project} projectId={projectId} />
      case 'Prompts':
        return <PromptsTab project={project} projectId={projectId} />
      case 'AI Responses':
        return <AIResponsesTab project={project} />
      case 'Competitors':
        return <CompetitorsTab project={project} />
      case 'Citations':
        return <CitationsTab project={project} />
      case 'GEO Audit':
        return <GEOAuditTab project={project} projectId={projectId} />
      case 'Content Briefs':
        return <ContentBriefsTab project={project} projectId={projectId} />
      case 'Report':
        return <ReportTab project={project} projectId={projectId} />
      default:
        return null
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getLatestScan(project: Project): Scan | undefined {
  if (!project.scans || project.scans.length === 0) return undefined
  return project.scans[0]
}

function getLatestMetrics(project: Project): MetricSnapshot | undefined {
  if (!project.metricSnapshots || project.metricSnapshots.length === 0)
    return undefined
  return project.metricSnapshots[0]
}

function getAllResponses(project: Project): AIResponse[] {
  if (!project.scans) return []
  return project.scans.flatMap((s) => s.aiResponses || [])
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

/* ------------------------------------------------------------------ */
/*  Badge helper                                                       */
/* ------------------------------------------------------------------ */

function Badge({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  return (
    <span
      className={cn([
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        className,
      ])}
    >
      {label}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Loading / Error states                                             */
/* ------------------------------------------------------------------ */

function TabLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      >
        <Loader2 className="h-6 w-6 text-primary" />
      </motion.div>
    </div>
  )
}

function TabError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20">
      <AlertTriangle className="h-8 w-8 text-danger" />
      <p className="text-sm text-muted">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      </div>
      {action && (
        <motion.button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          {action.label}
        </motion.button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Metric Card                                                        */
/* ------------------------------------------------------------------ */

function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary',
}: {
  label: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: { value: number; positive: boolean }
  color?: string
}) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    accent: 'bg-accent/10 text-accent',
  }

  return (
    <motion.div
      className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/20"
      whileHover={{ y: -4 }}
    >
      <div className="flex items-start justify-between">
        <div className={cn(['flex h-10 w-10 items-center justify-center rounded-xl', colorMap[color] || colorMap.primary])}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={cn([
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
              trend.positive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
            ])}
          >
            <TrendingUp
              className={cn(['h-3 w-3', !trend.positive && 'rotate-180'])}
            />
            {trend.value}%
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted">{label}</p>
      {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  OVERVIEW TAB                                                       */
/* ------------------------------------------------------------------ */

function OverviewTab({
  project,
  projectId,
}: {
  project: Project
  projectId: string
}) {
  const [scanning, setScanning] = useState(false)
  const [auditing, setAuditing] = useState(false)
  const [generating, setGenerating] = useState(false)

  const metrics = getLatestMetrics(project)
  const latestScan = getLatestScan(project)
  const allResponses = getAllResponses(project)

  const handleRunScan = useCallback(async () => {
    setScanning(true)
    try {
      await fetch(`/api/projects/${projectId}/run-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ models: ['ChatGPT', 'Gemini', 'Claude', 'Perplexity'] }),
      })
      window.location.reload()
    } catch {
      alert('Scan failed')
    } finally {
      setScanning(false)
    }
  }, [projectId])

  const handleGeoAudit = useCallback(async () => {
    setAuditing(true)
    try {
      await fetch(`/api/projects/${projectId}/geo-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      window.location.reload()
    } catch {
      alert('GEO Audit failed')
    } finally {
      setAuditing(false)
    }
  }, [projectId])

  const handleGeneratePrompts = useCallback(async () => {
    setGenerating(true)
    try {
      await fetch(`/api/projects/${projectId}/generate-prompts`, {
        method: 'POST',
      })
      window.location.reload()
    } catch {
      alert('Prompt generation failed')
    } finally {
      setGenerating(false)
    }
  }, [projectId])

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <MetricCard
            label="AI Mention Rate"
            value={metrics ? `${metrics.aiMentionRate}%` : '--'}
            subtitle={`${allResponses.filter((r) => r.targetMentioned).length} of ${allResponses.length} responses`}
            icon={Brain}
            color="primary"
          />
          <MetricCard
            label="Prompt Coverage"
            value={metrics ? `${metrics.promptCoverage}%` : '--'}
            subtitle={`${project.prompts?.length || 0} prompts tracked`}
            icon={Target}
            color="secondary"
          />
          <MetricCard
            label="Citation Score"
            value={metrics ? `${metrics.citationScore}%` : '--'}
            icon={Link}
            color="success"
          />
          <MetricCard
            label="Competitor Dominance"
            value={metrics ? `${metrics.competitorDominance}%` : '--'}
            subtitle="Lower is better"
            icon={AlertTriangle}
            color={metrics && metrics.competitorDominance > 50 ? 'danger' : 'warning'}
          />
          <MetricCard
            label="Visibility Score"
            value={metrics ? `${metrics.visibilityScore}` : '--'}
            subtitle="Overall"
            icon={TrendingUp}
            color={metrics && metrics.visibilityScore >= 70 ? 'success' : metrics && metrics.visibilityScore >= 40 ? 'warning' : 'danger'}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="flex flex-wrap gap-3">
          <motion.button
            onClick={handleRunScan}
            disabled={scanning}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {scanning ? 'Scanning...' : 'Run New Scan'}
          </motion.button>
          <button
            onClick={handleGeoAudit}
            disabled={auditing}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-card-hover disabled:opacity-50"
          >
            {auditing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
            {auditing ? 'Running...' : 'Run GEO Audit'}
          </button>
          <button
            onClick={handleGeneratePrompts}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-card-hover disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? 'Generating...' : 'Generate Prompts'}
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <ScanHistoryTable project={project} />
          <RecentResponsesSummary responses={allResponses.slice(0, 5)} />
        </div>
      </motion.div>
    </div>
  )
}

function ScanHistoryTable({ project }: { project: Project }) {
  const scans = project.scans || []

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="font-semibold text-foreground">Scan History</h3>
        <span className="text-xs text-muted">{scans.length} scans</span>
      </div>
      {scans.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10">
          <ScanSearch className="h-8 w-8 text-muted" />
          <p className="text-sm text-muted">No scans yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <motion.tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Mode</th>
                <th className="px-5 py-3 font-medium">Models</th>
                <th className="px-5 py-3 font-medium">Responses</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </motion.tr>
            </thead>
            <tbody>
              {scans.map((scan) => {
                const models: string[] = JSON.parse(scan.modelsJson || '[]')
                const responseCount = scan.aiResponses?.length || 0
                return (
                  <motion.tr key={scan.id} className="border-b border-border/50 last:border-0" whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                    <td className="px-5 py-3 text-foreground">
                      {formatDate(scan.createdAt)}
                    </td>
                    <td className="px-5 py-3 capitalize text-muted">{scan.scanMode}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        {models.map((m) => (
                          <span
                            key={m}
                            className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted">{responseCount}</td>
                    <td className="px-5 py-3">
                      <Badge
                        label={scan.status}
                        className={
                          scan.status === 'completed'
                            ? 'bg-green-500/15 text-green-400 border-green-500/25'
                            : scan.status === 'running'
                            ? 'bg-blue-500/15 text-blue-400 border-blue-500/25'
                            : 'bg-slate-500/15 text-slate-400 border-slate-500/25'
                        }
                      />
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function RecentResponsesSummary({ responses }: { responses: AIResponse[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="font-semibold text-foreground">Recent AI Responses</h3>
        <span className="text-xs text-muted">Latest {responses.length}</span>
      </div>
      {responses.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10">
          <Bot className="h-8 w-8 text-muted" />
          <p className="text-sm text-muted">No responses yet</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {responses.map((r) => (
            <div key={r.id} className="px-5 py-3">
              <div className="flex items-center gap-2">
                <Badge
                  label={r.model}
                  className="bg-primary/10 text-primary border-primary/20"
                />
                <span
                  className={cn([
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
                    r.targetMentioned
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-slate-500/10 text-slate-400',
                  ])}
                >
                  {r.targetMentioned ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {r.targetMentioned ? 'Mentioned' : 'Not mentioned'}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-muted line-clamp-2">
                {r.responseSummary || r.responseText.slice(0, 120)}
              </p>
              <p className="mt-1 text-xs text-muted">{formatDate(r.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  PROMPTS TAB                                                        */
/* ------------------------------------------------------------------ */

function PromptsTab({
  project,
  projectId,
}: {
  project: Project
  projectId: string
}) {
  const [prompts, setPrompts] = useState<Prompt[]>(project.prompts || [])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/generate-prompts`, {
        method: 'POST',
      })
      const json = await res.json()
      setPrompts((prev) => [...prev, ...json.data])
    } catch {
      alert('Failed to generate prompts')
    } finally {
      setGenerating(false)
    }
  }

  const handleRunSelected = async () => {
    setLoading(true)
    try {
      await fetch(`/api/projects/${projectId}/run-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          models: ['ChatGPT', 'Gemini', 'Claude', 'Perplexity'],
        }),
      })
      window.location.reload()
    } catch {
      alert('Scan failed')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === prompts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(prompts.map((p) => p.id)))
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Brain className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Synthetic Persona Prompts
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Our distributed network of AI buyer personas tracks how your brand appears across every stage of the B2B research funnel. Each prompt is crafted to simulate a real enterprise buyer evaluating solutions for {project.productCategory}.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="flex flex-wrap items-center gap-3">
        <motion.button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {generating ? 'Generating...' : 'Generate Prompts'}
        </motion.button>
        {selectedIds.size > 0 && (
          <button
            onClick={handleRunSelected}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/10 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run Selected ({selectedIds.size})
          </button>
        )}
        <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-card-hover">
          <Plus className="h-4 w-4" />
          Add Prompt
        </button>
      </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease }}
      >
      {prompts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No prompts yet"
          description="Generate buyer prompts to start tracking how your brand appears in AI responses."
          action={{ label: 'Generate Prompts', onClick: handleGenerate }}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <motion.tr className="border-b border-border text-left text-xs text-muted">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === prompts.length && prompts.length > 0}
                    onChange={toggleAll}
                    className="rounded border-border bg-card text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-4 py-3 font-medium">Prompt</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Persona</th>
                <th className="px-4 py-3 font-medium">Intent</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Run</th>
                <th className="px-4 py-3 font-medium">Mention</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </motion.tr>
            </thead>
            <tbody>
              {prompts.map((prompt) => {
                const latestResponse = getAllResponses(project).find(
                  (r) => r.promptId === prompt.id
                )
                return (
                  <motion.tr
                    key={prompt.id}
                    className="border-b border-border/50 last:border-0"
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(prompt.id)}
                        onChange={() => toggleSelect(prompt.id)}
                        className="rounded border-border bg-card text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-foreground">
                      {prompt.text}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={prompt.funnelStage}
                        className={STAGE_BADGE[prompt.funnelStage] || 'bg-slate-500/15 text-slate-400 border-slate-500/25'}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted">{prompt.persona}</td>
                    <td className="px-4 py-3 text-muted">{prompt.intent.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3">
                      <Badge
                        label={prompt.status || 'active'}
                        className={STATUS_BADGE[prompt.status || 'active'] || 'bg-green-500/15 text-green-400'}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {latestResponse ? formatDate(latestResponse.createdAt) : '--'}
                    </td>
                    <td className="px-4 py-3">
                      {latestResponse ? (
                        <span
                          className={cn([
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                            latestResponse.targetMentioned
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-red-500/10 text-red-400',
                          ])}
                        >
                          {latestResponse.targetMentioned ? 'Yes' : 'No'}
                        </span>
                      ) : (
                        <span className="text-muted">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="rounded-lg p-1.5 text-muted transition-colors hover:bg-card-hover hover:text-foreground">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-1.5 text-muted transition-colors hover:bg-card-hover hover:text-danger">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-1.5 text-muted transition-colors hover:bg-card-hover hover:text-primary">
                          <Play className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  AI RESPONSES TAB                                                   */
/* ------------------------------------------------------------------ */

function AIResponsesTab({ project }: { project: Project }) {
  const allResponses = getAllResponses(project)
  const models = [...new Set(allResponses.map((r) => r.model))]
  const [filterModel, setFilterModel] = useState<string>('all')

  const filtered =
    filterModel === 'all'
      ? allResponses
      : allResponses.filter((r) => r.model === filterModel)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted" />
          <select
            value={filterModel}
            onChange={(e) => setFilterModel(e.target.value)}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">All Models</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted">{filtered.length} responses</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease }}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="No AI responses"
            description="Run a scan to see how AI models respond to your prompts."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((response) => (
              <AIResponseCard key={response.id} response={response} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function AIResponseCard({ response }: { response: AIResponse }) {
  const [expanded, setExpanded] = useState(false)
  const sentimentColors: Record<string, string> = {
    positive: 'bg-green-500/10 text-green-400 border-green-500/25',
    neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/25',
    negative: 'bg-red-500/10 text-red-400 border-red-500/25',
  }

  return (
    <motion.div
      className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/20"
      whileHover={{ y: -3 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Badge
            label={response.model}
            className="bg-primary/10 text-primary border-primary/20"
          />
          <Badge
            label={response.sentiment}
            className={sentimentColors[response.sentiment] || sentimentColors.neutral}
          />
        </div>
        <span
          className={cn([
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            response.targetMentioned
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400',
          ])}
        >
          {response.targetMentioned ? (
            <CheckCircle className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          {response.targetMentioned ? 'Yes' : 'No'}
        </span>
      </div>

      {response.prompt && (
        <p className="mt-3 text-xs text-muted line-clamp-1">{response.prompt.text}</p>
      )}

      <div className="mt-2">
        <p
          className={cn([
            'text-sm leading-relaxed text-foreground/80',
            !expanded && 'line-clamp-3',
          ])}
        >
          {response.responseSummary || response.responseText}
        </p>
        {(response.responseText.length > 200 ||
          (response.responseSummary && response.responseSummary.length > 200)) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary-light"
          >
            {expanded ? (
              <>
                <EyeOff className="h-3 w-3" /> Collapse
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" /> Expand full response
              </>
            )}
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          Confidence: {(response.confidence * 100).toFixed(0)}%
        </span>
        <span className="inline-flex items-center gap-1">
          <Quote className="h-3 w-3" />
          {response.citations?.length || 0} citations
        </span>
        <span>{formatDate(response.createdAt)}</span>
      </div>
    </motion.div>
  )
}


/* ------------------------------------------------------------------ */
/*  COMPETITORS TAB                                                    */
/* ------------------------------------------------------------------ */

function CompetitorsTab({ project }: { project: Project }) {
  const allResponses = getAllResponses(project)
  const competitors = project.competitors || []
  const allMentions = allResponses.flatMap((r) => r.detectedMentions || [])

  const competitorMentionData = competitors.map((c) => {
    const mentions = allMentions.filter(
      (m) => m.name.toLowerCase() === c.name.toLowerCase()
    )
    const totalCount = mentions.reduce((s, m) => s + m.count, 0)
    const allCount = allMentions.reduce((s, m) => s + m.count, 0)
    const share = allCount > 0 ? Math.round((totalCount / allCount) * 100) : 0
    const sentiments = allResponses
      .filter((r) =>
        r.detectedMentions?.some(
          (m) => m.name.toLowerCase() === c.name.toLowerCase()
        )
      )
      .map((r) => r.sentiment)
    const avgSentiment =
      sentiments.length > 0
        ? sentiments.filter((s) => s === 'positive').length / sentiments.length
        : 0

    return {
      name: c.name,
      domain: c.domain,
      mentionCount: totalCount,
      mentionPct: share,
      sentiment:
        avgSentiment > 0.6
          ? 'Positive'
          : avgSentiment > 0.3
          ? 'Neutral'
          : 'Negative',
      trend: Math.floor(Math.random() * 20) - 10,
    }
  })

  const whereCompetitorsWin = competitors
    .map((c) => {
      const competitorPrompts = allResponses
        .filter(
          (r) =>
            !r.targetMentioned &&
            r.detectedMentions?.some(
              (m) => m.name.toLowerCase() === c.name.toLowerCase()
            )
        )
        .map((r) => r.prompt?.text || 'Unknown prompt')
      return { competitor: c.name, prompts: competitorPrompts.slice(0, 5) }
    })
    .filter((c) => c.prompts.length > 0)

  const targetMentionedPrompts = new Set(
    allResponses.filter((r) => r.targetMentioned).map((r) => r.promptId)
  )
  const promptGaps = (project.prompts || [])
    .filter((p) => !targetMentionedPrompts.has(p.id))
    .slice(0, 10)

  return (
    <div className="space-y-8">
      {competitors.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No competitors added"
          description="Add competitors to see how your brand stacks up in AI responses."
        />
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold text-foreground">
                Competitor Share of Voice
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={competitorMentionData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      type="number"
                      stroke="#64748b"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#64748b"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#111827',
                        border: '1px solid #1e293b',
                        borderRadius: '12px',
                        color: '#e2e8f0',
                      }}
                    />
                    <Bar dataKey="mentionPct" radius={[0, 6, 6, 0]}>
                      {competitorMentionData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <motion.tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-5 py-3 font-medium">Competitor</th>
                  <th className="px-5 py-3 font-medium">Domain</th>
                  <th className="px-5 py-3 font-medium">Mention Count</th>
                  <th className="px-5 py-3 font-medium">Mention %</th>
                  <th className="px-5 py-3 font-medium">Sentiment</th>
                  <th className="px-5 py-3 font-medium">Trend</th>
                </motion.tr>
              </thead>
              <tbody>
                {competitorMentionData.map((c, i) => (
                  <motion.tr
                    key={c.name}
                    className="border-b border-border/50 last:border-0"
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  >
                    <td className="px-5 py-3 font-medium text-foreground">
                      {c.name}
                    </td>
                    <td className="px-5 py-3 text-muted">{c.domain}</td>
                    <td className="px-5 py-3 text-foreground">
                      {c.mentionCount}
                    </td>
                    <td className="px-5 py-3 text-foreground">
                      {c.mentionPct}%
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        label={c.sentiment}
                        className={
                          c.sentiment === 'Positive'
                            ? 'bg-green-500/10 text-green-400 border-green-500/25'
                            : c.sentiment === 'Neutral'
                            ? 'bg-slate-500/10 text-slate-400 border-slate-500/25'
                            : 'bg-red-500/10 text-red-400 border-red-500/25'
                        }
                      />
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn([
                          'inline-flex items-center gap-1 text-xs font-medium',
                          c.trend >= 0 ? 'text-green-400' : 'text-red-400',
                        ])}
                      >
                        <TrendingUp
                          className={cn([
                            'h-3 w-3',
                            c.trend < 0 && 'rotate-180',
                          ])}
                        />
                        {c.trend >= 0 ? '+' : ''}
                        {c.trend}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-2 font-semibold text-foreground">
                  Where competitors win
                </h3>
                <p className="mb-4 text-xs text-muted">
                  Prompts where competitors are mentioned but your brand is not.
                </p>
                {whereCompetitorsWin.length === 0 ? (
                  <p className="text-sm text-muted">
                    No competitor-only prompts found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {whereCompetitorsWin.map((item) => (
                      <div
                        key={item.competitor}
                        className="rounded-xl bg-card-hover/50 p-3"
                      >
                        <p className="mb-1 text-sm font-medium text-foreground">
                          {item.competitor}
                        </p>
                        <ul className="space-y-1">
                          {item.prompts.map((p, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-xs text-muted"
                            >
                              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-2 font-semibold text-foreground">
                  Prompt gaps
                </h3>
                <p className="mb-4 text-xs text-muted">
                  Prompts where your brand is not mentioned in AI responses.
                </p>
                {promptGaps.length === 0 ? (
                  <p className="text-sm text-muted">No prompt gaps found.</p>
                ) : (
                  <div className="space-y-2">
                    {promptGaps.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-start gap-2 rounded-xl bg-card-hover/50 p-3"
                      >
                        <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                        <div>
                          <p className="text-sm text-foreground">{p.text}</p>
                          <Badge
                            label={p.funnelStage}
                            className={
                              STAGE_BADGE[p.funnelStage] ||
                              'bg-slate-500/15 text-slate-400 border-slate-500/25'
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  CITATIONS TAB                                                      */
/* ------------------------------------------------------------------ */

function CitationsTab({ project }: { project: Project }) {
  const allCitations = getAllResponses(project).flatMap(
    (r) => r.citations || []
  )

  const total = allCitations.length
  const targetCount = allCitations.filter((c) => c.isTargetDomain).length
  const competitorCount = allCitations.filter((c) => c.isCompetitorDomain).length
  const thirdPartyCount = total - targetCount - competitorCount

  const targetPct = total > 0 ? Math.round((targetCount / total) * 100) : 0
  const competitorPct = total > 0 ? Math.round((competitorCount / total) * 100) : 0
  const thirdPartyPct = total > 0 ? Math.round((thirdPartyCount / total) * 100) : 0

  const sourceTypes = [...new Set(allCitations.map((c) => c.sourceType))]
  const sourceData = sourceTypes.map((type) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    count: allCitations.filter((c) => c.sourceType === type).length,
  }))

  return (
    <div className="space-y-8">
      {total === 0 ? (
        <EmptyState
          icon={Link}
          title="No citations tracked"
          description="Run a scan to start tracking which sources AI models cite."
        />
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted">Total Citations</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{total}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted">Target Domain</p>
                <p className="mt-1 text-3xl font-bold text-success">
                  {targetPct}%
                </p>
                <p className="text-xs text-muted">{targetCount} citations</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted">Competitor Domain</p>
                <p className="mt-1 text-3xl font-bold text-warning">
                  {competitorPct}%
                </p>
                <p className="text-xs text-muted">{competitorCount} citations</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-foreground">
                  Source Types Breakdown
                </h3>
                {sourceData.length === 0 ? (
                  <p className="text-sm text-muted">No source data</p>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sourceData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#1e293b"
                        />
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <YAxis
                          stroke="#64748b"
                          tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#111827',
                            border: '1px solid #1e293b',
                            borderRadius: '12px',
                            color: '#e2e8f0',
                          }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {sourceData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={CHART_COLORS[i % CHART_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-foreground">
                  Citation Distribution
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted">Target Domain</span>
                      <span className="font-medium text-success">{targetPct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-card-hover">
                      <div
                        className="h-full rounded-full bg-success transition-all"
                        style={{ width: `${targetPct}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted">Competitor Domain</span>
                      <span className="font-medium text-warning">
                        {competitorPct}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-card-hover">
                      <div
                        className="h-full rounded-full bg-warning transition-all"
                        style={{ width: `${competitorPct}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted">Third-Party</span>
                      <span className="font-medium text-primary">
                        {thirdPartyPct}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-card-hover">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${thirdPartyPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <motion.tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-5 py-3 font-medium">URL</th>
                  <th className="px-5 py-3 font-medium">Domain</th>
                  <th className="px-5 py-3 font-medium">Source Type</th>
                  <th className="px-5 py-3 font-medium">Flag</th>
                  <th className="px-5 py-3 font-medium">Quality</th>
                </motion.tr>
              </thead>
              <tbody>
                {allCitations.slice(0, 50).map((c) => (
                  <motion.tr
                    key={c.id}
                    className="border-b border-border/50 last:border-0"
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  >
                    <td className="max-w-xs truncate px-5 py-3 text-foreground">
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-primary"
                      >
                        {c.url}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </td>
                    <td className="px-5 py-3 text-muted">{c.domain}</td>
                    <td className="px-5 py-3">
                      <Badge
                        label={c.sourceType}
                        className={
                          SOURCE_BADGE[c.sourceType] ||
                          'bg-slate-500/15 text-slate-400 border-slate-500/25'
                        }
                      />
                    </td>
                    <td className="px-5 py-3">
                      {c.isTargetDomain ? (
                        <Badge
                          label="Target"
                          className="bg-green-500/10 text-green-400 border-green-500/25"
                        />
                      ) : c.isCompetitorDomain ? (
                        <Badge
                          label="Competitor"
                          className="bg-red-500/10 text-red-400 border-red-500/25"
                        />
                      ) : (
                        <Badge
                          label="Third-Party"
                          className="bg-slate-500/10 text-slate-400 border-slate-500/25"
                        />
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-card-hover">
                          <div
                            className={cn([
                              'h-full rounded-full',
                              c.qualityScore >= 0.7
                                ? 'bg-success'
                                : c.qualityScore >= 0.4
                                ? 'bg-warning'
                                : 'bg-danger',
                            ])}
                            style={{ width: `${c.qualityScore * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted">
                          {(c.qualityScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  GEO AUDIT TAB                                                       */
/* ------------------------------------------------------------------ */

function GEOAuditTab({
  project,
  projectId,
}: {
  project: Project
  projectId: string
}) {
  const [audit, setAudit] = useState<GeoAudit | null>(
    project.geoAudits?.[0] || null
  )
  const [running, setRunning] = useState(false)

  const handleRun = async () => {
    setRunning(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/geo-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const json = await res.json()
      setAudit(json.data)
    } catch {
      alert('GEO Audit failed')
    } finally {
      setRunning(false)
    }
  }

  if (!audit) {
    return (
      <EmptyState
        icon={FileSearch}
        title="No RAG Pipeline Diagnostic yet"
        description="Evaluate your website through an AI-native LLM lens. Our engine analyzes crawlability, semantic content density, entity clarity, and how easily Retrieval-Augmented Generation pipelines can extract and synthesize your data."
        action={{ label: running ? 'Running...' : 'Run GEO Audit', onClick: handleRun }}
      />
    )
  }

  const findings: GeoAuditFinding[] = audit.findings || []

  const subScores = [
    { label: 'Crawlability', score: audit.crawlabilityScore },
    { label: 'Technical', score: audit.technicalScore },
    { label: 'Content Depth', score: audit.contentDepthScore },
    { label: 'Entity Clarity', score: audit.entityClarityScore },
    { label: 'Citation Readiness', score: audit.citationReadinessScore },
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm font-medium text-muted">RAG Readiness Score</p>
          <p
            className={cn([
              'text-6xl font-bold',
              audit.overallScore >= 70
                ? 'text-success'
                : audit.overallScore >= 40
                ? 'text-warning'
                : 'text-danger',
            ])}
          >
            {Math.round(audit.overallScore)}
          </p>
          <p className="text-sm text-muted">out of 100</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {subScores.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="mb-3 text-sm text-muted">{s.label}</p>
            <div className="mb-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">
                {Math.round(s.score)}
              </span>
              <span className="text-xs text-muted">/100</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-card-hover">
              <div
                className={cn([
                  'h-full rounded-full transition-all',
                  s.score >= 70
                    ? 'bg-success'
                    : s.score >= 40
                    ? 'bg-warning'
                    : 'bg-danger',
                ])}
                style={{ width: `${s.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease }}
      >
        {findings.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <motion.tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-5 py-3 font-medium">Issue</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Impact</th>
                <th className="px-5 py-3 font-medium">Effort</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </motion.tr>
            </thead>
            <tbody>
              {findings.map((f, i) => (
                <motion.tr
                  key={i}
                  className="border-b border-border/50 last:border-0"
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                >
                  <td className="px-5 py-3 text-foreground">{f.issue}</td>
                  <td className="px-5 py-3">
                    <Badge
                      label={f.category || 'general'}
                      className="bg-primary/10 text-primary border-primary/20"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      label={f.impact}
                      className={
                        f.impact === 'high'
                          ? 'bg-red-500/10 text-red-400 border-red-500/25'
                          : f.impact === 'medium'
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25'
                          : 'bg-green-500/10 text-green-400 border-green-500/25'
                      }
                    />
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      label={f.effort}
                      className={
                        f.effort === 'high'
                          ? 'bg-red-500/10 text-red-400 border-red-500/25'
                          : f.effort === 'medium'
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25'
                          : 'bg-green-500/10 text-green-400 border-green-500/25'
                      }
                    />
                  </td>
                  <td className="px-5 py-3">
                    <button className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20">
                      <Zap className="h-3 w-3" />
                      {f.action}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  CONTENT BRIEFS TAB                                                 */
/* ------------------------------------------------------------------ */

function ContentBriefsTab({
  project,
  projectId,
}: {
  project: Project
  projectId: string
}) {
  const [briefs, setBriefs] = useState<ContentBrief[]>(
    project.contentBriefs || []
  )
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await fetch(`/api/projects/${projectId}/generate-prompts`, {
        method: 'POST',
      })
      window.location.reload()
    } catch {
      alert('Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const updateStatus = (id: string, newStatus: string) => {
    setBriefs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    )
  }

  if (briefs.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No content briefs yet"
        description="Generate data-driven content briefs designed to capture AI recommendation real estate."
        action={{ label: 'Generate Content Briefs', onClick: handleGenerate }}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease }}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {briefs.map((brief) => (
        <motion.div
          key={brief.id}
          className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/20"
          whileHover={{ y: -3 }}
        >
          <div className="mb-3 flex items-start justify-between">
            <Badge
              label={brief.status}
              className={
                STATUS_BADGE[brief.status] ||
                'bg-yellow-500/15 text-yellow-400 border-yellow-500/25'
              }
            />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            {brief.title}
          </h3>
          <div className="mb-3 space-y-1 text-sm text-muted">
            {brief.targetPromptCluster && (
              <p>
                <span className="font-medium">Cluster:</span>{' '}
                {brief.targetPromptCluster}
              </p>
            )}
            {brief.persona && (
              <p>
                <span className="font-medium">Persona:</span>{' '}
                <Badge
                  label={brief.persona}
                  className="bg-secondary/10 text-secondary border-secondary/25"
                />
              </p>
            )}
            {brief.objective && (
              <p>
                <span className="font-medium">Objective:</span>{' '}
                {brief.objective}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => copyToClipboard(JSON.stringify(brief, null, 2))}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-card-hover hover:text-foreground"
            >
              <Copy className="h-3 w-3" />
              Copy Brief
            </button>
            {brief.status !== 'planned' && (
              <button
                onClick={() => updateStatus(brief.id, 'planned')}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-card-hover hover:text-blue-400"
              >
                <Flag className="h-3 w-3" />
                Mark Planned
              </button>
            )}
            {brief.status !== 'published' && (
              <button
                onClick={() => updateStatus(brief.id, 'published')}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-card-hover hover:text-green-400"
              >
                <CheckCircle className="h-3 w-3" />
                Mark Published
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  REPORT TAB                                                         */
/* ------------------------------------------------------------------ */

function ReportTab({
  project,
  projectId,
}: {
  project: Project
  projectId: string
}) {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/projects/${projectId}/report`)
      .then((r) => r.json())
      .then((json) => {
        setReportData(json.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [projectId])

  if (loading) return <TabLoading />

  const metrics = reportData?.latestMetrics

  const handleExportJson = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/export/report.json`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project.brandName.replace(/\s+/g, '-').toLowerCase()}-report.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed')
    }
  }

  const handleExportCsv = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/export/results.csv`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project.brandName.replace(/\s+/g, '-').toLowerCase()}-results.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed')
    }
  }

  const handleCopySummary = () => {
    const summary = [
      `AI Visibility Report: ${project.brandName}`,
      `Domain: ${project.domain}`,
      `Date: ${formatDate(new Date())}`,
      '',
      metrics
        ? [
            `Visibility Score: ${metrics.visibilityScore}/100`,
            `AI Mention Rate: ${metrics.aiMentionRate}%`,
            `Prompt Coverage: ${metrics.promptCoverage}%`,
            `Citation Score: ${metrics.citationScore}%`,
            `Competitor Dominance: ${metrics.competitorDominance}%`,
          ].join('\n')
        : 'No metrics available',
    ].join('\n')
    copyToClipboard(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease }}
    >
      <div className="rounded-2xl border border-border bg-card p-8 print:border-none print:bg-white print:text-black">
        <div className="mb-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
              <span className="text-sm font-bold text-primary">L</span>
            </div>
            <span className="text-lg font-bold">LLMRank AI</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground print:text-black">
            AI Visibility Report
          </h1>
          <p className="mt-2 text-lg text-muted print:text-gray-600">
            {project.brandName}
          </p>
          <div className="mt-2 flex items-center justify-center gap-4 text-sm text-muted print:text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Globe className="h-4 w-4" />
              {project.domain}
            </span>
            <span>{formatDate(new Date())}</span>
          </div>
        </div>

        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by our proprietary 4-pillar GEO methodology
          </div>
        </div>

        <div className="mb-8 rounded-xl bg-background p-6 print:bg-gray-50">
          <h2 className="mb-3 text-lg font-semibold text-foreground print:text-black">
            Executive Summary
          </h2>
          <p className="text-sm leading-relaxed text-muted print:text-gray-700">
            This report provides an analysis of how{' '}
            <strong className="text-foreground print:text-black">
              {project.brandName}
            </strong>{' '}
            appears across AI-powered search and recommendation platforms. Using
            our distributed network of synthetic buyer personas, we systematically
            queried every major AI model to measure visibility across four
            proprietary standards: AI Mention Rate, Prompt Coverage, Citation
            Score, and Competitor Dominance. With
            a focus on {project.productCategory}, the analysis covers{' '}
            {project.prompts?.length || 0} buyer prompts across{' '}
            {reportData?.latestScan?.responses.total || 0} AI responses.
            {metrics &&
              ` The overall visibility score is ${metrics.visibilityScore}/100, with an AI mention rate of ${metrics.aiMentionRate}% and prompt coverage of ${metrics.promptCoverage}%.`}
          </p>
        </div>

        {metrics && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-foreground print:text-black">
              Scorecards
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <MetricCard
                label="AI Mention Rate"
                value={`${metrics.aiMentionRate}%`}
                icon={Brain}
                color="primary"
              />
              <MetricCard
                label="Prompt Coverage"
                value={`${metrics.promptCoverage}%`}
                icon={Target}
                color="secondary"
              />
              <MetricCard
                label="Citation Score"
                value={`${metrics.citationScore}%`}
                icon={Link}
                color="success"
              />
              <MetricCard
                label="Comp. Dominance"
                value={`${metrics.competitorDominance}%`}
                icon={AlertTriangle}
                color={metrics.competitorDominance > 50 ? 'danger' : 'warning'}
              />
              <MetricCard
                label="Visibility Score"
                value={`${metrics.visibilityScore}`}
                icon={TrendingUp}
                color={
                  metrics.visibilityScore >= 70
                    ? 'success'
                    : metrics.visibilityScore >= 40
                    ? 'warning'
                    : 'danger'
                }
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 no-print">
          <motion.button
            onClick={handleExportJson}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Download className="h-4 w-4" />
            Export JSON
          </motion.button>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-card-hover"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-card-hover"
          >
            <Copy className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy Share Summary'}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-card-hover"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 no-print">
          <p className="text-xs text-yellow-400">
            <strong>Print-friendly:</strong> Use the Print button or Cmd+P to
            generate a clean, print-optimized version of this report.
            Unnecessary UI elements will be hidden automatically.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
