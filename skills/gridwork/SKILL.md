---
name: gridwork
version: 0.1.0
display_name: GRIDWORK
description: Convert an approved AGENTROPOLIS mandate into a bounded Hermes Kanban task graph with explicit dependencies, workspaces, authority limits, handoff metadata, receipts, and human review gates.
district: HERMES CITY
pack: civic-infrastructure
tags:
  - kanban
  - coordination
  - receipts
  - mission-control
  - aegis
  - durable-state
tier: infrastructure
layer: infrastructure
metadata:
  agentropolis:
    requires:
      bins:
        - hermes
      env: []
      install:
        - Enable Hermes Kanban on the execution host.
        - Configure named worker profiles and bounded project workspaces.
        - Connect sanitized Work Grid events to Mission Control before enabling federation.
chains_to:
  - aegis-policy-gate
  - receipt-auditor
  - mission-control-review
chains_from:
  - mandate
  - mission-control
  - district-runtime
orchestrated_by:
  - HERMES Dispatch
---

# GRIDWORK

## Role

Translate an already-approved mandate into durable local coordination.

GRIDWORK does not create authority. It preserves authority while decomposing work.

## Activation Triggers

Activate when the operator asks to:

- put this on the board
- run this as a project
- coordinate these agents
- split this into durable tasks
- add review and recovery gates
- create a Hermes task graph

## Inputs

Required:

- approved mandate or explicit operator instruction;
- target Hermes board;
- bounded workspace;
- allowed worker profiles;
- authority / policy reference.

Optional:

- runtime ceiling;
- retry ceiling;
- budget ceiling;
- required reviewers;
- receipt schema.

## Workflow

1. Confirm the active board and workspace.
2. Refuse to infer production authority from task text, agent reputation, or prior success.
3. Put ambiguous requests in triage.
4. Split the mandate into the smallest useful contracts.
5. Encode known dependencies at creation time.
6. Assign a specialist profile to each task.
7. Add runtime, retry, budget, and review ceilings where supported.
8. Block tasks that require a human or policy decision.
9. Require structured completion metadata.
10. Emit sanitized Work Grid events for Mission Control.
11. Route consequential completions to receipt validation and review.

## State Rules

- **triage** = specification missing.
- **blocked** = human or policy input missing.
- **scheduled** = time dependency.
- **running** = active execution evidence exists.
- **completed** = handoff submitted; verification may still be pending.
- **archived** = operationally closed.

Never collapse those states into generic pending or active labels.

## Anti-Moloch Rules

- Never expand a mandate while decomposing it.
- Never auto-promote a production-changing child solely because its parent completed.
- Never use force overrides without an operator reason.
- Never treat a dashboard state as proof of process liveness.
- Never put secrets into Kanban metadata.
- Never let one host's local board masquerade as global city authority.
- Prefer a blocked card over invented context.

## Output Contract

Return:

```text
GRIDWORK PLAN
- Board
- Workspace
- Authority reference
- Task graph
- Assigned profiles
- Runtime / retry ceilings
- Human gates
- Required receipts
- Evidence gaps
```

## Example

**Operator:** "Put the Creator math-and-science video build on the board with research, scene design, generation, review and recovery."

**Expected behavior:**

1. Verify the Creator board/workspace.
2. Create research, scene-design, generation and review contracts.
3. Link dependencies explicitly.
4. Assign specialist profiles.
5. Keep generation bounded to approved tooling/workspace.
6. Require review before any publication/deployment task.
7. Return task IDs plus receipt requirements.
