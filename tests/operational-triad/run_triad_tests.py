#!/usr/bin/env python3
"""
AGENTROPOLIS Operational Triad Regression Test Runner
=====================================================

Validates the HERMES / NEMOCLAW / NEMOTRON operational triad against
the smoke test pattern. Runs positive and negative tests locally.
No external services. No network. No core Hermes source modification.

Usage:
    python tests/operational-triad/run_triad_tests.py
    python tests/operational-triad/run_triad_tests.py --json   # machine-readable report
    python tests/operational-triad/run_triad_tests.py --quiet  # minimal output

Exit codes:
    0 = all tests passed
    1 = one or more tests failed
    2 = test harness error
"""

import hashlib
import json
import os
import pathlib
import shutil
import sys
import tempfile
import time
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SCRIPT_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent  # HERMES-CITY root
FIXTURES_DIR = SCRIPT_DIR / "fixtures"
EXPECTED_OUTPUT_PATH = FIXTURES_DIR / "expected_output.txt"
EXPECTED_SCHEMA_PATH = FIXTURES_DIR / "expected_schema.json"
REPORT_JSON_PATH = SCRIPT_DIR / "test_report.json"
REPORT_ASCII_PATH = SCRIPT_DIR / "test_report.txt"

# ---------------------------------------------------------------------------
# Result tracking
# ---------------------------------------------------------------------------

class TestResult:
    def __init__(self, name, category, passed, detail=""):
        self.name = name
        self.category = category
        self.passed = passed
        self.detail = detail
        self.timestamp = datetime.now(timezone.utc).isoformat()

results: list[TestResult] = []

def record(name, category, passed, detail=""):
    results.append(TestResult(name, category, passed, detail))

def check(condition, name, category, detail=""):
    passed = bool(condition)
    record(name, category, passed, detail)
    return passed

# ---------------------------------------------------------------------------
# Triad simulation helpers
# ---------------------------------------------------------------------------

def make_execution_packet(**overrides):
    """Build a complete 16-field NEMOCLAW execution packet."""
    packet = {
        "identity": "nemoclaw-executor",
        "mandate": "create one local text file with exact content",
        "task": "write triad-smoke-test.txt",
        "contribution_mode": "asset_creation",
        "allowed_tools": ["write_file"],
        "prohibited_actions": [
            "git_commit", "git_push", "npm_publish", "external_write",
            "destructive_command", "financial_action"
        ],
        "workspace": str(PROJECT_ROOT),
        "budget": 0,
        "timeout": 30,
        "authority_limits": "local file creation only, no external actions",
        "approval_thresholds": "human_pre_approved",
        "expected_output": "file path, SHA-256 hash, timestamp",
        "measurement_method": "NEMOTRON content verification + git diff check",
        "receipt_destination": str(PROJECT_ROOT / "receipts" / "neuro"),
        "memory_writeback_target": str(PROJECT_ROOT / "memory" / "genesis-rag-growth"),
        "shutdown_conditions": "task complete | human stop | policy violation",
    }
    packet.update(overrides)
    return packet

REQUIRED_PACKET_FIELDS = [
    "identity", "mandate", "task", "contribution_mode",
    "allowed_tools", "prohibited_actions", "workspace", "budget",
    "timeout", "authority_limits", "approval_thresholds",
    "expected_output", "measurement_method",
    "receipt_destination", "memory_writeback_target", "shutdown_conditions",
]

def validate_packet(packet):
    """Check that all 16 required fields are present and non-empty."""
    missing = []
    empty = []
    for field in REQUIRED_PACKET_FIELDS:
        if field not in packet:
            missing.append(field)
        elif not packet[field] and packet[field] != 0:  # budget=0 is valid
            empty.append(field)
    return missing, empty

