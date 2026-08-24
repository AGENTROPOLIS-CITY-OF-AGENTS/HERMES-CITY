# Security Policy

HERMES CITY is a public static shell. It must not contain production credentials, private prompts, wallet secrets, client data, authenticated browser sessions, or private AGENTROPOLIS runtime code.

## Reporting

Use GitHub private vulnerability reporting or a security advisory. Do not publish exploit details, credentials, tokens, private URLs, personal data, or screenshots of sensitive systems in public issues.

Include the affected path, reproduction steps, expected impact, and a safe proof of concept.

## Scope

In scope: static pages, public schemas, public documentation, GitHub Pages workflow, dependency loading, and accidental secret exposure.

Out of scope: production AGENTROPOLIS services, private HERMES-SOCIAL infrastructure, private AGENTROPOLIS-DOCK workflows, social credentials, and wallet systems.

## Secret Shield

Raw secrets never enter model context. Tools never print raw secrets. Logs never persist raw secrets. Production credentials are used only inside sealed runtimes.

## Content Security Policy (GitHub Pages)

GitHub Pages serves static files and cannot send security headers, so the public shell applies a CSP meta tag on the landing page (`index.html`):

    default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'

- The landing page uses no inline scripts and no third-party runtime scripts. Three.js is vendored locally (`assets/three.module.js`) with an integrity hash recorded in `assets/VENDORED_ASSETS.md`.
- Interactive subpages (`super-hermes/`) currently use inline styles/scripts and are NOT covered by the meta CSP. Known limitation; tracked for a later lane.
- If header-based CSP is ever required, serve the site behind a CDN/edge that can inject headers; the meta policy above is the static Pages fallback.

## Vendored assets

Three.js 0.160.0 is vendored under `assets/` to remove the third-party CDN runtime dependency. See `assets/VENDORED_ASSETS.md` for source, license, integrity hash, and the update procedure.

## Static verification gate

`scripts/verify-site.py` checks routes, local links, same-page anchors, HTML structure, accessibility gates, color contrast, robots/sitemap/404, and canonical metadata. CI runs it before every Pages deployment (`make verify-site`).
