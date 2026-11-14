# ThreeRT cloud-rendering evaluation v0.1

Status: PROPOSED, NOT DEPLOYED. No cloud GPU provisioned.

Upstream: https://github.com/meshy-dev/ThreeRT (MIT source; packaged macOS/iOS clients closed-source). Pin exact upstream commit before any build. Upstream README documents `threert-render render out/bundles/cornell-box.js -o out/cornell.png --spp 32`; it does NOT establish an existing production cloud interactive-streaming service. Third-party scene assets have separate licenses.

## Goal
WORLDQ / HERMES CITY / ROMRIOT proof of concept: a minimal neon district with one moving emissive object, static geometry and a physics object, rendered remotely without requiring a client GPU.

## Phases
1. Cloud CPU CI: verify scene schema, deterministic geometry, model/asset licenses and no-secrets fixtures. Do not imply path-tracing performance.
2. Cloud GPU batch: on approved ephemeral GPU worker, pin Rust, Node 24, Bun and upstream commit; build from source; render test scene to PNG using upstream CLI; record render time, peak RAM/VRAM, output hash, GPU/driver and estimated cost.
3. Interactive streaming: only after batch passes, prototype remote input transport, video encoder, browser playback, session TTL and server-authoritative multiplayer. Streaming is custom integration work, not assumed to be supplied by ThreeRT.
4. Browser fallback: compare equivalent three.js scene and log fidelity and FPS separately.

## Security
Default deny: GPU provisioning, billing, external egress, unpinned dependencies, third-party asset fetches and streaming sessions. All require 54-T/APEX54 authorization, per-job USD cap, idle timeout, kill switch, isolated containers and content-addressed receipts. Never place secrets in prompts, source, or public logs.

## Acceptance gates
- License inventory includes source, app binaries and assets.
- One reproducible remote batch render with a signed receipt and output digest.
- Cloud GPU is terminated on completion, cancellation or timeout.
- No local GPU dependency for browser user.
- Interactive target: measure end-to-end input-to-photon latency and p95 frame time on real client networks; do not invent target achievement.
- Separate proof for collision authority, malicious scene code isolation and abuse controls before multiplayer production.

## Ownership
WORLDQ scene integration; HERMES CITY navigable district; CREATOR-CORE orchestration; CONSTRUCTION cloud worker; APEX54 authorization. No production approval implied.
