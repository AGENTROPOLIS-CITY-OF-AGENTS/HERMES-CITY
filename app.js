import * as THREE from "./assets/three.module.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const bootLines = [
  "boot://hermes-city",
  "mode: static mini 3d agentropolis",
  "core: hermes orchestration tower",
  "district: nemoclaw builder works",
  "district: nemotron research council",
  "district: wallet rails commerce lane",
  "boundary: public shell only",
  "license: apache-2.0",
  "ready: city interface online"
];

const terminal = document.querySelector("#typewriter");
const revealItems = document.querySelectorAll(".reveal");

function revealOnScroll() {
  const trigger = window.innerHeight * 0.88;
  revealItems.forEach((item) => {
    const top = item.getBoundingClientRect().top;
    if (top < trigger) item.classList.add("visible");
  });
}

function typeBootSequence() {
  if (!terminal) return;
  if (prefersReducedMotion) {
    terminal.textContent = bootLines.join("\n") + "\nCITY READY";
    return;
  }
  let lineIndex = 0;
  let charIndex = 0;
  let output = "";

  function tick() {
    const line = bootLines[lineIndex];
    output += line[charIndex] || "";
    terminal.textContent = output + "_";
    charIndex += 1;

    if (charIndex > line.length) {
      output += "\n";
      lineIndex += 1;
      charIndex = 0;
    }

    if (lineIndex < bootLines.length) {
      setTimeout(tick, charIndex === 0 ? 220 : 22);
    } else {
      terminal.textContent = output + "\nCITY READY";
    }
  }

  tick();
}

function addCardSignals() {
  document.querySelectorAll(".card").forEach((card, index) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(35, 231, 255, 0.18), rgba(12, 18, 28, 0.78) 42%)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.background = "rgba(12, 18, 28, 0.78)";
    });
    card.style.transitionDelay = `${index * 80}ms`;
  });
}

function showStaticFallback(canvas) {
  if (!canvas) return;
  document.body.classList.add("no-webgl");
  canvas.setAttribute("aria-hidden", "true");
  let fallback = document.querySelector(".city-fallback");
  if (fallback) return;
  fallback = document.createElement("div");
  fallback.className = "city-fallback";
  fallback.setAttribute("role", "img");
  fallback.setAttribute("aria-label", "Static map of the Agentropolis districts: Hermes HQ, NemoClaw Works, Nemotron Council, Wallet Rails, RAILWATCH, Mission Control");
  const towerList = [
    "Hermes HQ",
    "NemoClaw Works",
    "Nemotron Council",
    "Wallet Rails",
    "RAILWATCH",
    "Mission Control"
  ];
  const heading = document.createElement("p");
  heading.className = "city-fallback-heading";
  heading.textContent = "3D city visualization unavailable";
  fallback.appendChild(heading);
  const note = document.createElement("p");
  note.textContent = "This environment does not support WebGL (or motion is reduced). The districts below remain mapped.";
  fallback.appendChild(note);
  const list = document.createElement("ul");
  towerList.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    list.appendChild(li);
  });
  fallback.appendChild(list);
  canvas.insertAdjacentElement("afterend", fallback);
}

