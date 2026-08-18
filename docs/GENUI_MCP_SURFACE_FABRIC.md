# AGENTROPOLIS GenUI + MCP Surface Fabric

## Status
Production architecture draft for HERMES-CITY beta integration.

## Purpose
Unify HERMES skills, MCP capabilities, GenUI manifests, HERMES Workspace, Desktop HUD, TUI, and Skinscape under one portable interaction fabric.

## Canonical flow

HERMES Agent Core -> ATG/Atralith intent -> AGENTROPOLIS Agent MCP -> capability result -> GenUI manifest -> surface renderer -> user action -> BE state/action endpoint -> 54-T policy and receipt.

## Layer responsibilities

### HERMES Agent Core
Plans, reasons, selects tools/skills, and requests interface output.

### ATG / Atralith
Carries agent intent and semantic UI instructions. ATG is the AGENTROPOLIS agentic language, not a traffic-control layer.

### AGENTROPOLIS Agent MCP
Provides governed capability and tool access. MCP returns normalized semantic results and action handles, not arbitrary untrusted UI code.

### GenUI Fabric
Transforms normalized results into portable semantic UI manifests: cards, charts, tables, controls, forms, timelines, status panels, queues, and action groups.

### Surface adapters
The same manifest may render across:
- HERMES Desktop HUD
- HERMES Workspace
- HERMES TUI
- mobile/compact surfaces
- AGENTROPOLIS 3D consoles and kiosks

### HERMES Skinscape
Applies identity, terminal/TUI theme, branded ASCII assets, profile skinning, and presentation treatment without changing capability semantics.

### BE
Owns normalized data/state APIs, action endpoints, subscriptions, and server-side session state.

### 54-T
Applies containment, effective-capability verification, action scoping, egress controls, quarantine, dual-control rules for high-impact actions, and immutable receipts.

## Root doctrine

1. MCP supplies capability.
2. GenUI supplies interaction semantics.
3. Workspace/HUD/TUI/3D surfaces supply presentation environments.
4. Skinscape supplies identity and visual treatment.
5. BE supplies state and governed action endpoints.
6. 54-T supplies enforcement and receipts.
7. ATG/Atralith expresses intent and semantic contracts.

## Security rules

- Default deny executable HTML/JS returned directly by arbitrary MCP servers.
- Prefer allowlisted semantic component types over arbitrary code execution.
- Every actionable control must include a capability handle and policy scope.
- Destructive or high-impact controls require 54-T preflight and, where configured, dual control.
- Raw credentials never enter manifests or model context.
- External content is untrusted until processed by the Ingest Membrane and security checks.
- Every state-changing action produces an immutable action receipt.

## Minimal GenUI manifest contract

```json
{
  "schema": "agentropolis.genui/v1",
  "surface_hint": "auto",
  "title": "BTC/USD",
  "components": [
    {
      "type": "metric",
      "id": "btc-price",
      "label": "BTC/USD",
      "value": 64320,
      "unit": "USD"
    },
    {
      "type": "sparkline",
      "id": "btc-24h",
      "series_ref": "market://btc-usd/24h"
    },
    {
      "type": "action_group",
      "actions": [
        {
          "id": "analyze",
          "label": "Analyze",
          "capability_handle": "cap://market/analyze"
        },
        {
          "id": "create-watch",
          "label": "Create Watch",
          "capability_handle": "cap://market/watch/create"
        }
      ]
    }
  ],
  "provenance": {
    "required": true
  },
  "receipt_policy": "on_action"
}
```

## Surface behavior

### Desktop HUD
Compact, context-aware, floating, low-interruption rendering.

### Workspace
Expanded interactive panels with history, secondary analysis, and multi-agent task state.

### TUI
Keyboard-first terminal components, text charts, tables, command palette, tool/MCP visibility.

### Skinscape
Theme and identity overlays that never alter permissions or capability semantics.

### 3D AGENTROPOLIS
Render manifests as world terminals, holographic panels, control rooms, kiosks, or district-specific consoles.

## District examples

- CREATOR: shot timeline, runtime selector, render queue, adapter registry status.
- GTM: campaign funnel, CHAOS RANK, audience signals, launch controls.
- CBE: agent profile, availability, reputation, contract actions.
- ATV Network: story queue, rundown, teleprompter, audience metrics.
- Gaming: inventory, quests, NPC/agent controls, world state.
- Terra54: property card, underwriting, funding scenarios.
- NEUROMETAX: tax-event timeline, document status, exposure summary.
- HERMES-CITY: worker status, task graph, memory/provenance, swarm controls.
- 54-T: permission graph, quarantine state, risk receipts, kill-switch controls.

## Beta implementation phases

### Phase 1 - Contract
- Define `agentropolis.genui/v1` JSON schema.
- Define component allowlist.
- Define capability-handle and receipt fields.
- Define surface hints and graceful degradation.

### Phase 2 - Adapters
- Workspace renderer.
- TUI renderer.
- HUD renderer.
- Skinscape theme adapter.

### Phase 3 - MCP bridge
- Convert MCP/skill results into normalized result envelopes.
- Add GenUI manifest generation hooks.
- Bind actions to scoped capability handles.

### Phase 4 - 54-T enforcement
- Pre-render permission filtering.
- Pre-action capability verification.
- Receipt issuance.
- Quarantine unsupported or unsafe components.

### Phase 5 - Reference widgets
- Market card.
- GitHub/repository card.
- Agent status card.
- Render queue card.
- Social intelligence card.

### Phase 6 - Beta validation
- Cross-surface parity tests.
- Accessibility and keyboard tests.
- Malformed-manifest fuzzing.
- MCP prompt-injection and untrusted-content tests.
- Capability escalation tests.
- Receipt integrity tests.

## Acceptance criteria

- One semantic manifest renders on HUD, Workspace, and TUI without changing capability semantics.
- Skinscape changes appearance only.
- MCP servers cannot inject arbitrary executable UI by default.
- Every state-changing action is policy checked and receipted.
- Unsupported components degrade safely to text/status output.
- High-impact actions remain human-approved or dual-controlled per 54-T policy.
