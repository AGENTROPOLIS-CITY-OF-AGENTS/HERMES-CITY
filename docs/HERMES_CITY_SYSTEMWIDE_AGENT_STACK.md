# HERMES City Systemwide Agent Stack

Updated: 2026-07-05

HERMES is the operator layer for Agentropolis. HERMES City runs orchestration, dispatch, command surfaces, and operator workflows. It does not replace Agentropolis, the city OS.

## Canon Roles

```text
AGENTROPOLIS = city
OPEN WORK LABS = research lab
HERMES = operator
AGENTROPOLIS-AGENT-MCP = permission gate
54T = governance shield
OpenClaude = builder and audit assistant, operator-optional
Gitlawb = proof-of-work experiment
```

## HERMES-Owned Placement

| Resource | HERMES City role | Use |
| --- | --- | --- |
| `builderz-labs/mission-control` | Mission Operations Center | Agent operations cockpit, telemetry, task dispatch, recurring jobs, fleet health, and cost visibility. |
| `0xNyk/awesome-hermes-agent` | HERMES Atlas | Reference shelf for skills, integrations, workflows, memory, UIs, and agent patterns. |
| `0xNyk/xint` | Signal Scanner | Public social signal review, narrative detection, launch feedback, and CLEAR/BWB sourcing. |
| `builderz-labs/marketing-dashboard` | Growth Command Center | CRM, outreach, content operations, campaign tracking, analytics, and revenue visibility. |
| `0xNyk/awesome-agent-cortex` | Cortex Reference Shelf | Memory, identity, ownership, knowledge graph, wallet, MCP, and observability references. |
| `0xNyk/council-of-high-intelligence` | Council Review Lane | HERMES may route major decisions into 54T governance review before execution. |

## Operator Flow

```text
Operator intent
  -> HERMES Dispatch
  -> Mission Operations Center
  -> Signal / Growth / Atlas / Cortex lanes
  -> AGENTROPOLIS-AGENT-MCP permission gate
  -> 54T governance shield when material risk exists
  -> Agentropolis registry / audit receipt
```

## Boundaries

- HERMES operates; Agentropolis defines city law.
- HERMES may evaluate external resources, but canon changes flow back to `AGENTROPOLIS-CITY-OF-AGENTS/agentropolis`.
- HERMES may call OpenClaude as an optional builder/audit assistant.
- HERMES may publish proof receipts to Gitlawb only as an experiment, never as final governance authority.
