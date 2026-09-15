import { AXES_ALL } from "./data.js";
import { getPrenom } from "./identity.js";
import { showToast } from "./utils.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";

let config = { xAxis: AXES_ALL[0].id, yAxis: AXES_ALL[1].id };
let points = [];

function axisById(id) {
  return AXES_ALL.find((a) => a.id === id) || AXES_ALL[0];
}

function populateSelects() {
  const xSel = document.getElementById("m2-axis-x");
  const ySel = document.getElementById("m2-axis-y");
  [xSel, ySel].forEach((sel) => {
    sel.innerHTML = "";
    AXES_ALL.forEach((axis) => {
      const opt = document.createElement("option");
      opt.value = axis.id;
      opt.textContent = `${axis.a} ↔ ${axis.b}`;
      sel.appendChild(opt);
    });
  });
  xSel.value = config.xAxis;
  ySel.value = config.yAxis;
}

function renderAxisLabels() {
  const xa = axisById(config.xAxis);
  const ya = axisById(config.yAxis);
  document.getElementById("m2-label-left").textContent = xa.a;
  document.getElementById("m2-label-right").textContent = xa.b;
  document.getElementById("m2-label-top").textContent = ya.b;
  document.getElementById("m2-label-bottom").textContent = ya.a;
}

function renderPoints() {
  const map = document.getElementById("m2-map");
  map.querySelectorAll(".map-point").forEach((p) => p.remove());
  const visible = points.filter((p) => p.xAxis === config.xAxis && p.yAxis === config.yAxis);
  visible.forEach((p) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "map-point";
    dot.style.left = `${p.x}%`;
    dot.style.top = `${100 - p.y}%`;
    dot.innerHTML = `<span class="map-point-dot"></span><span class="map-point-label">${p.name}</span>`;
    dot.title = "Cliquer pour supprimer ce point";
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      removePoint(p.id);
    });
    map.appendChild(dot);
  });

  const list = document.getElementById("m2-point-list");
  list.innerHTML = "";
  if (visible.length === 0) {
    list.innerHTML = `<p class="empty-note">Aucun point placé pour ces deux axes.</p>`;
    return;
  }
  visible.forEach((p) => {
    const row = document.createElement("div");
    row.className = "point-row";
    row.innerHTML = `<span>${p.name}</span><span class="point-coords">(${Math.round(p.x)}, ${Math.round(p.y)})</span>`;
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

async function clearAllPoints() {
  if (!db) return;
  const qs = await getDocs(collection(db, "module2_points"));
  await Promise.all(qs.docs.map((d) => deleteDoc(d.ref)));
}

async function onAxisChange(which) {
  const xSel = document.getElementById("m2-axis-x");
  const ySel = document.getElementById("m2-axis-y");
  const newX = xSel.value;
  const newY = ySel.value;
  const hasPoints = points.some((p) => p.xAxis === config.xAxis && p.yAxis === config.yAxis);
  if (hasPoints) {
    const ok = confirm(
      "Changer un axe réinitialise les points déjà placés sur la carte pour tout le monde. Continuer ?"
    );
    if (!ok) {
      xSel.value = config.xAxis;
      ySel.value = config.yAxis;
      return;
    }
    await clearAllPoints();
  }
  config = { xAxis: newX, yAxis: newY };
  if (db) {
    await setDoc(doc(db, "module2", "config"), {
      xAxis: newX,
      yAxis: newY,
      updatedAt: new Date().toISOString(),
    });
  }
  renderAxisLabels();
  renderPoints();
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
  const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
  const y = Math.max(0, Math.min(100, 100 - ((e.clientY - rect.top) / rect.height) * 100));
  if (!db) {
    showToast("Base de données non configurée — voir README.md.");
    return;
  }
  await addDoc(collection(db, "module2_points"), {
    name,
    x,
    y,
    xAxis: config.xAxis,
    yAxis: config.yAxis,
    createdBy: getPrenom() || null,
    createdAt: new Date().toISOString(),
  });
  nameInput.value = "";
  nameInput.focus();
}

function subscribeConfig() {
  if (!db) return;
  onSnapshot(doc(db, "module2", "config"), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      config = { xAxis: data.xAxis, yAxis: data.yAxis };
      populateSelects();
      renderAxisLabels();
      renderPoints();
    }
  });
}

function subscribePoints() {
  if (!db) return;
  onSnapshot(collection(db, "module2_points"), (qs) => {
    points = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderPoints();
  });
}

export function initModule2() {
  populateSelects();
  renderAxisLabels();
  renderPoints();

  document.getElementById("m2-axis-x").addEventListener("change", () => onAxisChange("x"));
  document.getElementById("m2-axis-y").addEventListener("change", () => onAxisChange("y"));
  document.getElementById("m2-map").addEventListener("click", onMapClick);

  subscribeConfig();
  subscribePoints();
}
