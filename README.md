# HERMES CITY

Public coordination layer for the AGENTROPOLIS ecosystem.

HERMES CITY is the public-facing civic shell for agent-native commerce, ecosystem intelligence, model routing, MCP tooling, district recruitment, community participation, and the AGENTROPOLIS Social Transit Grid.

Agentropolis is the private city OS.  
HERMES CITY is the public signal layer.

---

## Public Pages

- `/` — HERMES CITY public civic shell and mini 3D Agentropolis
- `/community/` — HERMES Community participation and governed onboarding pathways
- `/social/` — public-safe architecture for the HERMES Social Surface and AGENTROPOLIS Social Transit Grid
- `/super-hermes/` — capability intelligence office

The private implementation repositories remain separate:

- `wiredchaos/AGENTROPOLIS-DOCK` — onboarding, review, district alignment, and admission logic
- `wiredchaos/HERMES-SOCIAL` — private social adapters, orchestration, authenticated sessions, and execution controls

---

## Purpose

HERMES CITY explains how autonomous agents, tools, wallets, workflows, model routers, MCP servers, social adapters, communities, and district recruiters can coordinate safely.

This repo is for public-safe architecture only.

It does not expose:

- private Agentropolis runtime code
- private orchestration details
- wallet keys
- social credentials or authenticated sessions
- client or citizen data
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
  -> tool / workflow / social / community lane
  -> validation
  -> receipt log
```

HERMES routes the work.  
HERMES does not replace Agentropolis.

---

## HERMES Community

The public community page explains how builders, creators, operators, communities, vendors, and partner ecosystems can participate without receiving direct access to the Intelligence Grid.

```text
Community signal
  -> HERMES intake
  -> AGENTROPOLIS-DOCK
  -> identity + purpose review
  -> district alignment
  -> policy gate
  -> approved participation
  -> permanent receipt
```

Participation may be open. Authority remains earned, scoped, revocable, and audited.

---

## HERMES Social Surface

The public social page documents the platform-agnostic Social Surface embedded in HERMES Desktop.

```text
External social channels
  -> API / browser / ingest adapters
  -> AGENTROPOLIS Ingest Membrane
  -> ASBE + policy checks
  -> normalized Social Event
  -> HERMES council
  -> ignore / analyze / draft / escalate / approve / execute
  -> permanent action receipt
```

Supported channel classes include Web2 social, community and messaging, and Web3 social protocols. Operational connectors, credentials, and authenticated sessions stay private in `HERMES-SOCIAL`.

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

Fast, narrow, always-on. Finds agents, builders, tools, workflows, MCP servers, creator apps, public demos, GitHub repositories, social signals, and ecosystem opportunities.

### LLM Closer

The persuasion and onboarding layer. Creates public replies, messages, onboarding copy, proposals, follow-up questions, and district invitations.

### ML Intern

The learning and scoring layer. Tracks lead quality, conversion signals, engagement, reputation, churn, useful patterns, and CHAOS RANK / AEO signals.

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

## Public-Safe Deployment Lanes

HERMES CITY may document optional local, cloud, model, and tool gateway lanes where they remain subordinate to HERMES Dispatch, the Model Council, the MCP Registry, and the Policy Gate.

Managed access must retain BYOK, BYOH, local-tool, and human-review fallback lanes.

---

## GitHub Pages

The site deploys automatically from `main` using `.github/workflows/pages.yml`.

The deployment contains static public files only. No production secrets, social tokens, wallet credentials, or private runtime configuration belong in this repository.

Live URL: https://wiredchaos.github.io/HERMES-CITY/

Public routes (verified):

- `/` — public civic shell and mini 3D Agentropolis
- `/community/` — HERMES Community participation and governed onboarding pathways
- `/social/` — public-safe architecture for the HERMES Social Surface and AGENTROPOLIS Social Transit Grid
- `/super-hermes/` — capability intelligence office

CI runs a validation job before every deployment (routes, local links, same-page anchors, HTML structure, accessibility gates, color contrast, canonical metadata, gitleaks secret scan). The deploy job is blocked until validation passes.

Local verification (no `make` required):

    python scripts/verify-site.py

---

## License

Apache License 2.0. See `LICENSE`.
