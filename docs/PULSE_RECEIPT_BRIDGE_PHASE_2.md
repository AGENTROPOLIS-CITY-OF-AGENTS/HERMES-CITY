# Pulse Receipt Bridge Phase 2 Contract

## Purpose

Phase 2 adds a governed contract layer that correlates observed development pulse with bounded HERMES execution, validation evidence, human approval, and receipt creation.

This layer is public-safe and does not expose private Agentropolis runtime or governance internals.

## Architectural Roles

- Git City Pulse: visible activity signal source for workspace presence only.
- HERMES Runtime: bounded task execution emitter for start and completion events.
- Validation Engine: emits evidence-oriented validation lifecycle events.
- Mission Control: sole authority plane for approval decisions.
- Receipt Bridge: correlation and permanence layer that links task, evidence, approval, and receipt.
- HERMES CITY UI: projection layer that displays governed operating status.

## Event-Source Boundaries

- Pulse-originated events can only claim activity observation.
- HERMES-originated events can claim task lifecycle progression.
- Validation-originated events can claim validation status and evidence references.
- Mission Control-originated events can claim approval authority decisions.
- Receipt-originated events can claim receipt persistence and correlation links.

No source may claim another source's authority.

## Correlation Model

- task_id is represented as correlation_id across task, validation, approval, and receipt events.
- receipt.created links to the same correlation_id and may include receipt_id and receipt_path.
- State derivation ignores uncorrelated events for receipt verification.
- If multiple event chains exist, each chain is derived independently by correlation_id.
- Evidence is partitioned by workspace_id and correlation_id.
- The resolver preserves accepted evidence events for later guard evaluation.

## Authority Boundary

- Mission Control is the only authority for approval.approved and approval.rejected.
- HERMES cannot self-approve.
- Pulse events do not grant authority or imply approval.

## Public/Private Data Boundary

Public-safe allowed:
- event metadata
- non-sensitive evidence references
- artifact paths, commit hashes, receipt IDs

Prohibited:
- credentials, API keys, secret storage values
- personal identifiers
- private Agentropolis runtime data
- proprietary internal routing and prompt content

## State Derivation Rules

State set:
- IDLE
- ACTIVE
- EXECUTING
- VALIDATING
- AWAITING_APPROVAL
- RECEIPT_VERIFIED
- FAILED

Rules:
- Pulse may transition IDLE to ACTIVE only.
- HERMES task_started transitions to EXECUTING.
- hermes.task_completed with completion_status=success records bounded execution evidence while remaining in EXECUTING.
- Successful completion does not itself initiate or pass validation.
- State remains EXECUTING until validation.started is received.
- validation.started transitions EXECUTING to VALIDATING only when prior evidence contains hermes.task_completed with completion_status=success under the same correlation_id.
- validation.passed transitions to AWAITING_APPROVAL.
- approval.approved from mission_control is recorded in AWAITING_APPROVAL and does not verify alone.
- RECEIPT_VERIFIED requires all of:
  - hermes.task_completed with completion_status=success
  - validation.passed
  - approval.approved from mission_control
  - receipt.created
  - all four events share one correlation_id
- FAILED may be entered by:
  - hermes.task_completed with completion_status=failed
  - hermes.task_completed with completion_status=partial
  - hermes.task_completed with completion_status=aborted
  - validation.failed
  - approval.rejected

## Freshness And Expiry Behavior

- ACTIVE is freshness-bound to a configurable window (activity_freshness_window_ms).
- If no newer pulse.activity_observed arrives within the window, transition ACTIVE to IDLE.
- Expiry is heartbeat-based and must not alter historical evidence records.

## Failure And Rollback Behavior

Failure handling:
- invalid schema event: reject and log contract violation
- missing required evidence: block upward transition
- authority mismatch: reject approval transition
- partial or aborted completion: deterministic transition to FAILED

Rollback behavior:
- Disable Phase 2 bridge processing flag.
- Fall back to static Pulse presence messaging.
- Preserve already-written receipts and audit logs.

## Smallest Runtime Implementation Slice

- Load and validate events against config/pulse-receipt-event-schema.json.
- Derive status using config/pulse-governed-state-machine.json.
- Support only local replayed event input.
- Render governed status and truth-boundary text.
- Do not depend on unverified external Git City APIs.

Validation note:
- JSON parsing confirms syntax only and is not semantic schema validation.
- Semantic schema validation must use a JSON Schema validator against representative events.

## Truth Boundary

Pulse proves observed workspace activity only. Pulse does not independently prove actor identity, task success, validation success, deployment, approval, or production readiness.
