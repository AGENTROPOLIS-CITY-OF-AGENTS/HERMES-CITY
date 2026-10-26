# Governed Coordinator Profile (proposal)

Status: DESIGN / NOT LIVE. This document does not grant execution authority.

## Purpose
A single front door for Hermes requests: capture, triage, assign, track. Reuse existing Dispatch, Hermes PM, ATG, AEGIS and Audit services; do not build a competing orchestrator.

## Contract
Input: request_id, actor_identity, source, intent, sensitivity, evidence_refs, timestamp.
Output: task_id, owner, mandate_ref, policy_decision, status, receipt_refs, next_action.

## Flow
1. Intake: normalize text/voice/client requests; quarantine untrusted instructions.
2. Identity and mandate: authenticate actor, resolve explicit scope; deny by default.
3. Triage: deduplicate, classify risk and cost, decompose into bounded tasks.
4. Dispatch: select authorized specialist with least privilege and explicit tool grants.
5. Track: durable state transitions queued -> assigned -> running -> blocked/review -> completed/failed; bounded retries, idempotency keys, timeout and escalation.
6. Evidence: each handoff emits immutable receipt with task, agent, policy, timestamp, input/output hashes and outcome; audit independently.
7. Human gate: external publishing, payments, credential use, destructive changes and production promotion require separately verified approvals.

## Deployment boundaries
- Standalone Hermes: local-only profile with file-backed queue, no production authority by default.
- T.A.G. Trappin @ Grok: public generic template; no private AGENTROPOLIS code, credentials, prompts, topology or internal data.
- AGENTROPOLIS: adapter to existing governance corridor, behind AEGIS and ATG.

## Acceptance tests before activation
- Unauthorized requests denied; prompt injection cannot modify mandates.
- Duplicate intake yields one task; retries cannot repeat side effects.
- Offline specialist yields blocked state and escalation, not false success.
- Cross-tenant and public/private boundaries enforced.
- Every handoff has traceable receipt; missing receipt fails closed.
- Costs capped; approval cannot be self-issued by executing agent.
- Dry-run end-to-end verified; no production deploy without independent review.

## Rollout
Phase 0 design review -> Phase 1 mock queue -> Phase 2 authorized sandbox adapters -> Phase 3 assurance and release approval. No automatic merge or deploy.
