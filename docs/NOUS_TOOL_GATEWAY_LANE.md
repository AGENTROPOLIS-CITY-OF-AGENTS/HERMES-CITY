# Nous Tool Gateway Lane

Public-safe architecture note for connecting HERMES CITY to the Nous Tool Gateway.

## Purpose

The Nous Tool Gateway is an optional managed capability lane that can give Hermes agents access to external providers through one gateway surface.

It is infrastructure.

It is not:

- the Agentropolis city OS
- HERMES Dispatch
- the policy authority
- the memory layer
- the identity registry
- a wallet authority
- permission to execute without review

Its role is to expose approved provider capabilities behind centralized authentication, routing, rate limits, observability, validation, and receipt requirements.

## Placement in the Grid

```text
Human Mission Control
  -> mandate + policy + budget
  -> HERMES Dispatch
  -> Model Council
  -> MCP Registry
  -> Policy Gate
  -> Nous Tool Gateway if approved
  -> provider or tool
  -> validation
  -> receipt log
```

The gateway sits below policy and routing, and above third-party providers.

## Initial Provider Classes

The public provider surface may include:

- browser automation
- website crawling and structured extraction
- media generation
- web search
- document and file tools
- code execution
- databases and APIs
- custom MCP-style integrations

Named providers such as Browser Use, Firecrawl, and fal.ai are capability candidates, not permanent dependencies. Availability, pricing, quotas, and terms must be verified in the operator dashboard before production use.

## Authority Levels

```text
READ_ONLY
  Search, inspect, crawl, retrieve, or summarize.

DRAFT_ONLY
  Generate a candidate artifact without submitting it.

ASSISTED_ACTION
  Execute only after explicit operator approval.

BOUNDED_AUTOMATION
  Execute within pre-approved scope, rate, budget, and destination limits.

HIGH_RISK_MANUAL
  Stop and return a human-readable digest.
```

No model output may route directly into a consequential tool action.

## Sovereign Fallback Pattern

```text
Nous Tool Gateway
  -> BYOK provider adapter
  -> BYOH or self-hosted tool lane
  -> local tool
  -> queue for human review
```

The managed gateway is an acceleration lane, not a single point of authority or permanent dependency.

## Required Controls

- scoped credentials per provider
- per-agent budgets and rate limits
- domain and destination allowlists
- explicit approval for destructive or externally visible actions
- provider health and quota checks
- output validation before publish, merge, deploy, payment, or wallet action
- immutable or append-only receipts where practical
- emergency disable switch
- no secrets committed to GitHub

## Environment Contract

Use placeholders in documentation only.

```text
NOUS_TOOL_GATEWAY_ENABLED=false
NOUS_TOOL_GATEWAY_MODE=operator_approved
NOUS_TOOL_GATEWAY_BUDGET_USD=0
NOUS_TOOL_GATEWAY_ALLOWED_PROVIDERS=
NOUS_TOOL_GATEWAY_ALLOWED_DOMAINS=
NOUS_TOOL_GATEWAY_RECEIPTS=required
```

Real credentials belong in approved secret managers or runtime credential stores.

## Receipt Shape

```json
{
  "workflow": "nous_tool_gateway",
  "agent_id": "policy_resolved",
  "provider": "selected_by_policy",
  "capability": "selected_by_policy",
  "authority_level": "READ_ONLY",
  "budget_checked": true,
  "policy_approved": true,
  "validated": true,
  "receipt_logged": true
}
```

## Activation Prompt

```text
Route this public-safe workflow through the Nous Tool Gateway only when the requested capability is approved, credentials are scoped, budget and destination limits pass policy, output validation is available, and a receipt will be logged. Otherwise use a BYOK, BYOH, local, or human-review fallback.
```

## Decision Lock

The Nous Tool Gateway is a managed external capability corridor for Hermes agents.

It is not the brain.
It is not the memory layer.
It is not the permission system.
It does not replace Mission Control, HERMES Dispatch, MCP governance, validation, or receipts.
