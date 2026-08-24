# AGENTROPOLIS Operational Triad Regression Test

## Status

Local regression test — NOT production-ready. Validates the HERMES / NEMOCLAW / NEMOTRON operational triad pattern against the smoke test that was run on 2026-08-01.

## What This Tests

This suite validates that the operational triad enforces its contracts:

- HERMES produces a complete 16-field execution packet
- NEMOCLAW executes only within bounded authority
- NEMOTRON independently verifies output and issues PASS / FAIL / QUARANTINE
- Receipts are created and memory writeback occurs
- No unauthorized file changes, financial authority, or role impersonation

## Files

```
tests/operational-triad/
  run_triad_tests.py          Test runner (positive + negative tests)
  test_report.json            Machine-readable report (generated on run)
  test_report.txt             Human-readable ASCII report (generated on run)
  README.md                   This file
  fixtures/
    expected_output.txt       Expected file content for smoke test
    expected_schema.json      Expected packet schema and validation rules
```

## Running

### Local (one command)

```bash
cd C:\Users\marqu\wiredchaos\HERMES-CITY && python tests/operational-triad/run_triad_tests.py
```

### Full suite with all output

```bash
cd C:\Users\marqu\wiredchaos\HERMES-CITY

# Run all tests, print ASCII report
python tests/operational-triad/run_triad_tests.py

# Machine-readable JSON output to stdout
python tests/operational-triad/run_triad_tests.py --json

# Minimal output (just the verdict)
python tests/operational-triad/run_triad_tests.py --quiet
```

Exit codes:
- 0 = all tests passed
- 1 = one or more tests failed
- 2 = harness error

## Test Inventory

### Positive Tests (3 suites)

| Test | What it verifies |
|------|-----------------|
| test_positive_full_triad | Full HERMES -> NEMOCLAW -> NEMOTRON cycle: doctrine retrieval, 16-field packet, bounded execution, exact output, PASS verdict, receipt, memory writeback, no financial authority, human authority retained |
| test_positive_existing_receipts_intact | The original 4 smoke test receipts + 1 memory entry are preserved on disk |
| test_positive_nemotron_verdicts | NEMOTRON can correctly issue PASS, FAIL, and QUARANTINE verdicts |

### Negative Tests (8 suites)

| Test | What it verifies |
|------|-----------------|
| test_negative_missing_mandate | Empty mandate -> packet validation fails -> restricted mode |
| test_negative_missing_contribution_mode | Empty contribution_mode -> packet validation fails -> restricted mode |
| test_negative_missing_authority_limits | Empty authority_limits -> packet validation fails -> restricted mode |
| test_negative_missing_receipt_destination | Empty receipt_destination -> packet validation fails -> restricted mode |
| test_negative_unauthorized_tool | NEMOCLAW requests git_commit or curl -> blocked by prohibited_actions / not in allowed_tools |
| test_negative_altered_output | NEMOCLAW writes wrong content -> NEMOTRON detects mismatch -> FAIL |
| test_negative_missing_evidence | No file created -> NEMOTRON file_exists check fails -> FAIL |
| test_negative_role_impersonation | HERMES cannot execute, NEMOCLAW cannot authorize, NEMOTRON cannot settle without evidence |

## Constraints

- Local workspace only — no network calls, no external services
- Does not modify core Hermes source
- Does not modify the existing smoke test artifacts (receipts, memory entry)
- Test workspaces use tempdir — cleaned up automatically
- No git operations performed by the test runner

## Rollback Instructions

To remove this test suite entirely:

```bash
cd C:\Users\marqu\wiredchaos\HERMES-CITY
rm -rf tests/operational-triad/
```

This removes all test files, fixtures, and generated reports. It does NOT touch:
- receipts/neuro/
- memory/genesis-rag-growth/
- config/neuro-operating-profile.json
- SOUL.md
- skins/agentropolis.yaml
- config.yaml
- triad-smoke-test.txt

The existing smoke test receipts and memory entry are preserved separately and are not affected by running or removing this test suite.

## Not Production-Ready

This is a local regression test that validates the triad pattern. It does not:
- connect to live MCP servers
- test real agent dispatch
- verify network isolation in production
- test against live Hermes runtime
- guarantee production deployment safety

## Canonical Success Condition

```
HERMES plans.
NEMOCLAW executes.
NEMOTRON verifies.
Human Mission Control retains authority.
Every contribution produces a receipt.
```
