# Hermes Host Capability and Connector Control — 2026-09-22

## Host capability admission
A skill being installed does not mean the host can execute it.

Canonical admission path:
Skill exists -> Skill trusted -> Host prerequisites satisfied -> Required app live -> Capability admitted -> AEGIS authorizes effect -> Execute -> Receipt

Track:
- requires_apps
- min_app_version
- host_capability_state
- availability_evidence
- last_probe_at
- protocol_generation

Unknown or missing prerequisites fail closed.

## Application-backed MCP
Application-backed MCP endpoints are runtime facts, not identity or authority.

Track:
- declared_app
- host_os
- app_version
- liveness_kind
- endpoint_epoch
- host_gate_verdict

App restart or token/endpoint rotation may change liveness state without changing citizen identity or mandate.

## Connector control plane
Connector account ownership, runtime profile, chat session, citizen identity, and authority are separate concepts.

Receipt fields:
- owner_type
- profile_id
- account_id_ref
- connector
- policy_revision
- operation_id
- aegis_verdict

Hermes may own connector lifecycle UX. AEGIS remains final authority for consequential effects.

## Route identity
Remote continuity identity must include:
connection_id + profile_id + route_epoch

A similarly named local profile must never substitute for a remote-owned route.
