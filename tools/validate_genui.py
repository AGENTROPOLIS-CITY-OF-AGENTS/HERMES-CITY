#!/usr/bin/env python3
"""Dependency-free beta validator for AGENTROPOLIS GenUI v1 manifests."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ALLOWED_SURFACES = {"auto", "hud", "workspace", "tui", "mobile", "3d"}
ALLOWED_COMPONENTS = {"metric", "text", "status", "sparkline", "action_group"}
ALLOWED_IMPACTS = {"read", "low", "medium", "high", "irreversible"}
ALLOWED_CONFIRMATIONS = {"none", "human", "dual_control"}
FORBIDDEN_KEYS = {"html", "javascript", "script", "onload", "onclick", "credential", "password", "secret", "private_key"}


def fail(message: str) -> None:
    raise ValueError(message)


def check_forbidden(value, path="$"):
    if isinstance(value, dict):
        for key, child in value.items():
            if key.lower() in FORBIDDEN_KEYS:
                fail(f"{path}: forbidden key {key!r}")
            check_forbidden(child, f"{path}.{key}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            check_forbidden(child, f"{path}[{index}]")


def validate_action(action: dict, path: str) -> None:
    required = {"id", "label", "capability_handle", "policy_scope", "impact"}
    missing = required - set(action)
    if missing:
        fail(f"{path}: missing action fields: {sorted(missing)}")
    if not str(action["capability_handle"]).startswith("cap://"):
        fail(f"{path}: capability_handle must start with cap://")
    if not str(action["policy_scope"]).startswith("scope://"):
        fail(f"{path}: policy_scope must start with scope://")
    if action["impact"] not in ALLOWED_IMPACTS:
        fail(f"{path}: unsupported impact {action['impact']!r}")
    confirmation = action.get("confirmation", "none")
    if confirmation not in ALLOWED_CONFIRMATIONS:
        fail(f"{path}: unsupported confirmation {confirmation!r}")
    if action["impact"] in {"high", "irreversible"} and confirmation != "dual_control":
        fail(f"{path}: high-impact action requires dual_control")


def validate_manifest(doc: dict) -> None:
    if doc.get("schema") != "agentropolis.genui/v1":
        fail("$.schema: expected agentropolis.genui/v1")
    if doc.get("surface_hint") not in ALLOWED_SURFACES:
        fail("$.surface_hint: unsupported surface")
    if not isinstance(doc.get("title"), str) or not doc["title"].strip():
        fail("$.title: non-empty string required")
    provenance = doc.get("provenance")
    if not isinstance(provenance, dict) or provenance.get("required") is not True:
        fail("$.provenance.required: must be true")
    if not provenance.get("source_type") or not provenance.get("source_ref"):
        fail("$.provenance: source_type and source_ref required")
    if doc.get("receipt_policy") not in {"never", "on_action", "always"}:
        fail("$.receipt_policy: unsupported value")

    components = doc.get("components")
    if not isinstance(components, list) or not components:
        fail("$.components: non-empty array required")
    if len(components) > 64:
        fail("$.components: maximum 64 components")

    seen = set()
    for index, component in enumerate(components):
        path = f"$.components[{index}]"
        if not isinstance(component, dict):
            fail(f"{path}: object required")
        kind = component.get("type")
        if kind not in ALLOWED_COMPONENTS:
            fail(f"{path}.type: unsupported component {kind!r}")
        component_id = component.get("id")
        if not component_id:
            fail(f"{path}.id: required")
        if component_id in seen:
            fail(f"{path}.id: duplicate id {component_id!r}")
        seen.add(component_id)

        if kind == "metric" and "value" not in component:
            fail(f"{path}.value: required")
        elif kind in {"text", "status"} and not isinstance(component.get("text"), str):
            fail(f"{path}.text: string required")
        elif kind == "sparkline":
            series = component.get("series")
            if not isinstance(series, list) or len(series) < 2 or not all(isinstance(v, (int, float)) for v in series):
                fail(f"{path}.series: at least two numeric values required")
        elif kind == "action_group":
            actions = component.get("actions")
            if not isinstance(actions, list) or not actions:
                fail(f"{path}.actions: non-empty array required")
            for action_index, action in enumerate(actions):
                if not isinstance(action, dict):
                    fail(f"{path}.actions[{action_index}]: object required")
                validate_action(action, f"{path}.actions[{action_index}]")

    check_forbidden(doc)


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("usage: validate_genui.py MANIFEST.json [...]", file=sys.stderr)
        return 2
    ok = True
    for name in argv[1:]:
        path = Path(name)
        try:
            doc = json.loads(path.read_text(encoding="utf-8"))
            validate_manifest(doc)
            print(f"PASS {path}")
        except Exception as exc:
            ok = False
            print(f"FAIL {path}: {exc}", file=sys.stderr)
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
