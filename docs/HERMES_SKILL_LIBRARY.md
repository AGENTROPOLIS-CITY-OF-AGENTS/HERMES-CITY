# Hermes Skill Library

Hermes Skill Library is the model-agnostic operating layer for Hermes City and Agentropolis.

It is not dependent on Claude, CLAD, or any single vendor runtime.

## Purpose

Hermes acts as the COO and Chief Orchestrator for agent work:

- routes tasks to the correct agent or skill
- keeps memory, permissions, and audit trails clean
- coordinates GitHub, MCP, wallet, browser, calendar, and search tools
- reduces hallucination by forcing assumptions, evidence, and risk checks
- turns repeatable workflows into reusable operational skills

## Root Workspace

```txt
hermes-skill-library/
├── HERMES.md                  global Hermes doctrine, operator rules, tone, standards
├── session-log.md             session memory, decisions, active tasks, unresolved questions
├── master-az-index.md         every skill, owner, command, source, dependency
├── anti-moloch.md             hallucination control, drift checks, safety gates
├── install.md                 setup instructions for model-agnostic runtimes
└── README.md                  public overview
```

## Operator Command Kernel

The canonical operator-controlled reasoning protocol is:

```txt
docs/HERMES_NEURO_COMMAND_KERNEL.md
```

It provides model-agnostic slash-command modes for:

- `/TRUTHMODE`
- `/ELI10`
- `/REDTEAM`
- `/HORMOZI`
- `/HUMAN`
- `/FUTUREYOU`
- `/UNLEARN`
- `/80/20`
- `/SOCRATES`
- `/LINDYMODE`

The kernel preserves human authority, evidence discipline, Anti-Moloch review, permission boundaries, and the HERMES execution chain:

```txt
Identity → Mandate → Plan → Execute → Receipt → Audit
```

## Skills

```txt
skills/
├── core-ops/
│   ├── task-router.md
│   ├── delegation-manager.md
│   ├── mission-brief-extractor.md
│   ├── assumption-auditor.md
│   ├── output-reviewer.md
│   └── shipping-gate.md
│
├── agent-governance/
│   ├── role-charter.md
│   ├── permission-model.md
│   ├── escalation-rules.md
│   ├── audit-log.md
│   ├── drift-detector.md
│   └── red-team-review.md
│
├── memory-system/
│   ├── memory-stack.md
│   ├── session-recall.md
│   ├── project-context.md
│   ├── salience-filter.md
│   ├── forgetting-policy.md
│   └── cross-session-sync.md
│
├── builder-skills/
│   ├── repo-analyzer.md
│   ├── github-updater.md
│   ├── issue-writer.md
│   ├── feature-planner.md
│   ├── pr-reviewer.md
│   ├── deployment-checklist.md
│   └── release-notes.md
│
├── business-ops/
│   ├── business-model-builder.md
│   ├── offer-stack.md
│   ├── pricing-strategy.md
│   ├── client-intake.md
│   ├── invoice-writer.md
│   └── deliverable-review.md
│
├── creator-ops/
│   ├── caption-writer.md
│   ├── x-thread-builder.md
│   ├── carousel-builder.md
│   ├── video-script.md
│   ├── brand-voice.md
│   └── campaign-planner.md
│
├── research-council/
│   ├── source-checker.md
│   ├── claim-validator.md
│   ├── timeline-builder.md
│   ├── swot-analyzer.md
│   └── perspective-review.md
│
├── finance-tax/
│   ├── tax-organizer.md
│   ├── csv-categorizer.md
│   ├── audit-file-builder.md
│   ├── entity-review.md
│   └── client-note-writer.md
│
├── agent-wallet/
│   ├── wallet-policy.md
│   ├── payment-router.md
│   ├── spending-limits.md
│   ├── approval-gates.md
│   └── transaction-audit.md
│
└── city-districts/
    ├── agentropolis.md
    ├── hermes-city.md
    ├── terra54.md
    ├── boardforge.md
    ├── neura.md
    └── creator-codex.md
```

## Agents

```txt
agents/
├── hermes-coo.md              orchestration, prioritization, operator alignment
├── nemomclaw-builder.md       engineering, implementation, repo execution
├── research-council.md        evidence, citations, source validation
├── xrpl-whisperer.md          ledger guidance, FEN and XRPL execution support
├── economic-executor.md       wallet policy and payment execution with approvals
└── district-steward.md        per-district governance and context isolation
```

## MCP Integrations

```txt
mcp/
├── github.md                  repo read/write, issues, PRs, release notes
├── filesystem.md              local project context and artifact handling
├── browser.md                 live verification and source capture
├── search.md                  web and research retrieval
├── wallet.md                  transaction proposals and spending gates
├── gmail.md                   operator communication workflows
├── calendar.md                scheduling and execution cadence
└── crm.md                     leads, clients, contacts, pipeline state
```

## Commands

```txt
commands/
├── brief.md                   extract mission brief from messy input
├── decompose.md               break large objective into milestones
├── audit.md                   assumptions, risks, missing evidence
├── ship.md                    final quality gate before delivery
├── redteam.md                 adversarial review
├── update-github.md           repo update protocol
├── memory-sync.md             preserve important decisions
└── route.md                   choose agent, skill, and tool path
```

## Anti-Moloch Protocol

Every Hermes skill must answer four questions before shipping:

1. What is known?
2. What is assumed?
3. What can go wrong?
4. What needs human approval?

No fake certainty. No vendor lock. No hidden dependency on Claude or CLAD.

## Agentropolis Fit

Hermes Skill Library is the local operational brain of Hermes City.

Agentropolis remains the full city-scale coordination layer. Hermes City is the mini-city and execution district where agent skills, MCP integrations, memory, governance, and builder workflows are tested before scaling into the larger Agentropolis system.
