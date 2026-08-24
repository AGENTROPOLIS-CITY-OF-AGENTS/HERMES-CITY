/**
 * Agentropolis Civic Proof — Hermes Desktop overlay.
 * Local telemetry only. No model calls. No inferred authority.
 */

import {
  Badge,
  Button,
  cn,
  Codicon,
  ErrorState,
  host,
  PALETTE_AREA,
  ROUTES_AREA,
  SIDEBAR_NAV_AREA,
  Skeleton,
  STATUSBAR_AREAS,
  Tip,
  useQuery
} from '@hermes/plugin-sdk'
import { jsx, jsxs } from 'react/jsx-runtime'

// Reuse the bundled backend namespace. This plugin is a replacement overlay,
// not a companion that can be loaded beside another plugin with the same id.
const ID = 'hermes-achievements'
let rest

const clamp01 = value => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0))
const safeDiv = (a, b) => (b > 0 ? a / b : 0)

function normalizedEntropy(values) {
  const positive = values.map(value => Math.max(0, Number(value) || 0))
  const total = positive.reduce((sum, value) => sum + value, 0)
  const active = positive.filter(value => value > 0).length
  if (!total || active <= 1) return 0
  const entropy = positive.reduce((sum, value) => {
    if (!value) return sum
    const p = value / total
    return sum - p * Math.log2(p)
  }, 0)
  return clamp01(entropy / Math.log2(active))
}

function distribution(values) {
  const cleaned = values.map(value => Math.max(0, Number(value) || 0))
  const total = cleaned.reduce((sum, value) => sum + value, 0)
  return total ? cleaned.map(value => value / total) : cleaned.map(() => 0)
}

function kl(p, q) {
  return p.reduce((sum, value, index) => {
    if (!value) return sum
    return sum + value * Math.log2(value / (q[index] || Number.EPSILON))
  }, 0)
}

function jensenShannon(a, b) {
  const p = distribution(a)
  const q = distribution(b)
  const midpoint = p.map((value, index) => (value + q[index]) / 2)
  return clamp01((kl(p, midpoint) + kl(q, midpoint)) / 2)
}

function toolVector(source = {}) {
  return [
    source.terminal_calls ?? source.total_terminal_calls,
    source.file_tool_calls ?? ((source.total_patch_calls || 0) + (source.total_file_reads_searches || 0)),
    source.web_calls ?? source.total_web_calls,
    source.delegate_calls ?? source.total_delegate_calls,
    source.process_calls ?? source.total_process_calls,
    source.cron_calls ?? source.total_cron_calls
  ].map(value => Number(value) || 0)
}

function splitSessions(sessions = []) {
  const ordered = [...sessions].sort(
    (a, b) => Number(a.last_active || a.started_at || 0) - Number(b.last_active || b.started_at || 0)
  )
  if (ordered.length < 4) return { baseline: ordered, recent: ordered }
  const cut = Math.max(1, Math.floor(ordered.length * 0.75))
  return { baseline: ordered.slice(0, cut), recent: ordered.slice(cut) }
}

function sumVectors(sessions) {
  return sessions.reduce(
    (acc, session) => toolVector(session).map((value, index) => value + acc[index]),
    [0, 0, 0, 0, 0, 0]
  )
}

function deriveProof(data) {
  const aggregate = data.aggregate || {}
  const sessions = data.sessions || []
  const totalTools = Number(aggregate.total_tool_calls || 0)
  const errors = Number(aggregate.total_errors || 0)
  const sessionCount = Number(aggregate.session_count || sessions.length || 0)
  const hasTelemetry = totalTools > 0 || sessionCount > 0
  const usefulSignals = [
    aggregate.total_patch_calls,
    aggregate.total_file_reads_searches,
    aggregate.total_web_extract_calls,
    aggregate.test_events,
    aggregate.release_events,
    aggregate.git_events,
    aggregate.memory_write_events
  ].reduce((sum, value) => sum + (Number(value) || 0), 0)

  const { baseline, recent } = splitSessions(sessions)
  const entropy = normalizedEntropy(toolVector(aggregate))
  const drift = baseline.length && recent.length
    ? jensenShannon(sumVectors(baseline), sumVectors(recent))
    : 0
  const errorDensity = safeDiv(errors, totalTools)
  const usefulWork = clamp01(safeDiv(usefulSignals, totalTools))
  const activity = clamp01(safeDiv(data.unlocked_count || 0, data.total_count || 0))
  const heat = clamp01(errorDensity * 4 + drift * 0.8)
  const health = hasTelemetry
    ? clamp01((usefulWork * 0.45) + ((1 - heat) * 0.35) + (entropy * 0.20))
    : null

  return {
    activity,
    entropy,
    drift,
    errorDensity,
    usefulWork,
    health,
    hasTelemetry,
    totalTools,
    errors,
    sessionCount
  }
}

function pct(value) {
  return Number.isFinite(value) ? `${Math.round(clamp01(value) * 100)}%` : 'N/A'
}

