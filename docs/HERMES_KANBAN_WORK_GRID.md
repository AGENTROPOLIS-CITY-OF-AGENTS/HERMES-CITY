# Hermes Kanban -> AGENTROPOLIS Work Grid

**Status:** v1 integration contract  
**Local authority:** Hermes host board  
**City authority:** Human Mission Control + AEGIS

## Purpose

Use Hermes Kanban as durable local coordination for work that needs parallelism, dependencies, review, recovery, or handoff.

Tiny one-shot work remains in chat.

## Mapping

| Hermes | Work Grid |
|---|---|
| board | host-local project boundary |
| task | bounded mandate fragment |
| profile | worker authority shape |
| parent / link | dependency edge |
| workspace | execution terrain |
| claim | temporary execution lease |
| run | execution attempt |
| log / events | operational evidence |
| complete metadata | handoff candidate |
| archive | closed operational history |

## Required worker behavior

Workers use Hermes native Kanban tools when available. They do not shell out merely to mutate their own board.

A worker MUST:
- remain on the assigned board;
- remain inside the assigned workspace;
- respect runtime, retry, budget and authority limits;
- block rather than invent missing human decisions;
- preserve dependency order;
- complete with a concise summary and structured evidence;
- never place secrets in comments, metadata, logs, or receipts.

## Federation rule

A Hermes host emits sanitized Work Grid events. Mission Control receives projections only.

```text
Hermes board
  -> sanitized event
  -> Mission Control Work Grid
  -> AEGIS / operator review
  -> receipt / audit
```

Mission Control does not rewrite the local Hermes board through the observational feed.

## Liveness

`running` is not accepted solely because a card says running.

Local liveness should combine:
- valid claim / lease;
- active run record;
- recent heartbeat or event;
- host-local process/runtime evidence when available.

If those disagree, report `stale-or-unknown` and route to recovery. Do not fabricate a healthy state.

## Completion metadata

Preferred fields:

```json
{
  "changed_files": [],
  "verification": [],
  "decisions": [],
  "open_risks": [],
  "receipt_refs": []
}
```

## Security boundary

Tenants, labels, task titles, comments and board membership are not security boundaries. Sensitive separation requires explicit board/workspace/host isolation plus AEGIS policy.
