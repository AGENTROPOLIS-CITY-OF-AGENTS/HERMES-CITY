# Hermes Streaming TTS Adoption — HERMES CITY

**Status:** Adopted architecture; implementation verification required  
**Canonical specification:** https://github.com/AGENTROPOLIS-CITY-OF-AGENTS/agentropolis/blob/main/docs/HERMES_STREAMING_TTS.md

HERMES CITY uses streaming TTS for low-latency concierge dialogue, district briefings, status reports, and human-agent interaction.

```text
Hermes token stream -> safe clause splitter -> Voice Gateway -> provider adapter -> PCM chunks -> city surface
```

Rules: route vendors through the Voice Gateway; begin only on safe clauses; preserve whole-file and text fallback; support barge-in, mute, cancel, transfer, and human takeover; keep credentials outside prompts and clients; do not treat voice as authorization; require approval for publishing, deployment, payments, deletion, access changes, or third-party contact; retain audio and transcripts only by consent and policy.

Production readiness requires latency, interruption, fallback, secret-isolation, consent, and receipt tests.
