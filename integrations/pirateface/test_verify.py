import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from verify import verify, VerificationError

class VerifyTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.artifact = self.root / "weights.gguf"
        self.artifact.write_bytes(b"example artifact only")
        self.manifest = self.root / "manifest.json"
        self.data = {
            "schema_version": 1, "model_id": "test/model", "filename": "weights.gguf",
            "sha256": hashlib.sha256(self.artifact.read_bytes()).hexdigest(),
            "size_bytes": self.artifact.stat().st_size, "license": "reviewed-example",
            "source": "offline fixture", "approved": True
        }
        self.save()

    def save(self):
        self.manifest.write_text(json.dumps(self.data))

    def test_valid(self):
        self.assertTrue(verify(self.manifest, self.artifact)["verified"])

    def test_unapproved(self):
        self.data["approved"] = False
        self.save()
        with self.assertRaises(VerificationError):
            verify(self.manifest, self.artifact)

    def test_tampered(self):
        self.artifact.write_bytes(b"changed artifact bytes")
        with self.assertRaises(VerificationError):
            verify(self.manifest, self.artifact)

    def test_bad_hash(self):
        self.data["sha256"] = "0" * 64
        self.save()
        with self.assertRaises(VerificationError):
            verify(self.manifest, self.artifact)

    def test_symlink(self):
        alias = self.root / "alias.gguf"
        alias.symlink_to(self.artifact)
        with self.assertRaises(VerificationError):
            verify(self.manifest, alias)

if __name__ == "__main__":
    unittest.main()
