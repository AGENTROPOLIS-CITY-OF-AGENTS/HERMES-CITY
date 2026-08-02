# Hermes Agent v2026.7.30 — Agentropolis Integration

**Upstream tag:** `v2026.7.30`  
**Hermes version:** `0.19.1`  
**Agentropolis posture:** CANARY

## Role

Hermes is the operator runtime beneath Agentropolis authority. It may plan, delegate, code, call approved tools, maintain sessions, and coordinate workers. It may not create its own mandate, widen capability scope, bypass policy, self-approve consequential actions, or replace receipt and audit requirements.

```text
Human Mission Control
  -> mandate + policy + budget
  -> HERMES Dispatch
  -> MCP Registry + Policy Gate
  -> bounded execution lane
  -> validation
  -> receipt log
```

## Release areas adopted

- gateway health and restart behavior;
- desktop session, tab, queue, and resume durability;
- context compression and long-session continuity;
- subagent lifecycle and orphan prevention;
- remote runtime connectivity and recovery;
- voice and Telegram media reliability;
- Buzz/Nostr connectivity;
- FLUX3 generation and delivery;
- monitoring, redaction, and operational evidence.

## Public-safe status language

Allowed:

- `runtime candidate`
- `canary node`
- `gateway healthy`
- `policy-gated`
- `receipt verified`
- `rollback available`

Not allowed without evidence:

- `fully autonomous`
- `production hardened`
- `self-governing`
- `unlimited authority`
- `zero-failure`

## Promotion rule

HERMES CITY may publish a production status only after Mission Control, OPS, AEGIS, and the receipt ledger agree that the canary gates passed. Runtime health alone is not production approval.