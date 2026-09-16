import { TERNARY_AXES } from "./data.js";
import { getPrenom } from "./identity.js";
import { showToast } from "./utils.js";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";

// Sommets du triangle en pourcentage du conteneur (proportions d'un
// triangle équilatéral, marge laissée pour les libellés).
const V = {
  food: { x: 50, y: 10 },
  design: { x: 8, y: 82.75 },
  experience: { x: 92, y: 82.75 },
};
const CENTROID = {
  x: (V.food.x + V.design.x + V.experience.x) / 3,
  y: (V.food.y + V.design.y + V.experience.y) / 3,
};

function scaleTriangle(k) {
  const scale = (p) => ({
    x: CENTROID.x + k * (p.x - CENTROID.x),
    y: CENTROID.y + k * (p.y - CENTROID.y),
  });
  return [scale(V.food), scale(V.design), scale(V.experience)];
}

function toCartesian(food, design, experience) {
  const total = food + design + experience || 1;
  const wF = food / total;
  const wD = design / total;
  const wE = experience / total;
  return {
    x: wF * V.food.x + wD * V.design.x + wE * V.experience.x,
    y: wF * V.food.y + wD * V.design.y + wE * V.experience.y,
  };
}

function toBarycentric(px, py) {
  const A = V.food, B = V.design, C = V.experience;
  const denom = (B.y - C.y) * (A.x - C.x) + (C.x - B.x) * (A.y - C.y);
  let wA = ((B.y - C.y) * (px - C.x) + (C.x - B.x) * (py - C.y)) / denom;
  let wB = ((C.y - A.y) * (px - C.x) + (A.x - C.x) * (py - C.y)) / denom;
  let wC = 1 - wA - wB;
  wA = Math.max(0, wA);
  wB = Math.max(0, wB);
  wC = Math.max(0, wC);
  const sum = wA + wB + wC || 1;
  return { food: (wA / sum) * 100, design: (wB / sum) * 100, experience: (wC / sum) * 100 };
}

let points = [];

function pointsToPathAttr(pts) {
  return pts.map((p) => `${p.x},${p.y}`).join(" ");
}

function renderTriangleBackground() {
  const svg = document.getElementById("m2-triangle-svg");
  if (!svg) return;
  svg.innerHTML = "";
  const NS = "http://www.w3.org/2000/svg";
  const el = (name, attrs) => {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    return node;
  };

  [1 / 3, 2 / 3].forEach((k) => {
    svg.appendChild(
      el("polygon", { points: pointsToPathAttr(scaleTriangle(k)), class: "ternary-grid" })
    );
  });

  svg.appendChild(
    el("polygon", {
      points: pointsToPathAttr([V.food, V.design, V.experience]),
      class: "ternary-outline",
    })
  );

  const labelDefs = [
    { axis: TERNARY_AXES[0], x: V.food.x, y: V.food.y - 4, anchor: "middle" },
    { axis: TERNARY_AXES[1], x: V.design.x + 2, y: V.design.y + 7, anchor: "start" },
    { axis: TERNARY_AXES[2], x: V.experience.x - 2, y: V.experience.y + 7, anchor: "end" },
  ];
  labelDefs.forEach(({ axis, x, y, anchor }) => {
    const text = el("text", { x, y, "text-anchor": anchor, class: "ternary-label" });
    text.textContent = axis.label.toUpperCase();
    svg.appendChild(text);
  });
}

function renderPoints() {
  const container = document.getElementById("m2-map");
  container.querySelectorAll(".map-point").forEach((p) => p.remove());
  points.forEach((p) => {
    const pos = toCartesian(p.food, p.design, p.experience);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "map-point";
    btn.style.left = `${pos.x}%`;
    btn.style.top = `${pos.y}%`;
    btn.innerHTML = `<span class="map-point-dot"></span><span class="map-point-label">${p.name}</span>`;
    btn.title = "Cliquer pour supprimer ce point";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      removePoint(p.id);
    });
    container.appendChild(btn);
  });

  const list = document.getElementById("m2-point-list");
  list.innerHTML = "";
  if (points.length === 0) {
    list.innerHTML = `<p class="empty-note">Aucun point placé pour l'instant.</p>`;
    return;
  }
  points.forEach((p) => {
    const row = document.createElement("div");
    row.className = "point-row";
    row.innerHTML = `<span>${p.name}</span><span class="point-coords">Food ${Math.round(p.food)} · Design ${Math.round(p.design)} · Experience ${Math.round(p.experience)}</span>`;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "point-remove";
    btn.textContent = "Retirer";
    btn.addEventListener("click", () => removePoint(p.id));
    row.appendChild(btn);
    list.appendChild(row);
  });
}

async function removePoint(id) {
  if (!db) return;
  await deleteDoc(doc(db, "module2_points", id));
}

async function onMapClick(e) {
  if (e.target.closest(".map-point")) return;
  const nameInput = document.getElementById("m2-point-name");
  const name = nameInput.value.trim();
  if (!name) {
    showToast("Indiquez d'abord un nom pour le point.");
    nameInput.focus();
    return;
  }
  const map = document.getElementById("m2-map");
  const rect = map.getBoundingClientRect();
  const px = ((e.clientX - rect.left) / rect.width) * 100;
  const py = ((e.clientY - rect.top) / rect.height) * 100;
  const { food, design, experience } = toBarycentric(px, py);
  if (!db) {
    showToast("Base de données non configurée — voir README.md.");
    return;
  }
  await addDoc(collection(db, "module2_points"), {
    name,
    food,
    design,
    experience,
    createdBy: getPrenom() || null,
    createdAt: new Date().toISOString(),
  });
  nameInput.value = "";
  nameInput.focus();
}

function subscribePoints() {
  if (!db) return;
  onSnapshot(collection(db, "module2_points"), (qs) => {
    points = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderPoints();
  });
}

export function initModule2() {
  renderTriangleBackground();
  renderPoints();
  document.getElementById("m2-map").addEventListener("click", onMapClick);
  window.addEventListener("resize", renderTriangleBackground);
  subscribePoints();
}
