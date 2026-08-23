# HERMES-CITY Spawn Runtime Contract

HERMES-CITY is the live spatial runtime and presentation surface for approved Agentropolis spawn packages.

Construction is **not** owned by HERMES-CITY. Construction remains a function of `AGENTROPOLIS-CREATOR` through RCP. HERMES-CITY consumes verified packages and renders them as governed city surfaces.

## Runtime contract

```text
Docking intake
  -> CREATOR Construction / RCP
  -> spawn package
  -> BE verification
  -> HERMES-CITY mount
```

A mounted spawn package should provide:

- stable `agentropolis_spawn_id`;
- `agentropolis.spatial-scene.v1` compatible manifest;
- semantic city placement;
- orthographic overview camera configuration by default;
- optional authored perspective/cinematic paths;
- scroll-scrub timeline bindings where applicable;
- runtime capability bindings;
- provenance and source-owner metadata;
- progressive rendering tier;
- reduced-motion and no-WebGL fallbacks;
- truthful telemetry state;
- BE receipt reference.

## Camera doctrine

The default orientation mode is orthographic so users can understand the project as a living miniature inside Agentropolis. Perspective cameras remain valid for cinematic transitions, close inspection, authored tours, and scroll-driven storytelling.

The runtime MUST NOT require dedicated GPU hardware. WebGL is the baseline. WebGPU and heavier effects are optional enhancements.

## Semantic twin rule

A spawned project is represented as an operating spatial twin, not a decorative model. Buildings, rails, services, agents, rooms, and interfaces should map to real project concepts and capabilities whenever those concepts are available.

## Authority

HERMES-CITY MUST NOT silently mutate source project logic or grant new execution authority. Callable actions route through the governed Agent MCP execution corridor. Public state must distinguish live instrumentation, simulation, unknown state, and static presentation.

## Evaluation

BE is the system evaluator for mounted spatial twins. ASBE remains Entertainment District scoped.
