# Git City Pulse Lane for HERMES CITY

**Status:** Integration candidate  
**Layer:** Public signal and development telemetry  
**Runtime:** Hermes Agent  
**Authority:** Human Mission Control

## City role

Git City Pulse becomes the **Development Pulse Exchange** for HERMES CITY. It visualizes that approved building activity is happening inside a VS Code workspace. It does not become an authority plane, an execution runtime, or a replacement for HERMES Dispatch.

```text
Human Mission Control
  -> approved HERMES CITY workspace
  -> Hermes Agent bounded execution
  -> VS Code file, terminal, task, test, and Git activity
  -> Git City Pulse extension
  -> public development signal
  -> HERMES CITY receipt correlation
```

## Designation

| Component | HERMES CITY role |
|---|---|
| Git City Pulse | Development activity visualization |
| Hermes Agent | Bounded builder and operator runtime |
| VS Code workspace | Local execution surface |
| HERMES Dispatch | Mandate normalization and routing |
| Mission Control | Human authority and approval plane |
| Receipt log | Evidence of the actual work performed |

## What the first integration does

The first release is a passive, local-first connection:

1. Open `wiredchaos/HERMES-CITY` in VS Code.
2. Run Hermes Agent inside that workspace through an approved terminal or ACP client.
3. Install and connect the Git City Pulse extension locally.
4. Allow Git City Pulse to observe supported editor activity.
5. Keep HERMES CITY receipts separate from Git City telemetry.

This makes HERMES CITY visibly active while Hermes works. It does not prove which actor performed every change unless the upstream extension provides that attribution.

## Truth boundary

Git City Pulse activity is a **presence signal**, not a verified execution receipt.

Do not infer any of the following from a pulse alone:

- that Hermes performed the action;
- that a task succeeded;
- that tests passed;
- that a deployment occurred;
- that Mission Control approved the work;
- that the repository is production-ready.

Only validated artifacts, tests, commit hashes, approvals, and receipt records may support those claims.

## Local configuration

Secrets and user-specific extension state must remain local.

```text
Allowed in repository:
  docs
  public-safe schemas
  example configuration
  workspace recommendations without credentials

Never commit:
  Git City API keys
  extension secret storage
  personal identifiers
  terminal output
  proprietary source snapshots
  private Agentropolis runtime data
```

## Phase 2 bridge

A deeper bridge may be built only when a supported Git City API, command, event, or extension interface is verified.

Target contract:

```text
Hermes task starts
  -> HERMES CITY creates task ID
  -> approved workspace activity occurs
  -> Git City receives non-sensitive pulse
  -> Hermes validates artifacts and tests
  -> receipt records task ID, commit, evidence, and outcome
  -> public city displays separate PULSE and VERIFIED states
```

Proposed public states:

- `OFFLINE` — no local pulse connection detected
- `PULSE` — development activity observed, outcome unverified
- `VALIDATING` — HERMES CITY is checking artifacts or tests
- `VERIFIED` — a receipt exists with evidence
- `BLOCKED` — policy, test, or approval gate failed

## Activation checklist

- [ ] Clone or open `wiredchaos/HERMES-CITY` in VS Code.
- [ ] Install Git City Pulse from the Visual Studio Marketplace.
- [ ] Connect the extension using local secret storage.
- [ ] Confirm Hermes Agent can operate in the same workspace.
- [ ] Run a harmless documentation edit.
- [ ] Confirm Git City shows activity.
- [ ] Confirm no key or private telemetry was added to Git.
- [ ] Record the actual file and commit evidence in a HERMES CITY receipt.

## Governance line

> Git City shows that the district is awake. Receipts prove what the district actually built.
