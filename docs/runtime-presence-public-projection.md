# HERMES CITY Runtime Presence Projection

HERMES CITY may visualize live AGENTROPOLIS activity, but it is never a raw runtime telemetry client.

## Source contract

The upstream source of truth is the AGENTROPOLIS Runtime Presence Layer in the Intelligence Grid. HERMES CITY consumes a derived public-safe projection only.

```text
Runtime adapters
  -> AGENTROPOLIS Ingest Membrane
  -> RuntimeEvent
  -> policy/risk evaluation
  -> public field allowlist
  -> PublicPresence projection
  -> HERMES CITY
```

## Allowed display state

- explicitly public agent display name or pseudonym
- coarse state: idle, working, waiting, done, unavailable
- public district / room assignment
- coarse activity class: reading, writing, browsing, terminal, delegating
- aggregate swarm counts
- explicitly public completion receipts

## Never exposed

- prompts or prompt fragments
- tool arguments or shell commands
- filesystem paths
- private URLs or query strings
- credentials, cookies, API keys, secrets, wallet material
- session, task, execution, or approval identifiers
- internal host topology
- private policy metadata or risk scores
- private user/client content

## Interaction boundary

Runtime presence on HERMES CITY is read-only. Public clients cannot mutate execution state through the presence surface.

Any future action controls must route separately through HERMES Dispatch, Policy/Risk, explicit approvals, validation, and receipts.
