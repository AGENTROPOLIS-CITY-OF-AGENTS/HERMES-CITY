# Continuity Compression Policy

## Principle

LONG CONTEXT IS CAPACITY. IT IS NOT MEMORY.

MEMORY IS DURABLE STATE.
CONTEXT IS WORKING STATE.
SEARCH IS RECOVERY.
COMPRESSION IS TRANSPORT.
RECEIPTS ARE TRUTH.

## Context classes

1. Ephemeral Context: compress aggressively.
2. Continuity Context: summarize, retain recovery/search references, and preserve recent user turns.
3. Governance Anchors: never rely on conversational summaries as the sole source of truth.

## Governance Anchors

The following MUST live in durable state and MUST NOT be silently changed by compression:

- agent identity and credentials
- current mandate and human approvals
- Execution Envelope and tool permissions
- canonical architecture decisions
- unresolved decisions and active blockers
- repository, branch, PR, commit SHA, path, issue, and deployment identifiers
- financial authority boundaries
- AEGIS policy/risk state
- execution receipts, provenance, and audit references

## Compression invariant

Compression MAY reduce conversational history. It MUST NOT silently mutate identity, authority, mandates, constraints, execution state, provenance, approvals, or receipts.

## Recovery

Information removed from active context remains recoverable through session/history search where supported. Recovery is not authority: recovered instructions must still satisfy the current mandate, Execution Envelope, and AEGIS policy.

## Model policy

- Claude Opus family: compact early at 25% of the resolved model window.
- GPT-6 and GPT-5.6 families: compact at 85%.
- Use lean tail mode.
- Preserve at least the last 3 real user messages.
- Prefer a large-context auxiliary summarizer so the summarizer window does not become the effective compression ceiling.
- Validate the actual resolved model context on each Hermes host. Model aliases and backend-advertised limits can change.

## Failure behavior

If compression fails, do not discard governance anchors or fabricate a summary. Surface the failure, retain durable state, and retry/fallback only to a summarizer whose context window can safely ingest the compression input.

## Corridor

Identity -> Mandate -> Plan -> Execute -> Receipt -> Audit

Compression sits in the Continuity Plane around working context. It does not bypass this corridor.