function metricTone(value, invert = false) {
  if (!Number.isFinite(value)) return 'text-(--ui-text-tertiary)'
  const score = invert ? 1 - clamp01(value) : clamp01(value)
  if (score >= 0.72) return 'text-(--ui-accent)'
  if (score >= 0.42) return 'text-(--ui-text-primary)'
  return 'text-(--ui-text-tertiary)'
}

function MetricCard({ label, value, detail, invert = false }) {
  return jsxs('div', {
    className: 'rounded-lg border border-(--ui-stroke-secondary) bg-(--ui-bg-secondary) p-4',
    children: [
      jsxs('div', {
        className: 'flex items-center justify-between gap-2',
        children: [
          jsx('span', { className: 'text-xs font-medium uppercase tracking-wide text-(--ui-text-tertiary)', children: label }),
          jsx(Badge, { variant: 'outline', className: 'text-[0.625rem]', children: 'proxy' })
        ]
      }),
      jsx('div', {
        className: cn('mt-2 text-2xl font-semibold tabular-nums', metricTone(value, invert)),
        children: pct(value)
      }),
      jsx('p', { className: 'mt-2 text-xs leading-relaxed text-(--ui-text-tertiary)', children: detail })
    ]
  })
}

function EvidenceCard({ title, state, detail, icon }) {
  return jsxs('div', {
    className: 'rounded-lg border border-(--ui-stroke-secondary) bg-(--ui-bg-secondary) p-4',
    children: [
      jsxs('div', {
        className: 'flex items-center gap-2',
        children: [
          jsx(Codicon, { name: icon, className: 'text-(--ui-text-tertiary)' }),
          jsx('span', { className: 'text-sm font-medium', children: title }),
          jsx(Badge, { variant: 'outline', className: 'ml-auto text-[0.625rem]', children: state })
        ]
      }),
      jsx('p', { className: 'mt-2 text-xs leading-relaxed text-(--ui-text-tertiary)', children: detail })
    ]
  })
}

function CivicProofPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['hermes-achievements', 'civic-proof'],
    queryFn: () => rest('/achievements'),
    refetchInterval: 120_000
  })

  if (isLoading) {
    return jsx('div', {
      className: 'grid h-full grid-cols-1 gap-4 overflow-y-auto p-6 sm:grid-cols-2 lg:grid-cols-3',
      children: Array.from({ length: 9 }, (_, index) => jsx(Skeleton, { key: index, className: 'h-36 rounded-lg' }))
    })
  }

  if (isError || !data) {
    return jsx(ErrorState, {
      title: 'Civic Proof unavailable',
      description: `${error?.message ?? 'Unknown error'} — enable the bundled hermes-achievements backend plugin.`,
      children: jsx(Button, { variant: 'secondary', onClick: () => refetch(), children: 'Retry' })
    })
  }

  const proof = deriveProof(data)
  const telemetryDetail = proof.hasTelemetry
    ? 'thermodynamic health proxy'
    : 'insufficient telemetry — no score issued'

  return jsxs('div', {
    className: 'h-full overflow-y-auto',
    children: [
      jsxs('header', {
        className: 'border-b border-(--ui-stroke-secondary) px-6 py-5',
        children: [
          jsxs('div', {
            className: 'flex flex-wrap items-start justify-between gap-4',
            children: [
              jsxs('div', {
                children: [
                  jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      jsx(Codicon, { name: 'shield', className: 'text-(--ui-accent)' }),
                      jsx('h1', { className: 'text-xl font-semibold', children: 'AGENTROPOLIS CIVIC PROOF' })
                    ]
                  }),
                  jsx('p', {
                    className: 'mt-1 max-w-3xl text-sm text-(--ui-text-tertiary)',
                    children: 'Local activity telemetry, thermodynamic proxies, and evidence gaps. This surface never grants authority.'
                  })
                ]
              }),
              jsxs('div', {
                className: 'text-right',
                children: [
                  jsx('div', {
                    className: cn('text-3xl font-semibold tabular-nums', metricTone(proof.health)),
                    children: pct(proof.health)
                  }),
                  jsx('div', { className: 'text-xs text-(--ui-text-tertiary)', children: telemetryDetail })
                ]
              })
            ]
          }),
          jsxs('div', {
            className: 'mt-4 flex flex-wrap gap-2 text-xs text-(--ui-text-tertiary)',
            children: [
              jsx(Badge, { variant: 'outline', children: `${proof.sessionCount} sessions` }),
              jsx(Badge, { variant: 'outline', children: `${proof.totalTools} tool calls` }),
              jsx(Badge, { variant: 'outline', children: `${proof.errors} error signals` }),
              jsx(Badge, { variant: 'warn', children: 'AUTHORITY: NOT GRANTED' })
            ]
          })
        ]
      }),
      jsxs('main', {
        className: 'space-y-6 p-6',
        children: [
          jsxs('section', {
            children: [
              jsx('h2', { className: 'mb-3 text-sm font-semibold', children: 'Thermodynamics' }),
              jsxs('div', {
                className: 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4',
                children: [
                  jsx(MetricCard, { label: 'Tool entropy', value: proof.hasTelemetry ? proof.entropy : null, detail: 'Distributional diversity across terminal, files, web, delegation, processes, and cron.' }),
                  jsx(MetricCard, { label: 'Drift', value: proof.hasTelemetry ? proof.drift : null, invert: true, detail: 'Jensen-Shannon divergence between recent and baseline tool-use distributions. Lower is steadier.' }),
                  jsx(MetricCard, { label: 'Error density', value: proof.hasTelemetry ? Math.min(1, proof.errorDensity * 4) : null, invert: true, detail: `${proof.errorDensity.toFixed(3)} errors per tool call. Lower is generally healthier, but context still matters.` }),
                  jsx(MetricCard, { label: 'Useful work', value: proof.hasTelemetry ? proof.usefulWork : null, detail: 'Bounded ratio of edits, reads, extracts, tests, releases, git, and memory-write signals to tool calls.' })
                ]
              })
            ]
          }),
          jsxs('section', {
            children: [
              jsx('h2', { className: 'mb-3 text-sm font-semibold', children: 'Civic separation of powers' }),
              jsxs('div', {
                className: 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4',
                children: [
                  jsx(EvidenceCard, { title: 'Achievements', state: `${data.unlocked_count}/${data.total_count}`, icon: 'milestone', detail: `Activity and exploration only. Completion ratio: ${pct(proof.activity)}.` }),
                  jsx(EvidenceCard, { title: 'Receipts', state: 'NOT CONNECTED', icon: 'verified', detail: 'No signed or verified receipt source is present in the achievements payload. Coverage is unknown, not zero.' }),
                  jsx(EvidenceCard, { title: 'Reputation', state: 'NOT CONNECTED', icon: 'account', detail: 'Reviewed task outcomes are required before reliability or quality can be scored.' }),
                  jsx(EvidenceCard, { title: 'Authority', state: 'DENIED BY DEFAULT', icon: 'lock', detail: 'Permissions require an explicit mandate and policy-gate decision. Scores cannot promote an agent.' })
                ]
              })
            ]
          }),
          jsxs('section', {
            className: 'rounded-lg border border-(--ui-stroke-strong) bg-(--ui-bg-tertiary) p-5',
            children: [
              jsx('h2', { className: 'text-sm font-semibold', children: 'Required handoff' }),
              jsx('p', {
                className: 'mt-2 text-sm leading-relaxed text-(--ui-text-tertiary)',
                children: 'Connect Agentropolis proof receipts and reviewed outcomes. Route any permission increase through AEGIS Policy Gate and Human Mission Control. High drift or error pressure should trigger review, not punishment or automatic shutdown.'
              })
            ]
          })
        ]
      })
    ]
  })
}

