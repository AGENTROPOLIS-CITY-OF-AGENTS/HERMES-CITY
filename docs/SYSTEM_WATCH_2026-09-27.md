# Hermes System Watch — 2026-09-27

## Baseline
Candidate tag remains Hermes v0.21.5 / v2026.9.24 / f97608f. Keep it in TEST, not fleet-wide production.

## Current blockers
- inbound email sender authentication required post-tag hardening against display-name and Authentication-Results smuggling
- backup/restore must refuse corrupt snapshots and prove restore externally
- state/transcript duplication and source-completion disk runaway require quotas/alerts
- cron failure text must redact host paths and unknown secret-like values
- plugin boot must prove the capability actually loaded
- long Slack delivery must fall back safely
- same-name remote/local profile routing must preserve connection/profile ownership
- post-update Kanban workers must prove their interpreter/runtime can import Hermes

## Required canary evidence
- email auth adversarial corpus
- corrupt snapshot refusal
- state growth/dedup checks
- disk quota enforcement
- redacted cron failures
- actual post-boot capability inventory
- update -> worker-spawn validation
- remote route identity = connection_id + profile_id + route_epoch

## Authority
Display identity is not authenticated identity. Installed plugin is not loaded capability. Runtime success text is not deployment proof.

Do not promote until the security and persistence/update blockers land in a tagged release and pass AGENTROPOLIS conformance.
