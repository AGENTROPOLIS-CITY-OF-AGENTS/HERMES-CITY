import * as THREE from "./assets/three.module.js";

/*
 * HERMES CITY globe-first shell (AGENTROPOLIS Design System 0.2.0).
 *
 * Presentation tiers are a real runtime lifecycle, not just a DOM attribute:
 *   FULL      highest geometry / pixel ratio, 60 fps loop
 *   ADAPTIVE  device-aware: adaptive profile, or the lite profile on
 *             save-data / low-memory / low-core devices
 *   LITE      no antialiasing, pixel ratio 1, low geometry, 30 fps cap
 *   MINIMUM   WebGL torn down (context released), static district map shown
 * Every tier change disposes the current renderer and mounts a new one, so
 * switching tiers mid-session changes the actual rendering cost.
 *
 * Visualization is not the source of truth and grants no authority.
 */

const TIERS = ["full", "adaptive", "lite", "minimum"];
const TIER_LABELS = {
  full: "FULL — highest globe detail",
  adaptive: "ADAPTIVE — detail matched to this device",
  lite: "LITE — reduced globe detail, 30 fps",
  minimum: "MINIMUM — 3D globe off, static district map"
};
const STORAGE_KEY = "agentropolis-tier";

const PROFILES = {
  full: { name: "full", webgl: true, antialias: true, maxPixelRatio: 2, sphere: [64, 48], stars: 600, fps: 60 },
  adaptive: { name: "adaptive", webgl: true, antialias: true, maxPixelRatio: 1.25, sphere: [48, 32], stars: 360, fps: 60 },
  lite: { name: "lite", webgl: true, antialias: false, maxPixelRatio: 1, sphere: [24, 16], stars: 120, fps: 30 },
  minimum: { name: "minimum", webgl: false }
};

const html = document.documentElement;
const tierButtons = [...document.querySelectorAll(".tier-control [data-tier]")];
const tierStatus = document.querySelector("#tier-status");
const fallbackEl = document.querySelector("#globe-fallback");
const fallbackReason = document.querySelector("#globe-fallback-reason");
const reducedQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

/* Persistence is optional: blocked storage (sandboxed iframes, strict
 * privacy policies) must never stop the globe or the tier controls. */
const storage = {
  get() {
    try { return window.localStorage.getItem(STORAGE_KEY); } catch { return null; }
  },
  set(value) {
    try { window.localStorage.setItem(STORAGE_KEY, value); } catch { /* non-persistent session */ }
  }
};

function prefersReducedMotion() {
  return Boolean(reducedQuery && reducedQuery.matches);
}

function isLowPowerDevice() {
  const nav = window.navigator || {};
  const conn = nav.connection;
  if (conn && conn.saveData) return true;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) return true;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4) return true;
  return false;
}

function resolveProfile(tier) {
  if (tier === "adaptive" && isLowPowerDevice()) return { ...PROFILES.lite, name: "adaptive-lite" };
  return PROFILES[tier] || PROFILES.adaptive;
}

function showFallback(reason) {
  html.dataset.globeState = reason === "minimum" ? "fallback-minimum" : "fallback-no-webgl";
  if (!fallbackEl) return;
  if (fallbackReason) {
    fallbackReason.textContent = reason === "minimum"
      ? "MINIMUM tier: the 3D globe is switched off to save power. The district map remains available below."
      : "3D globe unavailable in this browser (WebGL could not start). The district map remains available below.";
  }
  fallbackEl.hidden = false;
}

let webglProbe = null;
function webglAvailable() {
  // Probe once on a throwaway canvas so unsupported browsers go straight to
  // the static map instead of retrying renderer creation on every tier change.
  if (webglProbe === null) {
    try {
      const probe = document.createElement("canvas");
      webglProbe = Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
    } catch {
      webglProbe = false;
    }
  }
  return webglProbe;
}

function hideFallback() {
  if (fallbackEl) fallbackEl.hidden = true;
}

/* ---------- Globe lifecycle ---------- */

let active = null; // { dispose() }

function freshCanvas() {
  // A canvas whose WebGL context was released cannot host a new renderer,
  // so every mount gets a fresh element with the same identity/attributes.
  const old = document.querySelector("#globe3d");
  if (!old) return null;
  const canvas = old.cloneNode(false);
  old.replaceWith(canvas);
  return canvas;
}

function stageSize(canvas) {
  const host = canvas.parentElement || canvas;
  const rect = host.getBoundingClientRect();
  return { width: Math.max(1, Math.round(rect.width)), height: Math.max(1, Math.round(rect.height)) };
}

