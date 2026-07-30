# HERMES CITY: Buzz Shared Profile Bridge

## Working implementation

HERMES CITY adopts [`r0b0tlab/hermes-buzz-shared-profile`](https://github.com/r0b0tlab/hermes-buzz-shared-profile) as the current public-safe bridge for adding an existing Hermes profile to Buzz Desktop as a native managed agent.

```text
Hermes profile
  -> hermes -p <profile> acp
  -> buzz-acp
  -> Buzz managed agent
  -> Buzz channels and threads
```

The bridge writes one entry into Buzz Desktop's `managed-agents.json`. It does not copy Hermes profile state, memory, skills, sessions, or `state.db`.

## Shared-profile invariant

```text
Hermes profile directory = sole writable owner of durable agent state
Buzz managed-agent entry = reference and ACP launch configuration
```

This means HERMES CITY can expose a Hermes agent in Buzz without creating a second, drifting copy of its identity or memory.

## Public-safe setup

```bash
hermes skills inspect amanning3390/hermes-buzz-shared-profile/hermes-buzz-shared-profile
hermes skills install amanning3390/hermes-buzz-shared-profile/hermes-buzz-shared-profile

hermes profile create hermes-city --description "HERMES CITY civic agent"
python3 ${HERMES_SKILL_DIR}/scripts/shared_profile.py buzz-add --profile hermes-city --name "HERMES CITY"
```

Restart Buzz Desktop after registration.

## What the bridge provides

- cross-platform Buzz Desktop discovery
- native managed-agent registration
- direct Hermes ACP launch
- deterministic profile slugging as `hermes:<profile>`
- atomic preservation of existing Buzz agents
- optional `SOUL.md` prompt import
- add, update, list, and remove commands

## What remains outside the bridge

The shared-profile skill is an execution bridge, not the complete HERMES CITY governance plane. It does not provide:

- district authorization
- capability policy enforcement
- signed approval workflows
- credential management
- artifact receipts
- payment or wallet authority
- deployment authority
- cross-community memory transfer

These remain controlled by HERMES Dispatch, Mission Control, AEGIS, and the receipt layer.

## Security boundary

The default `respond_to: owner-only` setting reduces who may activate the managed agent, but it is not sufficient authorization for sensitive tools. A compromised authorized identity may reach local Hermes capabilities through ACP. Destructive, financial, publishing, deployment, and credential-bearing actions require separate runtime gates.

## Canonical city flow

```text
Operator intent
  -> Buzz signed channel event
  -> HERMES CITY managed profile
  -> Hermes ACP execution
  -> approved MCP or local tool lane
  -> artifact and receipt
  -> Buzz thread review
  -> Mission Control decision
```

## Reviewed upstream status

- Skill version: `0.3.0`
- Platforms: macOS, Linux, Windows 10/11
- Runtime: Python 3.11+
- License: MIT