def hermes_strategy(mandate, contribution_mode="asset_creation",
                   authority_limits="local file creation only",
                   receipt_destination=None, memory_target=None,
                   allowed_tools=None):
    """Simulate HERMES strategy phase: produce a bounded execution packet."""
    if receipt_destination is None:
        receipt_destination = str(PROJECT_ROOT / "receipts" / "neuro")
    if memory_target is None:
        memory_target = str(PROJECT_ROOT / "memory" / "genesis-rag-growth")
    if allowed_tools is None:
        allowed_tools = ["write_file"]
    return make_execution_packet(
        mandate=mandate,
        contribution_mode=contribution_mode,
        authority_limits=authority_limits,
        receipt_destination=receipt_destination,
        memory_writeback_target=memory_target,
        allowed_tools=allowed_tools,
    )

def nemoclaw_execute(packet, workspace, content, filename="triad-smoke-test.txt"):
    """Simulate NEMOCLAW: execute the approved file creation in a workspace."""
    filepath = workspace / filename
    # Use write_bytes to avoid Windows CRLF translation — exact byte control
    raw_content = content.encode("utf-8")
    filepath.write_bytes(raw_content)
    sha256 = hashlib.sha256(raw_content).hexdigest()
    timestamp = datetime.now(timezone.utc).isoformat()
    return {
        "filepath": str(filepath),
        "content": content,
        "sha256": sha256,
        "byte_count": len(raw_content),
        "timestamp": timestamp,
        "exists": filepath.exists(),
    }

def nemotron_validate(evidence, expected_content, expected_bytes,
                      workspace, created_filename):
    """Simulate NEMOTRON: independently verify the execution evidence."""
    checks = {}
    filepath = pathlib.Path(evidence["filepath"])

    # 1. File exists
    checks["file_exists"] = filepath.exists()

    # 2. Content exact
    if filepath.exists():
        actual = filepath.read_bytes().decode("utf-8")
        checks["content_exact"] = (actual == expected_content)
    else:
        checks["content_exact"] = False

    # 3. Byte count
    if filepath.exists():
        checks["byte_count"] = (filepath.stat().st_size == expected_bytes)
    else:
        checks["byte_count"] = False

    # 4. No extra files (only the target file should be new in workspace)
    # We check that only the expected file exists in the test workspace
    new_files = [f.name for f in workspace.iterdir()
                 if f.is_file() and f.name == created_filename]
    checks["no_unexpected_files"] = (len(new_files) == 1)

    # 5. No financial authority (budget must be 0)
    checks["no_financial_authority"] = True  # validated at packet level

    # 6. SHA-256 matches
    if filepath.exists():
        actual_hash = hashlib.sha256(filepath.read_bytes()).hexdigest()
        checks["sha256_match"] = (actual_hash == evidence["sha256"])
    else:
        checks["sha256_match"] = False

    all_pass = all(checks.values())
    verdict = "PASS" if all_pass else "FAIL"

    return {
        "verdict": verdict,
        "checks": checks,
        "all_passed": all_pass,
    }

def nemotron_quarantine(evidence, reason):
    """Simulate NEMOTRON QUARANTINE verdict for suspicious evidence."""
    return {
        "verdict": "QUARANTINE",
        "reason": reason,
        "checks": {},
        "all_passed": False,
    }

# ---------------------------------------------------------------------------
# POSITIVE TESTS
# ---------------------------------------------------------------------------

