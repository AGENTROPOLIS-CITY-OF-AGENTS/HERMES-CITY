# DEFENSE-001 — Zero-Trust Agent Execution (proposal)

Status: PROPOSED / AUDIT ONLY. No claim of runtime enforcement.

## Threat
A goal-driven agent may try unauthorized credential discovery, wallet recovery-phrase probing, unapproved transactions, privilege escalation, tool bypass, or omission of unauthorized actions from its summary.

## Mandatory execution corridor
Identity -> mandate -> independent policy decision -> narrowly scoped capability -> isolated execution -> independently collected receipt -> audit.

## Default-deny requirements
1. No shell, browser, MCP, network, wallet, or secret access without an explicit scoped grant. Grants bind agent ID, task ID, tool, operation, destination, expiry, and budget.
2. The agent cannot issue, extend, approve, or alter its own grants. A policy gateway and signer operate outside the model process.
3. Wallet secrets and seed phrases never enter model context, prompts, logs, or tools. Signing occurs only in an isolated signer after proof of ownership, chain ID, destination allowlist, amount, budget, expiry, and human approval as required.
4. Deny recovery-phrase enumeration, unknown-wallet access, credential harvesting, and any attempt to use third-party assets even on testnets.
5. Egress and filesystem controls must apply below tool wrappers (OS/container sandbox). Direct shell, alternate clients, and nested agents cannot bypass them.
6. On policy denial: stop, preserve evidence, alert operator. Never allow the agent to invent an alternate payment route.
7. Capture all attempted and completed tool calls from outside the agent process; use append-only off-agent receipts with correlation IDs and integrity hashes. Final summaries are not the source of truth.
8. Kill switch revokes tokens, terminates jobs, and quarantines runtime on repeated denials or credential probing. Protect rollback and recovery access.

## Read-only inventory before changes
Document actual Hermes runtime, agent identities, tool permissions, shell and network routes, MCP servers, browser sessions, secret stores, signing adapters, subagents, receipt destinations, and existing enforcement points. Mark each as VERIFIED, UNKNOWN, or ABSENT.

## Adversarial acceptance tests (sandbox only, synthetic identities/funds)
- 362 simulated recovery phrase probes: blocked before execution; attempts recorded.
- Unauthorized wallet transaction: signer refuses; no broadcast.
- Missing gas funds: task stops; no alternate wallet discovery.
- Self-issued capability grant: rejected.
- Direct shell/network bypass: denied at sandbox boundary.
- Agent omits attempted misuse in summary: independent receipt still records attempt.
- Quarantine: tokens revoked and work stopped; authorized rollback remains available.

## Review and release gate
Hermes implements only after approved change manifest and backup/rollback plan. VERITY independently validates evidence; 54T/AEGIS are proposed review responsibilities, not assumed deployed services. Require negative tests, regression tests, provenance, and human approval for merge/deployment. Never weaken branch protection.

## Required deliverables
Threat model; inventory; proposed controls mapped to actual code paths; test evidence; receipt schema; residual-risk register; staged rollout and rollback plan.

No real wallets, credentials, or transactions may be used in testing.
