import { AXES_CLASSIQUES, AXES_UNION, colorForName } from "./data.js";
import { renderRadar, renderRadarLegend } from "./radar.js";
import { debounce, showToast } from "./utils.js";
import { getPrenom, getPrenomSlug, onPrenomChange, requirePrenom } from "./identity.js";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";

const state = {}; // axisId -> 0-100
let mode = "mine"; // "mine" | "team"
let teamDocs = []; // [{prenom, values}]
let unsubTeam = null;

function defaultValues() {
  const v = {};
  [...AXES_CLASSIQUES, ...AXES_UNION].forEach((a) => (v[a.id] = 50));
  return v;
}
Object.assign(state, defaultValues());

function buildSliderRow(axis) {
  const row = document.createElement("div");
  row.className = "slider-row";
  row.innerHTML = `
    <div class="slider-poles">
      <span class="pole pole-a">${axis.a}</span>
      <span class="slider-value" data-val="${axis.id}">${state[axis.id]}</span>
      <span class="pole pole-b">${axis.b}</span>
    </div>
    <input type="range" min="0" max="100" value="${state[axis.id]}" data-axis="${axis.id}" class="slider-input" />
  `;
  const input = row.querySelector("input");
  const valOut = row.querySelector(".slider-value");
  input.addEventListener("input", () => {
    state[axis.id] = Number(input.value);
    valOut.textContent = input.value;
    renderMineLive();
  });
  return row;
}

function buildSliders(containerId, axes) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  axes.forEach((axis) => container.appendChild(buildSliderRow(axis)));
}

const renderMineLive = () => {
  if (mode !== "mine") return;
  const name = getPrenom() || "Vous";
  const color = colorForName(name || "vous");
  const seriesClassiques = [{ label: name, color, values: state }];
  const seriesUnion = [{ label: name, color, values: state }];
  const rC = document.getElementById("m1-radar-classiques");
  const rU = document.getElementById("m1-radar-union");
  if (rC) renderRadar(rC, AXES_CLASSIQUES, seriesClassiques, { ariaLabel: "Radar axes classiques" });
  if (rU) renderRadar(rU, AXES_UNION, seriesUnion, { ariaLabel: "Radar axes UNION" });
  const lC = document.getElementById("m1-legend-classiques");
  const lU = document.getElementById("m1-legend-union");
  if (lC) renderRadarLegend(lC, AXES_CLASSIQUES, seriesClassiques);
  if (lU) renderRadarLegend(lU, AXES_UNION, seriesUnion);
};

function renderTeam() {
  const rC = document.getElementById("m1-radar-classiques");
  const rU = document.getElementById("m1-radar-union");
  const seriesC = teamDocs.map((d) => ({ label: d.prenom, color: colorForName(d.prenom), values: d.values }));
  const seriesU = teamDocs.map((d) => ({ label: d.prenom, color: colorForName(d.prenom), values: d.values }));
  if (rC) renderRadar(rC, AXES_CLASSIQUES, seriesC, { ariaLabel: "Radar équipe — axes classiques" });
  if (rU) renderRadar(rU, AXES_UNION, seriesU, { ariaLabel: "Radar équipe — axes UNION" });
  const lC = document.getElementById("m1-legend-classiques");
  const lU = document.getElementById("m1-legend-union");
  if (lC) renderRadarLegend(lC, AXES_CLASSIQUES, seriesC.length === 1 ? seriesC : []);
  if (lU) renderRadarLegend(lU, AXES_UNION, seriesU.length === 1 ? seriesU : []);
  renderColorLegend(teamDocs);
}

function renderColorLegend(list) {
  const el = document.getElementById("m1-color-legend");
  if (!el) return;
  el.innerHTML = "";
  if (list.length === 0) {
    el.innerHTML = `<p class="empty-note">Personne n'a encore enregistré ses curseurs.</p>`;
    return;
  }
  list.forEach((d) => {
    const chip = document.createElement("span");
    chip.className = "color-chip";
    chip.innerHTML = `<i style="background:${colorForName(d.prenom)}"></i>${d.prenom}`;
    el.appendChild(chip);
  });
}

function switchTab(newMode) {
  mode = newMode;
  document.getElementById("m1-tab-mine").classList.toggle("active", mode === "mine");
  document.getElementById("m1-tab-team").classList.toggle("active", mode === "team");
  document.querySelectorAll(".m1-mine-only").forEach((el) => (el.hidden = mode !== "mine"));
  document.getElementById("m1-color-legend").hidden = mode !== "team";
  if (mode === "mine") renderMineLive();
  else renderTeam();
}

async function loadMine() {
  if (!db) return;
  const slug = getPrenomSlug();
  const snap = await getDoc(doc(db, "module1", slug));
  if (snap.exists()) {
    const data = snap.data();
    Object.assign(state, defaultValues(), data.values || {});
  } else {
    Object.assign(state, defaultValues());
  }
  buildSliders("m1-slider-list-classiques", AXES_CLASSIQUES);
  buildSliders("m1-slider-list-union", AXES_UNION);
  renderMineLive();
}

async function save() {
  const name = requirePrenom();
  if (!name) return;
  if (!db) {
    showToast("Base de données non configurée — voir README.md.");
    return;
  }
  const slug = getPrenomSlug();
  await setDoc(doc(db, "module1", slug), {
    prenom: name,
    values: state,
    updatedAt: new Date().toISOString(),
  });
  showToast("Curseurs enregistrés — merci " + name + " !");
}

function subscribeTeam() {
  if (!db || unsubTeam) return;
  unsubTeam = onSnapshot(collection(db, "module1"), (qs) => {
    teamDocs = qs.docs.map((d) => d.data()).filter((d) => d.prenom);
    if (mode === "team") renderTeam();
  });
}

export function initModule1() {
  buildSliders("m1-slider-list-classiques", AXES_CLASSIQUES);
  buildSliders("m1-slider-list-union", AXES_UNION);
  renderMineLive();

  document.getElementById("m1-tab-mine").addEventListener("click", () => switchTab("mine"));
  document.getElementById("m1-tab-team").addEventListener("click", () => switchTab("team"));
  document.getElementById("m1-save-btn").addEventListener("click", save);

  onPrenomChange(debounce(loadMine, 150));
  if (getPrenom()) loadMine();
  subscribeTeam();
}