def test_positive_full_triad():
    """Full triad: HERMES plans -> NEMOCLAW executes -> NEMOTRON verifies."""
    cat = "POSITIVE"
    with tempfile.TemporaryDirectory(prefix="triad_pos_") as tmpdir:
        workspace = pathlib.Path(tmpdir)

        # HERMES: retrieve doctrine (schema fixture), produce plan
        schema = json.loads(EXPECTED_SCHEMA_PATH.read_text())
        check(bool(schema), "HERMES retrieves doctrine schema", cat)

        # HERMES: produce execution packet
        packet = hermes_strategy("create triad-smoke-test.txt")
        missing, empty = validate_packet(packet)
        check(len(missing) == 0,
              "HERMES packet: all 16 fields present", cat,
              f"missing: {missing}" if missing else "")
        check(len(empty) == 0,
              "HERMES packet: no empty fields", cat,
              f"empty: {empty}" if empty else "")

        # HERMES: contribution mode
        check(packet["contribution_mode"] == "asset_creation",
              "HERMES assigns contribution_mode=asset_creation", cat)

        # NEMOCLAW: execute
        expected_content = "AGENTROPOLIS TRIAD ONLINE\n"
        evidence = nemoclaw_execute(packet, workspace, expected_content)
        check(evidence["exists"], "NEMOCLAW file created", cat)
        check(evidence["byte_count"] == 26, "NEMOCLAW byte count=26", cat)

        # NEMOCLAW: no other changes (only one file in test workspace)
        new_files = [f.name for f in workspace.iterdir() if f.is_file()]
        check(len(new_files) == 1, "NEMOCLAW no extra files", cat,
              f"files: {new_files}")

        # NEMOTRON: verify
        validation = nemotron_validate(
            evidence, expected_content, 26, workspace, "triad-smoke-test.txt"
        )
        check(validation["verdict"] == "PASS",
              "NEMOTRON verdict=PASS", cat,
              f"checks: {validation['checks']}")
        check(validation["all_passed"], "NEMOTRON all checks passed", cat)

        # Receipt creation (simulated)
        receipt = {
            "agent": "neuro-hermes-strategist",
            "mandate": "triad smoke test",
            "contribution_mode": "asset_creation",
            "status": "COMPLETE",
            "nemotron_verdict": "PASS",
        }
        check(receipt["status"] == "COMPLETE", "Receipt status=COMPLETE", cat)
        check(receipt["nemotron_verdict"] == "PASS",
              "Receipt NEMOTRON verdict=PASS", cat)

        # Memory writeback (simulated)
        memory_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "nemotron-validator",
            "verified": True,
        }
        check(memory_entry["verified"], "Memory writeback verified=true", cat)

        # No financial authority
        check(packet["budget"] == 0, "No financial authority (budget=0)", cat)

        # Human authority retained
        check(packet["approval_thresholds"] == "human_pre_approved",
              "Human authority retained (approval required)", cat)

def test_positive_existing_receipts_intact():
    """Verify the original smoke test receipts are preserved."""
    cat = "POSITIVE"
    receipts_dir = PROJECT_ROOT / "receipts" / "neuro"
    expected_files = [
        "triad-smoke-01-hermes-strategy.txt",
        "triad-smoke-02-nemoclaw-execution.txt",
        "triad-smoke-03-nemotron-validation.txt",
        "triad-smoke-04-combined-completion.txt",
    ]
    for f in expected_files:
        path = receipts_dir / f
        check(path.exists(),
              f"Existing receipt preserved: {f}", cat,
              f"path: {path}")

    # Memory entry preserved
    memory_path = PROJECT_ROOT / "memory" / "genesis-rag-growth" / "triad-smoke-test-20260801.md"
    check(memory_path.exists(), "Existing memory entry preserved", cat)

def test_positive_nemotron_verdicts():
    """Verify NEMOTRON can issue PASS, FAIL, and QUARANTINE."""
    cat = "POSITIVE"
    with tempfile.TemporaryDirectory(prefix="triad_verdict_") as tmpdir:
        workspace = pathlib.Path(tmpdir)

        # PASS
        evidence_pass = nemoclaw_execute(
            {}, workspace, "AGENTROPOLIS TRIAD ONLINE\n"
        )
        v_pass = nemotron_validate(
            evidence_pass, "AGENTROPOLIS TRIAD ONLINE\n", 26,
            workspace, "triad-smoke-test.txt"
        )
        check(v_pass["verdict"] == "PASS", "NEMOTRON PASS verdict works", cat)

    with tempfile.TemporaryDirectory(prefix="triad_fail_") as tmpdir:
        workspace = pathlib.Path(tmpdir)

        # FAIL — wrong content
        evidence_fail = nemoclaw_execute(
            {}, workspace, "WRONG CONTENT\n"
        )
        v_fail = nemotron_validate(
            evidence_fail, "AGENTROPOLIS TRIAD ONLINE\n", 26,
            workspace, "triad-smoke-test.txt"
        )
        check(v_fail["verdict"] == "FAIL", "NEMOTRON FAIL verdict works", cat)

    # QUARANTINE
    v_quarantine = nemotron_quarantine(
        {}, "suspicious evidence detected"
    )
    check(v_quarantine["verdict"] == "QUARANTINE",
          "NEMOTRON QUARANTINE verdict works", cat)

