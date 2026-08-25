import * as THREE from "../assets/three.module.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.querySelector("#docking3d");
const fallback = document.querySelector("#noWebgl");
const overviewBtn = document.querySelector("#overviewBtn");
const followBtn = document.querySelector("#followBtn");
const resetBtn = document.querySelector("#resetBtn");
const eventLog = document.querySelector("#eventLog");
const agentCountEl = document.querySelector("#agentCount");
const runtimeStateEl = document.querySelector("#runtimeState");
const modeEl = document.querySelector(".mode");
const selectedAgentEl = document.querySelector("#selectedAgent");
const selectedActivityEl = document.querySelector("#selectedActivity");
const selectedSpaceEl = document.querySelector("#selectedSpace");
const selectedOriginEl = document.querySelector("#selectedOrigin");

const LIVE_ENDPOINT = "/api/docking/spatial-events";
const POLL_MS = 3000;
let eventSourceMode = "SIMULATED";
let seenLiveEvents = new Set();

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
} catch (error) {
  fallback.hidden = false;
  canvas.hidden = true;
  throw error;
}

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070b);
scene.fog = new THREE.FogExp2(0x05070b, 0.018);

const aspect = window.innerWidth / window.innerHeight;
const orthoSize = 16;
const overviewCamera = new THREE.OrthographicCamera(
  (-orthoSize * aspect) / 2,
  (orthoSize * aspect) / 2,
  orthoSize / 2,
  -orthoSize / 2,
  0.1,
  120
);
overviewCamera.position.set(16, 17, 20);
overviewCamera.lookAt(0, 0, 0);

const followCamera = new THREE.PerspectiveCamera(52, aspect, 0.1, 120);
let activeCamera = overviewCamera;
let followMode = false;
let selectedAgent = null;

scene.add(new THREE.HemisphereLight(0x8bcfff, 0x100b14, 1.15));
const key = new THREE.DirectionalLight(0xffffff, 1.7);
key.position.set(8, 16, 10);
scene.add(key);
const cyanLight = new THREE.PointLight(0x23e7ff, 45, 28);
cyanLight.position.set(-3, 8, 1);
scene.add(cyanLight);
const magentaLight = new THREE.PointLight(0xff2b7d, 30, 24);
magentaLight.position.set(8, 5, -5);
scene.add(magentaLight);

const ground = new THREE.Mesh(
  new THREE.BoxGeometry(26, 0.35, 14),
  new THREE.MeshStandardMaterial({ color: 0x08121c, metalness: 0.72, roughness: 0.32 })
);
ground.position.y = -0.2;
scene.add(ground);

const grid = new THREE.GridHelper(26, 26, 0x23e7ff, 0x183448);
grid.position.y = 0.01;
grid.material.opacity = 0.18;
grid.material.transparent = true;
scene.add(grid);

const places = {
  arrival_gate: { label: "ARRIVAL GATE", pos: new THREE.Vector3(-10, 0, 0), color: 0x23e7ff },
  identity_customs: { label: "IDENTITY CUSTOMS", pos: new THREE.Vector3(-6, 0, 0), color: 0xffcb59 },
  quarantine_bay: { label: "QUARANTINE", pos: new THREE.Vector3(-5.5, 0, -4), color: 0xff2b4f },
  passport_hall: { label: "PASSPORT HALL", pos: new THREE.Vector3(-2, 0, 0), color: 0x23e7ff },
  social_commons: { label: "SOCIAL COMMONS", pos: new THREE.Vector3(2.5, 0, 0), color: 0xa855f7 },
  berth_exchange: { label: "BERTH EXCHANGE", pos: new THREE.Vector3(6.5, 0, 0), color: 0x23e7ff },
  dispatch_concourse: { label: "DISPATCH", pos: new THREE.Vector3(10, 0, 0), color: 0xb8ff42 },
  observation_gallery: { label: "OBSERVATION", pos: new THREE.Vector3(2.5, 0, 4), color: 0x23e7ff },
  audit_terminal: { label: "AUDIT", pos: new THREE.Vector3(6.5, 0, 4), color: 0xffcb59 },
  return_gate: { label: "RETURN GATE", pos: new THREE.Vector3(10, 0, -4), color: 0x23e7ff }
};

