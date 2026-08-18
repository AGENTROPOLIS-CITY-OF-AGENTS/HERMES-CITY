import json
import unittest
from pathlib import Path
import importlib.util

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("validate_genui", ROOT / "tools" / "validate_genui.py")
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class GenUIValidatorTests(unittest.TestCase):
    def load(self, name):
        return json.loads((ROOT / "tests" / "fixtures" / "genui" / name).read_text(encoding="utf-8"))

    def test_valid_market_manifest(self):
        MODULE.validate_manifest(self.load("market.valid.json"))

    def test_unsafe_manifest_is_rejected(self):
        with self.assertRaises(ValueError):
            MODULE.validate_manifest(self.load("unsafe.invalid.json"))

    def test_high_impact_requires_dual_control(self):
        doc = self.load("market.valid.json")
        action = doc["components"][-1]["actions"][0]
        action["impact"] = "high"
        action["confirmation"] = "human"
        with self.assertRaises(ValueError):
            MODULE.validate_manifest(doc)

    def test_policy_scope_is_mandatory(self):
        doc = self.load("market.valid.json")
        del doc["components"][-1]["actions"][0]["policy_scope"]
        with self.assertRaises(ValueError):
            MODULE.validate_manifest(doc)

    def test_unknown_component_is_rejected(self):
        doc = self.load("market.valid.json")
        doc["components"][0]["type"] = "iframe"
        with self.assertRaises(ValueError):
            MODULE.validate_manifest(doc)


if __name__ == "__main__":
    unittest.main()
