# Hermes → X-LONG trajectory handoff (proposal)

Status: contract-only; **no runtime adapter installed**. Parent initiative: AGENTROPOLIS-UTILITY-GRID draft PR #50.

Hermes may emit sanitized event references after an approved Mission/ATG execution envelope, via Ingest Membrane. Fields: event_id, parent_id, tenant_id, mission_id, agent_id, kind, artifact_ref, content_digest and optional token estimate. Event kind: mission_start / tool_call / spawn / compaction / retry / checkpoint / terminal / timeout. Never emit raw prompts, hidden reasoning, messages, API tokens, cookies, or full tool bodies.

Integration steps:
1. Identify actual Hermes event and sub-agent hooks; document provenance and permission boundaries.
2. Implement adapter behind disabled feature flag (default off).
3. Require event-level scope, consent/retention policy, masking and content digest verification at ingress.
4. Reconcile events from interruption / compaction without inventing missing parents.
5. Capture separate evaluator receipts from BE/VERITY and reject self-evaluation.
6. Send to Utility Grid X-LONG processor only after receipt and membrane gates.
7. Shadow-mode replay golden fixtures. Demand signed approval before live routing.

**No execution authority, no new CLI permission, no automatic training or promotion.**

Reference: AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-UTILITY-GRID#50.
