# HERMES-3D public Pages integration

Status: integration contract only; no embedded runtime or deployment.

HERMES-CITY is the public-safe signal surface. AGENTROPOLIS-WORLD owns the canonical spatial city and organization-wide repository building directory. HERMES-3D is an optional office-level 3D visualization, not a replacement for the city renderer.

Canonical organization-wide contract: https://github.com/AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-WORLD/pull/9

Candidate upstream: https://github.com/iamlukethedev/Hermes3D

## Pages rollout rule
Only opt-in repositories with verified GitHub Pages enabled should expose a public-safe Office entry point. Pages sites MUST NOT expose internal fleet activity, credential registries, raw gateway endpoints, tokens, approvals, or privileged agent actions.

The Pages component should link to the canonical WORLD office address by public manifest (organization/repository/building/office). Show a labeled placeholder until the office frontend, manifest and sanitized event API are implemented and audited. Never infer that a Pages site is deployed from the presence of this file.

## Release gates
Pin upstream version and audit dependencies, run 54T/VERITY security checks, require signed public manifests and tenant filtering, support 2D fallback, pass Pages build and link checks, preserve branch protection, obtain NEURO approval, and verify deployed URLs after release.

No live integration or deploy is performed by this documentation commit.
