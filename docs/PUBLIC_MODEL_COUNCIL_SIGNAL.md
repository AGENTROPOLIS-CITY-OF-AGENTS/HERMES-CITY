# Public Model Council Signal

HERMES CITY tracks model-provider capability as public infrastructure signal for safe agent-native coordination.

This document is intentionally public-safe. It describes concepts, roles, and routing principles without exposing private Agentropolis implementation details.

## Public Signal

Modern agent systems should not depend on one universal model. They should route tasks across specialized model lanes with clear authority boundaries.

| Public Lane | Example Provider Families | Public Meaning |
| --- | --- | --- |
| Fast Worker | DeepSeek Flash-style models | low-latency routine agent work |
| Planner | Ornith-style planning models | agent coordination and workflow decomposition |
| Research | GLM / Qwen / Kimi-style research models | synthesis, document analysis, long-context reasoning |
| Builder | Kimi Code / Qwen Coder-style models | code, automation, scaffolding, developer workflows |
| Council Review | Nemotron-style frontier reasoning models | hard decisions, high-context synthesis, review gates |
| Lightweight Fallback | Gemma / Llama / OSS models | cost-aware fallback and edge-compatible execution |

## Model Watch Principle

HERMES CITY may track public model-watch signals from researchers, model hosts, benchmark authors, hardware testers, and quantization projects. These signals are discovery inputs, not automatic production approvals.

A meaningful performance signal binds the whole execution profile:

```text
model/checkpoint
+ quantization
+ runtime
+ hardware
+ context actually tested
+ memory/cache policy
+ task quality
+ latency/throughput
+ provenance
```

Configured context capacity is not the same as useful occupied context proven under load. Public benchmark claims remain external evidence until reproduced or otherwise verified through the governed evaluation path.

## Why HERMES CITY Tracks This

Agent-native commerce requires:

- model selection by task type
- tool authority controls
- credential lease awareness
- audit receipts
- fallback lanes
- public/private boundaries
- no permanent ambient access
- evidence-aware model/runtime selection

## Public Routing Principle

```text
agent intent
  -> classify task
  -> choose approved model/runtime lane
  -> check authority
  -> execute bounded action
  -> validate outcome
  -> log receipt
```

## Boundary

HERMES CITY may publish public routing concepts and ecosystem signals.

Private production routing logic, credentials, wallet flows, internal prompts, customer data, undisclosed evaluation thresholds, and undisclosed Agentropolis implementation details stay out of this repository.
