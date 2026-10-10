# HERMES Desktop Bot Mode Binding

Status: public-safe architecture contract

HERMES Desktop is the operator cockpit for Agentropolis Bot Mode. It is not the source of agent authority.

## Boundary

```text
Desktop intent
-> Identity
-> Mandate
-> Policy / 54-T gate
-> Tool + model permission
-> Execute
-> Receipt
-> Audit
```

A Bot tab, group chat, routine, unread notification, or selected model is session state. Session state is not authority.

## Desktop binding

| HERMES Desktop primitive | Agentropolis binding |
|---|---|
| Bot tab | governed agent session |
| Bot roster | district / agent roster |
| Bot identity view | resolved agent identity + role |
| Routines | governed scheduled workflows |
| Group chats | multi-agent coordination rooms |
| Unread activity | Mission Control activity signal |
| Empty Bot state | selected agent context before first conversation |
| New Bot default model | safe functional bootstrap model profile |
| Desktop language setting | presentation-layer locale inheritance |

## Session fabric

Bot Mode should share the normal HERMES Desktop session fabric wherever possible. Bot switching preserves selected identity and context; unread state uses the ordinary activity model; empty Bot sessions render the selected Bot; routines are first-class workflow objects; group and Bot sessions share a consistent lifecycle; localized Desktop settings propagate to Bot Mode presentation strings.

## Bot bootstrap contract

A newly created Bot that is not cloned from an existing profile must still be able to send its first message.

```text
create Bot
-> resolve identity shell
-> attach safe functional model profile
-> resolve district / role defaults
-> apply policy envelope
-> open session
-> first message ready
```

The bootstrap model is a functional fallback, not permanent routing authority. Agentropolis may subsequently route work according to policy, workload, district, device capability, compute budget, BYOM/BYOH configuration, evaluation results, and availability.

A model selection never grants tools, data, credentials, memory, or elevated execution scope by itself.

## Group session contract

Group chats are coordination surfaces, not permission unions. Each agent keeps distinct identity, mandate, tool permissions, data scope, memory scope, attribution, and policy gates. No participant inherits another participant's authority by joining the same conversation.

## Routine contract

A Routine is a scheduled or triggered request for execution. It does not permanently elevate a Bot.

```text
routine trigger
-> resolve Bot identity
-> resolve current mandate
-> resolve current policy
-> dispatch
-> execute
-> verify
-> receipt
```

Revoked permissions, expired credentials, changed risk tiers, or disabled tools must stop or degrade the routine safely.

## Activity and unread state

Unread indicators are attention signals only. They may represent new Bot output, routine completion, approval requests, failed execution, group activity, or receipt events. Unread state is never proof that an action succeeded; receipts remain the execution record.

## Localization

Bot Mode follows the HERMES Desktop presentation locale, including supported Japanese, Simplified Chinese, and Traditional Chinese interfaces. Localization affects presentation only. Canonical identifiers, policy decisions, audit events, receipts, and machine-readable enums remain stable across locales.

## Cockpit / control tower model

```text
HERMES Desktop = cockpit
Mission Control = control tower
Agentropolis = governed intelligence grid
```

The cockpit optimizes interaction. The control tower provides human oversight. The grid owns identity, authority, routing, execution constraints, receipts, and audit.

## Non-negotiable doctrine

> A Bot session is not authority.

The usable interface may become simpler. The governance boundary does not.
