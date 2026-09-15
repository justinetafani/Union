import { AXES_TON, colorForName } from "./data.js";
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

const state = {};
let mode = "mine";
let teamDocs = [];
let unsubTeam = null;

function defaultValues() {
  const v = {};
  AXES_TON.forEach((a) => (v[a.id] = 50));
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

function buildSliders() {
  const container = document.getElementById("m5-slider-list");
  if (!container) return;
  container.innerHTML = "";
  AXES_TON.forEach((axis) => container.appendChild(buildSliderRow(axis)));
}

function renderMineLive() {
  if (mode !== "mine") return;
  const name = getPrenom() || "Vous";
  const color = colorForName(name || "vous");
  const series = [{ label: name, color, values: state }];
  const r = document.getElementById("m5-radar");
  if (r) renderRadar(r, AXES_TON, series, { ariaLabel: "Radar ton de voix" });
  const l = document.getElementById("m5-legend");
  if (l) renderRadarLegend(l, AXES_TON, series);
}

function renderTeam() {
  const series = teamDocs.map((d) => ({ label: d.prenom, color: colorForName(d.prenom), values: d.values }));
  const r = document.getElementById("m5-radar");
  if (r) renderRadar(r, AXES_TON, series, { ariaLabel: "Radar équipe — ton de voix" });
  const l = document.getElementById("m5-legend");
  if (l) renderRadarLegend(l, AXES_TON, series.length === 1 ? series : []);
  renderColorLegend(teamDocs);
}

function renderColorLegend(list) {
  const el = document.getElementById("m5-color-legend");
  if (!el) return;
  el.innerHTML = "";
  if (list.length === 0) {
    el.innerHTML = `<p class="empty-note">Personne n'a encore enregistré son ton de voix.</p>`;
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
  document.getElementById("m5-tab-mine").classList.toggle("active", mode === "mine");
  document.getElementById("m5-tab-team").classList.toggle("active", mode === "team");
  document.querySelectorAll(".m5-mine-only").forEach((el) => (el.hidden = mode !== "mine"));
  document.getElementById("m5-color-legend").hidden = mode !== "team";
  if (mode === "mine") renderMineLive();
  else renderTeam();
}

async function loadMine() {
  if (!db) return;
  const slug = getPrenomSlug();
  const snap = await getDoc(doc(db, "module5", slug));
  if (snap.exists()) {
    const data = snap.data();
    Object.assign(state, defaultValues(), data.values || {});
  } else {
    Object.assign(state, defaultValues());
  }
  buildSliders();
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
  await setDoc(doc(db, "module5", slug), {
    prenom: name,
    values: state,
    updatedAt: new Date().toISOString(),
  });
  showToast("Ton de voix enregistré — merci " + name + " !");
}

function subscribeTeam() {
  if (!db || unsubTeam) return;
  unsubTeam = onSnapshot(collection(db, "module5"), (qs) => {
    teamDocs = qs.docs.map((d) => d.data()).filter((d) => d.prenom);
    if (mode === "team") renderTeam();
  });
}

export function initModule5() {
  buildSliders();
  renderMineLive();

  document.getElementById("m5-tab-mine").addEventListener("click", () => switchTab("mine"));
  document.getElementById("m5-tab-team").addEventListener("click", () => switchTab("team"));
  document.getElementById("m5-save-btn").addEventListener("click", save);

  onPrenomChange(debounce(loadMine, 150));
  if (getPrenom()) loadMine();
  subscribeTeam();
}