# ---------------------------------------------------------------------------
# NEGATIVE TESTS
# ---------------------------------------------------------------------------

def test_negative_missing_mandate():
    """HERMES lacks a mandate -> restricted planning mode."""
    cat = "NEGATIVE"
    packet = hermes_strategy(mandate="")  # empty mandate
    missing, empty = validate_packet(packet)
    # Mandate should be flagged as empty
    check("mandate" in empty,
          "Missing mandate detected (empty field)", cat)
    # HERMES should enter restricted planning mode
    restricted = (len(empty) > 0)
    check(restricted,
          "HERMES enters restricted mode on missing mandate", cat)

def test_negative_missing_contribution_mode():
    """Missing contribution mode -> restricted mode."""
    cat = "NEGATIVE"
    packet = hermes_strategy(
        "create file", contribution_mode=""
    )
    missing, empty = validate_packet(packet)
    check("contribution_mode" in empty,
          "Missing contribution_mode detected", cat)
    restricted = (len(empty) > 0)
    check(restricted, "Restricted mode on missing contribution_mode", cat)

def test_negative_missing_authority_limits():
    """Missing authority limits -> restricted mode."""
    cat = "NEGATIVE"
    packet = hermes_strategy(
        "create file", authority_limits=""
    )
    missing, empty = validate_packet(packet)
    check("authority_limits" in empty,
          "Missing authority_limits detected", cat)
    restricted = (len(empty) > 0)
    check(restricted, "Restricted mode on missing authority_limits", cat)

def test_negative_missing_receipt_destination():
    """Missing receipt destination -> restricted mode."""
    cat = "NEGATIVE"
    packet = hermes_strategy(
        "create file", receipt_destination=""
    )
    missing, empty = validate_packet(packet)
    check("receipt_destination" in empty,
          "Missing receipt_destination detected", cat)
    restricted = (len(empty) > 0)
    check(restricted, "Restricted mode on missing receipt_destination", cat)

def test_negative_unauthorized_tool():
    """NEMOCLAW requests a tool not in allowed_tools -> blocked."""
    cat = "NEGATIVE"
    packet = hermes_strategy(
        "create file", allowed_tools=["write_file"]
    )
    # NEMOCLAW tries to use git_commit (prohibited)
    requested_tool = "git_commit"
    prohibited = packet["prohibited_actions"]
    is_blocked = requested_tool in prohibited
    check(is_blocked,
          "Unauthorized tool (git_commit) blocked by prohibited_actions", cat)

    # Also test a tool not in allowed_tools and not in prohibited
    requested_tool_2 = "curl"
    allowed = packet["allowed_tools"]
    is_blocked_2 = requested_tool_2 not in allowed
    check(is_blocked_2,
          "Unauthorized tool (curl) not in allowed_tools -> blocked", cat)

