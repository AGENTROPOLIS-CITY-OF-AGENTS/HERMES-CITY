# Hermes intelligence intake and bill watcher dispatch
Status: proposed skill / operator handoff; no live job or model enrollment.

## Bills and due-date candidate
1. Collect **operator supplied** payee alias, billing period, due date, currency, amount or explicit unknown, reminder timezone and lead time, and statement/receipt source reference.
2. Generate source-linked register, weekly due/changed/missing review, and draft reminder.
3. Distinguish due, scheduled, autopay-enabled, attempted, posted and **confirmed-paid**; confirmed-paid requires matched evidence for the same payee and period.
4. Reset new-period expectations without inheriting last month's payment status.
5. Request approval for calendar creation, outbound messages or sharing; never pay bills, edit autopay, open banking logins or recommend debt strategy autonomously.
6. Store minimal opt-in aliases/preferences; do not store account numbers or credentials in logs.
7. Simulate two periods and changed due date before making a scheduling request.

## Model candidate trials
- AirLLM: verify GPU **VRAM**, CPU RAM, disk footprint, offload latency and throughput. Do not equate model loading with usable inference speed.
- Nous MISSINGNO.: verify official model ID, portal access, pricing expiry, data handling and tool-call precision.
- Mistral Large 4: verify endpoint name, current access, token limits, price and model card; no assumed open-weight availability.
- BE evaluates; 54T checks containment; AEGIS gates privileged tools; Hermes consumes approved bounded routes. No automatic provider enablement.

## Fleet tasks
HERMES PM: scope implementation per owner, maintain dependency matrix, prepare CI receipts and dry-run evidence.
VERITY: independently reproduce claims, check credential exposure and denial behavior, sign acceptance/denial receipts.
Devin/engineer: implement after review, preserve current branch protections, **no merge or deploy without human authorization**.

Note HERMES-CITY has a separate protected-public-surface release issue under audit; do not merge or deploy this candidate while unresolved containment blocks exist.
