# Hermes Pattern Authority Matrix

| Pattern | Default | May read | May write | Credential rule | Independent review | Production authority |
|---|---|---|---|---|---|---|
| Tool-permission authority | R2 | Scoped | Scoped | Per-tool, least privilege | VERITY + AEGIS | No by default |
| Builder/auditor separation | R1 | Workspace | Review artifacts | Separate identities | VERITY | No |
| Shared durable memory | R1 | Approved vault | Append via governed path | No raw secrets | VERITY | No |
| Persistent cron ops | R2 | Approved sources | Bounded destinations | Dedicated service credentials | AEGIS | Explicit grant |
| Mobile operator surface | R2 | Status | Approval/steer commands | User-bound session | AEGIS | No direct root |
| Skill emergence | R2 | Test corpus | Candidate skill only | No inherited production creds | VERITY + SENTINEL-6 | Only after signed promotion |
| Runtime rollback | R1 | Checkpoints | Reversible workspace state | Local/runtime scoped | SENTINEL-6 | N/A |
| Signed tool verification | R2 | Tool metadata | Registry status | Publisher/verifier separation | VERITY + AEGIS | After verification |
| Local-first runtime | R1 | Local approved data | Local workspace | Device-scoped | AEGIS | Bounded |
| Cost-aware routing | R0 | Metrics | Routing metadata | None | VERITY | N/A |
| Market evidence | R3 | Market/data sources | Evidence records | Separate from execution creds | VERITY + AEGIS | Human/policy-gated only |

## Non-negotiable distinctions

- Presentation != Authentication != Authority
- Installed != Loaded != Live != Authorized
- Configured != Reachable
- Enrolled != Compliant
- Released != Production Ready
- Execution != Evidence
- Community adoption != AGENTROPOLIS approval
- Recommendation != transaction
- Signal != order
