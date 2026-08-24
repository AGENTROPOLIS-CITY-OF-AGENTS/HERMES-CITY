# Agentropolis Civic Proof for Hermes Desktop

A public-safe Hermes Desktop overlay that extends the local achievements telemetry into an Agentropolis civic proof surface.

It separates:

```text
Achievements -> activity signals
Receipts     -> verifiable evidence
Reputation   -> reviewed reliability
Authority    -> explicit runtime mandate
```

The first three may inform review. None of them grants authority.

## What ships

- `/civic-proof` desktop page
- Sidebar navigation row
- Status-bar thermodynamic-health chip
- Command Palette entry: `Agentropolis: Open Civic Proof`
- Local telemetry proxies:
  - normalized tool entropy
  - recent-versus-baseline drift
  - error density
  - useful-work ratio
  - bounded thermodynamic-health score
- Explicit evidence-gap states for receipts and reputation
- Denied-by-default authority state

## Token and network behavior

Opening or refreshing Civic Proof does not create an agent turn or call a model.

The plugin reads the existing local endpoint:

```text
/api/plugins/hermes-achievements/achievements
```

The overlay computes its metrics in the desktop UI. It does not send telemetry to Agentropolis, HERMES CITY, or a third-party service.

## Requirement

Hermes Agent must have the bundled achievements backend enabled:

```yaml
plugins:
  enabled:
    - hermes-achievements
```

Verify the route mounted:

```bash
grep "Mounted plugin API routes: /api/plugins/hermes-achievements" ~/.hermes/logs/agent.log
```

## Install on macOS or Linux

This overlay uses the same desktop plugin ID as `hermes-achievements` so that `ctx.rest` binds to the bundled achievements backend. Back up any existing desktop plugin first.

```bash
mkdir -p ~/.hermes/desktop-plugins/hermes-achievements

if [ -f ~/.hermes/desktop-plugins/hermes-achievements/plugin.js ]; then
  cp ~/.hermes/desktop-plugins/hermes-achievements/plugin.js \
    ~/.hermes/desktop-plugins/hermes-achievements/plugin.js.backup
fi

cp integrations/hermes-desktop-civic-proof/plugin.js \
  ~/.hermes/desktop-plugins/hermes-achievements/plugin.js
```

Then open Hermes Desktop and run:

```text
Command Palette -> Reload desktop plugins
```

## Install on Windows PowerShell

```powershell
$target = Join-Path $HOME ".hermes\desktop-plugins\hermes-achievements"
New-Item -ItemType Directory -Force -Path $target | Out-Null

$plugin = Join-Path $target "plugin.js"
if (Test-Path $plugin) {
  Copy-Item $plugin "$plugin.backup" -Force
}

Copy-Item ".\integrations\hermes-desktop-civic-proof\plugin.js" $plugin -Force
```

Then open Hermes Desktop and run:

```text
Command Palette -> Reload desktop plugins
```

## Metric definitions

### Tool entropy

Normalized Shannon entropy across six local tool categories:

```text
terminal | files | web | delegation | processes | cron
```

A higher number means activity is distributed across more categories. It does not mean the work was correct.

### Drift proxy

Jensen-Shannon divergence between:

- the earliest 75 percent of sessions
- the most recent 25 percent of sessions

A higher number means the recent tool-use distribution differs more from the historical baseline. Drift can represent degradation, adaptation, a new project, or a changed mandate. It requires interpretation.

### Error density

```text
total error signals / total tool calls
```

Errors are detected from stored session telemetry. The metric is operational pressure, not a competence score.

### Useful-work proxy

A bounded ratio of available work signals to total tool calls. Current signals include:

- patches
- file reads and searches
- web extracts
- tests
- releases
- git events
- memory writes

This is a proxy because the achievements backend does not semantically judge whether the resulting artifact was useful.

### Thermodynamic health

A bounded composite:

```text
45% useful-work proxy
35% inverse heat
20% tool entropy
```

Heat combines scaled error density and drift. The score is deliberately advisory and must not be used as an automatic authorization gate.

## Receipt integration contract

The receipt envelope lives at:

```text
schemas/agentropolis-proof-receipt.schema.json
```

Until a receipt source is connected, the UI reports:

```text
Receipts: NOT CONNECTED
Coverage: unknown
```

It must never convert missing evidence into a zero score or a fabricated pass.

## Governance

```text
Identity -> Mandate -> Plan -> Execute -> Receipt -> Audit -> Human Review
```

Civic Proof belongs between receipt collection and review. It can summarize evidence and operational health. Permission changes still route through AEGIS Policy Gate and Human Mission Control.

> Activity is a signal. A receipt is evidence. Authority is a mandate.