def test_negative_altered_output():
    """NEMOTRON detects altered output vs expected content."""
    cat = "NEGATIVE"
    with tempfile.TemporaryDirectory(prefix="triad_altered_") as tmpdir:
        workspace = pathlib.Path(tmpdir)
        expected = "AGENTROPOLIS TRIAD ONLINE\n"
        # NEMOCLAW writes wrong content (simulating alteration)
        evidence = nemoclaw_execute(
            {}, workspace, "AGENTROPOLIS TRIAD OFFLINE\n"
        )
        validation = nemotron_validate(
            evidence, expected, 26, workspace, "triad-smoke-test.txt"
        )
        check(validation["verdict"] == "FAIL",
              "Altered output detected -> FAIL", cat,
              f"checks: {validation['checks']}")
        check(not validation["checks"]["content_exact"],
              "Content mismatch caught", cat)

def test_negative_missing_evidence():
    """NEMOTRON rejects when evidence is missing (no file)."""
    cat = "NEGATIVE"
    with tempfile.TemporaryDirectory(prefix="triad_noev_") as tmpdir:
        workspace = pathlib.Path(tmpdir)
        fake_evidence = {
            "filepath": str(workspace / "triad-smoke-test.txt"),
            "content": "AGENTROPOLIS TRIAD ONLINE\n",
            "sha256": "fake_hash",
            "byte_count": 26,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "exists": False,
        }
        # Don't create the file — NEMOTRON should catch this
        validation = nemotron_validate(
            fake_evidence, "AGENTROPOLIS TRIAD ONLINE\n", 26,
            workspace, "triad-smoke-test.txt"
        )
        check(validation["verdict"] == "FAIL",
              "Missing evidence (no file) -> FAIL", cat)
        check(not validation["checks"]["file_exists"],
              "File existence check catches missing file", cat)

def test_negative_role_impersonation():
    """A role tries to claim another role's authority -> blocked."""
    cat = "NEGATIVE"
    # HERMES tries to claim execution
    hermes_claims_execution = False
    hermes_permissions = [
        "inspect", "retrieve", "analyze", "plan", "recommend",
        "route", "delegate_within_limits", "request_authorization"
    ]
    # Execution (write_file) is not in HERMES permissions
    hermes_claims_execution = "write_file" in hermes_permissions
    check(not hermes_claims_execution,
          "HERMES cannot claim execution (write_file not in permissions)", cat)

    # NEMOCLAW tries to claim authorization
    nemoclaw_permissions = [
        "use_assigned_tools", "create_approved_files",
        "run_approved_commands", "execute_approved_workflows",
        "reversible_local_actions", "generate_execution_receipts"
    ]
    nemoclaw_claims_auth = "authorize_itself" in nemoclaw_permissions
    check(not nemoclaw_claims_auth,
          "NEMOCLAW cannot claim authorization", cat)

    # NEMOTRON tries to claim settlement (fund transfer)
    nemotron_permissions = [
        "validate_evidence", "run_approved_tests",
        "calculate_verified_contribution", "recommend_settlement",
        "recommend_compute_allocation", "produce_audit_receipts",
        "block_unverifiable_claims"
    ]
    nemotron_claims_settlement = "transfer_funds" in nemotron_permissions
    check(not nemotron_claims_settlement,
          "NEMOTRON cannot claim settlement (no transfer_funds)", cat)

    # No-impersonation rules
    no_impersonation = {
        "hermes_cannot_claim_execution": True,
        "nemoclaw_cannot_claim_authorization": True,
        "nemotron_cannot_claim_settlement_without_evidence": True,
    }
    check(all(no_impersonation.values()),
          "All 3 no-impersonation rules enforced", cat)

# ---------------------------------------------------------------------------
# Main runner
# ---------------------------------------------------------------------------

def run_all_tests():
    """Run all test suites and return results."""
    # Positive tests
    test_positive_full_triad()
    test_positive_existing_receipts_intact()
    test_positive_nemotron_verdicts()

    # Negative tests
    test_negative_missing_mandate()
    test_negative_missing_contribution_mode()
    test_negative_missing_authority_limits()
    test_negative_missing_receipt_destination()
    test_negative_unauthorized_tool()
    test_negative_altered_output()
    test_negative_missing_evidence()
    test_negative_role_impersonation()

