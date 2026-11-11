# AGP-BROWSER-001 | Browser Fleet
Status: **PROPOSED / NOT LIVE**. Public HERMES-CITY is only the coordination and status surface, not the private browser runtime.

| Lane | Proposed purpose | Restrictions |
| --- | --- | --- |
| Chrome / Chromium | HERMES and Browser Harness deterministic web automation | Isolated, ephemeral profile only |
| Brave | EVM/Solana dApp QA | Disposable testnet wallets; no production signing |
| DuckDuckGo Search | Search/research destination via approved Chromium/Brave adapter | Standalone DDG browser is not a presumed CDP adapter |
| Firefox | Independent compatibility/security testing | Tool support must be verified |
| Edge | Windows compatibility testing | Dedicated agent profile only |
| CloakBrowser | Experimental compatibility evaluation | No production admission without independent audit |
| Browse.sh | Reusable website skills | Pinned, signed/reviewed skills and scoped mandate |
| Crabbox / alternative isolated runtime | Disposable execution environment | Whole-process attestation, 54T validation and IRON GATE egress before use |

## Canonical private execution
`AGENT-ENTITY -> ATG Web Action -> AEGIS/54T decision -> verified whole-process sandbox -> HERMES Browser Harness -> observed result -> receipt -> VERITY`.

HERMES-CITY must never contain raw credentials, browser cookies/profiles, production wallet keys, unapproved debugging endpoints, or unverified sandbox status. UI should show distinct planned, configured, verified, and running states only with evidence. A proposed adapter is not a live capability.

Owner roles: HERMES (PM), Codex/Devin (implementation), AEGIS/54T (policy and containment), VERITY (independent audit), NEURO (production approval). Existing `docs/CRABBOX_BROWSESH_DISTRICTS.md` remains a historical map; this document governs browser fleet readiness.

## Verification exit criteria
P0: real containment provider validated, fail-closed escape tests green, no personal session import, scoped egress active. P1: approved adapter smoke tests; P2: immutable/off-host evidence and independently verified authorization receipts. No merge/deploy until authorized.
