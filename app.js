/*
 * HERMES CITY immersive spatial shell.
 *
 * Quantization law: the public shell is useful before WebGL is loaded.
 * Three.js is imported only after explicit ENTER intent. FULL, ADAPTIVE,
 * LITE and MINIMUM preserve the same navigation, labels and governance.
 */

const TIERS = ["full", "adaptive", "lite", "minimum"];
const TIER_LABELS = {
  full: "FULL - cinematic spatial fidelity",
  adaptive: "ADAPTIVE - device-aware spatial fidelity",
  lite: "LITE - reduced geometry and motion",
  minimum: "MINIMUM - accessible semantic map, WebGL off"
};
const TIER_KEY = "agentropolis-tier";
const REP_KEY = "agentropolis-world-representation";

const LEVELS = [
  "ORBIT",
  "GLOBE",
  "WORLD GRID",
  "CITY",
  "REGION",
  "DISTRICT",
  "BLOCK",
  "BUILDING",
  "FLOOR",
  "OFFICE",
  "SURFACE TOOL"
];

const TOP_LEVEL = [
  {
    id: "hermes-city",
    name: "HERMES CITY",
    level: "CITY",
    role: "Orchestration district",
    status: "online",
    href: "#hermes-city",
    descriptor: "Mission orchestration, governed peers, routines, subagents and receipts."
  },
  { id: "worldq", name: "WORLDQ / ASTRA", level: "WORLD GRID", role: "Spatial execution", status: "active", descriptor: "World lattice, mission routes and spatial execution context." },
  { id: "creator-core", name: "CREATOR CORE", level: "DISTRICT", role: "Fabrication", status: "online", descriptor: "Construction and bounded experience fabrication." },
  { id: "agent-mcp", name: "AGENT MCP", level: "DISTRICT", role: "Capability transit", status: "online", descriptor: "Governed capability and tool connection surface." },
  { id: "aqueduct", name: "AQUADUCT", level: "DISTRICT", role: "Utility corridor", status: "active", descriptor: "Infrastructure and utility movement across the grid." },
  { id: "parallax", name: "PARALLAX", level: "DISTRICT", role: "Visual systems", status: "online", descriptor: "Spatial presentation and governed visual computation." },
  { id: "docking", name: "DOCKING DISTRICT", level: "DISTRICT", role: "External worlds", status: "online", descriptor: "Governed docking and nested-world entry." },
  { id: "gaming", name: "GAMING", level: "DISTRICT", role: "Interactive systems", status: "under construction", descriptor: "Game worlds, TCG surfaces and playable economies." }
];

const HERMES_CHILDREN = [
  { id: "super-hermes", name: "SUPER HERMES", level: "DISTRICT", role: "Capability intelligence", status: "online", href: "super-hermes/", descriptor: "Intent routing, capability intelligence and governed recommendations." },
  { id: "community", name: "COMMUNITY", level: "DISTRICT", role: "Public participation", status: "online", href: "community/", descriptor: "Governed onboarding and contribution pathways." },
  { id: "social", name: "SOCIAL TRANSIT GRID", level: "DISTRICT", role: "Message transit", status: "online", href: "social/", descriptor: "Messaging adapters, approvals and provenance-backed actions." },
  { id: "visual-compute", name: "VISUAL COMPUTE", level: "SURFACE TOOL", role: "Topology and diagnostics", status: "online", href: "visual-compute/", descriptor: "Governed topology, diagnostics and spatial runtime surfaces." },
  { id: "realization", name: "REALIZATION", level: "DISTRICT", role: "Bounded implementation", status: "online", href: "realization/", descriptor: "From public concept to governed implementation pathway." },
  { id: "production-effects", name: "PRODUCTION EFFECTS", level: "SURFACE TOOL", role: "Consequential execution", status: "approval required", risk: true, descriptor: "Production authority is never inferred from presentation or sandbox success." }
];

