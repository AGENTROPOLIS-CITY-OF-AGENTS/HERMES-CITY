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
