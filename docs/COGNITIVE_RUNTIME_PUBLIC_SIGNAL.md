# Cognitive Runtime Profiles — Public Signal Boundary

Status: PUBLIC-SAFE ARCHITECTURE
Owner: HERMES CITY

HERMES CITY may describe the existence and approval state of cognitive-runtime profiles, but it does not expose private orchestration, hidden reasoning, credentials, proprietary prompts, or unapproved experimental internals.

## Public-safe flow

```text
Operator intent
  -> HERMES Dispatch
  -> CHAOS RANK route selection
  -> AEGIS qualification / policy gate
  -> canonical AGENTROPOLIS runtime
  -> OPS telemetry + validation receipts
  -> public-safe HERMES status
```

## External profile naming

The third-party J-Space Cognition Suite must be presented as an external profile, for example:

`external.tiger.jspace-v3.6`

It is not `AGENTROPOLIS::JSPACE` and must never be presented as a replacement or rename of AGENTROPOLIS JSpace.

ATG remains Atralith, the AGENTROPOLIS agentic language.

## Allowed public states

HERMES may expose only bounded states derived from authoritative receipts:

- `experimental`
- `reproducing`
- `qualified`
- `production-approved`
- `degraded`
- `revoked`

HERMES must not upgrade a state based on upstream marketing, benchmark screenshots, social claims, or model-generated inference.

## Allowed public metrics

When approved for disclosure, HERMES may show:

- model family
- workload class
- profile version
- qualification state
- benchmark suite name
- repeated-run aggregate result
- latency / token / task-success deltas
- evidence timestamp
- AEGIS receipt reference

Do not publish hidden chain-of-thought, private prompts, raw tool credentials, capability tokens, internal security policy, or non-public benchmark inputs.

## ASBE boundary

ASBE is the Agentic Studio Build Engine. It may consume a production-approved cognitive profile for studio workloads, but ASBE does not validate or approve the profile.

## Public claim law

A public capability statement must be narrower than or equal to the AEGIS approval scope. If the approval says a profile is qualified only for DeepSeek V4 repository-engineering workloads, HERMES must not describe it as generally improving all models or all tasks.

No receipt, no claim.
