# Cognitive Runtime Profiles — Public Signal

HERMES may publicly describe AGENTROPOLIS support for governed cognitive-runtime profiles without exposing private orchestration, prompts, credentials, or unverified performance claims.

## Public-safe flow

```text
Operator intent
  -> HERMES Dispatch
  -> CHAOS RANK task/model routing
  -> AEGIS qualification check
  -> approved cognitive runtime profile or base runtime
  -> model + governed tools
  -> validation
  -> OPS telemetry
  -> permanent receipts
```

## What a cognitive runtime profile is

A cognitive runtime profile is an optional inference-time control policy for task state, checkpoints, tool seams, verification, and recovery. Profiles do not change AGENTROPOLIS authority and do not automatically become part of canon.

## Experimental external profile

AGENTROPOLIS is evaluating the third-party `J-Space Cognition Suite V3.6` as an external profile under the identifier `external.tiger.jspace-v3.6`.

Public status: **experimental / not production-approved**.

Its published DeepSeek V4 report contains promising benchmark results, but those results are author-reported single-run measurements without confidence intervals. AGENTROPOLIS does not present them as independently verified performance claims.

## Namespace boundary

- `AGENTROPOLIS::JSPACE` remains AGENTROPOLIS JSpace.
- External J-Space remains an external profile.
- ATG means Atralith, the AGENTROPOLIS agentic language.
- ASBE means Agentic Studio Build Engine and remains a studio orchestration system.

## Public disclosure rules

HERMES may disclose:

- profile identity and upstream attribution;
- qualification state;
- supported model/task classes after approval;
- aggregate performance results backed by AGENTROPOLIS benchmark receipts;
- rollback/fallback availability.

HERMES must not disclose:

- private prompts or hidden reasoning;
- credentials, tokens, keys, or private session data;
- proprietary routing thresholds where disclosure would weaken controls;
- benchmark improvements that have not been independently reproduced;
- private runtime implementation details.