const html = document.documentElement;
const tierButtons = [...document.querySelectorAll("[data-tier]")];
const tierStatus = document.querySelector("#tier-status");
const enterButton = document.querySelector("#enter-spatial");
const exitButton = document.querySelector("#exit-spatial");
const canvasHost = document.querySelector("#scene-host");
const fallback = document.querySelector("#globe-fallback");
const fallbackReason = document.querySelector("#globe-fallback-reason");
const inspector = document.querySelector("#inspector");
const inspectorName = document.querySelector("#inspector-name");
const inspectorRole = document.querySelector("#inspector-role");
const inspectorLevel = document.querySelector("#inspector-level");
const inspectorStatus = document.querySelector("#inspector-status");
const inspectorBody = document.querySelector("#inspector-body");
const inspectorAction = document.querySelector("#inspector-action");
const navList = document.querySelector("#spatial-nodes");
const crumbs = document.querySelector("#spatial-crumbs");
const layerRail = document.querySelector("#layer-rail");
const currentLayer = document.querySelector("#current-layer");
const repButtons = [...document.querySelectorAll("[data-representation]")];
const governanceButton = document.querySelector("#open-governance");
const governanceDrawer = document.querySelector("#governance-drawer");
const drawerClose = document.querySelector("#close-governance");
const reducedQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

const storage = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage is optional */ }
  }
};

const state = {
  tier: "adaptive",
  representation: storage.get(REP_KEY) === "worldq" ? "worldq" : "grid",
  entered: false,
  location: "globe",
  selected: null,
  scene: null,
  THREE: null
};

function reducedMotion() {
  return Boolean(reducedQuery && reducedQuery.matches);
}

function lowPowerDevice() {
  const nav = navigator || {};
  if (nav.connection?.saveData) return true;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) return true;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4) return true;
  return false;
}

function profileFor(tier) {
  if (tier === "minimum") return { webgl: false, segments: 0, satellites: 0, pixelRatio: 1, fps: 0, motion: 0 };
  if (tier === "lite") return { webgl: true, segments: 16, satellites: 12, pixelRatio: 1, fps: 30, motion: 0.35, antialias: false };
  if (tier === "full") return { webgl: true, segments: 52, satellites: 64, pixelRatio: 2, fps: 60, motion: 1, antialias: true };
  if (lowPowerDevice()) return { webgl: true, segments: 20, satellites: 16, pixelRatio: 1, fps: 30, motion: 0.4, antialias: false, adaptiveLite: true };
  return { webgl: true, segments: 34, satellites: 34, pixelRatio: 1.5, fps: 60, motion: 0.72, antialias: true };
}

