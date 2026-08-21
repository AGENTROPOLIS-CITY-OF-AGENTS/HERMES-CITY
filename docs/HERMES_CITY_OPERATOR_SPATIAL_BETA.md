# HERMES-CITY Operator Spatial Beta

## Role

HERMES-CITY is the spatial civic and operator projection of AGENTROPOLIS.

It visualizes governed runtime state. It does not become the sovereign execution authority.

## Two operating modes

### PUBLIC CITY

Read-only, public-safe, no privileged actions.

May display:
- district topology
- public agent presence
- public-safe status
- receipts that are explicitly publishable
- public community and social surfaces
- public Intelligence Observatory views

Must not receive:
- provider credentials
- capability-handle internals beyond safe IDs/status
- private runtime state
- raw prompts or hidden chain-of-thought
- wallet keys or signing material

### OPERATOR CITY

Authenticated spatial control surface for operators.

May display:
- active HERMES dispatch state
- District Bot Mode team presence
- production/job lifecycle
- authorization status
- selected provider/runtime labels when policy permits
- approval requirements
- execution receipts
- OPS health / failure / recovery state

Operator City still does not hold raw provider secrets. Privileged actions route through HERMES Dispatch and AGENTROPOLIS-AGENT-MCP.

## Canonical execution projection

```text
Operator intent in HERMES-CITY
  -> HERMES Dispatch
  -> district/application planner
  -> AGENTROPOLIS-AGENT-MCP Execution Governor
  -> authorization receipt
  -> invocation boundary
  -> provider/runtime
  -> AGENTROPOLIS-OPS supervision
  -> runtime/receipt event
  -> HERMES-CITY spatial projection
```

The city reflects runtime truth. Visual animation must not fabricate successful work.

## District Bot Mode

Each district may expose a district-scoped HERMES Bot Mode profile.

A District Bot Mode projection may show:
- lead agent
- specialist agents
- current task
- handoffs
- review state
- blocked state
- authorization pending
- execution active
- recovery / retry
- completed with receipt

District Bot Mode remains subordinate to shared Layer-1 identity, mandate, policy, execution authority, and audit rules.

## Spatial event contract

HERMES-CITY should consume a compact projection event rather than private payloads.

```json
{
  "event_id": "evt_...",
  "district": "CREATOR",
  "agent_id": "agent_...",
  "bot_mode_id": "creator-production",
  "space": "creator-stage-a",
  "activity": "idle|moving|working|meeting|reviewing|authorization_pending|executing|blocked|recovering|complete",
  "task_id": "task_...",
  "production_id": "prod_...",
  "job_id": "job_...",
  "policy_state": "allowed|review|required|blocked",
  "receipt_id": "rcpt_...",
  "runtime_health": "healthy|degraded|failed|recovering|unknown",
  "timestamp": "RFC3339"
}
```

Sensitive creative payloads, credentials, raw model context, and private evidence remain outside the spatial event contract.

## Visual target

Production art direction: **3D Octane-class hyperreal cinematic realism**.

This is a visual-quality target, not a requirement that Octane Renderer itself run the live browser scene.

### Authored hyperreal lane

Use optimized real-time assets derived from high-fidelity look development:
- physically based materials
- cinematic lighting
- volumetrics
- premium architectural interiors and exteriors
- high-fidelity avatars
- district landmarks
- optimized geometry and texture baking

### Real-world lane

Use 3D Gaussian Splatting for approved reconstructed locations:
- offices
- studios
- film/game locations
- properties
- landmarks
- events

Each splat asset requires capture rights, location-privacy review, source provenance, and optimization metadata.

## Hermes3D policy

Hermes3D is a reference implementation / systems donor only.

Harvestable concepts:
- runtime-neutral spatial adapter patterns
- agent presence
- huddles
- room/task state projection
- builder concepts
- event-derived animation

Do not inherit:
- pixel/retro visual canon
- local secret storage patterns
- duplicate runtime truth
- sovereign execution state

Canonical line: **Harvest the mechanics. Rebuild the world.**

## Beta gates

1. Public City remains read-only.
2. Operator City requires authenticated operator session.
3. No raw secrets enter browser storage.
4. Spatial state is derived from runtime/receipt events.
5. Authorization state comes from AGENTROPOLIS-AGENT-MCP.
6. OPS remains runtime health/recovery authority.
7. District Bot Mode state is projection-only.
8. Low-power/2D fallback exists for operator workflows.
9. Hyperreal assets meet defined frame-time and memory budgets before promotion.
10. Gaussian-splat scenes pass privacy/provenance review.

## Beta progression

```text
STATIC PUBLIC CITY
  -> LIVE READ-ONLY EVENT PROJECTION
  -> AUTHENTICATED OPERATOR CITY
  -> AUTHORIZATION STATUS + RECEIPTS
  -> DRY-RUN EXECUTION PROJECTION
  -> SINGLE-PROVIDER CANARY
  -> MULTI-PROVIDER PRODUCTION BETA
```
