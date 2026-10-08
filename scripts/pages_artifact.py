#!/usr/bin/env python3
"""HERMES CITY GitHub Pages artifact: allowlist assembly + independent verification.

    python3 scripts/pages_artifact.py assemble [--out _site]
    python3 scripts/pages_artifact.py verify   [--site _site] [--inventory FILE]

assemble  copies ONLY the paths named in scripts/pages-allowlist.json into the
          output directory (default _site). A missing allowlisted file is a hard
          failure. Nothing is copied by default.
verify    walks the produced directory (exactly what upload-pages-artifact
          would tar) and fails if ANY file is not allowlisted, if any path hits
          the protected-path denylist, if any dotfile/symlink is present, or if
          any file matches a credential pattern. It writes a sha256 inventory.

Exit code 0 = pass, 1 = fail. Stdlib only.
"""
import argparse
import hashlib
import json
import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALLOWLIST_PATH = os.path.join(ROOT, "scripts", "pages-allowlist.json")

# Defence in depth: these may never be published even if someone allowlists
# them. Matched case-insensitively against every path segment / suffix.
PROTECTED_SEGMENTS = {
    ".git", ".github", "config", "receipts", "memory", "node_modules", "dist",
    "_site", "tests", "test", "scripts", "tools", "src", "schemas", "skills",
    "integrations", "examples", "secrets", "secret", "credentials", "private",
    "prompts", "evidence", "governance", "exploits", "state", "hermes-bridge",
}
PROTECTED_BASENAMES = {
    "package.json", "package-lock.json", "makefile", "agents.md", "soul.md",
    "agentropolis.repo.json", "agentropolis.repo.yaml", ".env", ".npmrc",
    ".gitleaks.toml", "readme.md", "id_rsa", "id_ed25519",
}
PROTECTED_SUFFIXES = (
    ".pem", ".key", ".p12", ".pfx", ".env", ".map", ".py", ".jsx", ".ts",
    ".tsx", ".yml", ".yaml", ".toml", ".lock", ".log", ".sqlite", ".db",
)
SECRET_PATTERNS = [
    ("github-token", re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b")),
    ("github-pat", re.compile(r"\bgithub_pat_[A-Za-z0-9_]{40,}\b")),
    ("openai-key", re.compile(r"\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b")),
    ("anthropic-key", re.compile(r"\bsk-ant-[A-Za-z0-9_-]{20,}\b")),
    ("slack-token", re.compile(r"\bxox[abprs]-[A-Za-z0-9-]{10,}\b")),
    ("aws-access-key", re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b")),
    ("google-api-key", re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b")),
    ("private-key", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----")),
    ("jwt", re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}")),
    ("vault-reference", re.compile(r"\bop://[A-Za-z0-9_-]+/")),
    ("assigned-secret", re.compile(r"(?i)\b(?:api[_-]?key|secret|password|passwd|auth[_-]?token|access[_-]?token)\b\s*[:=]\s*[\"'][^\"'\s]{12,}[\"']")),
]


def load_allowlist():
    with open(ALLOWLIST_PATH, encoding="utf-8") as fh:
        return json.load(fh)


def norm(rel):
    rel = rel.replace("\\", "/")
    if rel.startswith("/") or ".." in rel.split("/") or rel in ("", "."):
        raise ValueError("unsafe allowlist path: %r" % rel)
    return rel


def protected_reason(rel):
    parts = rel.lower().split("/")
    for seg in parts:
        if seg.startswith("."):
            return "dotfile/dot-directory segment %r" % seg
        if seg in PROTECTED_SEGMENTS:
            return "protected segment %r" % seg
    base = parts[-1]
    if base in PROTECTED_BASENAMES:
        return "protected file %r" % base
    if base.endswith(PROTECTED_SUFFIXES):
        return "protected suffix %r" % os.path.splitext(base)[1]
    return None


def allowed_paths(allow, site=None):
    """Return (exact set, [(prefix, extensions)]) of publishable artifact paths."""
    exact = {norm(p) for p in allow.get("files", [])}
    exact |= {norm(m["to"]) for m in allow.get("mapped_files", [])}
    prefixes = [(norm(b["to"]).rstrip("/") + "/", tuple(b["allowed_extensions"])) for b in allow.get("built_directories", [])]
    return exact, prefixes


def validate_allowlist(allow):
    errors = []
    exact, prefixes = allowed_paths(allow)
    for rel in sorted(exact):
        why = protected_reason(rel)
        if why:
            errors.append("allowlist entry %s is protected: %s" % (rel, why))
    for prefix, _ in prefixes:
        why = protected_reason(prefix.rstrip("/"))
        if why:
            errors.append("built directory %s is protected: %s" % (prefix, why))
    return errors


def copy_file(src, dst):
    if os.path.islink(src) or not os.path.isfile(src):
        raise FileNotFoundError("allowlisted source missing or not a regular file: %s" % os.path.relpath(src, ROOT))
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copyfile(src, dst)


def assemble(out):
    allow = load_allowlist()
    errors = validate_allowlist(allow)
    if errors:
        for e in errors:
            print("[FAIL] " + e)
        return 1
    out = os.path.abspath(out)
    if os.path.commonpath([out, ROOT]) == ROOT and out != os.path.join(ROOT, "_site"):
        print("[FAIL] refusing to assemble into %s (use _site or a path outside the repo)" % out)
        return 1
    shutil.rmtree(out, ignore_errors=True)
    os.makedirs(out)
    try:
        for rel in allow.get("files", []):
            copy_file(os.path.join(ROOT, norm(rel)), os.path.join(out, norm(rel)))
        for m in allow.get("mapped_files", []):
            copy_file(os.path.join(ROOT, norm(m["from"])), os.path.join(out, norm(m["to"])))
        for b in allow.get("built_directories", []):
            src_dir = os.path.join(ROOT, norm(b["from"]))
            if not os.path.isdir(src_dir):
                raise FileNotFoundError("built directory missing (run npm run build first): %s" % b["from"])
            exts = tuple(b["allowed_extensions"])
            for dp, dns, fns in os.walk(src_dir):
                dns[:] = sorted(d for d in dns if not d.startswith("."))
                for f in sorted(fns):
                    src = os.path.join(dp, f)
                    rel = os.path.relpath(src, src_dir).replace(os.sep, "/")
                    if f.startswith(".") or not f.lower().endswith(exts):
                        print("[SKIP] %s/%s (extension/dotfile not allowlisted)" % (b["from"], rel))
                        continue
                    copy_file(src, os.path.join(out, norm(b["to"]), rel))
    except FileNotFoundError as exc:
        print("[FAIL] " + str(exc))
        return 1
    for inj in allow.get("inject_scripts", []):
        page = os.path.join(out, norm(inj["page"]))
        with open(page, encoding="utf-8") as fh:
            text = fh.read()
        if inj["tag"] not in text:
            if "</head>" not in text:
                print("[FAIL] cannot inject into %s: no </head>" % inj["page"])
                return 1
            text = text.replace("</head>", "  %s\n</head>" % inj["tag"], 1)
            with open(page, "w", encoding="utf-8") as fh:
                fh.write(text)
    count = sum(len(f) for _, _, f in os.walk(out))
    print("[PASS] assembled %d allowlisted files into %s" % (count, os.path.relpath(out, ROOT) if out.startswith(ROOT) else out))
    return 0


def verify(site, inventory_path=None):
    allow = load_allowlist()
    fails = validate_allowlist(allow)
    exact, prefixes = allowed_paths(allow)
    site = os.path.abspath(site)
    if not os.path.isdir(site):
        print("[FAIL] artifact directory missing: %s" % site)
        return 1
    inventory = []
    seen = set()
    for dp, dns, fns in os.walk(site, followlinks=False):
        for d in list(dns):
            if os.path.islink(os.path.join(dp, d)):
                fails.append("symlinked directory in artifact: %s" % os.path.relpath(os.path.join(dp, d), site))
        for f in fns:
            full = os.path.join(dp, f)
            rel = os.path.relpath(full, site).replace(os.sep, "/")
            seen.add(rel)
            if os.path.islink(full):
                fails.append("symlink in artifact: %s" % rel)
                continue
            listed = rel in exact or any(rel.startswith(p) and rel.lower().endswith(ext) for p, ext in prefixes)
            if not listed:
                fails.append("not allowlisted: %s" % rel)
            why = protected_reason(rel)
            if why:
                fails.append("protected path published: %s (%s)" % (rel, why))
            with open(full, "rb") as fh:
                data = fh.read()
            text = data.decode("utf-8", errors="ignore")
            for name, rx in SECRET_PATTERNS:
                m = rx.search(text)
                if m:
                    fails.append("credential pattern %s in %s at offset %d" % (name, rel, m.start()))
            inventory.append({"path": rel, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()})
    missing = sorted(p for p in exact if p not in seen)
    for p in missing:
        fails.append("allowlisted file missing from artifact: %s" % p)
    inventory.sort(key=lambda x: x["path"])
    if inventory_path:
        with open(inventory_path, "w", encoding="utf-8") as fh:
            json.dump({"contract": "agentropolis.hermes-city.pages-artifact-inventory.v1",
                       "file_count": len(inventory),
                       "total_bytes": sum(i["bytes"] for i in inventory),
                       "files": inventory}, fh, indent=1)
            fh.write("\n")
    if fails:
        print("=== PAGES ARTIFACT: FAIL (%d) ===" % len(fails))
        for f in fails:
            print("  [FAIL] " + f)
        return 1
    print("[PASS] pages artifact: %d files, all allowlisted; no protected paths, dotfiles, symlinks or credential patterns" % len(inventory))
    return 0


def main(argv=None):
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("assemble")
    a.add_argument("--out", default=os.path.join(ROOT, "_site"))
    v = sub.add_parser("verify")
    v.add_argument("--site", default=os.path.join(ROOT, "_site"))
    v.add_argument("--inventory")
    args = ap.parse_args(argv)
    if args.cmd == "assemble":
        return assemble(args.out)
    return verify(args.site, args.inventory)


if __name__ == "__main__":
    sys.exit(main())