function mountGlobe(profile) {
  if (active) { active.dispose(); active = null; }
  html.dataset.globeQuality = profile.name;

  if (!profile.webgl) {
    const canvas = freshCanvas();
    if (canvas) canvas.hidden = true;
    showFallback("minimum");
    return;
  }

  const canvas = freshCanvas();
  if (!canvas) return;
  canvas.hidden = false;

  if (!webglAvailable()) {
    canvas.hidden = true;
    showFallback("no-webgl");
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: profile.antialias, powerPreference: "low-power" });
  } catch {
    canvas.hidden = true;
    showFallback("no-webgl");
    return;
  }
  hideFallback();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 1.2, 9.5);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, profile.maxPixelRatio));

  const group = new THREE.Group();
  scene.add(group);
  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(2.45, profile.sphere[0], profile.sphere[1]),
    new THREE.MeshStandardMaterial({ color: 0x071118, metalness: 0.58, roughness: 0.55, emissive: 0x06252a, emissiveIntensity: 0.35 })
  ));
  group.add(new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(2.48, 24, 16)),
    new THREE.LineBasicMaterial({ color: 0x19e6e6, transparent: true, opacity: 0.18 })
  ));
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.45, 0.012, 8, 180),
    new THREE.MeshBasicMaterial({ color: 0x19e6e6, transparent: true, opacity: 0.32 })
  );
  ring.rotation.x = Math.PI / 2.6;
  ring.rotation.z = 0.35;
  group.add(ring);

  const nodes = [
    ["HERMES CITY", new THREE.Vector3(2.2, 0.8, 1.3)],
    ["CREATOR CORE", new THREE.Vector3(-1.6, 1.7, 1.6)],
    ["AGENT MCP", new THREE.Vector3(-2.15, -0.5, 1.2)],
    ["WORLDQ", new THREE.Vector3(0.1, -2.2, 1.5)],
    ["AQUADUCT", new THREE.Vector3(1.2, 1.9, -1.5)],
    ["GAMING", new THREE.Vector3(-1.5, -1.4, -1.6)]
  ];
  nodes.forEach(([, pos], i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(i === 0 ? 0.14 : 0.08, 12, 12), new THREE.MeshBasicMaterial({ color: 0x19e6e6 }));
    m.position.copy(pos);
    group.add(m);
    if (i === 0) {
      const pulse = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.016, 8, 40), new THREE.MeshBasicMaterial({ color: 0x19e6e6, transparent: true, opacity: 0.6 }));
      pulse.position.copy(pos);
      pulse.lookAt(camera.position);
      group.add(pulse);
    }
  });

  const starsGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(profile.stars * 3);
  for (let i = 0; i < profile.stars; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 44;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
  }
  starsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0x19e6e6, size: 0.025, transparent: true, opacity: 0.45 })));

  scene.add(new THREE.AmbientLight(0xbad7e8, 0.65));
  const key = new THREE.PointLight(0x19e6e6, 55, 30);
  key.position.set(4, 5, 6);
  scene.add(key);
  const risk = new THREE.PointLight(0xff2a2a, 18, 22);
  risk.position.set(-5, -2, 3);
  scene.add(risk);

  // Size renderer + camera from the stage the canvas actually fills (not the
  // viewport), so the globe keeps its aspect ratio at any stage shape.
  function resize() {
    const { width, height } = stageSize(canvas);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (!loopRunning) drawFrame(performance.now());
  }

  const start = performance.now();
  let rafId = 0;
  let lastFrame = 0;
  let loopRunning = false;
  const frameInterval = 1000 / profile.fps;

  function drawFrame(now) {
    const t = (now - start) / 1000;
    group.rotation.y = prefersReducedMotion() ? -0.65 : -0.65 + t * 0.055;
    group.rotation.x = -0.09;
    renderer.render(scene, camera);
  }

  function loop(now) {
    if (!loopRunning) return;
    rafId = requestAnimationFrame(loop);
    if (now - lastFrame < frameInterval - 1) return;
    lastFrame = now;
    drawFrame(now);
  }

  function syncLoop() {
    const shouldRun = !prefersReducedMotion() && !document.hidden;
    if (shouldRun && !loopRunning) {
      loopRunning = true;
      html.dataset.globeState = "running";
      rafId = requestAnimationFrame(loop);
    } else if (!shouldRun) {
      if (loopRunning) cancelAnimationFrame(rafId);
      loopRunning = false;
      html.dataset.globeState = prefersReducedMotion() ? "static-frame" : "paused";
      drawFrame(performance.now());
    }
  }

  const ro = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(canvas.parentElement || canvas);
  else window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", syncLoop);
  if (reducedQuery && reducedQuery.addEventListener) reducedQuery.addEventListener("change", syncLoop);

  resize();
  syncLoop();

  active = {
    dispose() {
      loopRunning = false;
      cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", syncLoop);
      if (reducedQuery && reducedQuery.removeEventListener) reducedQuery.removeEventListener("change", syncLoop);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) [].concat(obj.material).forEach((m) => m.dispose());
      });
      renderer.dispose();
      renderer.forceContextLoss();
      html.dataset.globeState = "disposed";
    }
  };
}

/* ---------- Tier control ---------- */

function setTier(tier, { persist = true, announce = true } = {}) {
  if (!TIERS.includes(tier)) tier = "adaptive";
  const changed = html.dataset.tier !== tier || !html.dataset.globeState;
  html.dataset.tier = tier;
  tierButtons.forEach((b) => {
    const on = b.dataset.tier === tier;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", String(on));
  });
  if (persist) storage.set(tier);
  if (announce && tierStatus) tierStatus.textContent = "Experience tier: " + TIER_LABELS[tier];
  if (changed) mountGlobe(resolveProfile(tier));
}

tierButtons.forEach((b) => b.addEventListener("click", () => setTier(b.dataset.tier)));

const saved = storage.get();
setTier(TIERS.includes(saved) ? saved : "adaptive", { persist: false, announce: false });
