# Nous Hermes official plugins: discovery and approval gate

Status: CANDIDATE ONLY. Source: https://github.com/NousResearch/hermes-official-plugins . Inventory derived from supplied October 24, 2026 graphic; no live installation or version verification performed.

## Inventory (18)
Advanced Delegation; Agent Importers; MCP Serve; Memory Wiki; Langfuse; Claude Subscription DirectSDK (experimental); Meshy; Blender; TouchDesigner; Spotify; Home Assistant; X Chat; Snyk; REA; Camofox; Bubblewrap; Singularity/Apptainer; Accent Picker.

## Required read-only census
1. Capture Hermes version, platform and `hermes plugins --help` (do not assume subcommand names).
2. Query installed plugins using the supported local CLI; record name, version, publisher, enabled state, permissions, source hash and install method. Redact secrets.
3. Compare with upstream manifest at pinned commit; verify provenance, dependencies, licenses, platform requirements, network calls and costs.
4. Run Snyk/dependency and 54T policy review in isolation. Flag REA, Camofox, X Chat, MCP Serve and importers for elevated scrutiny.
5. Produce signed evidence/receipt and explicit human approval before installation, enablement or credential grants.

## Priority
P0: Advanced Delegation, MCP Serve, Snyk, Langfuse, Bubblewrap, Singularity/Apptainer.
P1: Memory Wiki, Meshy, Blender, TouchDesigner, Agent Importers, X Chat.
P2: Home Assistant, REA, Camofox, Spotify, Accent Picker.
HOLD: Claude Subscription DirectSDK pending experimental security and terms review.

## Invariants
Installed != Loaded != Live != Authorized. Summaries != authoritative ontology records. Default deny, least privilege, isolated credentials, immutable audit receipts. No bulk installs, merges or production changes from this document.
