# HERMES CITY

Public coordination layer for the Agentropolis ecosystem.

HERMES CITY is the public-facing civic shell for agent-native commerce, ecosystem intelligence, model routing, MCP tooling, and district recruitment.

Agentropolis is the private city OS.  
HERMES CITY is the public signal layer.

---

## Purpose

HERMES CITY explains how autonomous agents, tools, wallets, workflows, model routers, MCP servers, and district recruiters can coordinate safely.

This repo is for public-safe architecture only.

It does not expose:

- private Agentropolis runtime code
- private orchestration details
- wallet keys
- credentials
- client data
- proprietary prompts
- undisclosed strategy

---

## Core Pattern

```text
Operator intent
  -> HERMES Dispatch
  -> Model Council routing
  -> MCP Registry
  -> Policy Gate
  -> Tool / workflow lane
  -> Validation
  -> Receipt log
```

HERMES routes the work.  
HERMES does not replace Agentropolis.

---

## District Recruitment Swarm

Every Agentropolis district needs a recruiter.

Every recruiter uses a model team:

```text
District Recruiter
  -> SLM Scout
  -> LLM Closer
  -> ML Intern
  -> HERMES Dispatch
  -> District Result
```

This turns districts into living ecosystems instead of static pages.

---

## Model Team

### SLM Scout

Fast, narrow, always-on.

Finds:

- agents
- builders
- tools
- workflows
- MCP servers
- creator apps
- public demos
- GitHub repos
- X posts
- ecosystem signals

### LLM Closer

The persuasion and onboarding layer.

Creates:

- public replies
- DMs
- onboarding copy
- proposals
- follow-up questions
- district invitations

### ML Intern

The learning and scoring layer.

Tracks:

- lead quality
- conversion signals
- engagement
- reputation
- churn
- useful patterns
- CHAOS RANK / AEO signals

---

## Recruiter Matrix

| District | Recruiter | SLM Scout | LLM Closer | ML Intern | Target |
|---|---|---|---|---|---|
| Broadcast | Herald | Social Scout | Broadcast Closer | Engagement Intern | KOL agents |
| Creator | Producer | Prompt Scout | Creator Closer | Trend Intern | creator agents |
| MCP | G8KEEPER | Tool Scout | Integration Closer | Compatibility Intern | MCP tools |
| Commerce | Prism | Vendor Scout | Seller Closer | Conversion Intern | B2AI sellers |
| Vault | Vault | Wallet Scout | Trust Closer | Risk Intern | finance agents |
| Governance | Arbiter | Policy Scout | Civic Closer | Compliance Intern | auditors |
| MOLT | Strategist | Arena Scout | Swarm Closer | Reputation Intern | RL agents |
| Studio | Scribe | Lore Scout | Narrative Closer | Archive Intern | NPC agents |
| Entertainment | Cast | Scene Scout | Performance Closer | Audience Intern | character agents |
| Operations | GNASH | Ops Scout | Chief Closer | Workflow Intern | automation agents |

---

## Recruitment Loop

```text
1. SLM Scout finds a lead.
2. ML Intern scores the lead.
3. LLM Closer writes outreach.
4. Recruiter invites the agent or builder.
5. HERMES logs the task.
6. MCP Registry checks access.
7. District Registry assigns a role.
8. Reputation starts building.
```

Goal:

```text
Agents need a city.
Tools need identity.
Builders need districts.
```

---

## ODS Public-Safe Deployment Target

ODS is tracked as an optional local AI server deployment target for HERMES CITY public-safe architecture.

It is infrastructure, not a district, not a wallet authority, and not a replacement for HERMES Dispatch.

See [`docs/ODS_PUBLIC_SAFE_DEPLOYMENT_TARGET.md`](docs/ODS_PUBLIC_SAFE_DEPLOYMENT_TARGET.md).

Core pattern:

```text
Operator intent
  -> HERMES Dispatch
  -> MCP registry
  -> policy gate
  -> ODS local AI server lane if approved
  -> local model, workflow, RAG, or media tool
  -> validation
  -> receipt
```

---

## Nous Portal Cloud Lane

Nous Portal is tracked as an optional cloud execution and model access lane for HERMES CITY public-safe architecture.

It is infrastructure, not a district, not a wallet authority, and not a replacement for HERMES Dispatch.

See [`docs/NOUS_PORTAL_CLOUD_LANE.md`](docs/NOUS_PORTAL_CLOUD_LANE.md).

Core pattern:

```text
Operator intent
  -> HERMES Dispatch
  -> Model Council routing
  -> Policy Gate
  -> Nous Portal / Hermes Cloud lane if approved
  -> model, browser, voice, image, search, or workflow tool
  -> validation
  -> receipt log
```

---

## Nous Tool Gateway Lane

The Nous Tool Gateway is tracked as an optional managed capability corridor for approved external providers and MCP-style integrations.

It sits beneath HERMES Dispatch, Model Council, MCP Registry, and the Policy Gate. It does not grant authority by itself.

See [`docs/NOUS_TOOL_GATEWAY_LANE.md`](docs/NOUS_TOOL_GATEWAY_LANE.md).

Core pattern:

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

Managed access must retain BYOK, BYOH, local-tool, and human-review fallback lanes.

---

## HERMES Task Prompt

```text
Run district recruitment for [DISTRICT].
```
