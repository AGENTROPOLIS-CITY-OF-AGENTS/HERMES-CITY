# HERMES CITY AGENT-ENTITY Runtime Continuity

Hermes is a replaceable execution harness and persistent coordination surface. It is not the source of AGENT-ENTITY identity.

## Runtime rule

```text
AGENT-ENTITY
  -> Dock admission
  -> RuntimeBinding
  -> HERMES session / bot / worker
```

A Hermes bot, desktop session, group, subagent, or peer process MUST NOT silently become a new AGENT-ENTITY when valid continuity evidence resolves to an existing entity.

## Required runtime context

Hermes-facing Agentropolis jobs SHOULD carry:

- `agent_entity_id`
- `agent_did`
- `runtime_binding_id`
- `dock_session_ref`
- `mandate_ref`
- `execution_envelope_ref`
- `capability_policy_ref`
- `continuity_passport_ref` where available

Raw private keys and root credentials MUST NOT be projected into Hermes context.

## Handoff rule

A handoff from ChatGPT, Codex, local runtime, mobile, or another approved harness into Hermes is a runtime transition, not an identity-creation event.

```text
same AGENT-ENTITY
  + new runtime
  = new RuntimeBinding
  != new identity
```

## Authority

Identity continuity does not transfer authority automatically. Effective permissions are recalculated for the active runtime binding through mandate, AEGIS, Capability Grid, budget and execution-envelope controls.

## Receipts

Material execution SHOULD bind receipts to both:

- persistent `agent_entity_id`
- active `runtime_binding_id`

This makes it possible to preserve reputation and history at the entity level while still identifying which runtime actually performed the action.
