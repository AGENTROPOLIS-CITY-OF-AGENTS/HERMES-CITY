# HERMES CITY: NVIDIA MCP Integration

## Identity

HERMES CITY is the operator-facing city layer for AGENTROPOLIS.

This document captures how HERMES CITY connects to an MCP server that can route safe agent workflows into NVIDIA-backed local or cloud inference.

HERMES CITY is not the compute layer itself. It is the visual/operator surface where agents, missions, receipts, and system status become legible.

## Role Split

```text
HERMES CITY
  -> operator interface, rooms, mission status, notifications

AGENTROPOLIS MCP
  -> tool contract, permissions, context routing

NVIDIA Runtime
  -> NIM endpoints, local RTX inference, DGX Spark class execution, workflow profiling

Mission Control
  -> run visibility, receipts, human review, deployment state
```

## What HERMES CITY Should Display

HERMES CITY should surface the NVIDIA MCP lane as physical city structures, not flat panels.

Recommended structures:

- **NIM Relay Tower** — model routing and endpoint health
- **RTX Engine Room** — local GPU status and resource pressure
- **DGX Forge** — heavy local reasoning, fine-tuning, or batch execution lane
- **Hermes Dispatch Desk** — operator commands, briefs, notifications
- **Receipt Vault** — redacted execution receipts and audit trails
- **Workflow Observatory** — traces, bottlenecks, cost, latency, failures

## MCP Tools Consumed by HERMES CITY

Initial safe tools:

```text
hermes.notify
nim.chat
local.resource_check
agentiq.profile_workflow
```

Expansion tools:

```text
hermes.brief
hermes.status
nim.healthcheck
nim.embed
nim.rerank
local.list_agents
local.read_logs
agentiq.trace
agentiq.export_receipt
```

Blocked until policy-gated:

```text
local.run_agent
local.stop_agent
hermes.wrap_command
```

## Operator Flow

```text
User issues mission in HERMES CITY
  -> HERMES sends structured task to MCP
  -> MCP checks policy and allowed tools
  -> NVIDIA router selects local/cloud endpoint
  -> workflow runs
  -> Mission Control receives trace and receipt
  -> HERMES CITY displays result as city status
```

## Environment Variables

The UI should never expose these directly. They belong in the MCP/server runtime only.

```text
NVIDIA_API_KEY
NIM_BASE_URL
NIM_MODEL
HERMES_HOME
LOCAL_AGENT_HOME
MCP_SERVER_PORT
AGENTIQ_CONFIG_PATH
```

## Safety Rules

HERMES CITY must not:

- display raw secrets
- read `.env` values into the browser
- run raw shell commands from the UI
- execute destructive local actions without human approval
- present simulated execution as real execution
- bypass MCP policy checks

HERMES CITY should:

- show endpoint health without leaking credentials
- show receipts with secrets redacted
- separate proposed actions from completed actions
- require approval for persistent account changes
- fail closed when runtime identity is unclear

## UI Canon

Every interface element should map to a 3D city object.

Do not render NVIDIA status as a generic card. Render it as infrastructure:

```text
NIM Relay Tower
RTX Engine Room
DGX Forge
Receipt Vault
Workflow Observatory
```

## Example User Mission

"Hermes, check local NVIDIA resources, route this code audit through the NIM endpoint, profile the workflow, and return a redacted execution receipt. Do not run destructive commands."

## Captured MCP Skill Pack

Primary MCP skill spec location:

```text
wiredchaos/AGENTROPOLIS-AGENT-MCP/mcp-skills/mcp-hermes-nvidia.md
```

Related AGENTROPOLIS city capture:

```text
AGENTROPOLIS-CITY-OF-AGENTS/agentropolis/mcp-skills/skills/mcp-hermes-nvidia.md
```

## Status

Captured as HERMES CITY integration doc.

Implementation should begin with read-only status and chat tools before any local execution actions are exposed.