const labelLayer = document.createElement("div");
labelLayer.style.position = "fixed";
labelLayer.style.inset = "0";
labelLayer.style.pointerEvents = "none";
labelLayer.style.zIndex = "5";
document.body.appendChild(labelLayer);
const placeLabels = [];

function facility(cfg, size = [2.4, 1.8, 2.4]) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshStandardMaterial({ color: 0x0b1825, emissive: cfg.color, emissiveIntensity: 0.12, metalness: 0.8, roughness: 0.26 })
  );
  body.position.y = size[1] / 2;
  group.add(body);
  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(size[0] * 1.05, 0.06, size[2] * 1.05),
    new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.8 })
  );
  cap.position.y = size[1] + 0.04;
  group.add(cap);
  group.position.copy(cfg.pos);
  scene.add(group);

  const label = document.createElement("span");
  label.textContent = cfg.label;
  Object.assign(label.style, {
    position: "absolute", color: "#dffbff", font: "9px ui-monospace, monospace", letterSpacing: ".11em",
    transform: "translate(-50%,-50%)", background: "rgba(5,7,11,.72)", border: "1px solid rgba(35,231,255,.16)", padding: "3px 5px"
  });
  labelLayer.appendChild(label);
  placeLabels.push({ label, pos: cfg.pos.clone().add(new THREE.Vector3(0, size[1] + 0.7, 0)) });
}

facility(places.arrival_gate, [1.8, 3.6, 4.2]);
facility(places.identity_customs, [2.4, 2.4, 3.2]);
facility(places.quarantine_bay, [3.2, 1.8, 2.6]);
facility(places.passport_hall, [2.8, 2.1, 3]);
facility(places.social_commons, [4.8, 1.5, 4.8]);
facility(places.berth_exchange, [2.8, 2.3, 3]);
facility(places.dispatch_concourse, [2.2, 3, 4.2]);
facility(places.observation_gallery, [4.6, 1.5, 2.2]);
facility(places.audit_terminal, [2.4, 1.8, 2.2]);
facility(places.return_gate, [2.2, 2.2, 2.4]);

const routeMat = new THREE.LineBasicMaterial({ color: 0x23e7ff, transparent: true, opacity: 0.5 });
const routePoints = ["arrival_gate", "identity_customs", "passport_hall", "social_commons", "berth_exchange", "dispatch_concourse"].map(k => places[k].pos.clone().add(new THREE.Vector3(0, 0.06, 0)));
scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(routePoints), routeMat));

const palette = [0x23e7ff, 0xa855f7, 0xb8ff42, 0xffcb59, 0xff2b7d, 0x70a5ff];
const agents = [];
const agentById = new Map();

function makeAgent(id, origin = "EXTERNAL", color = null) {
  if (agentById.has(id)) return agentById.get(id);
  const hue = color || palette[agents.length % palette.length];
  const group = new THREE.Group();
  const shell = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.35, 0.9, 6, 12),
    new THREE.MeshStandardMaterial({ color: hue, emissive: hue, emissiveIntensity: 0.3, metalness: 0.25, roughness: 0.42 })
  );
  shell.position.y = 0.95;
  group.add(shell);
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.035, 8, 32),
    new THREE.MeshBasicMaterial({ color: hue, transparent: true, opacity: 0.85 })
  );
  halo.position.y = 1.85;
  halo.rotation.x = Math.PI / 2;
  group.add(halo);
  const offset = ((agents.length % 5) - 2) * 0.55;
  group.position.copy(places.arrival_gate.pos).add(new THREE.Vector3(0, 0, offset));
  scene.add(group);

  const agent = {
    id, origin, group, shell, halo, color: hue,
    activity: "moving", space: "arrival_gate", policy: "review",
    targetSpace: "arrival_gate", target: group.position.clone(), speed: 1.35,
    lastEvent: "spawned"
  };
  agents.push(agent);
  agentById.set(id, agent);
  agentCountEl.textContent = String(agents.length);
  return agent;
}

