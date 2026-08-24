# Unreal MCP Public-Safe Routing

## Purpose

This document explains the public-safe coordination pattern for using Hermes with Unreal Engine inside the AGENTROPOLIS ecosystem.

HERMES CITY is the public signal and coordination layer. It may explain the route, publish safe status, recruit builders, and describe approved capabilities. It does not expose private runtime code, project secrets, credentials, local endpoints, proprietary prompts, client data, wallet authority or unrestricted editor controls.

Canonical city contract:

`AGENTROPOLIS-CITY-OF-AGENTS/agentropolis/docs/UNREAL_MCP_CITY_INTEGRATION.md`

## Public-safe pattern

```text
operator intent
  -> HERMES Dispatch
  -> Model Council routing
  -> MCP Registry
  -> policy gate
  -> Creator / ASBE production contract
  -> local Unreal execution lane when approved
  -> validation
  -> receipt
  -> public-safe status or approved media
```

HERMES routes the work. HERMES does not replace AGENTROPOLIS, Creator, ASBE, the Gaming District, or the MCP authority membrane.

## What may be public

HERMES CITY may publish:

- high-level architecture diagrams
- approved capability descriptions
- non-sensitive installation references
- status labels such as proposed, pilot, testing, approved or disabled
- approved screenshots and renders
- public release notes
- builder and recruiter calls
- sanitized receipt summaries
- approved package names and versions
- known limitations
- public incident notices after review

## What must remain private

Do not publish:

- local machine addresses beyond generic loopback examples
- workstation identity or network details
- private project paths
- unpublished asset inventories
- credentials, API keys or wallet keys
- private MCP manifests
- unrestricted tool schemas when disclosure creates risk
- client or user data
- proprietary prompts or hidden strategy
- unreleased source code
- internal risk scores
- private approval identities
- raw audit logs containing sensitive data

Public explanation is not public access.

## Routing roles

| Layer | Public-safe role |
| --- | --- |
| AGENTROPOLIS Mission Control | States that mandates, authority, review and receipts govern execution |
| HERMES Dispatch | Explains that approved requests are routed to the correct model and tool lane |
| Model Council | Describes provider-independent selection without exposing private credentials or strategy |
| MCP Registry | States that tools are registered, scoped and checked before use |
| AGENTROPOLIS-CREATOR | Describes the Foundry role for worlds, assets and production packets |
| ASBE | Describes scenes, shots, Sequencer planning and PBX handoffs |
| Unreal MCP | Describes a local editor execution adapter, not an autonomous authority |
| Gaming / Social / GTM | Describes approved consumer applications and distribution surfaces |

## Public capability card

```text
Name: UNREAL MCP LANE
Role: Local Unreal Editor execution adapter
Status: DISABLED BY DEFAULT
Scope: Approved inspection, scene construction, simulation, rendering and export
Authority: AGENTROPOLIS Mission Control + MCP policy gate
Network: Local-only by default
Evidence: Structural validation + visual review + receipt
```

This card is descriptive. It is not an activation command.

## Public operator guidance

A safe public explanation should use this sequence:

```text
1. Define the world or production goal.
2. Compile the request into a Creator or ASBE contract.
3. Route through HERMES.
4. Check tool authority through the MCP registry.
5. Execute locally and serially.
6. Verify the resulting Unreal state.
7. Save only within approved roots.
8. Produce a receipt.
9. Publish only after separate approval.
```

Never imply that installing a connector grants production authority.

## Installation reference

Public documentation may reference the current Hermes installation pattern:

```bash
hermes skills install official/creative/unreal-mcp
hermes mcp install unreal-engine
```

Public documentation must also state:

- the editor-side plugins and local server must be configured separately
- versions and requirements must be verified against the current upstream guide
- the server should remain local by default
- installation does not grant write, export, deployment, wallet or publishing authority
- production use requires AGENTROPOLIS policy registration and approval

Upstream guide:

`https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-unreal-mcp`

## Public status model

Use one of these states:

```text
PROPOSED
DOCUMENTED
DISABLED
READ_ONLY_PILOT
ISOLATED_DRAFT_PILOT
PRODUCTION_REVIEW
APPROVED_LIMITED
SUSPENDED
RETIRED
```

Do not use `LIVE` unless the exact capability, environment, approval scope and evidence have been verified.

## Sanitized receipt summary

A public receipt may include:

```json
{
  "receipt": "public-reference",
  "lane": "unreal-mcp",
  "status": "validated",
  "operation_class": "DRAFT | SIMULATE | RENDER",
  "project_alias": "approved-public-alias",
  "outputs": [],
  "validation": "passed | partial | failed",
  "approved_for_publication": false,
  "timestamp": "iso-8601"
}
```

It must omit secrets, private paths, private identities, hidden prompts, credentials and sensitive raw logs.

## Recruitment lane

The Creator, Gaming, MCP and Studio recruiters may identify builders for:

- Unreal environment design
- technical art
- Blueprint development
- Sequencer and cinematic production
- material and lighting work
- gameplay prototyping
- automation testing
- MCP adapter security
- performance validation
- rights and provenance operations

Recruitment flow:

```text
public builder signal
  -> SLM scout
  -> ML intern scoring
  -> LLM closer outreach
  -> human review when required
  -> district onboarding
  -> bounded test assignment
  -> receipt and reputation
```

Recruitment never grants access to private projects or production tools by default.

## Public incident language

When a lane is paused or fails, publish factual status without inventing certainty.

Recommended pattern:

```text
The Unreal MCP lane is currently suspended while the team validates [specific boundary]. No production authority is active through this lane. Existing approved packages remain subject to their original receipts and rollback controls.
```

Do not describe a freeze, tool error, uncertain state or failed receipt as a successful deployment.

## Consumer messaging

### Gaming

Public copy may say that Gaming consumes approved Unreal worlds and cinematics. It must also state that gameplay identity, inventory, rewards, reputation and settlement remain governed outside the editor lane.

### Social

Public copy may say that Social consumes approved rooms, avatars, captures and performances. A social prompt does not directly mutate a production project.

### GTM

Public copy may say that GTM distributes approved trailers, demos and campaigns. Creation approval and distribution approval are separate.

## Forbidden positioning

Do not claim:

- Unreal MCP is the AGENTROPOLIS brain
- Hermes has unrestricted control of Unreal
- any public user can prompt production changes directly
- tool connectivity equals authorization
- an editor response proves a successful world change without verification
- a generated asset is rights-cleared without evidence
- a game or NPC controls city governance
- an install command activates production access

## Initial public release package

The first public-safe package should contain:

1. one architecture diagram
2. one capability card
3. one isolated pilot description
4. one approved screenshot or render
5. one sanitized receipt summary
6. one explicit limitations section
7. one builder recruitment call
8. one link to the upstream installation guide

Do not publish private project files or raw execution logs as proof.

## Canon lock

```text
HERMES CITY publishes the signal.
HERMES Dispatch routes the request.
MCP checks authority.
Creator defines the production package.
ASBE coordinates scenes and shots.
Unreal executes approved local operations.
AGENTROPOLIS remains the authority.
```

Public visibility is not public control.