function createMiniCity() {
  const canvas = document.querySelector("#city3d");
  if (!canvas) return;

  let webglSupported = false;
  try {
    webglSupported = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch (err) {
    webglSupported = false;
  }
  if (!webglSupported) {
    showStaticFallback(canvas);
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (err) {
    showStaticFallback(canvas);
    return;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070b, 0.028);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(13, 11, 18);
  camera.lookAt(0, 1.6, 0);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, prefersReducedMotion ? 1 : 1.8));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const group = new THREE.Group();
  scene.add(group);

  const cyan = new THREE.Color(0x23e7ff);
  const red = new THREE.Color(0xff2b4f);
  const lime = new THREE.Color(0xb8ff42);
  const purple = new THREE.Color(0xa855f7);

  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(8.5, 9.4, 0.22, 96),
    new THREE.MeshStandardMaterial({ color: 0x07111b, metalness: 0.45, roughness: 0.35 })
  );
  ground.position.y = -0.13;
  group.add(ground);

  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x23e7ff, transparent: true, opacity: 0.28 });
  [4.4, 6.2, 8.1].forEach((radius, index) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.012, 8, 160), ringMaterial.clone());
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.02 + index * 0.025;
    group.add(ring);
  });

  const districts = [
    { name: "Hermes HQ", x: 0, z: 0, h: 5.8, color: cyan },
    { name: "NemoClaw Works", x: -4.1, z: -2.7, h: 3.7, color: red },
    { name: "Nemotron Council", x: 4.4, z: -2.4, h: 4.2, color: purple },
    { name: "Wallet Rails", x: -4.6, z: 3.4, h: 3.1, color: lime },
    { name: "RAILWATCH", x: 4.8, z: 3.1, h: 3.4, color: cyan },
    { name: "Mission Control", x: 0.2, z: 5.3, h: 2.8, color: red }
  ];

  const labelLayer = document.createElement("div");
  labelLayer.className = "city-label-layer";
  document.body.appendChild(labelLayer);

  const labels = [];

  districts.forEach((district, index) => {
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, district.h, 1.1),
      new THREE.MeshStandardMaterial({
        color: 0x0c1724,
        emissive: district.color,
        emissiveIntensity: index === 0 ? 0.28 : 0.16,
        metalness: 0.72,
        roughness: 0.28
      })
    );
    building.position.set(district.x, district.h / 2, district.z);
    group.add(building);

    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.08, 1.25),
      new THREE.MeshBasicMaterial({ color: district.color, transparent: true, opacity: 0.72 })
    );
    cap.position.set(district.x, district.h + 0.07, district.z);
    group.add(cap);

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 6.5, 16),
      new THREE.MeshBasicMaterial({ color: district.color, transparent: true, opacity: 0.24 })
    );
    beam.position.set(district.x, district.h + 3.3, district.z);
    group.add(beam);

    const label = document.createElement("span");
    label.className = "city-label";
    label.textContent = district.name;
    labelLayer.appendChild(label);
    labels.push({ label, position: new THREE.Vector3(district.x, district.h + 0.6, district.z) });
  });

  const roadMaterial = new THREE.LineBasicMaterial({ color: 0xff2b4f, transparent: true, opacity: 0.42 });
  districts.slice(1).forEach((district) => {
    const points = [new THREE.Vector3(0, 0.06, 0), new THREE.Vector3(district.x, 0.06, district.z)];
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), roadMaterial);
    group.add(line);
  });

  const starGeometry = new THREE.BufferGeometry();
  const starCount = 420;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = Math.random() * 36 + 4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
  }
  starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0x23e7ff, size: 0.035, transparent: true, opacity: 0.62 })));

  scene.add(new THREE.AmbientLight(0x8fb8ff, 0.45));
  const key = new THREE.PointLight(0x23e7ff, 95, 40);
  key.position.set(0, 8, 2);
  scene.add(key);
  const accent = new THREE.PointLight(0xff2b4f, 65, 35);
  accent.position.set(-7, 4, 5);
  scene.add(accent);

  const clock = new THREE.Clock();

  function projectLabels() {
    labels.forEach(({ label, position }) => {
      const projected = position.clone().applyMatrix4(group.matrixWorld).project(camera);
      const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
      label.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      label.style.opacity = projected.z > 1 ? "0" : "1";
    });
  }

  function animate() {
    const elapsed = clock.getElapsedTime();
    if (prefersReducedMotion) {
      group.rotation.y = 0.6;
    } else {
      group.rotation.y = elapsed * 0.075;
      group.position.y = Math.sin(elapsed * 0.7) * 0.08;
    }
    projectLabels();
    renderer.render(scene, camera);
    if (!prefersReducedMotion) requestAnimationFrame(animate);
  }

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
}

window.addEventListener("scroll", revealOnScroll, { passive: true });
window.addEventListener("load", () => {
  if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("visible"));
  } else {
    revealOnScroll();
  }
  typeBootSequence();
  addCardSignals();
  try {
    createMiniCity();
  } catch (err) {
    console.warn("3D city unavailable:", err);
    showStaticFallback(document.querySelector("#city3d"));
  }
});
