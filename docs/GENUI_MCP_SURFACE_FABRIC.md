# AGENTROPOLIS GenUI + MCP Surface Fabric

## Status
Closed-beta implementation candidate. Rendering is enabled; live external state-changing actions remain disabled until 54-T-backed capability verification and production adapters are connected.

## Purpose
Unify HERMES skills, MCP capabilities, GenUI manifests, HERMES Workspace, Desktop HUD, TUI, Skinscape, mobile, and 3D surfaces under one portable interaction fabric.

## Canonical flow

```text
HERMES Agent Core
  -> ATG / Atralith intent
  -> AGENTROPOLIS Agent MCP
  -> normalized capability result
  -> agentropolis.genui/v1 manifest
  -> surface renderer
  -> user action request
  -> 54-T preflight
  -> BE capability endpoint
  -> immutable action receipt
```

ATG is Atralith, the AGENTROPOLIS agentic language. It expresses intent and semantic contracts; it is not a traffic-control layer.

## Root doctrine

1. MCP supplies governed capability.
2. GenUI supplies portable interaction semantics.
3. Workspace, HUD, TUI, mobile, and 3D adapters supply presentation surfaces.
4. Skinscape supplies identity and visual treatment only.
5. BE supplies normalized state and governed action endpoints.
6. 54-T supplies effective-capability verification, containment, approval enforcement, quarantine, and receipts.
7. Raw credentials never enter manifests or model context.

## Beta implementation shipped in this branch

- `config/genui-fabric.json` — feature flags, component allowlist, security invariants, beta action policy.
- `schemas/agentropolis.genui.v1.schema.json` — machine-readable v1 manifest contract.
- `tools/validate_genui.py` — dependency-free semantic/security validator.
- `tests/fixtures/genui/market.valid.json` — accepted reference manifest.
- `tests/fixtures/genui/unsafe.invalid.json` — hostile/unsafe rejection fixture.
- `tests/test_genui_validator.py` — contract and security unit tests.
- `genui-renderer.js` — safe browser reference renderer using DOM text nodes and allowlisted component types.
- `genui-beta.html` + `genui-beta.css` — interactive public-safe beta surface.
- `.github/workflows/genui-beta.yml` — CI gate for schema/config validity, validator behavior, unsafe-fixture rejection, and governance invariants.

## Allowed beta component types

The initial browser renderer intentionally supports a narrow set:

- `metric`
- `text`
- `status`
- `sparkline`
- `action_group`

The configuration reserves additional future types, but renderers must treat anything unsupported as non-executable status output until explicitly implemented and tested.

## Action contract

Every actionable control must include these fields:

```json
{
  "id": "create-watch",
  "label": "Create Watch",
  "capability_handle": "cap://market/watch/create",
  "policy_scope": "scope://market/watch/write",
  "impact": "low",
  "confirmation": "human"
}
```

### `capability_handle`
Opaque reference to the capability that BE/MCP may request. It is not a credential and must never contain a raw secret.

### `policy_scope`
Explicit 54-T policy namespace used to authorize or deny the requested action.

### `impact`
One of `read`, `low`, `medium`, `high`, or `irreversible`.

### `confirmation`
One of `none`, `human`, or `dual_control`. High and irreversible actions require `dual_control` at validation time.

## Minimal valid manifest

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
      "type": "action_group",
      "id": "market-actions",
      "actions": [
        {
          "id": "analyze",
          "label": "Analyze",
          "capability_handle": "cap://market/analyze",
          "policy_scope": "scope://market/read",
          "impact": "read",
          "confirmation": "none"
        }
      ]
    }
  ],
  "provenance": {
    "required": true,
    "source_type": "mcp",
    "source_ref": "mcp://market/btc-usd"
  },
  "receipt_policy": "on_action"
}
```

## Security invariants

- Arbitrary HTML and JavaScript are denied.
- Inline event handlers are denied.
- Unknown component types are non-executable and must degrade safely.
- Actionable controls require both `capability_handle` and `policy_scope`.
- High-impact and irreversible actions require dual control.
- Production secrets are forbidden in the public beta.
- External state-changing actions are disabled in the public beta.
- The reference renderer never uses `innerHTML` for manifest content.
- Manifest content is treated as untrusted data.
- State-changing execution must occur behind a 54-T preflight and a BE capability endpoint.
- Every state-changing action must produce a permanent receipt.

## Surface behavior

### Desktop HUD
Compact, context-aware, floating, low-interruption rendering.

### HERMES Workspace
Expanded interactive panels with history, secondary analysis, and multi-agent task state.

### TUI
Keyboard-first components, text charts, tables, command palette, and tool/MCP visibility.

### Skinscape
Themes and identity overlays only. Skinscape must never alter capability, policy, impact, or confirmation semantics.

### Mobile
Responsive compact cards with the same action contract and policy scopes.

### AGENTROPOLIS 3D
The same manifest may be represented as terminals, holographic panels, kiosks, or district consoles. A 3D surface is still a renderer, not an authority layer.

## MCP bridge contract

MCP/skill output must be normalized before rendering. MCP servers do not receive authority to return executable UI code. A normalized result may provide data, provenance, and scoped action descriptors; the trusted GenUI layer decides whether and how those descriptors render.

## Beta action behavior

The public-safe beta deliberately separates interaction from execution:

- read actions emit an action request event;
- state-changing actions emit simulation-mode requests by default;
- no raw capability credential is stored client-side;
- no external production write is performed by the reference page;
- connecting live BE/54-T execution is a separate production promotion gate.

## District reference widgets

- CREATOR — shot status, runtime selector, render queue.
- GTM — campaign funnel, CHAOS RANK, audience signals.
- CBE — agent profile, reputation, availability, contract request.
- ATV Network — story queue, rundown, teleprompter state.
- Gaming — inventory, quests, NPC/agent state.
- Terra54 — property status, underwriting state, funding scenario.
- NEUROMETAX — tax-event timeline and document status.
- HERMES-CITY — worker health, task graph, provenance, swarm state.
- 54-T — permission status, quarantine state, risk receipts.

## Closed-beta validation matrix

The CI beta gate must verify:

1. config JSON parses;
2. schema JSON parses;
3. a valid manifest passes the semantic validator;
4. an unsafe manifest fails validation;
5. high-impact actions without dual control fail;
6. actions without `policy_scope` fail;
7. unknown components fail validation;
8. arbitrary HTML/JavaScript and secret-like manifest keys remain disabled by policy;
9. live external actions remain disabled;
10. human approval remains required before production promotion.

## Acceptance criteria for beta

- One semantic manifest can render without embedding executable third-party HTML/JS.
- The same action descriptor retains identical capability and policy semantics across surfaces.
- Skinscape can change presentation without changing authority.
- Unsupported or unsafe content cannot become executable UI.
- High-impact controls cannot validate without dual control.
- State-changing actions remain simulation-only in the public beta.
- CI rejects governance drift that enables arbitrary code, secrets, or live external writes.

## Production promotion blockers

This branch is beta-ready infrastructure, not a claim that all production adapters are live. Promotion requires:

- real HERMES MCP result-envelope adapter;
- real BE capability-handle resolver;
- real 54-T preflight/authorization adapter;
- immutable receipt sink;
- Workspace/TUI/HUD adapter parity tests;
- Skinscape presentation-only integration test;
- accessibility and keyboard test pass;
- malformed-input/fuzz test pass;
- explicit human approval for promotion.
