# GenUI Surface Fabric Beta Readiness Receipt

- Date: 2026-08-18
- Repository: `wiredchaos/HERMES-CITY`
- Branch: `feat/genui-mcp-surface-fabric`
- Mode: closed beta
- Feature flag: `genui_surface_fabric`

## Implemented

- `agentropolis.genui/v1` contract and schema
- governed beta configuration
- semantic/security validator
- valid and hostile fixtures
- validator unit tests
- safe browser reference renderer
- interactive beta surface
- CI validation gate
- action capability-handle + policy-scope contract
- high-impact dual-control validation
- simulation-only state-changing actions
- provenance requirement
- explicit production promotion blockers

## Security state

- arbitrary HTML: denied
- arbitrary JavaScript: denied
- raw credentials in manifests: denied
- live external state-changing actions: disabled
- 54-T preflight required by contract before live action execution
- high-impact action policy: deny without dual control
- production promotion: human approval required

## Validation target

CI must prove that valid fixtures pass, hostile fixtures fail, governance invariants remain locked, and validator unit tests pass.

## Honest boundary

This receipt records the closed-beta implementation present in HERMES-CITY. It does not claim that production BE, 54-T, Workspace, HUD, TUI, Skinscape, or external MCP adapters are already connected. Those integrations remain explicit promotion gates and must be separately verified before live production execution.
