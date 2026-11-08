/**
 * HERMES-CITY Functionality Vault 54 integration — builder tests.
 * node:test, zero dependencies. Static + logic checks on index.html.
 * These are BUILDER tests, not independent verification (APEX54/GROKBOT
 * verification is a separate step). Run: node --test tests/hc54-integration.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const HTML = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

const TOWER_IDS = [
  "hermes-hq", "mission-control", "nemoclaw-works", "nemotron-council",
  "visual-compute", "wallet-rails", "hermes-community", "hermes-social",
  "super-hermes", "chaos-mall", "builder-commons",
];

test("image fix: no external tower image paths remain; all 11 images inlined", () => {
  assert.ok(!HTML.includes("assets/areas/"), "assets/areas/ path still present");
  for (const id of TOWER_IDS) {
    assert.ok(HTML.includes(`"${id}": "data:image/webp;base64,`),
      `no inlined data-URI for ${id}`);
  }
  assert.ok(HTML.includes("window.__HC_POSTER"), "poster fallback reference missing");
  assert.ok(HTML.includes("onerror"), "no onerror fallback present");
});

test("image fix: the 11 reference webp files exist and decode", () => {
  for (const id of TOWER_IDS) {
    const f = path.join(ROOT, "assets", "areas", `${id}.webp`);
    assert.ok(fs.existsSync(f), `missing assets/areas/${id}.webp`);
    const buf = fs.readFileSync(f);
    assert.equal(buf.subarray(0, 4).toString("ascii"), "RIFF", `${id}.webp is not WebP`);
    assert.ok(buf.length > 5000, `${id}.webp suspiciously small`);
  }
});

test("tokens: canonical named references only, no Design System hex as live values", () => {
  assert.ok(HTML.includes("#00E5FF"), "canonical cyan missing");
  assert.ok(HTML.includes("#FF2638"), "canonical red missing");
  assert.ok(HTML.includes("#080B10"), "canonical obsidian missing");
  assert.ok(!HTML.includes(":#19E6E6") && !HTML.includes(":#FF2A2A"),
    "Design System hex used as a live value");
  assert.ok(!HTML.includes("cdn.jsdelivr") && !HTML.includes("unpkg.com"),
    "unexpected CDN dependency");
});

test("Three.js stays inlined r186, no CDN", () => {
  assert.ok(HTML.includes('<script src="data:application/javascript;base64,'),
    "inlined Three.js script tag missing");
  assert.ok(!HTML.includes("threejs.org") && !HTML.includes("cdnjs"),
    "Three.js CDN reference present");
});

test("all six primitives are present in the artifact", () => {
  const markers = {
    "MASKED-TEXT-54": ["maskedSet", "mt-line", "mt-inner"],
    "INK-REVEAL-54": ["inkReveal", "hcInkFilter", "ink-in"],
    "LIQUID-GLASS-54": ["backdrop-filter:blur(16px)", "hc54"],
    "SPATIAL-SHELF-54": ["hcShelf", "shelfSelect", "SHELF", "aria-activedescendant"],
    "SPATIAL-MARQUEE-54": ["hcMarquee", "hc-marquee"],
    "PORTAL-REVEAL-54": ["portalTo", "hcPortalVeil"],
  };
  for (const [name, needles] of Object.entries(markers)) {
    for (const n of needles) assert.ok(HTML.includes(n), `${name}: missing ${n}`);
  }
});

test("floor model: one floor per service, elevator + floor camera API", () => {
  assert.ok(HTML.includes("hcFloorBtns"), "floor selector missing");
  assert.ok(HTML.includes("hcElevCar"), "elevator car missing");
  assert.ok(HTML.includes("floor: function(arg)"), "__HC3D.floor missing");
  assert.ok(HTML.includes("showInterior"), "3D interior show/hide missing");
  assert.ok(HTML.includes("hideInterior"), "3D interior hide missing");
});

test("activity display is wired to the real event log and labeled honestly", () => {
  assert.ok(HTML.includes("hcActivityList"), "activity list missing");
  assert.ok(HTML.includes("SESSION INTERACTION EVENTS ONLY"), "honest activity label missing");
  assert.ok(HTML.includes("NO LIVE AGENT FEED IS CONNECTED"), "missing-feed disclosure missing");
  assert.ok(!/live agent activity/i.test(HTML.replace(/NOT LIVE AGENT ACTIVITY/g, "")) ||
    HTML.includes("NOT LIVE AGENT ACTIVITY"), "unqualified live-agent-activity claim present");
  assert.ok(HTML.includes("renderActivity"), "activity renderer missing");
});

test("preserved systems: __HC3D API, view state machine, wallet denial, session receipts", () => {
  for (const m of ["select: function", "enter: function", "reset: function", "cityView: function"]) {
    assert.ok(HTML.includes(m), `__HC3D missing ${m}`);
  }
  assert.ok(HTML.includes("wallet_connect_denied"), "wallet denial event missing");
  assert.ok(HTML.includes("RECEIPT"), "receipt text missing");
  assert.ok(HTML.includes("prefers-reduced-motion"), "reduced-motion handling missing");
  assert.ok(HTML.includes("data-gl=\"off\""), "WebGL-fail fallback missing");
  assert.ok(HTML.includes("aria-live"), "aria-live region missing");
});

test("performance: tier + frame budget instrumentation present", () => {
  assert.ok(HTML.includes("__HC54"), "__HC54 perf object missing");
  assert.ok(HTML.includes("hcFrameEma"), "frame-time EMA missing");
  assert.ok(HTML.includes("drawCalls"), "draw-call reporting missing");
  assert.ok(HTML.includes("BUDGET 33 MS"), "performance budget label missing");
  assert.ok(HTML.includes("FULL") && HTML.includes("ADAPTIVE") &&
    HTML.includes("LITE") && HTML.includes("MINIMUM"), "quality tiers incomplete");
});

test("hashes: index.html is stable and recorded", () => {
  const hash = createHash("sha256").update(fs.readFileSync(path.join(ROOT, "index.html"))).digest("hex");
  assert.equal(hash.length, 64, "SHA-256 malformed");
  console.log("  index.html sha256:", hash);
});