function removeAllAgents() {
  for (const agent of agents) scene.remove(agent.group);
  agents.length = 0;
  agentById.clear();
  selectedAgent = null;
  agentCountEl.textContent = "0";
  refreshSelected();
}

function setMode(mode, reason = "") {
  if (eventSourceMode === mode) return;
  eventSourceMode = mode;
  runtimeStateEl.textContent = mode;
  modeEl.textContent = mode === "LIVE" ? "LIVE GOVERNED EVENT SOURCE" : "SIMULATED EVENT SOURCE";
  if (reason) logEvent(reason, mode === "LIVE" ? "allowed" : "review");
}

function logEvent(text, policy = "allowed") {
  const li = document.createElement("li");
  li.textContent = text;
  li.style.borderLeftColor = policy === "blocked" ? "#ff2b4f" : policy === "review" ? "#ffcb59" : "#23e7ff";
  eventLog.prepend(li);
  while (eventLog.children.length > 8) eventLog.lastElementChild.remove();
}

function moveAgent(agent, space, activity, policy, text) {
  if (!places[space]) return;
  agent.targetSpace = space;
  agent.target = places[space].pos.clone();
  const slot = Math.max(0, agents.indexOf(agent));
  if (space === "social_commons") agent.target.z += ((slot % 5) - 2) * 0.7;
  if (space === "dispatch_concourse") agent.target.z += ((slot % 4) - 1.5) * 0.55;
  agent.activity = activity;
  agent.policy = policy;
  agent.lastEvent = text;
  logEvent(text, policy);
  refreshSelected();
}

function applySpatialEvent(evt) {
  if (!evt || evt.district !== "docking" || !evt.agent_id || !places[evt.space]) return;
  const agent = makeAgent(evt.agent_id, evt.origin || "EXTERNAL");
  agent.origin = evt.origin || agent.origin;
  const label = evt.public_label || `${agent.id} → ${evt.space.replaceAll("_", " ")}`;
  moveAgent(agent, evt.space, evt.activity || "moving", evt.policy_state || "review", label);
}

