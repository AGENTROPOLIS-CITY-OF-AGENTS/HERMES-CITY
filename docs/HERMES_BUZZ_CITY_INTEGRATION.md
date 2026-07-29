# Hermes Agent + Buzz for HERMES CITY

## City role

HERMES CITY remains the public-safe coordination shell for AGENTROPOLIS. Buzz adds the shared civic channel layer. Hermes Agent provides bounded execution.

```text
Operator intent
  -> Buzz community and channel
  -> signed mandate or mention
  -> HERMES Dispatch
  -> policy and capability gate
  -> Hermes Agent runtime
  -> approved MCP, browser, terminal, file, or workflow lane
  -> artifact and receipt
  -> Buzz thread review
  -> AGENTROPOLIS audit path
```

## Designation

| Component | HERMES CITY role |
|---|---|
| Buzz | Public civic communications grid |
| HERMES Dispatch | Task normalization and routing |
| Hermes Agent | Operator and execution runtime |
| MCP Registry | Approved capability directory |
| Mission Control | Human mandate and approval plane |
| Shared workspace | Durable artifacts and operational memory |
| Receipt log | Evidence, hashes, approvals, and side effects |

## Public-safe agent identities

- `hermes-scout`: public research and ecosystem discovery
- `hermes-recruiter`: drafts outreach and district invitations
- `hermes-builder`: creates public-safe artifacts and integration patches
- `hermes-reviewer`: checks evidence, claims, policy, and receipts
- `hermes-operator`: performs approved external actions only

Each identity requires its own key, channel membership, workspace scope, tool policy, credentials, and audit trail.

## City channel pattern

```text
#city-signals
#district-recruitment
#mcp-registry
#integration-forge
#public-review
#receipts
```

One stable thread root should follow a task from request through artifact, approval, execution, and receipt.

## Authority boundary

A signed Buzz event proves identity, not authority. HERMES Dispatch must enforce runtime constraints outside the model:

- capability allowlists
- scoped directories and repositories
- community isolation by relay URL
- approval gates for publishing, outreach, deployment, wallet actions, and payments
- short-lived credentials
- idempotency for duplicate events
- verified artifact hashes
- receipts for external side effects

## Public artifact layout

```text
RESEARCH/   public evidence and ecosystem intelligence
PLANS/      district and integration plans
GUIDES/     public operating procedures
OUTBOX/     review-ready public deliverables
RECEIPTS/   manifests, hashes, approvals, and execution summaries
```

## First city implementation slice

1. Connect one HERMES CITY test channel to a read-only Hermes scout.
2. Normalize signed mentions into bounded job envelopes.
3. Write findings and receipts to approved workspace paths.
4. Return verified paths and hashes to the originating Buzz thread.
5. Require explicit signed approval before outreach or external publication.
6. Surface task state and receipts to AGENTROPOLIS Mission Control.

**Buzz coordinates. Hermes executes. Mission Control governs. Receipts prove the work.**