# HERMES Fleet + Continuity Runtime

Status: proposed runtime integration
Date: 2026-09-15

## Position

HERMES is the persistent cognitive and fleet-execution runtime that may animate governed AgentEntities. It is not the Constitution, ATG authority, AEGIS, Mission Control, or the Audit Ledger.

## Governed corridor

```text
Human / Mission Control
  -> Constitution
  -> ATG / ATG:FLEET
  -> AEGIS
  -> Quantization + Fleet Torque
  -> HERMES
  -> BUZZ lifecycle events
  -> ExecutionCells
  -> Agent MCP / tools / isolated workspaces
  -> verification
  -> Sentinel-6
  -> receipt / audit
  -> AgentEntity history + lineage
```

## Hermes subagents as ExecutionCells

When a Hermes subagent participates in a governed FleetRun it MUST resolve to an ExecutionCell with:

- task contract
- parent mandate reference
- attenuated authority envelope
- ownership lease
- baseline snapshot
- allowed resources/files
- capability handles
- budget
- Context Capsule
- model/runtime representation route
- acceptance criteria
- verifier assignment
- integration edge
- receipt requirement

A chat thread is not an authority envelope. A branch is not an authority envelope. A model context is not an authority envelope.

## Continuity

Hermes session continuity and AgentEntity continuity are separate concepts.

An AgentEntity may remain continuous while Hermes:

- compacts a transcript
- restores a Context Capsule
- changes model provider
- changes model family
- selects an EXL3/GGUF/AWQ/GPTQ/FP8/etc. representation
- moves execution local -> edge -> workstation -> cloud or back
- migrates memory storage
- changes device or interface

Continuity requires evidence. Current authority must be independently resolved after resume/migration.

## History layers

Hermes integrations SHOULD distinguish:

1. `session_memory` — transient conversational/runtime state
2. `agent_memory` — durable task-relevant memory
3. `agent_history` — append-only meaningful lineage events
4. `execution_history` — mandates, FleetRuns, cells, actions, verification, receipts
5. `representation_history` — model/runtime/context/memory transforms and continuity evidence

## Fleet Torque integration

Before spawning large fleets, Hermes SHOULD request/consume a fleet topology decision derived from dependency density, write collision risk, context entropy, verification cost, available compute, deadline, and budget.

More agents is not automatically better.

## Stop semantics

A worker reporting "stopped" is not sufficient evidence that it stopped. Fleet control must resolve authoritative runtime/process/workspace state and emit a stop/drain/revoke/kill receipt as applicable.

## BUZZ events

Recommended signed events:

- `fleet.created`
- `cell.started`
- `ownership.leased`
- `baseline.bound`
- `capability.granted`
- `representation.selected`
- `representation.changed`
- `continuity.asserted`
- `context.entropy.high`
- `task.completed`
- `verification.failed`
- `budget.threshold`
- `lease.revoked`
- `integration.ready`
- `cell.stopped`
- `fleet.closed`

Conversation may render these events. It is not their authoritative store.

## Core rule

**Hermes coordinates cognition; coordination never creates authority.**
