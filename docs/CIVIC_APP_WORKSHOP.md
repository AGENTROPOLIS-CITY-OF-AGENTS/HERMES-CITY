# HERMES Civic App Workshop

The Civic App Workshop is the public-safe HERMES surface for requesting, previewing, reviewing, and approving isolated applications generated through the AGENTROPOLIS Civic Foundry Runtime. It is the human-facing surface of a governed runtime lane: operators describe an application, watch it take shape in an isolated sandbox, review what it wants to do, and approve or deny it - with a permanent receipt for every terminal outcome.

## Public pattern

```text
operator intent
  -> HERMES conversation and council
  -> policy envelope
  -> isolated application build
  -> safe preview
  -> approval queue
  -> governed capability use
  -> permanent receipt
```

HERMES remains the operator and orchestration surface. The workshop does not expose raw runtime internals, credentials, private prompts, citizen data, or unrestricted execution.

## Authority in public terms

The Civic App Workshop presents and coordinates; it does not decide on its own.

- HERMES presents approvals, coordinates the workshop flow, and reports status. HERMES does not independently approve permissions and does not execute around the Policy/Risk Layer.
- AEGIS issues the enforceable policy decision, including risk classification, approval requirements, execution constraints, escalation, suspension, and denial.
- AGENTROPOLIS-AGENT-MCP issues and enforces capabilities: permission enforcement, revalidation, commit control, revocation, and execution receipts.

Every capability an application may use comes from the capability layer, bound to an explicit approval. The workshop can request review, but it cannot grant what the policy and capability layers have not issued.

## User-visible lifecycle

- Drafting
- Building in sandbox
- Preview ready
- Capability requested
- Policy review
- Human approval required
- Shadow actions pending
- Revalidation required
- Commit authorized
- Committed with receipt
- Denied with receipt
- Cancelled with receipt
- Failed with receipt
- Rolled back with receipt

### What the states mean

- Drafting - the operator is describing the application with HERMES; nothing has been built yet.
- Building in sandbox - the application is constructed in an isolated workspace with no external access.
- Preview ready - a safe preview of the application and its intended behavior is available for review.
- Capability requested - the application's desired resource access has been submitted to the capability layer.
- Policy review - the Policy/Risk Layer classifies risk and issues the enforceable policy decision.
- Human approval required - approval of the exact proposed action bundle is required before anything executes.
- Shadow actions pending - proposed state-changing actions have been simulated and await review and approval.
- Revalidation required - the approval bundle is revalidated immediately before execution and again at commit time.
- Commit authorized - the policy and capability layers have authorized the atomic commit of the approved action.
- Committed with receipt - the action executed and produced a permanent receipt.
- Denied with receipt - the application or action was refused, permanently receipted.
- Cancelled with receipt - the application or action was cancelled, permanently receipted.
- Failed with receipt - the application or action failed, permanently receipted.
- Rolled back with receipt - the action was rolled back after drift or anomaly, permanently receipted.

No simulated result is presented as an actual external mutation. An approval binds to the exact simulated operation; any change to a bound field invalidates the approval and requires fresh review.

## Public security promise

Applications begin with no external access. Resource access is explicit, scoped, revocable, time-bounded, and auditable. State-changing actions are simulated first where supported, presented for review, revalidated before execution, and permanently receipted. Every terminal outcome - committed, denied, cancelled, failed, or rolled back - produces a receipt.

Cloudflare OS may be referenced as an open-source architectural influence. It does not replace HERMES or AGENTROPOLIS.
