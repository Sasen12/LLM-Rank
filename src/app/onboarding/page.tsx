'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const ease = [0.16, 1, 0.3, 1] as const

const MODELS = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity', 'Google AI Overviews', 'Copilot'] as const
const REGIONS = ['Global', 'North America', 'Europe', 'APAC', 'Latin America'] as const
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Japanese'] as const
const PROMPT_COUNTS = [10, 25, 50] as const

type FormData = {
  brandName: string
  domain: string
  productCategory: string
  shortDescription: string
  targetAudience: string
  primaryUseCases: string
  region: string
  language: string
  competitors: { name: string; domain: string }[]
  models: string[]
  promptCount: number
  scanMode: 'quick' | 'deep'
}

const initialForm: FormData = {
  brandName: '',
  domain: '',
  productCategory: '',
  shortDescription: '',
  targetAudience: '',
  primaryUseCases: '',
  region: 'Global',
  language: 'English',
  competitors: [],
  models: [...MODELS],
  promptCount: 25,
  scanMode: 'quick',
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const totalSteps = 4

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  function toggleModel(model: string) {
    setForm((prev) => ({
      ...prev,
      models: prev.models.includes(model)
        ? prev.models.filter((m) => m !== model)
        : [...prev.models, model],
    }))
  }

  function addCompetitor() {
    if (form.competitors.length >= 6) return
    setForm((prev) => ({
      ...prev,
      competitors: [...prev.competitors, { name: '', domain: '' }],
    }))
  }

  function updateCompetitor(index: number, field: 'name' | 'domain', value: string) {
    setForm((prev) => {
      const competitors = [...prev.competitors]
      competitors[index] = { ...competitors[index], [field]: value }
      return { ...prev, competitors }
    })
  }

  function removeCompetitor(index: number) {
    setForm((prev) => ({
      ...prev,
      competitors: prev.competitors.filter((_, i) => i !== index),
    }))
  }

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return form.brandName.trim().length > 0 && form.domain.trim().length > 0
      case 2:
        return form.targetAudience.trim().length > 0 && form.primaryUseCases.trim().length > 0
      case 3:
        return form.competitors.length >= 1 && form.competitors.every((c) => c.name.trim().length > 0)
      case 4:
        return form.models.length > 0
      default:
        return true
    }
  }

  async function handleSubmit() {
    if (!canProceed()) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: form.brandName,
          domain: form.domain,
          productCategory: form.productCategory,
          shortDescription: form.shortDescription,
          targetAudience: form.targetAudience,
          primaryUseCases: form.primaryUseCases,
          region: form.region,
          language: form.language === 'English' ? 'en' : form.language,
          competitors: form.competitors.filter((c) => c.name.trim().length > 0),
          models: form.models,
          promptCount: form.promptCount,
          scanMode: form.scanMode,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to create project')
      }

      router.push(`/projects/${json.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  function handleNext() {
    if (step < totalSteps) setStep((s) => s + 1)
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-white">Create New Project</h1>
          <p className="text-muted mt-1">Set up your AI search visibility tracking</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-full bg-card rounded-full h-1.5 mb-6">
          <motion.div
            className="bg-primary h-1.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease }}
          />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    s < step
                      ? 'bg-primary text-white'
                      : s === step
                        ? 'bg-primary text-white ring-2 ring-primary/30'
                        : 'bg-card text-muted'
                  }`}
                  animate={s === step ? { scale: 1.12 } : { scale: 1 }}
                  transition={{ duration: 0.3, ease }}
                >
                  {s < step ? '✓' : s}
                </motion.div>
                <span
                  className={`text-sm hidden sm:inline ${
                    s === step ? 'text-white' : 'text-muted'
                  }`}
                >
                  {['Brand Details', 'Market Details', 'Competitors', 'Models & Settings'][s - 1]}
                </span>
              </div>
              {s < totalSteps && (
                <div
                  className={`w-10 h-0.5 ${
                    s < step ? 'bg-primary' : 'bg-card'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-8">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Brand Details */}
            {step === 1 && (
              <motion.div
                key={1}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease }}
              >
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-muted mb-1.5 block">
                      What is your brand name?
                    </label>
                    <input
                      type="text"
                      value={form.brandName}
                      onChange={(e) => updateField('brandName', e.target.value)}
                      placeholder="e.g., NorthStar CRM"
                      className="w-full bg-card border border-border rounded-lg px-4 py-3 text-white placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted mb-1.5 block">
                      What is your website domain?
                    </label>
                    <input
                      type="text"
                      value={form.domain}
                      onChange={(e) => updateField('domain', e.target.value)}
                      placeholder="e.g., northstarcrm.example"
                      className="w-full bg-card border border-border rounded-lg px-4 py-3 text-white placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted mb-1.5 block">
                      Product category
                    </label>
                    <input
                      type="text"
                      value={form.productCategory}
                      onChange={(e) => updateField('productCategory', e.target.value)}
                      placeholder="e.g., CRM for B2B SaaS sales teams"
                      className="w-full bg-card border border-border rounded-lg px-4 py-3 text-white placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted mb-1.5 block">
                      Short description of your product
                    </label>
                    <textarea
                      value={form.shortDescription}
                      onChange={(e) => updateField('shortDescription', e.target.value)}
                      placeholder="Describe what your product does..."
                      rows={3}
                      className="w-full bg-card border border-border rounded-lg px-4 py-3 text-white placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Market Details */}
            {step === 2 && (
              <motion.div
                key={2}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease }}
              >
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-muted mb-1.5 block">
                      Target audience
                    </label>
                    <input
                      type="text"
                      value={form.targetAudience}
                      onChange={(e) => updateField('targetAudience', e.target.value)}
                      placeholder="e.g., Seed to Series B SaaS companies"
                      className="w-full bg-card border border-border rounded-lg px-4 py-3 text-white placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted mb-1.5 block">
                      Primary use cases
                    </label>
                    <textarea
                      value={form.primaryUseCases}
                      onChange={(e) => updateField('primaryUseCases', e.target.value)}
                      placeholder="e.g., Lead generation&#10;Sales prospecting&#10;Market research"
                      rows={4}
                      className="w-full bg-card border border-border rounded-lg px-4 py-3 text-white placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
                    />
                    <p className="text-xs text-muted mt-1">One per line</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted mb-1.5 block">
                        Region
                      </label>
                      <select
                        value={form.region}
                        onChange={(e) => updateField('region', e.target.value)}
                        className="w-full bg-card border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary appearance-none"
                      >
                        {REGIONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted mb-1.5 block">
                        Language
                      </label>
                      <select
                        value={form.language}
                        onChange={(e) => updateField('language', e.target.value)}
                        className="w-full bg-card border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary appearance-none"
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Competitors */}
            {step === 3 && (
              <motion.div
                key={3}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease }}
              >
                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-muted mb-4">
                      Add between 1 and 6 competitors you want to track against.
                    </p>
                  </div>

                  {form.competitors.map((comp, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={comp.name}
                          onChange={(e) => updateCompetitor(i, 'name', e.target.value)}
                          placeholder="Competitor name"
                          className="w-full bg-card border border-border rounded-lg px-4 py-3 text-white placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                        <input
                          type="text"
                          value={comp.domain}
                          onChange={(e) => updateCompetitor(i, 'domain', e.target.value)}
                          placeholder="Domain (optional)"
                          className="w-full bg-card border border-border rounded-lg px-4 py-3 text-white placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      </div>
                      <motion.button
                        onClick={() => removeCompetitor(i)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-2 p-2 text-muted hover:text-danger transition-colors"
                        aria-label="Remove competitor"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </motion.button>
                    </div>
                  ))}

                  {form.competitors.length < 6 && (
                    <motion.button
                      onClick={addCompetitor}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><path d="M12 8v8" /><path d="M8 12h8" />
                      </svg>
                      Add competitor
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Models & Settings */}
            {step === 4 && (
              <motion.div
                key={4}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease }}
              >
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-muted mb-3 block">
                      AI Models to track
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {MODELS.map((model) => (
                        <motion.label
                          key={model}
                          whileHover={{ y: -3 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            form.models.includes(model)
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-card hover:border-muted'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={form.models.includes(model)}
                            onChange={() => toggleModel(model)}
                            className="w-4 h-4 rounded border-border bg-card text-primary focus-visible:ring-2 focus-visible:ring-primary"
                          />
                          <span className="text-sm text-white">{model}</span>
                        </motion.label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted mb-3 block">
                      Prompts per model
                    </label>
                    <div className="flex gap-3">
                      {PROMPT_COUNTS.map((count) => (
                        <motion.label
                          key={count}
                          whileHover={{ y: -3 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                            form.promptCount === count
                              ? 'border-primary bg-primary/5 text-white'
                              : 'border-border bg-card text-muted hover:text-white hover:border-muted'
                          }`}
                        >
                          <input
                            type="radio"
                            name="promptCount"
                            checked={form.promptCount === count}
                            onChange={() => updateField('promptCount', count)}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">{count}</span>
                        </motion.label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted mb-3 block">
                      Scan mode
                    </label>
                    <div className="flex gap-3">
                      {(['quick', 'deep'] as const).map((mode) => (
                        <motion.label
                          key={mode}
                          whileHover={{ y: -3 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                            form.scanMode === mode
                              ? 'border-primary bg-primary/5 text-white'
                              : 'border-border bg-card text-muted hover:text-white hover:border-muted'
                          }`}
                        >
                          <input
                            type="radio"
                            name="scanMode"
                            checked={form.scanMode === mode}
                            onChange={() => updateField('scanMode', mode)}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium capitalize">{mode} Scan</span>
                        </motion.label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <motion.button
              onClick={handleBack}
              disabled={step === 1}
              whileHover={step !== 1 ? { scale: 1.02 } : undefined}
              whileTap={step !== 1 ? { scale: 0.97 } : undefined}
              className="px-5 py-2.5 rounded-lg border border-border text-muted hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium"
            >
              Back
            </motion.button>

            <div className="text-xs text-muted">
              Step {step} of {totalSteps}
            </div>

            {step < totalSteps ? (
              <motion.button
                onClick={handleNext}
                disabled={!canProceed()}
                whileHover={canProceed() ? { scale: 1.02 } : undefined}
                whileTap={canProceed() ? { scale: 0.97 } : undefined}
                className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium"
              >
                Next
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                whileHover={canProceed() && !submitting ? { scale: 1.02 } : undefined}
                whileTap={canProceed() && !submitting ? { scale: 0.97 } : undefined}
                className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium inline-flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
