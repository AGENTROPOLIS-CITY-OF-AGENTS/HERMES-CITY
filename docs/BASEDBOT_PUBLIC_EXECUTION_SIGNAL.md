# BasedBot Public Execution Signal

Public repository: `wiredchaos/HERMES-CITY`

Private companion: `AGENTROPOLIS-CITY-OF-AGENTS/agentropolis`

Source signal: `https://basedbot.app/base`

## Public Boundary

This document is a public signal brief only.

It may describe high-level architecture, risk posture, and non-sensitive interface patterns. It must not include private prompts, production execution code, wallet internals, credentials, proprietary strategy, client data, or undisclosed Agentropolis implementation details.

## Why This Matters

Agent-native commerce does not end at recommendations. Agents eventually need governed execution surfaces for market actions, treasury workflows, wallet monitoring, alerts, and settlement-aware decisions.

BasedBot is tracked as a candidate execution terminal signal because it sits near the place where agent reasoning can become capital movement.

That makes it strategically relevant, but also risk-sensitive.

## HERMES CITY Position

```text
BasedBot
= public execution terminal signal

HERMES CITY
= public civic shell and coordination map

Agentropolis
= private governance, policy, wallet, and audit engine
```

BasedBot should be understood as a possible tool lane, not as an autonomous financial brain.

## Public Architecture Pattern

```text
Onchain data / market signal
  -> HERMES-style orchestration
  -> Policy review
  -> Wallet permission layer
  -> Execution terminal
  -> Audit receipt
  -> Pause / revoke / reset controls
```

## Required Public Safety Principle

No blind autonomy.

Any agent system that can interact with capital should support:

- read-only mode
- simulation mode
- human approval mode
- limited execution mode
- spend caps
- allowlists
- cooldowns
- audit receipts
- kill switch controls
- manual reset after violations

## Signal Score

| Score | Label | Meaning | Action |
| --- | --- | --- | --- |
| 4 | Build | Strong strategic fit, execution risk requires controls | Create private implementation review |

## Integration Direction

HERMES CITY should track BasedBot under the public Execution Governor and RAILWATCH surfaces.

The public story is simple:

```text
Data helps agents understand markets.
Wallets give agents bounded authority.
Execution terminals let approved actions happen.
Governance keeps the loop survivable.
```

## Status

Public watch signal added.

Private implementation details belong in `AGENTROPOLIS-CITY-OF-AGENTS/agentropolis` only.
