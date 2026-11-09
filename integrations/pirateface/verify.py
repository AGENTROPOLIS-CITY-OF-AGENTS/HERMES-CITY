"""Offline, fail-closed verification for externally acquired model artifacts.

No downloading, torrenting, network access, deserialization or execution.
"""
import argparse
import hashlib
import json
from pathlib import Path

MAX_MANIFEST_BYTES = 65536
MAX_ARTIFACT_BYTES = 1024 * 1024 * 1024 * 1024
ALLOWED_FORMATS = {".safetensors", ".gguf"}

class VerificationError(Exception):
    pass

def verify(manifest_path, artifact_path):
    manifest_path, artifact_path = Path(manifest_path), Path(artifact_path)
    if manifest_path.is_symlink() or artifact_path.is_symlink():
        raise VerificationError("symlink inputs forbidden")
    if not artifact_path.is_file() or not manifest_path.is_file():
        raise VerificationError("regular files required")
    if manifest_path.stat().st_size > MAX_MANIFEST_BYTES:
        raise VerificationError("manifest too large")
    try:
        m = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (ValueError, UnicodeError) as exc:
        raise VerificationError("invalid manifest") from exc
    if not isinstance(m, dict):
        raise VerificationError("manifest must be object")
    required = {"schema_version", "model_id", "filename", "sha256", "size_bytes", "license", "source", "approved"}
    if set(m) != required or m["schema_version"] != 1:
        raise VerificationError("unsupported manifest")
    if not isinstance(m["approved"], bool) or not m["approved"]:
        raise VerificationError("explicit approval required")
    if not isinstance(m["model_id"], str) or not m["model_id"].strip():
        raise VerificationError("invalid model id")
    if not isinstance(m["license"], str) or not m["license"].strip():
        raise VerificationError("license review required")
    if not isinstance(m["source"], str) or not m["source"].strip():
        raise VerificationError("source required")
    if not isinstance(m["filename"], str) or m["filename"] != artifact_path.name:
        raise VerificationError("filename mismatch")
    if artifact_path.suffix.lower() not in ALLOWED_FORMATS:
        raise VerificationError("unsupported artifact format")
    digest = m["sha256"]
    if not isinstance(digest, str) or len(digest) != 64 or any(c not in "0123456789abcdef" for c in digest):
        raise VerificationError("invalid sha256")
    size = m["size_bytes"]
    if type(size) is not int or size < 1 or size > MAX_ARTIFACT_BYTES:
        raise VerificationError("invalid declared size")
    if artifact_path.stat().st_size != size:
        raise VerificationError("size mismatch")
    h = hashlib.sha256()
    with artifact_path.open("rb") as f:
        while chunk := f.read(1024 * 1024):
            h.update(chunk)
    if h.hexdigest() != digest:
        raise VerificationError("sha256 mismatch")
    return {"verified": True, "model_id": m["model_id"], "sha256": digest, "size_bytes": size,
            "note": "Integrity only: provenance, licensing, safety and runtime authorization NOT established"}

def main():
    p = argparse.ArgumentParser()
    p.add_argument("manifest")
    p.add_argument("artifact")
    a = p.parse_args()
    try:
        print(json.dumps(verify(a.manifest, a.artifact)))
    except (VerificationError, OSError) as exc:
        print(json.dumps({"verified": False, "reason": str(exc)}))
        raise SystemExit(1)

if __name__ == "__main__":
    main()
