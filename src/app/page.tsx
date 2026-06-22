"use client";

import { useRef } from "react";
import {
  Search,
  BarChart3,
  Link,
  FileSearch,
  FileText,
  Calendar,
  Brain,
  Sparkles,
  Bot,
  Orbit,
  ChevronRight,
  Check,
  ArrowUpRight,
  Menu,
  X,
  AlertTriangle,
  TrendingUp,
  Layers,
  Globe,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Animation config                                                   */
/* ------------------------------------------------------------------ */

const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease } },
};

function Section({ children, id, className = "" }: { children: React.ReactNode; id?: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function Card({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, ease, delay }}
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
      className={`rounded-2xl border border-border bg-card transition-colors ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const models = [
  { name: "ChatGPT", Icon: Brain },
  { name: "Gemini", Icon: Sparkles },
  { name: "Claude", Icon: Bot },
  { name: "Perplexity", Icon: Orbit },
];

const problems = [
  {
    icon: AlertTriangle,
    title: "The Recommendation Black Box",
    desc: "Your brand is being evaluated by AI models daily — but you have no idea what they say. SaaS marketers cannot see if ChatGPT or Gemini recommends their software when a qualified buyer asks.",
  },
  {
    icon: TrendingUp,
    title: "Competitor Hijacking",
    desc: "Legacy competitors appear in LLM-generated comparison tables while superior alternatives are omitted. Your product loses deals it never knew it was competing for.",
  },
  {
    icon: Layers,
    title: "Google-Era Architecture",
    desc: "Your documentation, case studies, and product pages are built for PageRank, not for Retrieval-Augmented Generation (RAG) pipelines. AI models cannot extract your value.",
  },
];

const features = [
  {
    icon: Search,
    title: "Synthetic Persona Prompt Tracking",
    desc: "Our distributed network of synthetic buyer personas systematically queries every major AI model. Discover exactly which high-intent prompts your brand appears in — and which ones it doesn't.",
  },
  {
    icon: BarChart3,
    title: "Multi-Model Share-of-Voice",
    desc: "Track mention frequency across ChatGPT, Gemini, Claude, and Perplexity simultaneously. See exactly where competitors win AI recommendations and find your prompt gaps.",
  },
  {
    icon: Link,
    title: "Citation Intelligence",
    desc: "Not all visibility is equal. Track which sources AI models cite — your domain, competitor domains, or third-party review sites. Earn citations from the sources that influence recommendations.",
  },
  {
    icon: FileSearch,
    title: "RAG Pipeline Diagnostic & GEO Audit",
    desc: "Our AI-native engine evaluates your website through an LLM lens: content density, semantic clarity, factual structuring, and RAG-readiness. Identifies if AI models can easily scrape and synthesize your data.",
  },
  {
    icon: FileText,
    title: "High-Information Content Engine",
    desc: "Rather than keyword-stuffed text, our engine produces structured data, comparison landing pages, case studies, and schema-rich content specifically designed to feed the parametric memory of AI models.",
  },
  {
    icon: Calendar,
    title: "CMS Publishing Roadmap",
    desc: "Plan, assign, and publish AI-optimized content directly from the platform. Native integrations with HubSpot, Webflow, and WordPress for automated deployment.",
  },
];

const metrics = [
  {
    name: "AI Mention Rate (AMR)",
    formula: "brand mentions across 1,000 standardized prompts / total responses × 100",
    good: ">60% is strong",
    desc: "The percentage of test queries where your brand is recommended across standardized categorical prompts. Measures general brand awareness within LLM weights.",
    color: "from-primary/15 to-primary/5",
    border: "border-primary/20",
    icon: Brain,
  },
  {
    name: "Prompt Coverage",
    formula: "unique prompts with brand mention / total prompts × 100",
    good: ">50% means good coverage",
    desc: "The breadth of semantic variations — transactional, educational, and conversational — that your brand successfully answers. Ensures visibility at every phase of the B2B buyer's research funnel.",
    color: "from-accent/15 to-accent/5",
    border: "border-accent/20",
    icon: TargetIcon,
  },
  {
    name: "Citation Score",
    formula: "your domain citations / total citations across search-centric models × 100",
    good: "Higher = more referral traffic from AI",
    desc: "The frequency with which search-centric models like Perplexity and Gemini append direct anchor links to your domain. Directly correlates to downstream referral traffic from AI engines.",
    color: "from-secondary/15 to-secondary/5",
    border: "border-secondary/20",
    icon: Link2Icon,
  },
  {
    name: "Competitor Dominance Index",
    formula: "competitor mentions / total brand mentions across shared prompt landscapes × 100",
    good: "Lower is better — identifies vulnerability",
    desc: "A relative index tracking competitor share-of-voice within shared prompt landscapes. Identifies gaps where competitors win organic recommendations that should be yours.",
    color: "from-danger/15 to-danger/5",
    border: "border-danger/20",
    icon: CrosshairIcon,
  },
];

const tiers = [
  {
    name: "SaaS Startup",
    price: "$299",
    period: "/mo",
    popular: false,
    audience: "Bootstrapped / Seed-stage SaaS",
    features: [
      "1 brand profile",
      "100 prompt tracks",
      "3 AI models (ChatGPT, Gemini, Claude)",
      "Weekly refresh",
      "Basic GEO audit",
      "Standard reporting",
    ],
    cta: "Start Free Trial",
    href: "/onboarding",
  },
  {
    name: "SaaS Growth",
    price: "$799",
    period: "/mo",
    popular: true,
    audience: "Series A+ Hyper-growth SaaS",
    features: [
      "3 brand profiles",
      "500 prompt tracks",
      "All 6 AI models",
      "Daily refresh",
      "Automated content optimizer",
      "Competitor gap analysis",
      "GEO audit + content briefs",
    ],
    cta: "Start Free Trial",
    href: "/onboarding",
  },
  {
    name: "Enterprise Scale",
    price: "$2,499",
    period: "+/mo",
    popular: false,
    audience: "Enterprise / Multi-Product",
    features: [
      "Unlimited brands",
      "Custom prompt tracks",
      "All models + custom fine-tuned",
      "Real-time API monitoring",
      "Dedicated RAG consultant",
      "Automated CMS publishing",
      "White-label reports",
      "Priority support & SLA",
    ],
    cta: "Contact Sales",
    href: "#",
  },
];

/* ------------------------------------------------------------------ */
/*  Icon helpers                                                       */
/* ------------------------------------------------------------------ */

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function Link2Icon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CrosshairIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="22" y1="12" x2="18" y2="12" />
      <line x1="6" y1="12" x2="2" y2="12" />
      <line x1="12" y1="6" x2="12" y2="2" />
      <line x1="12" y1="22" x2="12" y2="18" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Header />
      <Hero />
      <Problem />
      <Features />
      <Metrics />
      <Pricing />
      <Disclaimer />
      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

function Header() {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-2xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ rotate: -10, scale: 1.05 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 shadow-sm shadow-primary/10"
          >
            <span className="text-sm font-bold text-primary">L</span>
          </motion.div>
          <span className="text-lg font-bold tracking-tight">
            LLMRank <span className="text-primary">AI</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {["Problem", "Features", "Metrics", "Pricing"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {link}
            </a>
          ))}
        </nav>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="hidden md:block">
          <a
            href="/onboarding"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-primary/30"
          >
            Run Free AI Visibility Report
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </motion.div>
        <MobileMenu />
      </div>
    </motion.header>
  );
}

function MobileMenu() {
  return (
    <details className="group md:hidden">
      <summary className="flex cursor-pointer list-none items-center p-2 text-muted">
        <Menu className="h-5 w-5 group-open:hidden" />
        <X className="hidden h-5 w-5 group-open:block" />
      </summary>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed left-0 right-0 top-16 border-b border-border/30 bg-background/90 backdrop-blur-2xl"
      >
        <nav className="flex flex-col gap-1 p-4">
          {["Problem", "Features", "Metrics", "Pricing"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="rounded-lg px-4 py-3 text-sm font-medium text-muted transition-colors hover:bg-card-hover hover:text-foreground"
            >
              {link}
            </a>
          ))}
          <a
            href="/onboarding"
            className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
          >
            Run Free AI Visibility Report
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </nav>
      </motion.div>
    </details>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden">
      {/* Parallax background glow */}
      <motion.div style={{ y: bgY }} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 h-[30rem] w-[30rem] translate-x-1/2 rounded-full bg-secondary/8 blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-accent/8 blur-[120px]" />
      </motion.div>

      {/* Floating decorative shapes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1.5, ease }}
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[10%] h-16 w-16 rounded-2xl border border-primary/20 bg-primary/5"
        />
        <motion.div
          animate={{ y: [0, 25, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[40%] left-[5%] h-12 w-12 rounded-full border border-accent/20 bg-accent/5"
        />
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[30%] right-[15%] h-10 w-10 rounded-xl border border-secondary/20 bg-secondary/5"
        />
      </motion.div>

      <motion.div style={{ opacity }} className="mx-auto max-w-7xl px-4 pt-[12rem] sm:px-6 lg:px-8 sm:pt-[14rem]">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>
            Defining Generative Engine Optimization for B2B SaaS
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
            className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Rank where buyers now search:{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              ChatGPT, Gemini, Claude, and Perplexity
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.3 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl"
          >
            SEO is broken. AI doesn't read keyword-stuffed blog posts — it
            synthesizes structured, high-information content from brands it can
            verify. LLMRank AI is the first GEO platform built exclusively for
            B2B SaaS.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.45 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <motion.a
              href="/onboarding"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-primary/40"
            >
              Run Free AI Visibility Report
              <ArrowUpRight className="h-5 w-5" />
            </motion.a>
            <motion.a
              href="/dashboard"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm px-8 py-3.5 text-base font-semibold text-foreground transition-all hover:bg-card-hover"
            >
              View Demo Dashboard
              <ChevronRight className="h-5 w-5" />
            </motion.a>
          </motion.div>
        </div>

        {/* Model cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mx-auto mt-20 max-w-3xl"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {models.map(({ name, Icon }) => (
              <motion.div
                key={name}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.9 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease } },
                }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 transition-all hover:border-primary/30 hover:bg-card/80 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/10 transition-transform group-hover:scale-110">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Problem                                                            */
/* ------------------------------------------------------------------ */

function Problem() {
  return (
    <Section id="problem" className="border-t border-border/50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight sm:text-5xl">
            The B2B SaaS Visibility Crisis
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted">
            Enterprise buyers have stopped reading ten blue links. They ask
            ChatGPT. They ask Gemini. Your brand is being evaluated in every
            response — and you are flying blind.
          </motion.p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mt-16 grid gap-6 sm:grid-cols-3"
        >
          {problems.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease, delay: i * 0.1 } },
              }}
              whileHover={{ y: -6 }}
              className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-danger/20 hover:bg-card-hover hover:shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10">
                <Icon className="h-6 w-6 text-danger" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-muted">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Features                                                           */
/* ------------------------------------------------------------------ */

function Features() {
  return (
    <Section id="features" className="border-t border-border/50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight sm:text-5xl">
            The AI visibility platform for B2B SaaS
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted">
            Three programmatic pillars power every insight: synthetic persona
            prompt tracking, multi-model share-of-voice measurement, and
            high-information content optimization.
          </motion.p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <div className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted">{desc}</p>
              </div>
            </Card>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Metrics                                                            */
/* ------------------------------------------------------------------ */

function Metrics() {
  return (
    <Section id="metrics" className="border-t border-border/50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight sm:text-5xl">
            Four metrics that define a new category
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted">
            SEO had keyword rankings. GEO has AI Mention Rate, Prompt Coverage,
            Citation Score, and Competitor Dominance. These four indicators
            replace everything you knew about search performance.
          </motion.p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mt-16 grid gap-6 sm:grid-cols-2"
        >
          {metrics.map((metric, i) => {
            const IconComponent = metric.icon;
            return (
              <motion.div
                key={metric.name}
                variants={scaleIn}
                whileHover={{ y: -4 }}
                className={`rounded-2xl border bg-card p-6 sm:p-8 ${metric.border}`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${metric.color}`}>
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                    >
                      <IconComponent className="h-5 w-5 text-primary" />
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-bold">{metric.name}</h3>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-muted">{metric.desc}</p>
                <div className="mb-4 rounded-xl bg-background/50 p-3">
                  <code className="text-sm text-primary-light">
                    {metric.formula}
                  </code>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex items-center gap-2 text-sm text-success"
                >
                  <Check className="h-4 w-4" />
                  <span className="font-medium">{metric.good}</span>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Pricing                                                            */
/* ------------------------------------------------------------------ */

function Pricing() {
  return (
    <Section id="pricing" className="border-t border-border/50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted">
            Start with a free AI Visibility Report. Upgrade when you need deeper
            tracking and optimization.
          </motion.p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mt-16 grid gap-6 lg:grid-cols-3 lg:gap-8"
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
              }}
              whileHover={{ y: -8 }}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
                tier.popular
                  ? "border-primary/50 bg-card shadow-2xl shadow-primary/10"
                  : "border-border/50 bg-card hover:border-primary/20 hover:shadow-xl"
              }`}
            >
              {tier.popular && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                >
                  <span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-primary/20">
                    Most Popular
                  </span>
                </motion.div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-muted">
                  {tier.name}
                </h3>
                <p className="mt-1 text-xs text-muted">{tier.audience}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted">{tier.period}</span>
                </div>
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3 text-sm"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </motion.li>
                ))}
              </ul>
              <motion.a
                href={tier.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-center text-sm font-semibold transition-all ${
                  tier.popular
                    ? "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-dark"
                    : "border border-border/60 text-foreground hover:bg-card-hover"
                }`}
              >
                {tier.cta}
                <ArrowUpRight className="h-4 w-4" />
              </motion.a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer & Disclaimer                                                */
/* ------------------------------------------------------------------ */

function Disclaimer() {
  return (
    <div className="border-t border-border/30 bg-card/30 py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-muted">
          This prototype uses a mix of real API calls (OpenAI) and simulated
          model data. Real Claude, Gemini, Perplexity, Google AI Overviews, and
          Copilot integrations require API keys and official approval.
        </p>
      </div>
    </div>
  );
}

const footerLinks = [
  { label: "Features", href: "#features" },
  { label: "Metrics", href: "#metrics" },
  { label: "Pricing", href: "#pricing" },
  { label: "Privacy", href: "#" },
];

function Footer() {
  return (
    <footer className="border-t border-border/30 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
              <span className="text-xs font-bold text-primary">L</span>
            </div>
            <span className="text-sm font-bold">
              LLMRank <span className="text-primary">AI</span>
            </span>
          </div>
          <nav className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} LLMRank AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
