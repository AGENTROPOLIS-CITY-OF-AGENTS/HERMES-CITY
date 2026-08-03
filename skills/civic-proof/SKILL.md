---
name: civic-proof
version: 0.1.0
display_name: Civic Proof
description: Evaluate Hermes agent activity, receipts, reputation signals, and thermodynamic health without converting activity into authority.
district: HERMES CITY
pack: civic-infrastructure
tags:
  - achievements
  - receipts
  - reputation
  - thermodynamics
  - anti-gaming
  - governance
tier: infrastructure
layer: institution
metadata:
  agentropolis:
    requires:
      bins: []
      env: []
      install:
        - Enable the bundled Hermes hermes-achievements backend plugin.
        - Install the Agentropolis Civic Proof desktop overlay.
chains_to:
  - receipt-auditor
  - aegis-policy-gate
  - mission-control-review
chains_from:
  - hermes-achievements
  - audit-ledger
  - district-runtime
orchestrated_by:
  - HERMES Dispatch
---

# CIVIC PROOF

## Role

Turn local Hermes activity telemetry into a bounded operator-facing proof surface while keeping four concepts separate:

1. **Achievements** measure observed activity and exploration.
2. **Receipts** prove that an intended task produced a verifiable result.
3. **Reputation** summarizes reviewed quality and reliability over time.
4. **Authority** remains an explicit runtime grant and is never inferred from achievements, scores, or reputation.

> Activity is a signal. A receipt is evidence. Authority is a mandate.

## Activation Triggers

Activate when the operator asks to:

- show my Hermes achievements
- open civic proof
- evaluate agent thermodynamics
- check drift or entropy
- score agent reliability
- inspect receipt coverage
- determine whether an agent earned more authority

For the final trigger, the skill must report evidence and route the decision to human or policy review. It must not grant authority.

## Inputs

Required:

- Hermes achievements payload from `/api/plugins/hermes-achievements/achievements`

Optional:

- receipt summary conforming to `schemas/agentropolis-proof-receipt.schema.json`
- reviewed task outcomes
- district policy thresholds
- budget and mandate metadata

## Thermodynamic Signals

The current desktop overlay computes transparent proxies from local session telemetry:

- **Tool entropy**: normalized Shannon entropy across tool categories
- **Drift proxy**: Jensen-Shannon divergence between recent and baseline tool-use distributions
- **Error density**: errors divided by tool calls
- **Useful-work proxy**: bounded ratio of edits, reads, extracts, tests, releases, and similar work signals to total tool calls

These are operational indicators, not claims about cognition, intent, truthfulness, or semantic correctness.

## Anti-Moloch Rules

- Never reward raw tool-call volume by itself.
- Never treat error count as proof of persistence or competence.
- Never allow a badge, score, or tier to expand permissions.
- Never fabricate receipt coverage when no receipt source is connected.
- Label every inferred metric as a proxy.
- Prefer reviewed outcomes and signed receipts over engagement telemetry.
- Surface missing evidence instead of filling gaps with optimistic assumptions.

## Output Contract

Return:

```text
CIVIC PROOF STATUS
- Activity score
- Thermodynamic health
- Receipt coverage
- Reputation state
- Authority state
- Evidence gaps
- Required review or handoff
```

## Chain Behavior

### Chain in

`hermes-achievements` supplies local activity telemetry.

`audit-ledger` may supply signed or anchored receipts.

`district-runtime` may supply mandate, budget, and policy context.

### Chain out

- Send receipt validation to `receipt-auditor`.
- Send permission changes to `aegis-policy-gate`.
- Send ambiguous, high-risk, or high-drift cases to `mission-control-review`.

## Example

**Operator:** "Open Civic Proof and tell me whether this agent should receive deployment authority."

**Expected behavior:**

1. Load local achievement and thermodynamic telemetry.
2. Load receipt and review data when connected.
3. Report evidence, drift, error pressure, and receipt coverage.
4. State that no authority is granted by the score.
5. Produce a review packet for AEGIS or Human Mission Control.
