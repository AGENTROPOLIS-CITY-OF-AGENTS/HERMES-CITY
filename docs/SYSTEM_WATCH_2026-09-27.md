# Hermes System Watch — updated 2026-10-06

## Public-safe baseline
Upstream: NousResearch/hermes-agent
Stable release: v2026.9.24
Package version: v0.21.5
Commit: f97608f178d
Status: TEST only.

The stable release remains the reproducible candidate. Post-release hardening on upstream main is tracked as canary evidence and must not be treated as a fleet baseline until it appears in a tagged release.

## Promotion blockers
Every blocker below must be closed and represented by evidence before promotion:
- inbound identity/authentication hardening
- backup/restore integrity and externally verified recovery
- state/transcript growth controls and disk safety
- failure-message redaction
- proof that installed plugins/capabilities actually loaded
- safe fallback for long Slack delivery
- remote/local profile ownership and route-freshness validation
- post-update worker/runtime generation compatibility
- managed-root confinement across preview/review surfaces
- live revocation checks for interactive component authority

Security-sensitive exploit mechanics and private routing formulas belong in the private advisory/implementation channel, not this public watch.

## Required canary evidence
- public-safe ingress authentication adversarial suite
- corrupt snapshot refusal and verified restore
- state growth/dedup and disk quota checks
- redacted cron/runtime failures
- post-boot capability inventory
- update -> worker-spawn validation
- long-message delivery fallback
- remote/local ownership and route-freshness validation
- managed-root confinement regression
- live authorization revocation without restart

## Authority
Presentation identity is not authenticated identity.
Installed capability is not loaded capability.
Loaded capability is not authorized effect.
PID is not process identity.
Runtime success text is not deployment proof.

## Promotion rule
Do not promote Hermes fleet-wide until every listed blocker is closed in a tagged upstream release and the corresponding AGENTROPOLIS canary evidence passes.