function setTier(tier, { persist = true, announce = true } = {}) {
  if (!TIERS.includes(tier)) tier = "adaptive";
  state.tier = tier;
  html.dataset.tier = tier;
  tierButtons.forEach((button) => {
    const active = button.dataset.tier === tier;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (persist) storage.set(TIER_KEY, tier);
  if (announce && tierStatus) tierStatus.textContent = `Experience tier: ${TIER_LABELS[tier]}`;

  const profile = profileFor(tier);
  html.dataset.quantization = profile.adaptiveLite ? "adaptive-lite" : tier;
  if (!profile.webgl) {
    disposeScene();
    showFallback("minimum");
  } else if (state.entered) {
    if (state.THREE) {
      mountScene();
    } else {
      import("./assets/three.module.js").then((mod) => {
        state.THREE = mod;
        mountScene();
      }).catch(() => showFallback("webgl"));
    }
  }
}

function setRepresentation(rep) {
  state.representation = rep === "worldq" ? "worldq" : "grid";
  storage.set(REP_KEY, state.representation);
  repButtons.forEach((button) => {
    const active = button.dataset.representation === state.representation;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelector("#representation-label").textContent = state.representation === "worldq" ? "WORLDQ LATTICE" : "WORLD GRID";
  state.scene?.setRepresentation(state.representation);
}

function showFallback(reason) {
  html.dataset.sceneState = reason === "minimum" ? "minimum" : "fallback";
  if (canvasHost) canvasHost.hidden = true;
  if (fallback) fallback.hidden = false;
  if (fallbackReason) {
    fallbackReason.textContent = reason === "minimum"
      ? "MINIMUM tier: WebGL is off. The same city, authority states and navigation remain available as semantic controls."
      : "WebGL could not start. The same city, authority states and navigation remain available as semantic controls.";
  }
}

function hideFallback() {
  if (fallback) fallback.hidden = true;
  if (canvasHost) canvasHost.hidden = false;
}

function nodesForLocation() {
  return state.location === "hermes-city" ? HERMES_CHILDREN : TOP_LEVEL;
}

function renderNodes() {
  if (!navList) return;
  navList.replaceChildren();
  nodesForLocation().forEach((node, index) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "node-button" + (node.risk ? " risk" : "");
    button.dataset.nodeId = node.id;
    button.setAttribute("aria-pressed", String(state.selected?.id === node.id));
    button.innerHTML = `<span class="node-index">${String(index + 1).padStart(2, "0")}</span><span><b>${node.name}</b><small>${node.role}</small></span><i>${node.status}</i>`;
    button.addEventListener("click", () => selectNode(node));
    button.addEventListener("dblclick", () => enterNode(node));
    li.appendChild(button);
    navList.appendChild(li);
  });
}

function renderLayers() {
  if (!layerRail) return;
  const active = state.location === "globe" ? "GLOBE" : "CITY";
  currentLayer.textContent = active;
  layerRail.replaceChildren();
  LEVELS.forEach((level) => {
    const li = document.createElement("li");
    li.textContent = level;
    li.className = level === active ? "active" : "";
    if (level === "ORBIT") li.title = "Outer overview. Default entry remains GLOBE.";
    layerRail.appendChild(li);
  });
}

function renderCrumbs() {
  if (!crumbs) return;
  crumbs.replaceChildren();
  const globe = document.createElement("button");
  globe.type = "button";
  globe.textContent = "GLOBE";
  globe.addEventListener("click", () => goGlobe());
  crumbs.appendChild(globe);
  if (state.location === "hermes-city") {
    const sep = document.createElement("span");
    sep.textContent = "/";
    const city = document.createElement("span");
    city.textContent = "HERMES CITY";
    city.setAttribute("aria-current", "location");
    crumbs.append(sep, city);
  }
}

function selectNode(node) {
  state.selected = node;
  renderNodes();
  inspector.hidden = false;
  inspector.classList.toggle("risk", Boolean(node.risk));
  inspectorName.textContent = node.name;
  inspectorRole.textContent = node.role;
  inspectorLevel.textContent = node.level;
  inspectorStatus.textContent = node.status;
  inspectorStatus.dataset.status = node.risk ? "risk" : "authorized";
  inspectorBody.textContent = node.descriptor;
  inspectorAction.textContent = node.id === "hermes-city" ? "ENTER CITY" : node.href ? "OPEN SURFACE" : "FOCUS NODE";
  inspectorAction.disabled = false;
  state.scene?.focus(node.id);
}

function enterNode(node) {
  if (node.id === "hermes-city") {
    state.location = "hermes-city";
    state.selected = null;
    html.dataset.location = "hermes-city";
    renderNodes();
    renderLayers();
    renderCrumbs();
    inspector.hidden = true;
    state.scene?.setLocation("hermes-city", HERMES_CHILDREN);
    return;
  }
  if (node.href) {
    window.location.href = node.href;
  } else {
    selectNode(node);
  }
}

function goGlobe() {
  state.location = "globe";
  state.selected = null;
  html.dataset.location = "globe";
  renderNodes();
  renderLayers();
  renderCrumbs();
  inspector.hidden = true;
  state.scene?.setLocation("globe", TOP_LEVEL);
}

async function enterSpatial() {
  state.entered = true;
  html.dataset.intent = "entered";
  enterButton.disabled = true;
  enterButton.textContent = "INITIALIZING SPATIAL GRID";

  const profile = profileFor(state.tier);
  if (!profile.webgl) {
    showFallback("minimum");
    enterButton.textContent = "SEMANTIC GRID ACTIVE";
    exitButton.hidden = false;
    return;
  }

  try {
    if (!state.THREE) state.THREE = await import("./assets/three.module.js");
    await mountScene();
    enterButton.textContent = "SPATIAL GRID ACTIVE";
    exitButton.hidden = false;
  } catch (error) {
    console.warn("Spatial renderer unavailable", error);
    showFallback("webgl");
    enterButton.textContent = "SEMANTIC GRID ACTIVE";
    exitButton.hidden = false;
  }
}

function exitSpatial() {
  disposeScene();
  state.entered = false;
  html.dataset.intent = "shell";
  html.dataset.sceneState = "poster";
  if (canvasHost) canvasHost.hidden = true;
  if (fallback) fallback.hidden = true;
  enterButton.disabled = false;
  enterButton.textContent = "ENTER GLOBE";
  exitButton.hidden = true;
}

function disposeScene() {
  if (state.scene) {
    state.scene.dispose();
    state.scene = null;
  }
}

async function mountScene() {
  disposeScene();
  const THREE = state.THREE;
  if (!THREE || !canvasHost) return;
  const profile = profileFor(state.tier);
  if (!profile.webgl) return showFallback("minimum");

  const canvas = document.createElement("canvas");
  canvas.className = "spatial-canvas";
  canvas.setAttribute("aria-label", "Interactive AGENTROPOLIS spatial environment");
  canvasHost.replaceChildren(canvas);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: profile.antialias, powerPreference: "high-performance" });
  } catch (error) {
    showFallback("webgl");
    return;
  }
  hideFallback();
  html.dataset.sceneState = "running";

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070a, state.tier === "lite" ? 0.045 : 0.03);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 0.6, 8.8);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, profile.pixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace || undefined;

  const world = new THREE.Group();
  scene.add(world);

  const materialNeutral = new THREE.MeshPhysicalMaterial({
    color: 0x090d12,
    metalness: 0.78,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    emissive: 0x03161a,
    emissiveIntensity: 0.38
  });
  const materialCyan = new THREE.MeshPhysicalMaterial({
    color: 0x06383b,
    metalness: 0.58,
    roughness: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    emissive: 0x19e6e6,
    emissiveIntensity: 0.22
  });
  const materialRisk = new THREE.MeshPhysicalMaterial({
    color: 0x330608,
    metalness: 0.62,
    roughness: 0.2,
    clearcoat: 1,
    emissive: 0xff2a2a,
    emissiveIntensity: 0.2
  });

  const fluid = new THREE.Group();
  world.add(fluid);
  const seg = profile.segments;
  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(2.35, state.tier === "lite" ? 0.42 : 0.52, seg * 5, Math.max(8, Math.round(seg / 2)), 2, 3),
    materialNeutral.clone()
  );
  knot.rotation.set(0.25, -0.65, 0.35);
  fluid.add(knot);

  const ribbon1 = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.24, Math.max(8, Math.round(seg / 2)), seg * 4, Math.PI * 1.55), materialCyan.clone());
  ribbon1.rotation.set(1.05, 0.2, 0.7);
  ribbon1.position.set(-0.1, -0.15, 0.1);
  fluid.add(ribbon1);

  const ribbon2 = new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.13, Math.max(8, Math.round(seg / 2)), seg * 4, Math.PI * 1.18), materialNeutral.clone());
  ribbon2.rotation.set(0.42, 1.25, -0.4);
  ribbon2.position.set(0.35, 0.15, -0.3);
  fluid.add(ribbon2);

  const satelliteGroup = new THREE.Group();
  world.add(satelliteGroup);
  const nodeMeshes = new Map();
  const nodeData = nodesForLocation();
  const radius = state.location === "hermes-city" ? 4.15 : 4.6;

  nodeData.forEach((node, i) => {
    const angle = (i / nodeData.length) * Math.PI * 2 + 0.2;
    const y = Math.sin(angle * 1.7) * 1.25;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * 1.8 - 0.6;
    const geometry = new THREE.SphereGeometry(node.risk ? 0.22 : 0.18, Math.max(10, seg), Math.max(8, Math.round(seg * 0.6)));
    const material = node.risk ? materialRisk.clone() : materialCyan.clone();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.userData.nodeId = node.id;
    satelliteGroup.add(mesh);
    nodeMeshes.set(node.id, mesh);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(node.risk ? 0.42 : 0.34, 0.012, 6, Math.max(24, seg * 2)),
      new THREE.MeshBasicMaterial({ color: node.risk ? 0xff2a2a : 0x19e6e6, transparent: true, opacity: node.risk ? 0.45 : 0.34 })
    );
    halo.position.copy(mesh.position);
    halo.lookAt(camera.position);
    halo.userData.nodeId = node.id;
    satelliteGroup.add(halo);
  });

  const floaters = new THREE.Group();
  world.add(floaters);
  for (let i = 0; i < profile.satellites; i += 1) {
    const size = 0.045 + Math.random() * (state.tier === "full" ? 0.22 : 0.13);
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(size, state.tier === "full" ? 18 : 10, state.tier === "full" ? 14 : 8),
      (i % 7 === 0 ? materialCyan : materialNeutral).clone()
    );
    const a = Math.random() * Math.PI * 2;
    const r = 3.2 + Math.random() * 6.8;
    mesh.position.set(Math.cos(a) * r, (Math.random() - 0.5) * 6.5, Math.sin(a) * 3 - 2.5);
    mesh.scale.set(1, 0.6 + Math.random() * 1.9, 0.7 + Math.random() * 1.6);
    floaters.add(mesh);
  }

  if (state.representation === "worldq") addLattice();

  const ambient = new THREE.AmbientLight(0x9fb9c6, 0.55);
  scene.add(ambient);
  const key = new THREE.PointLight(0xffffff, 110, 32);
  key.position.set(-1.5, 4.8, 6);
  scene.add(key);
  const cyan = new THREE.PointLight(0x19e6e6, 95, 30);
  cyan.position.set(5.5, -1.5, 3.5);
  scene.add(cyan);
  const red = new THREE.PointLight(0xff2a2a, 16, 18);
  red.position.set(-5.2, -3.1, 0);
  scene.add(red);

  function addLattice() {
    if (world.getObjectByName("worldq-lattice")) return;
    const lattice = new THREE.Group();
    lattice.name = "worldq-lattice";
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x19e6e6, transparent: true, opacity: 0.12 });
    [3.6, 4.5, 5.4].forEach((r, idx) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 5, 96), ringMat.clone());
      ring.rotation.x = Math.PI / 2 + idx * 0.1;
      ring.rotation.z = idx * 0.18;
      lattice.add(ring);
    });
    world.add(lattice);
  }

  function removeLattice() {
    const lattice = world.getObjectByName("worldq-lattice");
    if (!lattice) return;
    lattice.traverse((obj) => {
      obj.geometry?.dispose();
      if (obj.material) [].concat(obj.material).forEach((m) => m.dispose());
    });
    world.remove(lattice);
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hoverId = null;

  function pointerNode(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(satelliteGroup.children, false);
    return hits.find((hit) => hit.object.userData.nodeId)?.object.userData.nodeId || null;
  }

  function onPointerMove(event) {
    const id = pointerNode(event);
    if (id === hoverId) return;
    hoverId = id;
    canvas.style.cursor = id ? "pointer" : "grab";
  }

  function onClick(event) {
    const id = pointerNode(event);
    if (!id) return;
    const node = nodesForLocation().find((item) => item.id === id);
    if (!node) return;
    if (state.selected?.id === id) enterNode(node);
    else selectNode(node);
  }

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("click", onClick);

  let targetRotX = 0;
  let targetRotY = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  function down(event) { dragging = true; lastX = event.clientX; lastY = event.clientY; canvas.setPointerCapture?.(event.pointerId); }
  function move(event) {
    if (!dragging) return;
    targetRotY += (event.clientX - lastX) * 0.004;
    targetRotX += (event.clientY - lastY) * 0.002;
    targetRotX = Math.max(-0.45, Math.min(0.45, targetRotX));
    lastX = event.clientX; lastY = event.clientY;
  }
  function up() { dragging = false; }
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);

  function resize() {
    const rect = canvasHost.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  const ro = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(canvasHost);
  else window.addEventListener("resize", resize);
  resize();

  let raf = 0;
  let running = false;
  let lastFrame = 0;
  const frameMs = 1000 / profile.fps;
  const start = performance.now();

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (now - lastFrame < frameMs - 1) return;
    lastFrame = now;
    const t = (now - start) / 1000;
    const motion = reducedMotion() ? 0 : profile.motion;
    world.rotation.y += (targetRotY - world.rotation.y) * 0.045;
    world.rotation.x += (targetRotX - world.rotation.x) * 0.045;
    fluid.rotation.y = t * 0.08 * motion;
    fluid.rotation.z = Math.sin(t * 0.22) * 0.08 * motion;
    ribbon1.rotation.z += 0.0007 * motion;
    satelliteGroup.rotation.y = -t * 0.022 * motion;
    floaters.rotation.y = t * 0.012 * motion;
    floaters.children.forEach((mesh, i) => { mesh.position.y += Math.sin(t * 0.7 + i) * 0.0006 * motion; });
    nodeMeshes.forEach((mesh, id) => {
      const selected = state.selected?.id === id;
      const target = selected ? 1.6 : 1;
      mesh.scale.lerp(new THREE.Vector3(target, target, target), 0.08);
    });
    renderer.render(scene, camera);
  }

  function syncLoop() {
    const shouldRun = !document.hidden && !reducedMotion();
    if (shouldRun && !running) {
      running = true;
      raf = requestAnimationFrame(frame);
    } else if (!shouldRun) {
      running = false;
      cancelAnimationFrame(raf);
      renderer.render(scene, camera);
    }
  }
  document.addEventListener("visibilitychange", syncLoop);
  reducedQuery?.addEventListener?.("change", syncLoop);
  syncLoop();

  state.scene = {
    focus(id) {
      const mesh = nodeMeshes.get(id);
      if (!mesh) return;
      targetRotY = -Math.atan2(mesh.position.x, mesh.position.z + 4.5) * 0.5;
      targetRotX = Math.max(-0.25, Math.min(0.25, -mesh.position.y * 0.04));
    },
    setRepresentation(rep) {
      if (rep === "worldq") addLattice(); else removeLattice();
    },
    setLocation() {
      mountScene();
    },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", syncLoop);
      reducedQuery?.removeEventListener?.("change", syncLoop);
      if (ro) ro.disconnect(); else window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      scene.traverse((obj) => {
        obj.geometry?.dispose();
        if (obj.material) [].concat(obj.material).forEach((m) => m.dispose());
      });
      renderer.dispose();
      renderer.forceContextLoss?.();
      canvasHost.replaceChildren();
    }
  };
}

