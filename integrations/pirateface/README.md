# Pirate Face private model ingress — draft v0.1

**Scope:** offline artifact-integrity admission prototype for HERMES. Not a Pirate Face API client, privacy service, torrent downloader, model loader, or production authorization.

## Boundary

External peer-to-peer retrieval must occur outside the HERMES execution runtime in a restricted staging environment. Never run downloaded scripts, pickle, remote code or model plugins. Default deny network egress and tool access for untrusted artifacts. Do not treat Tor as proof of anonymity or BitTorrent as private; ordinary peers may observe IP addresses.

## Local verification

```sh
python3 -m unittest discover -s integrations/pirateface -p 'test_*.py'
python3 integrations/pirateface/verify.py manifest.json weights.gguf
```

Manifest schema: exact keys `schema_version` (1), `model_id`, `filename`, `sha256` (lowercase hex), `size_bytes`, `license`, `source`, `approved` (boolean). A positive result means bytes matched a locally supplied hash **only**. The manifest itself is not authenticated; an attacker who can change both files can bypass this check. Do not use `approved=true` as an execution permission.

## Required before production

- Obtain authenticated signed manifests and independently trusted publisher identities; check model lineage and license terms.
- Inspect and sandbox supported formats, including safe parser limits and model-specific security review.
- Integrate APEX54 approval, HUSH54 metadata policy, GHOST54 isolation and immutable receipts with actual enforcement.
- Design privacy-aware transport separately and test IP, DNS, tracker, DHT, peer-discovery and telemetry leakage.
- Enforce file-descriptor-based path confinement and TOCTOU protection; current symlink check is not race-proof.
- Establish approved model registry, resource budgets, incident quarantine and offline recovery drills.
- Independently reproduce tests in CI and review before merge. No automatic download, inference or deployment.
