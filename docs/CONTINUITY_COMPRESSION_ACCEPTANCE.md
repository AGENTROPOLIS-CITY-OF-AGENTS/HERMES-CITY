# Continuity Compression Acceptance Checklist

- [ ] Hermes loads the merged YAML without schema/config errors.
- [ ] Opus-family session compacts near 25% of its resolved context window.
- [ ] GPT-6/GPT-5.6 sessions compact near 85% of their resolved context window.
- [ ] Lean mode performs one summary pass per compression event.
- [ ] Last 3 user messages survive verbatim.
- [ ] Repo/branch/PR/SHA/path/error identifiers needed for active work survive or are recoverable.
- [ ] Agent identity, mandate, approvals, Execution Envelope, AEGIS state, and receipts remain sourced from durable state.
- [ ] Session/history search can recover compacted conversational material.
- [ ] Auxiliary compressor failure does not silently erase context.
- [ ] Fallback summarizer, if configured, can ingest the full compression input.
- [ ] Compression event produces telemetry/receipt data: model, resolved window, trigger, input size, summary size, timestamp.
- [ ] No execution permission is inferred from a compressed summary.
