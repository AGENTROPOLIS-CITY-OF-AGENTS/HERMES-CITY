"""Negative + positive tests for the GitHub Pages allowlist gate.

Run: python3 -m unittest -v tests/test_pages_artifact.py
"""
import contextlib
import importlib.util
import io
import json
import os
import pathlib
import shutil
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("pages_artifact", ROOT / "scripts" / "pages_artifact.py")
pa = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(pa)


def quiet(fn, *a, **kw):
    with contextlib.redirect_stdout(io.StringIO()) as buf:
        rc = fn(*a, **kw)
    return rc, buf.getvalue()


class PagesArtifactGate(unittest.TestCase):
    def setUp(self):
        self.tmp = pathlib.Path(tempfile.mkdtemp(prefix="pages_gate_"))
        self.site = self.tmp / "_site"
        allow = pa.load_allowlist()
        for rel in allow["files"]:
            dst = self.site / rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / rel, dst)
        for m in allow["mapped_files"]:
            dst = self.site / m["to"]
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / m["from"], dst)
        # stand-in for the vite build output
        vc = self.site / "visual-compute" / "assets"
        vc.mkdir(parents=True)
        (self.site / "visual-compute" / "index.html").write_text("<!doctype html><title>vc</title>")
        (vc / "index-abc123.js").write_text("console.log('vc')")

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def assertGate(self, expect_pass, needle=None):
        rc, out = quiet(pa.verify, str(self.site))
        if expect_pass:
            self.assertEqual(rc, 0, out)
        else:
            self.assertEqual(rc, 1, "gate unexpectedly passed:\n" + out)
            if needle:
                self.assertIn(needle, out)

    def put(self, rel, text="x"):
        p = self.site / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text)

    def test_allowlist_itself_has_no_protected_entries(self):
        self.assertEqual(pa.validate_allowlist(pa.load_allowlist()), [])

    def test_clean_allowlisted_site_passes(self):
        self.assertGate(True)

    def test_config_directory_rejected(self):
        self.put("config/neuro-operating-profile.json", "{}")
        self.assertGate(False, "config/neuro-operating-profile.json")

    def test_github_directory_rejected(self):
        self.put(".github/workflows/pages.yml", "name: x")
        self.assertGate(False, ".github/workflows/pages.yml")

    def test_receipts_rejected_any_case(self):
        self.put("RECEIPTS/genui-beta-readiness.md")
        self.assertGate(False, "protected segment 'receipts'")

    def test_memory_rejected(self):
        self.put("memory/genesis-rag-growth/entry.md")
        self.assertGate(False, "protected segment 'memory'")

    def test_dotfile_rejected(self):
        self.put(".gitleaks.toml")
        self.assertGate(False, ".gitleaks.toml")

    def test_unlisted_public_looking_file_rejected(self):
        self.put("docs/roadmap.md")
        self.assertGate(False, "not allowlisted: docs/roadmap.md")

    def test_source_and_package_files_rejected(self):
        self.put("package.json", "{}")
        self.put("tests/operational-triad/run_triad_tests.py")
        self.assertGate(False, "package.json")

    def test_sourcemap_in_built_dir_rejected(self):
        self.put("visual-compute/assets/index-abc123.js.map", "{}")
        self.assertGate(False, "index-abc123.js.map")

    def test_credential_pattern_rejected(self):
        token = "gh" + "p_" + "A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8"
        self.put("app.js", (ROOT / "app.js").read_text() + "\n// " + token + "\n")
        self.assertGate(False, "credential pattern github-token")

    def test_private_key_rejected(self):
        self.put("assets/favicon.svg", "-----BEGIN " + "PRIVATE KEY-----\nabc\n")
        self.assertGate(False, "private-key")

    def test_symlink_rejected(self):
        target = self.tmp / "outside.txt"
        target.write_text("secret")
        try:
            os.symlink(target, self.site / "linked.txt")
        except (OSError, NotImplementedError):
            self.skipTest("symlinks unavailable on this host")
        self.assertGate(False, "symlink in artifact: linked.txt")

    def test_missing_allowlisted_file_rejected(self):
        (self.site / "404.html").unlink()
        self.assertGate(False, "allowlisted file missing from artifact: 404.html")

    def test_protected_allowlist_entry_rejected_even_if_listed(self):
        bad = pa.load_allowlist()
        bad["files"].append("config/genui-fabric.json")
        bad["files"].append("RECEIPTS/threeui-visual-compute.json")
        errs = pa.validate_allowlist(bad)
        self.assertTrue(any("config/genui-fabric.json" in e for e in errs), errs)
        self.assertTrue(any("RECEIPTS/threeui-visual-compute.json" in e for e in errs), errs)

    def test_path_traversal_allowlist_entry_rejected(self):
        with self.assertRaises(ValueError):
            pa.norm("../secrets.txt")
        with self.assertRaises(ValueError):
            pa.norm("/etc/passwd")


if __name__ == "__main__":
    unittest.main()
