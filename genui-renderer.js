const ALLOWED = new Set(["metric", "text", "status", "sparkline", "action_group"]);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  return node;
}

function renderSparkline(series) {
  const width = 320;
  const height = 80;
  const values = Array.isArray(series) ? series.filter(Number.isFinite) : [];
  if (values.length < 2) return el("div", "genui-status", "No series data");
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - ((value - min) / span) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "sparkline");
  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute("points", points);
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("stroke", "currentColor");
  polyline.setAttribute("stroke-width", "3");
  svg.appendChild(polyline);
  return svg;
}

function renderAction(action, options) {
  const button = el("button", "genui-action", action.label || action.id);
  const impact = action.impact || "unknown";
  const liveAllowed = options.liveExternalActions === true;
  const safeRead = impact === "read";
  if (!safeRead && !liveAllowed) {
    button.dataset.mode = "simulate";
    button.title = "Closed beta: state-changing actions are simulation-only";
  }
  button.addEventListener("click", () => {
    const detail = {
      id: action.id,
      capability_handle: action.capability_handle,
      policy_scope: action.policy_scope,
      impact,
      confirmation: action.confirmation || "none",
      mode: safeRead || liveAllowed ? "request" : "simulate"
    };
    window.dispatchEvent(new CustomEvent("agentropolis:genui-action", { detail }));
  });
  return button;
}

function renderComponent(component, options) {
  if (!ALLOWED.has(component.type)) {
    return el("section", "genui-component genui-status", `Unsupported component: ${component.type}`);
  }
  const wrap = el("section", `genui-component genui-${component.type}`);
  wrap.dataset.componentId = component.id || "unknown";
  if (component.label) wrap.appendChild(el("div", "genui-label", component.label));

  if (component.type === "metric") {
    const value = el("div", "genui-value", component.value);
    if (component.unit) value.appendChild(el("span", "genui-unit", ` ${component.unit}`));
    wrap.appendChild(value);
  } else if (component.type === "text" || component.type === "status") {
    wrap.appendChild(el("div", "genui-text", component.text || ""));
    if (component.state) wrap.dataset.state = component.state;
  } else if (component.type === "sparkline") {
    wrap.appendChild(renderSparkline(component.series));
  } else if (component.type === "action_group") {
    const row = el("div", "genui-actions");
    (component.actions || []).forEach((action) => row.appendChild(renderAction(action, options)));
    wrap.appendChild(row);
  }
  return wrap;
}

export function renderGenUI(root, manifest, options = {}) {
  if (!root) throw new Error("render root required");
  root.replaceChildren();
  const shell = el("article", "genui-shell");
  shell.dataset.surface = manifest.surface_hint || "auto";
  shell.appendChild(el("header", "genui-title", manifest.title || "Untitled"));
  const grid = el("div", "genui-grid");
  (manifest.components || []).forEach((component) => grid.appendChild(renderComponent(component, options)));
  shell.appendChild(grid);
  const provenance = manifest.provenance || {};
  shell.appendChild(el("footer", "genui-provenance", `source: ${provenance.source_type || "unknown"} / ${provenance.source_ref || "unavailable"}`));
  root.appendChild(shell);
  return shell;
}
