# Hermes Blackbox Public-Safe Architecture

Hermes Blackbox is tracked as a controlled-pilot, local-first flight recorder for Hermes Agent.

It can capture a Hermes session, redact common secrets, generate an after-action report, verify an event-stream hash, and produce a draft completion receipt.

## Public-safe flow

```text
Operator intent
  -> HERMES Dispatch
  -> approved tool lane
  -> validation
  -> Hermes Blackbox redacted flight record
  -> AEGIS assurance
  -> receipt log
  -> Human Mission Control review
```

## What it proves today

Blackbox can show that a particular normalized event stream has not changed since its SHA-256 hash was created. It can also surface likely evidence associated with a completion claim.

It does not independently prove that every claim is true, that the underlying machine was trustworthy, or that an agent had authority to perform the work.

## Public boundary

Public reports must exclude credentials, full system prompts, raw private records, client data, absolute local paths, and proprietary prompts. A v0.1 heuristic claim verdict must not be presented publicly as certified completion.

## Status vocabulary

- `draft` - record or receipt created, not assured
- `inconclusive` - evidence is insufficient or ambiguous
- `rejected` - evidence or integrity failed
- `verified` - AEGIS validated deterministic evidence

> Agents love to say done. The city requires evidence, policy, and review.
