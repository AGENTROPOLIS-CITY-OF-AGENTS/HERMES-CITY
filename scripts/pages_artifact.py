#!/usr/bin/env python3
"""HERMES CITY GitHub Pages artifact: allowlist assembly and fail-closed verification.

    python3 scripts/pages_artifact.py assemble [--out _site]
    python3 scripts/pages_artifact.py verify   [--site _site]

assemble copies only the paths named in scripts/pages-allowlist.json.
verify fails if any file in the artifact is outside that allowlist, or if any
path is denylisted (SOUL.md, AGENTS.md, config/**, RECEIPTS/**, .env*, config
JSON, dotfiles, symlinks) or matches a credential pattern.

Exit code 0 = pass, 1 = fail. Standard library only. Never prints file bodies.
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

PROTECTED_SEGMENTS = {
    ".git", ".github", "config", "receipts", "memory", "node_modules", "dist",
    "_site", "tests", "test", "scripts", "tools", "src", "schemas", "skills",
    "integrations", "examples", "secrets", "secret", "credentials", "private",
    "prompts", "evidence", "governance", "exploits", "state", "hermes-bridge",
}
PROTECTED_BASENAMES = {
    "package.json", "package-lock.json", "makefile", "agents.md", "soul.md",
    "agentropolis.repo.json", "agentropolis.repo.yaml", ".env", ".npmrc",
    ".gitleaks.toml", "id_rsa", "id_ed25519",
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
    ("assigned-secret", re.compile(
        r"(?i)\b(?:api[_-]?key|secret|password|passwd|auth[_-]?token|access[_-]?token)\b"
        r"\s*[:=]\s*[\"'][^\"'\s]{12,}[\"']"
    )),
]


def load_allowlist(path=None):
    with open(path or ALLOWLIST_PATH, encoding="utf-8") as fh:
        return json.load(fh)


def norm(rel):
    rel = rel.replace("\\", "/")
    parts = rel.split("/")
    if rel.startswith("/") or rel in ("", ".") or ".." in parts or any(p in ("", ".") for p in parts):
        raise ValueError("unsafe allowlist path")
    return rel


def _is_env_basename(base):
    return base == ".env" or base.startswith(".env.") or base.endswith(".env")


def protected_reason(rel):
    parts = rel.lower().split("/")
    for seg in parts:
        if seg.startswith("."):
            return "dotfile segment"
        if seg in PROTECTED_SEGMENTS:
            return "protected segment %r" % seg
        if "secret" in seg or "credential" in seg:
            return "sensitive name segment"
    base = parts[-1]
    if base in PROTECTED_BASENAMES or _is_env_basename(base):
        return "protected file"
    if base.endswith(PROTECTED_SUFFIXES):
        return "protected suffix"
    if len(parts) >= 2 and parts[-2] == "config" and base.endswith(".json"):
        return "config json"
    return None


def allowed_paths(allow):
    exact = {norm(p) for p in allow.get("files", [])}
    exact |= {norm(m["to"]) for m in allow.get("mapped_files", [])}
    prefixes = []
    for built in allow.get("built_directories", []):
        prefixes.append((norm(built["to"]).rstrip("/") + "/", tuple(built["allowed_extensions"])))
    return exact, prefixes


def validate_allowlist(allow):
    errors = []
    exact, prefixes = allowed_paths(allow)
    for rel in sorted(exact):
        why = protected_reason(rel)
        if why:
            errors.append("allowlist entry %s is protected (%s)" % (rel, why))
    for prefix, _exts in prefixes:
        why = protected_reason(prefix.rstrip("/"))
        if why:
            errors.append("built directory %s is protected (%s)" % (prefix, why))
    approved_sources = {"tests/fixtures/genui/market.valid.json"}
    for mapped in allow.get("mapped_files", []):
        src = norm(mapped["from"])
        if src not in approved_sources:
            errors.append("mapped source %s is not an approved public fixture" % src)
    return errors


def copy_file(src, dst):
    if os.path.islink(src) or not os.path.isfile(src):
        raise FileNotFoundError("allowlisted source missing or not a regular file: %s" % os.path.relpath(src, ROOT))
    os.makedirs(os.path.dirname(dst) or ".", exist_ok=True)
    shutil.copyfile(src, dst)


def _assert_safe_out(out):
    out = os.path.abspath(out)
    site = os.path.join(ROOT, "_site")
    try:
        inside = os.path.commonpath([out, ROOT]) == ROOT
    except ValueError:
        inside = False
    if inside and out != site:
        raise ValueError("refusing to assemble inside the repo outside _site")
    return out


def assemble(out, allow=None):
    allow = allow if allow is not None else load_allowlist()
    errors = validate_allowlist(allow)
    if errors:
        for err in errors:
            print("[FAIL] " + err)
        return 1
    try:
        out = _assert_safe_out(out)
    except ValueError as exc:
        print("[FAIL] " + str(exc))
        return 1
    shutil.rmtree(out, ignore_errors=True)
    os.makedirs(out)
    try:
        for rel in allow.get("files", []):
            copy_file(os.path.join(ROOT, norm(rel)), os.path.join(out, norm(rel)))
        for mapped in allow.get("mapped_files", []):
            copy_file(os.path.join(ROOT, norm(mapped["from"])), os.path.join(out, norm(mapped["to"])))
        for built in allow.get("built_directories", []):
            src_dir = os.path.join(ROOT, norm(built["from"]))
            if not os.path.isdir(src_dir):
                raise FileNotFoundError("built directory missing (run npm run build first): %s" % built["from"])
            exts = tuple(ext.lower() for ext in built["allowed_extensions"])
            for dp, dns, fns in os.walk(src_dir):
                dns[:] = sorted(d for d in dns if not d.startswith(".") and not os.path.islink(os.path.join(dp, d)))
                for fn in sorted(fns):
                    src = os.path.join(dp, fn)
                    rel = os.path.relpath(src, src_dir).replace(os.sep, "/")
                    if fn.startswith(".") or os.path.islink(src) or not fn.lower().endswith(exts):
                        print("[SKIP] %s/%s" % (built["from"], rel))
                        continue
                    copy_file(src, os.path.join(out, norm(built["to"]), rel))
    except (FileNotFoundError, ValueError) as exc:
        print("[FAIL] " + str(exc))
        return 1
    for rewrite in allow.get("rewrites", []):
        page = os.path.join(out, norm(rewrite["page"]))
        with open(page, encoding="utf-8") as fh:
            text = fh.read()
        src_text, dst_text = rewrite["from"], rewrite["to"]
        if src_text not in text:
            print("[FAIL] rewrite marker missing from %s" % rewrite["page"])
            return 1
        text = text.replace(src_text, dst_text)
        if src_text in text:
            print("[FAIL] rewrite incomplete for %s" % rewrite["page"])
            return 1
        with open(page, "w", encoding="utf-8") as fh:
            fh.write(text)
    for inj in allow.get("inject_scripts", []):
        page = os.path.join(out, norm(inj["page"]))
        with open(page, encoding="utf-8") as fh:
            text = fh.read()
        if inj["tag"] not in text:
            if "</head>" not in text:
                print("[FAIL] cannot inject into %s" % inj["page"])
                return 1
            text = text.replace("</head>", "  %s\n</head>" % inj["tag"], 1)
            with open(page, "w", encoding="utf-8") as fh:
                fh.write(text)
    count = sum(len(fns) for _, _, fns in os.walk(out))
    print("[PASS] assembled %d allowlisted files" % count)
    return 0


def _listed(rel, exact, prefixes):
    if rel in exact:
        return True
    lowered = rel.lower()
    return any(rel.startswith(prefix) and lowered.endswith(ext) for prefix, ext in prefixes)


def verify(site, allow=None):
    allow = allow if allow is not None else load_allowlist()
    fails = list(validate_allowlist(allow))
    exact, prefixes = allowed_paths(allow)
    site = os.path.abspath(site)
    if not os.path.isdir(site):
        print("[FAIL] artifact directory missing")
        return 1
    seen = set()
    for dp, dns, fns in os.walk(site, followlinks=False):
        for directory in list(dns):
            full_dir = os.path.join(dp, directory)
            if os.path.islink(full_dir):
                fails.append("symlinked directory: %s" % os.path.relpath(full_dir, site))
        for fn in fns:
            full = os.path.join(dp, fn)
            rel = os.path.relpath(full, site).replace(os.sep, "/")
            seen.add(rel)
            if os.path.islink(full):
                fails.append("symlink: %s" % rel)
                continue
            if not _listed(rel, exact, prefixes):
                fails.append("not allowlisted: %s" % rel)
            why = protected_reason(rel)
            if why:
                fails.append("denylisted: %s (%s)" % (rel, why))
            with open(full, "rb") as fh:
                data = fh.read()
            text = data.decode("utf-8", errors="ignore")
            for name, pattern in SECRET_PATTERNS:
                match = pattern.search(text)
                if match:
                    fails.append("credential pattern %s in %s at offset %d" % (name, rel, match.start()))
    for rel in sorted(exact - seen):
        fails.append("allowlisted file missing: %s" % rel)
    if fails:
        print("=== PAGES ARTIFACT: FAIL (%d) ===" % len(fails))
        for item in fails:
            print("  [FAIL] " + item)
        return 1
    print("[PASS] pages artifact: %d files, all allowlisted; no denylisted path or credential pattern" % len(seen))
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)
    assemble_cmd = sub.add_parser("assemble")
    assemble_cmd.add_argument("--out", default=os.path.join(ROOT, "_site"))
    verify_cmd = sub.add_parser("verify")
    verify_cmd.add_argument("--site", default=os.path.join(ROOT, "_site"))
    args = parser.parse_args(argv)
    if args.cmd == "assemble":
        return assemble(args.out)
    return verify(args.site)


if __name__ == "__main__":
    sys.exit(main())