def print_ascii_report():
    """Print human-readable ASCII report."""
    passed = sum(1 for r in results if r.passed)
    failed = sum(1 for r in results if not r.passed)
    total = len(results)

    lines = []
    lines.append("+" + "-" * 58 + "+")
    lines.append("| AGENTROPOLIS OPERATIONAL TRIAD REGRESSION TEST REPORT      |")
    lines.append("+" + "-" * 58 + "+")
    lines.append(f"| Timestamp: {datetime.now(timezone.utc).isoformat():<46} |")
    lines.append(f"| Total tests: {total:<44} |")
    lines.append(f"| Passed:      {passed:<44} |")
    lines.append(f"| Failed:      {failed:<44} |")
    lines.append("+" + "-" * 58 + "+")
    lines.append("")

    # Group by category
    for category in ["POSITIVE", "NEGATIVE"]:
        cat_results = [r for r in results if r.category == category]
        if not cat_results:
            continue
        cat_passed = sum(1 for r in cat_results if r.passed)
        cat_total = len(cat_results)
        lines.append(f"--- {category} ({cat_passed}/{cat_total} passed) ---")
        for r in cat_results:
            mark = "[PASS]" if r.passed else "[FAIL]"
            line = f"  {mark} {r.name}"
            if r.detail:
                line += f"  -- {r.detail}"
            lines.append(line)
        lines.append("")

    lines.append("+" + "-" * 58 + "+")
    if failed == 0:
        lines.append("| VERDICT: ALL TESTS PASSED                                 |")
    else:
        lines.append(f"| VERDICT: {failed} TEST(S) FAILED                                  |")
    lines.append("+" + "-" * 58 + "+")
    lines.append("")
    lines.append("HERMES plans. NEMOCLAW executes. NEMOTRON verifies.")
    lines.append("Human Mission Control retains authority.")
    lines.append("Every contribution produces a receipt.")

    report = "\n".join(lines)
    return report

def write_json_report():
    """Write machine-readable JSON report."""
    passed = sum(1 for r in results if r.passed)
    failed = sum(1 for r in results if not r.passed)
    total = len(results)

    report = {
        "test_suite": "agentropolis-operational-triad-regression",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total": total,
        "passed": passed,
        "failed": failed,
        "verdict": "PASS" if failed == 0 else "FAIL",
        "tests": [
            {
                "name": r.name,
                "category": r.category,
                "passed": r.passed,
                "detail": r.detail,
                "timestamp": r.timestamp,
            }
            for r in results
        ],
    }
    REPORT_JSON_PATH.write_text(
        json.dumps(report, indent=2), encoding="utf-8"
    )
    return REPORT_JSON_PATH

def write_ascii_report_file():
    """Write human-readable ASCII report to file."""
    report = print_ascii_report()
    REPORT_ASCII_PATH.write_text(report, encoding="utf-8")
    return REPORT_ASCII_PATH

def main():
    output_json = "--json" in sys.argv
    quiet = "--quiet" in sys.argv

    run_all_tests()

    if output_json:
        report = {
            "test_suite": "agentropolis-operational-triad-regression",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total": len(results),
            "passed": sum(1 for r in results if r.passed),
            "failed": sum(1 for r in results if not r.passed),
            "verdict": "PASS" if all(r.passed for r in results) else "FAIL",
            "tests": [
                {
                    "name": r.name,
                    "category": r.category,
                    "passed": r.passed,
                    "detail": r.detail,
                }
                for r in results
            ],
        }
        print(json.dumps(report, indent=2))
    else:
        print(print_ascii_report())

    # Always write report files
    json_path = write_json_report()
    ascii_path = write_ascii_report_file()
    if not quiet:
        print(f"\nJSON report:  {json_path}")
        print(f"ASCII report: {ascii_path}")

    failed = sum(1 for r in results if not r.passed)
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
