# Buzz Skills and Devin Public Lanes

HERMES CITY now recognizes three public-safe Buzz execution patterns:

```text
Native remote Hermes gateway
Shared-profile Hermes ACP
Built-in Buzz ACP presets, including Devin
```

## Native Hermes gateway

`tonbistudio/buzz-skills` provides a portable `hermes-in-buzz` workflow for connecting a dedicated remote Hermes host to a Buzz relay. The public architecture uses a separate Nostr agent identity, owner-only access by default, mention gating, NIP-OA when required, and real inbound/outbound verification.

## Native media delivery

The `buzz-media-attachments` skill sends approved local media through Buzz's native CLI attachment path. Delivery is only considered successful when Buzz returns an accepted event and event ID. Media transformations and hashes belong in the receipt.

## Devin ACP lane

Merged `block/buzz#3225` adds Devin to Buzz's built-in ACP preset catalog through the official invocation:

```text
devin acp
```

HERMES CITY presents Devin as an optional BYOH coding runtime, not as a city authority. Repository writes, merges, deployments, external publication, credentials, and destructive operations remain governed by Mission Control and policy gates.

## Public-safe flow

```text
Operator intent
  -> Buzz channel or thread
  -> HERMES Dispatch
  -> runtime selection
  -> policy gate
  -> Hermes gateway, Hermes ACP, or Devin ACP
  -> validation
  -> artifact and receipt
  -> human review
```

## Public security claims

HERMES CITY may state that these routes support dedicated identities, owner-only defaults, verified media delivery, and ACP runtime discovery. It must not claim that installing a skill or selecting a preset automatically provides authorization, sandboxing, credential isolation, deployment rights, or compliance.
