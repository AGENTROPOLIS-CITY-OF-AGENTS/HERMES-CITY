"""Fail-closed tests for the GitHub Pages allowlist artifact.

Run: python3 -m unittest -v tests/test_pages_artifact.py
"""
import contextlib
import importlib.util
import io
import os
import pathlib
import shutil
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("pages_artifact", ROOT / "scripts" / "pages_artifact.py")
pa = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(pa)

DENYLIST = (
    "SOUL.md",
    "AGENTS.md",
    "config/neuro-operating-profile.json",
    "config/other.json",
    "RECEIPTS/genui-beta-readiness.md",
    "receipts/lowercase.md",
    ".env",
    ".env.local",
    ".env.production",
    "nested/.env",
)


def quiet(fn, *args, **kwargs):
    with contextlib.redirect_stdout(io.StringIO()) as buf:
        rc = fn(*args, **kwargs)
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
        for mapped in allow["mapped_files"]:
            dst = self.site / mapped["to"]
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / mapped["from"], dst)
        vc = self.site / "visual-compute" / "assets"
        vc.mkdir(parents=True)
        (self.site / "visual-compute" / "index.html").write_text("<!doctype html><title>vc</title>\n")
        (vc / "index-abc123.js").write_text("console.log('vc')\n")
        page = self.site / "genui-beta.html"
        page.write_text(page.read_text().replace(
            "./tests/fixtures/genui/market.valid.json",
            "./genui/market.valid.json",
        ))
        index = self.site / "index.html"
        text = index.read_text()
        tag = '<script src="spatial-runtime.js" defer></script>'
        if tag not in text:
            index.write_text(text.replace("</head>", "  %s\n</head>" % tag, 1))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def assert_gate(self, expect_pass, needle=None):
        rc, out = quiet(pa.verify, str(self.site))
        if expect_pass:
            self.assertEqual(rc, 0, out)
        else:
            self.assertEqual(rc, 1, out)
            if needle:
                self.assertIn(needle, out)
        return out

    def put(self, rel, text="x"):
        path = self.site / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)

    def test_allowlist_itself_has_no_protected_entries(self):
        self.assertEqual(pa.validate_allowlist(pa.load_allowlist()), [])

    def test_clean_allowlisted_site_passes(self):
        self.assert_gate(True)

    def test_denylisted_paths_fail(self):
        for rel in DENYLIST:
            self.put(rel, "{}\n")
        out = self.assert_gate(False, "denylisted:")
        for rel in DENYLIST:
            self.assertIn(rel, out)

    def test_non_allowlisted_public_looking_file_fails(self):
        self.put("docs/roadmap.md")
        self.assert_gate(False, "not allowlisted: docs/roadmap.md")

    def test_github_and_package_metadata_fail(self):
        self.put(".github/workflows/pages.yml", "name: x\n")
        self.put("package.json", "{}\n")
        self.put("package-lock.json", "{}\n")
        out = self.assert_gate(False)
        self.assertIn(".github/workflows/pages.yml", out)
        self.assertIn("package.json", out)
        self.assertIn("package-lock.json", out)

    def test_secret_vault_doc_and_receipt_json_fail(self):
        self.put("docs/hermes-secret-vaults.md")
        self.put("RECEIPTS/threeui-visual-compute.json", "{}\n")
        out = self.assert_gate(False)
        self.assertIn("docs/hermes-secret-vaults.md", out)
        self.assertIn("RECEIPTS/threeui-visual-compute.json", out)

    def test_sourcemap_in_built_dir_fails(self):
        self.put("visual-compute/assets/index-abc123.js.map", "{}\n")
        self.assert_gate(False, "index-abc123.js.map")

    def test_credential_pattern_fails_without_echoing_secret(self):
        token = "gh" + "p_" + ("A1b2C3d4E5f6G7h8I9j0" * 2)
        self.put("app.js", (ROOT / "app.js").read_text() + "\n// " + token + "\n")
        out = self.assert_gate(False, "credential pattern github-token")
        self.assertNotIn(token, out)

    def test_private_key_pattern_fails(self):
        marker = "-----BEGIN " + "PRIVATE KEY-----\n"
        self.put("assets/favicon.svg", marker + "not-a-real-key\n")
        out = self.assert_gate(False, "credential pattern private-key")
        self.assertNotIn("not-a-real-key", out)

    def test_symlink_fails(self):
        target = self.tmp / "outside.txt"
        target.write_text("x")
        try:
            os.symlink(target, self.site / "linked.txt")
        except (OSError, NotImplementedError):
            self.skipTest("symlinks unavailable")
        self.assert_gate(False, "symlink: linked.txt")

    def test_missing_allowlisted_file_fails(self):
        (self.site / "404.html").unlink()
        self.assert_gate(False, "allowlisted file missing: 404.html")

    def test_protected_allowlist_entry_rejected_even_if_listed(self):
        bad = pa.load_allowlist()
        bad["files"] = list(bad["files"]) + [
            "config/genui-fabric.json",
            "RECEIPTS/genui-beta-readiness.md",
            "SOUL.md",
            "AGENTS.md",
            ".env.local",
        ]
        errors = pa.validate_allowlist(bad)
        joined = "\n".join(errors)
        for rel in ("config/genui-fabric.json", "RECEIPTS/genui-beta-readiness.md", "SOUL.md", "AGENTS.md", ".env.local"):
            self.assertIn(rel, joined)

    def test_hostile_genui_fixture_cannot_be_mapped(self):
        bad = pa.load_allowlist()
        bad["mapped_files"] = list(bad["mapped_files"]) + [{
            "from": "tests/fixtures/genui/unsafe.invalid.json",
            "to": "genui/unsafe.invalid.json",
        }]
        errors = pa.validate_allowlist(bad)
        self.assertTrue(any("unsafe.invalid.json" in err for err in errors), errors)

    def test_path_traversal_rejected(self):
        for rel in ("../secrets.txt", "/etc/passwd", "docs//architecture.md", "docs/../SOUL.md"):
            with self.assertRaises(ValueError):
                pa.norm(rel)

    def test_assemble_publish_tree_excludes_denylist(self):
        if not (ROOT / "dist" / "visual-compute").is_dir():
            self.skipTest("dist/visual-compute missing; CI builds it before this gate")
        out = self.tmp / "assembled"
        rc, text = quiet(pa.assemble, str(out))
        self.assertEqual(rc, 0, text)
        published = sorted(str(p.relative_to(out)).replace("\\", "/") for p in out.rglob("*") if p.is_file())
        for rel in DENYLIST:
            self.assertNotIn(rel, published)
        for rel in published:
            self.assertIsNone(pa.protected_reason(rel), rel)
            self.assertFalse(rel.startswith("tests/"), rel)
            self.assertFalse(rel.startswith("config/"), rel)
            self.assertFalse("RECEIPTS/" in rel or rel.lower().startswith("receipts/"), rel)
        html = (out / "genui-beta.html").read_text()
        self.assertNotIn("tests/fixtures", html)
        self.assertIn("./genui/market.valid.json", html)
        self.assertTrue((out / "genui" / "market.valid.json").is_file())
        vrc, vout = quiet(pa.verify, str(out))
        self.assertEqual(vrc, 0, vout)


if __name__ == "__main__":
    unittest.main()