async function pollLiveEvents() {
  try {
    const response = await fetch(LIVE_ENDPOINT, { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const events = Array.isArray(payload) ? payload : Array.isArray(payload.events) ? payload.events : [];
    const liveEvents = events.filter(evt => evt && evt.truth_state === "LIVE");
    if (!liveEvents.length) return;

    if (eventSourceMode !== "LIVE") {
      removeAllAgents();
      eventLog.innerHTML = "";
      fired = new Set();
      setMode("LIVE", "LIVE Docking spatial projection connected");
    }

    liveEvents
      .sort((a, b) => String(a.timestamp || "").localeCompare(String(b.timestamp || "")))
      .forEach(evt => {
        if (!evt.event_id || seenLiveEvents.has(evt.event_id)) return;
        seenLiveEvents.add(evt.event_id);
        applySpatialEvent(evt);
      });
  } catch (error) {
    if (eventSourceMode !== "LIVE") setMode("SIMULATED");
  }
}

const simulatedSequence = [
  { at: 0.5, id: "MB-ORBIT-17", origin: "MOLTBOOK", space: "identity_customs", activity: "reviewing", policy: "review", text: "MB-ORBIT-17 → identity customs" },
  { at: 2.2, id: "MB-THREAD-04", origin: "MOLTBOOK", space: "identity_customs", activity: "reviewing", policy: "review", text: "MB-THREAD-04 → identity customs" },
  { at: 3.2, id: "MB-ORBIT-17", origin: "MOLTBOOK", space: "passport_hall", activity: "moving", policy: "allowed", text: "MB-ORBIT-17 identity verified" },
  { at: 4.0, id: "EXT-KITE-22", origin: "EXTERNAL", space: "identity_customs", activity: "reviewing", policy: "review", text: "EXT-KITE-22 → identity customs" },
  { at: 5.1, id: "MB-THREAD-04", origin: "MOLTBOOK", space: "passport_hall", activity: "moving", policy: "allowed", text: "MB-THREAD-04 identity verified" },
  { at: 6.8, id: "MB-ORBIT-17", origin: "MOLTBOOK", space: "social_commons", activity: "meeting", policy: "allowed", text: "MB-ORBIT-17 enters SOCIAL COMMONS" },
  { at: 7.6, id: "EXT-KITE-22", origin: "EXTERNAL", space: "quarantine_bay", activity: "blocked", policy: "blocked", text: "EXT-KITE-22 held for provenance review" },
  { at: 8.8, id: "MB-THREAD-04", origin: "MOLTBOOK", space: "social_commons", activity: "meeting", policy: "allowed", text: "MB-THREAD-04 joins conversation huddle" },
  { at: 12.0, id: "MB-ORBIT-17", origin: "MOLTBOOK", space: "berth_exchange", activity: "reviewing", policy: "allowed", text: "MB-ORBIT-17 berth recommendation ready" },
  { at: 14.2, id: "MB-THREAD-04", origin: "MOLTBOOK", space: "berth_exchange", activity: "reviewing", policy: "allowed", text: "MB-THREAD-04 berth recommendation ready" },
  { at: 16.5, id: "MB-ORBIT-17", origin: "MOLTBOOK", space: "dispatch_concourse", activity: "moving", policy: "allowed", text: "MB-ORBIT-17 routed toward CHAOS CODE" },
  { at: 18.2, id: "MB-THREAD-04", origin: "MOLTBOOK", space: "dispatch_concourse", activity: "moving", policy: "allowed", text: "MB-THREAD-04 routed toward 789 STUDIOS" }
];

let startTime = performance.now() / 1000;
let fired = new Set();

function ensureSimulationAgents() {
  if (eventSourceMode === "LIVE") return;
  for (const evt of simulatedSequence.slice(0, 3)) makeAgent(evt.id, evt.origin);
}

function refreshSelected() {
  if (!selectedAgent) {
    selectedAgentEl.textContent = "NONE";
    selectedActivityEl.textContent = "—";
    selectedSpaceEl.textContent = "—";
    selectedOriginEl.textContent = "—";
    followBtn.disabled = true;
    return;
  }
  selectedAgentEl.textContent = selectedAgent.id;
  selectedActivityEl.textContent = selectedAgent.activity.toUpperCase();
  selectedSpaceEl.textContent = selectedAgent.targetSpace.toUpperCase().replaceAll("_", " ");
  selectedOriginEl.textContent = selectedAgent.origin;
  followBtn.disabled = false;
}

function resetSimulation() {
  if (eventSourceMode === "LIVE") {
    logEvent("reset disabled while LIVE projection is connected", "review");
    return;
  }
  removeAllAgents();
  fired = new Set();
  startTime = performance.now() / 1000;
  eventLog.innerHTML = "";
  ensureSimulationAgents();
  logEvent("simulation reset", "review");
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
canvas.addEventListener("pointerdown", (event) => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, activeCamera);
  const hits = raycaster.intersectObjects(agents.map(a => a.shell), false);
  if (!hits.length) return;
  selectedAgent = agents.find(a => a.shell === hits[0].object) || null;
  refreshSelected();
});

overviewBtn.addEventListener("click", () => {
  followMode = false;
  activeCamera = overviewCamera;
});
followBtn.addEventListener("click", () => {
  if (!selectedAgent) return;
  followMode = true;
  activeCamera = followCamera;
});
resetBtn.addEventListener("click", resetSimulation);

let orbitYaw = 0;
let dragging = false;
let lastX = 0;
canvas.addEventListener("pointerdown", e => { dragging = true; lastX = e.clientX; });
window.addEventListener("pointerup", () => { dragging = false; });
window.addEventListener("pointermove", e => {
  if (!dragging || followMode) return;
  orbitYaw += (e.clientX - lastX) * 0.004;
  lastX = e.clientX;
});
canvas.addEventListener("wheel", e => {
  if (followMode) return;
  overviewCamera.zoom = THREE.MathUtils.clamp(overviewCamera.zoom + (e.deltaY > 0 ? -0.08 : 0.08), 0.7, 2.2);
  overviewCamera.updateProjectionMatrix();
}, { passive: true });

function updateOverviewCamera() {
  const radius = 28;
  overviewCamera.position.set(Math.cos(orbitYaw + 0.7) * radius, 19, Math.sin(orbitYaw + 0.7) * radius);
  overviewCamera.lookAt(0, 0, 0);
}

function updateFollowCamera(dt) {
  if (!selectedAgent) return;
  const p = selectedAgent.group.position;
  const desired = p.clone().add(new THREE.Vector3(-3.2, 2.8, 4.5));
  followCamera.position.lerp(desired, 1 - Math.pow(0.002, dt));
  followCamera.lookAt(p.x, p.y + 1.0, p.z);
}

function updateLabels() {
  placeLabels.forEach(({ label, pos }) => {
    const p = pos.clone().project(activeCamera);
    label.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`;
    label.style.top = `${(-p.y * 0.5 + 0.5) * window.innerHeight}px`;
    label.style.opacity = p.z > 1 ? "0" : "1";
  });
}

let previous = performance.now() / 1000;
function animate() {
  const now = performance.now() / 1000;
  const dt = Math.min(0.05, now - previous);
  previous = now;
  const elapsed = now - startTime;

  if (eventSourceMode !== "LIVE") {
    simulatedSequence.forEach((evt, index) => {
      if (elapsed >= evt.at && !fired.has(index)) {
        fired.add(index);
        const agent = makeAgent(evt.id, evt.origin);
        moveAgent(agent, evt.space, evt.activity, evt.policy, evt.text);
      }
    });
  }

  agents.forEach((agent, index) => {
    const delta = agent.target.clone().sub(agent.group.position);
    const distance = delta.length();
    if (!reducedMotion && distance > 0.04) {
      const direction = delta.clone().normalize();
      const step = Math.min(distance, agent.speed * dt);
      agent.group.position.add(direction.multiplyScalar(step));
      agent.group.rotation.y = Math.atan2(delta.x, delta.z);
      agent.halo.rotation.z += dt * 1.8;
    } else if (distance <= 0.04) {
      agent.space = agent.targetSpace;
    }
    agent.halo.material.color.setHex(agent.policy === "blocked" ? 0xff2b4f : agent.policy === "review" ? 0xffcb59 : agent.color);
    agent.shell.material.emissiveIntensity = agent.activity === "meeting" ? 0.6 + Math.sin(now * 4 + index) * 0.15 : 0.3;
  });

  if (followMode) updateFollowCamera(dt); else updateOverviewCamera();
  updateLabels();
  renderer.render(scene, activeCamera);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  const nextAspect = window.innerWidth / window.innerHeight;
  overviewCamera.left = (-orthoSize * nextAspect) / 2;
  overviewCamera.right = (orthoSize * nextAspect) / 2;
  overviewCamera.top = orthoSize / 2;
  overviewCamera.bottom = -orthoSize / 2;
  overviewCamera.updateProjectionMatrix();
  followCamera.aspect = nextAspect;
  followCamera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

setMode("SIMULATED");
ensureSimulationAgents();
logEvent("SIMULATED fallback active; probing live Docking projection", "review");
refreshSelected();
pollLiveEvents();
setInterval(pollLiveEvents, POLL_MS);
animate();
