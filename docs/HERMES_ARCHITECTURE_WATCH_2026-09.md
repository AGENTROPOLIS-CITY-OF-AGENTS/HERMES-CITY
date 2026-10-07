# Hermes Architecture Watch — Consolidated September 2026

Status: canonical integration notes through 2026-09-11
Baseline: Hermes Agent v0.21.1 / v2026.9.7

## Core boundary
Hermes is a first-class AGENTROPOLIS runtime substrate, not the governance authority.

Canonical corridor: `Identity -> Mandate -> Plan -> Execute -> Receipt -> Audit`

Never collapse these distinctions:
- runtime address != identity != authority
- execution success != delivery success
- session history != skill learning != global memory != audit evidence
- provider/model route != authorization
- UI/profile label != canonical runtime identity
- Hermes approval UI != AGENTROPOLIS authority

## Runtime adapter contract
Every Hermes-backed citizen should expose citizen_id, display_name, runtime_profile, runtime_address, runtime_instance_id/runtime_lease, affinity_scope, auth_context, requested_route/effective_route/transition_reason, runtime_route_snapshot, capability_epoch, toolset_fingerprint, and profile_scope_integrity.

A capability refresh, model/provider transition, plugin revision change, or explicit reload creates a new runtime/capability epoch and receipt.

## Dispatch and peer/A2A
Hermes peer/Bot messaging is transport, never authority. Normalize inbound requests into a Dispatch Envelope and re-resolve policy locally.

Requirements: immutable origin envelope; citizen -> authorized runtime target resolution; peer credential origin binding (`peer_id + scheme + host + port`); no ambient/global credential fallback; authority fencing for leadership transfer (`authority_lease_id`, monotonic `fence_token`).

## Cron / routines
Routine Receipt v2 separates execution from delivery. Minimum fields: occurrence_id = job_id + scheduled_at, execution_id, job_id, execution_status, delivery_status, delivery_attempt, correlation_id, receipt_ref, delivery_provenance (origin|home|broadcast), continuation_session_ref.

Rules: duplicate dispatch must not repeat a committed consequential side effect; claim != execution; silenced notification never silences receipt/audit; runtime deployment preflight must verify scheduled-agent readiness before placement; treat Hermes operational SQLite state as runtime-owned/opaque.

## Subagents
Use Hermes delegation_id for parent/child provenance where available. Add delegation_settlement (joined|background), completion unit/group identity, child outcomes, aggregation_complete. Delegated identity/context may propagate; authority must attenuate on every hop.

## MCP / plugins / skills
Track package_id, component_type (agent|desktop), scope (profile/citizen|app), origin, revision_sha, exact revision attestation, and capability epoch. Do not duplicate Hermes plugin updater, checkout manager, MCP polling, kernel freshness manager, or provider-specific sticky-session logic.

## Collective Wisdom
Hermes Collective Wisdom V1 is an integration candidate beneath the AGENTROPOLIS Skill Registry, not a replacement for Grid-level COLLECTIVE, BUZZ, or AEGIS.

Flow: `Agent activity -> Hermes Wisdom -> candidate skill -> Skill Registry -> assurance gate -> AEGIS/risk -> approved distribution -> receipt/audit`.

Start with one low-risk, read-only candidate-skill adapter. Publication/install remain governed.

## Memory authority
Add `execution_mode: attended | unattended` and enforce operation-level grants, not just tool-level grants. Example memory capability: read; add; replace -> approval; remove -> approval. Unattended automation must not silently delete/replace durable standing rules.

## Browser
Hermes owns browser/CDP/Playwright mechanics. AGENTROPOLIS inserts an AEGIS prompt-ingress boundary for DOM/annotation content, redacts secrets before agent context, and keeps consequential writes behind mandate + approval + receipt.

## Artifact provenance
Receipt artifact_id, origin_session_id, origin_profile, origin_runtime, origin_path/resolved_path where safe, artifact_hash, size, classification, egress_policy, delivery_ref. Credentials, runtime DBs, cookies, and audit-only stores are non-exportable by default.

## Profile isolation
Multiplexing is not assumed to be a hard security boundary. Equivalent low-risk profiles may multiplex; different secrets, filesystem grants, container/volume boundaries, fiscal authority, or high-risk capabilities require stronger runtime/process isolation until conformance tests prove otherwise.

## Deployment/update receipts
A successful chat/update message is insufficient proof. Require code_applied, runtime_restart_observed, fleet_generation_verified, receipt_finalized. Prefer pinned tagged bases for production; canary post-tag fixes before promotion.

## Do not duplicate Hermes mechanics
Do not rebuild peer/A2A transport/name resolution, cron scheduler/retry/handoff queues, subagent heartbeat/concurrency/transport pooling, provider discovery/fallback/quarantine, browser control, artifact transfer/path translation, SQLite lifecycle/locking, plugin updater/revision checkout, or transcript/session resume mechanics.

AGENTROPOLIS differentiates on identity, mandate, policy, risk, dispatch authority, placement, capability attenuation, receipts, audit, topology, and portability.