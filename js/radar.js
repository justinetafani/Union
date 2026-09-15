// Radar chart SVG générique, sans dépendance externe.
// axes: [{id, a, b}]   series: [{label, color, values: {axisId: 0-100}}]

const SVG_NS = "http://www.w3.org/2000/svg";

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

function polarPoint(cx, cy, radius, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

export function renderRadar(container, axes, series, opts = {}) {
  const size = opts.size || 360;
  const pad = opts.labelPad ?? 34;
  const R = size / 2 - pad;
  const cx = size / 2;
  const cy = size / 2;
  const n = axes.length;
  const step = 360 / n;
  const startAngle = -90;

  container.innerHTML = "";
  const svg = el("svg", {
    viewBox: `0 0 ${size} ${size}`,
    width: "100%",
    height: "100%",
    role: "img",
    "aria-label": opts.ariaLabel || "Radar de positionnement",
  });

  // grille (anneaux)
  const gridGroup = el("g", { class: "radar-grid" });
  [0.25, 0.5, 0.75, 1].forEach((frac) => {
    const pts = axes
      .map((_, i) => polarPoint(cx, cy, R * frac, startAngle + i * step))
      .map((p) => `${p.x},${p.y}`)
      .join(" ");
    gridGroup.appendChild(
      el("polygon", { points: pts, class: "radar-ring", "data-ring": frac })
    );
  });
  svg.appendChild(gridGroup);

  // rayons + labels numérotés
  const spokesGroup = el("g", { class: "radar-spokes" });
  axes.forEach((axis, i) => {
    const angle = startAngle + i * step;
    const outer = polarPoint(cx, cy, R, angle);
    spokesGroup.appendChild(
      el("line", { x1: cx, y1: cy, x2: outer.x, y2: outer.y, class: "radar-spoke" })
    );
    const labelPt = polarPoint(cx, cy, R + 18, angle);
    const text = el("text", {
      x: labelPt.x,
      y: labelPt.y,
      class: "radar-index",
      "text-anchor": "middle",
      "dominant-baseline": "middle",
    });
    text.textContent = String(i + 1);
    spokesGroup.appendChild(text);
  });
  svg.appendChild(spokesGroup);

  // séries
  const seriesGroup = el("g", { class: "radar-series" });
  series.forEach((s) => {
    const pts = axes.map((axis, i) => {
      const v = Math.max(0, Math.min(100, s.values[axis.id] ?? 50));
      return polarPoint(cx, cy, R * (v / 100), startAngle + i * step);
    });
    const pointsStr = pts.map((p) => `${p.x},${p.y}`).join(" ");
    seriesGroup.appendChild(
      el("polygon", {
        points: pointsStr,
        style: `fill:${s.color}22;stroke:${s.color};stroke-width:2.5`,
        class: "radar-poly",
      })
    );
    pts.forEach((p) => {
      seriesGroup.appendChild(
        el("circle", { cx: p.x, cy: p.y, r: 3.5, style: `fill:${s.color}` })
      );
    });
  });
  svg.appendChild(seriesGroup);

  container.appendChild(svg);
}

// Construit la liste de légende (axe numéroté + pôles + valeur optionnelle).
export function renderRadarLegend(container, axes, series) {
  container.innerHTML = "";
  const list = document.createElement("ol");
  list.className = "radar-legend";
  axes.forEach((axis, i) => {
    const li = document.createElement("li");
    const num = document.createElement("span");
    num.className = "radar-legend-num";
    num.textContent = String(i + 1);
    const label = document.createElement("span");
    label.className = "radar-legend-label";
    label.textContent = `${axis.a} ↔ ${axis.b}`;
    li.appendChild(num);
    li.appendChild(label);
    if (series.length === 1) {
      const val = document.createElement("span");
      val.className = "radar-legend-val";
      val.textContent = Math.round(series[0].values[axis.id] ?? 50);
      li.appendChild(val);
    }
    list.appendChild(li);
  });
  container.appendChild(list);
}
