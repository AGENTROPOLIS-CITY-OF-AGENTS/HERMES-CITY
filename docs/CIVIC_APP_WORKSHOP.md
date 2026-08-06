# HERMES Civic App Workshop

The Civic App Workshop is the public-safe HERMES surface for requesting, previewing, reviewing, and approving isolated applications generated through the AGENTROPOLIS Civic Foundry Runtime.

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

## User-visible states

- Drafting
- Building in sandbox
- Preview ready
- Capability requested
- Shadow actions pending
- Revalidation required
- Approved for commit
- Committed with receipt
- Rejected or rolled back

## Public security promise

Applications begin with no external access. Resource access is explicit, scoped, revocable, time-bounded, and auditable. State-changing actions are simulated first where supported, presented for review, revalidated before execution, and permanently receipted.

Cloudflare OS may be referenced as an open-source architectural influence. It does not replace HERMES or AGENTROPOLIS.