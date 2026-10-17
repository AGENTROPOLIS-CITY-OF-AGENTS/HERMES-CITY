<!--
Reference copy. Canonical edition (PROPOSED, NEURO decision 2026-10):
  AGENTROPOLIS-CITY-OF-AGENTS/PUBLIC-PORT-DISTRIBUTION-MEMBRANE:docs/obsidian-gbrain-intelligence-layer.md
Provenance: this file previously held a tailored full copy (blob dbe1b89b, commit 23008cf0, created 2026-07-05 PT; never edited since).
Core sections that conflicted with current law (Obsidian described as the source of truth and as the writable brain) are replaced
by the reference below; the HERMES-CITY-specific section is preserved as an overlay and aligned to the governed write contract.
Prior text is recoverable from git history (no history rewrite).
Prepared by Grok Bot (bounded implementation). Not independently verified by VERITY.
-->

# Obsidian + gBRAIN Intelligence Layer (HERMES-CITY reference)

The canonical edition of this document lives in
`AGENTROPOLIS-CITY-OF-AGENTS/PUBLIC-PORT-DISTRIBUTION-MEMBRANE` at `docs/obsidian-gbrain-intelligence-layer.md`.
This repository keeps this reference plus the overlay below. Overlays may add detail; they may not contradict the
canonical Layer Roles or the Governed Write Contract.

| Layer | Role |
| --- | --- |
| WikiVault | Owns governed evidence and canon (promotion-gated). |
| Obsidian | Human-readable / human-editable knowledge; not canon until promoted. |
| gBRAIN | Derived, rebuildable claims graph; written only by the projection job. |
| J-Space | Contextual reasoning; derived and read-only. |

There is no direct gBRAIN write surface. Claims are staged, reviewed by a non-producing reviewer, promoted to
WikiVault/Obsidian, and then projected into gBRAIN.

## HERMES-CITY overlay: Hermes City Behavior

Hermes (PM / orchestrator) should use the stack to:

- search WikiVault and the vault before drafting or executing
- preserve attribution and provenance on claims
- cite source notes or WikiVault ids when available
- avoid presenting hunches as facts; canon is only what WikiVault holds
- turn meetings, emails, and repo notes into **staged claim proposals** (not direct graph entries); gBRAIN is updated only by projection after review
- draft bespoke intros only when the relationship context and claim attribution are clear