function ProofChip() {
  const { data } = useQuery({
    queryKey: ['hermes-achievements', 'civic-proof-chip'],
    queryFn: () => rest('/achievements'),
    refetchInterval: 120_000
  })
  if (!data) return null
  const proof = deriveProof(data)
  const label = proof.hasTelemetry
    ? `Civic Proof health proxy: ${pct(proof.health)}`
    : 'Civic Proof health proxy unavailable: insufficient telemetry'
  return jsx(Tip, {
    label,
    children: jsx('button', {
      className: 'inline-flex h-full items-center gap-1 px-1.5 text-[0.6875rem] tabular-nums text-(--ui-text-tertiary) hover:bg-(--chrome-action-hover)',
      type: 'button',
      onClick: () => host.navigate('/civic-proof'),
      children: jsxs('span', {
        children: [jsx(Codicon, { name: 'shield', size: '0.7rem' }), ` ${pct(proof.health)}`]
      })
    })
  })
}

export default {
  id: ID,
  name: 'Agentropolis Civic Proof',
  description: 'Achievements, thermodynamic telemetry proxies, evidence gaps, and authority separation for Hermes Desktop.',
  defaultEnabled: true,
  register(ctx) {
    rest = ctx.rest
    ctx.registerMany([
      {
        id: 'civic-proof-page',
        area: ROUTES_AREA,
        data: { path: '/civic-proof' },
        title: 'Civic Proof',
        render: () => jsx(CivicProofPage, {})
      },
      {
        id: 'civic-proof-nav',
        area: SIDEBAR_NAV_AREA,
        order: 56,
        data: { path: '/civic-proof', label: 'Civic Proof', codicon: 'shield' }
      },
      {
        id: 'civic-proof-chip',
        area: STATUSBAR_AREAS.right,
        order: 91,
        render: () => jsx(ProofChip, {})
      },
      {
        id: 'civic-proof-open',
        area: PALETTE_AREA,
        data: {
          id: 'agentropolis.civic-proof.open',
          label: 'Agentropolis: Open Civic Proof',
          keywords: ['agentropolis', 'proof', 'thermodynamics', 'drift', 'entropy', 'receipts'],
          run: () => host.navigate('/civic-proof')
        }
      }
    ])
  }
}
