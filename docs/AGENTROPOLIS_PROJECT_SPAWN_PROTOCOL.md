# Agentropolis Project Spawn Protocol — HERMES CITY Projection

HERMES CITY exposes the public-safe preview layer for projects and districts admitted into Agentropolis.

## Public flow

```text
Builder / project / repo / district candidate
  -> HERMES intake
  -> Docking District
  -> identity + provenance + license + purpose review
  -> district / building / rail / utility classification
  -> Construction District spawn plan
  -> Creator Core candidate scene/assets
  -> Agent MCP project-spawn manifest
  -> HERMES CITY spatial preview
  -> BE verification + receipt
  -> human approval when publication or mutation is involved
```

HERMES CITY never grants a project authority merely because it can render a city twin.

## Spawned city twin

An approved incoming project may receive an Agentropolis-native representation as one or more of:

- building
- campus
- district
- rail
- utility
- portal
- application surface

The representation should map to real project semantics rather than act as decorative 3D scenery.

## Camera and compatibility baseline

The default city-orientation view is orthographic, giving users a lightweight miniature-city view that supports orbit, zoom, selection, and reset.

Perspective cameras remain available for cinematic fly-throughs, interiors, and scroll-scrubbed storytelling.

```text
ORTHOGRAPHIC = orientation
PERSPECTIVE  = cinema/detail
SCROLL       = storytelling
```

WebGL is the compatibility baseline. WebGPU is optional. Dedicated NVIDIA/CUDA hardware is not required. Reduced-motion static viewpoints and a no-WebGL HTML path must remain available.

## Public data rule

HERMES CITY may show only public-safe project metadata and telemetry. Values such as entropy, drift, friction, stability, health, throughput, and cost must be labeled LIVE only when backed by actual instrumentation. Otherwise they must be SIMULATED, UNKNOWN, or NOT INSTRUMENTED.

## Authority boundary

The public preview is a coordination and observability surface. Repository writes, deployments, publishing, wallet actions, payments, destructive changes, and permission changes require a separately authenticated execution corridor and the appropriate human approval.

## Evaluation

BE is the general evaluator for project-spawn verification and scene receipts. ASBE remains scoped to Entertainment District responsibilities.

## Reference implementation

AGENTROPOLIS-AQUADUCT is the current reference implementation for `agentropolis.spatial-scene.v1`, procedural Three.js scenes, scroll-scrubbed camera choreography, fallback modes, state bindings, and BE receipts.