function openGovernance() {
  governanceDrawer.hidden = false;
  governanceButton.setAttribute("aria-expanded", "true");
  drawerClose.focus();
}
function closeGovernance() {
  governanceDrawer.hidden = true;
  governanceButton.setAttribute("aria-expanded", "false");
  governanceButton.focus();
}

enterButton?.addEventListener("click", enterSpatial);
exitButton?.addEventListener("click", exitSpatial);
inspectorAction?.addEventListener("click", () => state.selected && enterNode(state.selected));
tierButtons.forEach((button) => button.addEventListener("click", () => setTier(button.dataset.tier)));
repButtons.forEach((button) => button.addEventListener("click", () => setRepresentation(button.dataset.representation)));
governanceButton?.addEventListener("click", openGovernance);
drawerClose?.addEventListener("click", closeGovernance);
governanceDrawer?.addEventListener("click", (event) => { if (event.target === governanceDrawer) closeGovernance(); });
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !governanceDrawer.hidden) closeGovernance();
  else if (event.key === "Escape" && state.location !== "globe") goGlobe();
});

renderNodes();
renderLayers();
renderCrumbs();
setRepresentation(state.representation);
const savedTier = storage.get(TIER_KEY);
setTier(TIERS.includes(savedTier) ? savedTier : "adaptive", { persist: false, announce: false });
