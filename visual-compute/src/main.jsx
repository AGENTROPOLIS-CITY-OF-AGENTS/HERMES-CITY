import React from "react";
import { createRoot } from "react-dom/client";
import { DiagnosticsPanel } from "@designcodeio/threeui/components/DiagnosticsPanel";
import { ParticleNetwork } from "@designcodeio/threeui/components/ParticleNetwork";
import { PerformanceGauges } from "@designcodeio/threeui/components/PerformanceGauges";
import { PortalFieldCollection } from "@designcodeio/threeui/components/PortalFieldCollection";
import "@designcodeio/threeui/style.css";
import "./styles.css";

const primitives = [
  {
    id: "diagnostics",
    label: "DIAGNOSTICS",
    role: "Mission Control telemetry",
    Component: DiagnosticsPanel,
  },
  {
    id: "network",
    label: "INTELLIGENCE GRID",
    role: "Agent and signal topology",
    Component: ParticleNetwork,
  },
  {
    id: "gauges",
    label: "PERFORMANCE",
    role: "Public-safe evaluator surface",
    Component: PerformanceGauges,
  },
  {
    id: "portals",
    label: "DISTRICT PORTALS",
    role: "Civic navigation visualization",
    Component: PortalFieldCollection,
  },
];

function PrimitiveCard({ primitive }) {
  const { Component } = primitive;
  return (
    <article className="primitive-card" aria-labelledby={`${primitive.id}-title`}>
      <header className="primitive-head">
        <div>
          <p className="eyebrow">THREEUI ADAPTER / COMMUNITY</p>
          <h2 id={`${primitive.id}-title`}>{primitive.label}</h2>
        </div>
        <span className="status">PUBLIC-SAFE</span>
      </header>
      <p className="role">{primitive.role}</p>
      <div className="primitive-stage">
        <Component />
      </div>
    </article>
  );
}

function App() {
  return (
    <main className="shell">
      <header className="command-bar">
        <a href="../" className="brand" aria-label="Return to HERMES CITY">HC</a>
        <div>
          <p className="eyebrow">HERMES CITY / MISSION CONTROL</p>
          <h1>VISUAL COMPUTE</h1>
        </div>
        <div className="telemetry" aria-label="Visual Compute status">
          <span><b>GRID</b> ONLINE</span>
          <span><b>BOUNDARY</b> PUBLIC</span>
          <span><b>PROVIDER</b> THREEUI</span>
        </div>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow">THE INTELLIGENCE GRID</p>
          <h2>Spectacle in the environment. Precision in the controls.</h2>
        </div>
        <p>
          This surface is a governed presentation layer only. It visualizes public-safe city state and district navigation; private orchestration, credentials, memory, execution internals, and production policy remain outside this repository.
        </p>
      </section>

      <section className="grid" aria-label="Approved visual primitives">
        {primitives.map((primitive) => (
          <PrimitiveCard key={primitive.id} primitive={primitive} />
        ))}
      </section>

      <footer className="boundary">
        <span>IDENTITY → MANDATE → PLAN → EXECUTE → RECEIPT → AUDIT</span>
        <span>ThreeUI is presentation infrastructure, not execution authority.</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
