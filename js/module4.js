import { ARCHETYPES, colorForName } from "./data.js";
import { showToast, debounce } from "./utils.js";
import { getPrenom, getPrenomSlug, onPrenomChange, requirePrenom } from "./identity.js";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";

let selected = [];
let mode = "mine";
let teamDocs = [];
let unsubTeam = null;

function layoutWheel() {
  const wheel = document.getElementById("m4-wheel");
  if (!wheel) return;
  const size = wheel.clientWidth;
  const radius = size / 2 - 54;
  wheel.querySelectorAll(".archetype-item").forEach((item) => {
    item.style.setProperty("--radius", `${radius}px`);
  });
}

function buildWheel() {
  const wheel = document.getElementById("m4-wheel");
  if (!wheel) return;
  wheel.innerHTML = `<div class="wheel-center">UNION<br/><span>1 à 2 archétypes</span></div>`;
  const n = ARCHETYPES.length;
  ARCHETYPES.forEach((arch, i) => {
    const angle = (360 / n) * i;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "archetype-item";
    btn.style.setProperty("--angle", `${angle}deg`);
    btn.dataset.id = arch.id;
    btn.textContent = arch.label;
    btn.addEventListener("click", () => toggleArchetype(arch.id));
    wheel.appendChild(btn);
  });
  layoutWheel();
}

function renderDefinitions() {
  const container = document.getElementById("m4-definitions");
  if (!container) return;
  container.innerHTML = `<h3>Définitions</h3>`;
  const list = document.createElement("dl");
  ARCHETYPES.forEach((arch) => {
    const dt = document.createElement("dt");
    dt.textContent = arch.label;
    const dd = document.createElement("dd");
    dd.textContent = arch.def;
    list.appendChild(dt);
    list.appendChild(dd);
  });
  container.appendChild(list);
}

function toggleArchetype(id) {
  if (mode !== "mine") return;
  if (selected.includes(id)) {
    selected = selected.filter((s) => s !== id);
  } else {
    if (selected.length >= 2) {
      showToast("Deux archétypes maximum — désélectionnez-en un d'abord.");
      return;
    }
    selected.push(id);
  }
  renderSelection();
}

function renderSelection() {
  document.querySelectorAll(".archetype-item").forEach((btn) => {
    btn.classList.toggle("selected", selected.includes(btn.dataset.id));
  });
  const chips = document.getElementById("m4-selected-chips");
  if (chips) {
    chips.innerHTML = "";
    if (selected.length === 0) {
      chips.innerHTML = `<p class="empty-note">Aucun archétype sélectionné pour l'instant.</p>`;
    }
    selected.forEach((id) => {
      const arch = ARCHETYPES.find((a) => a.id === id);
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = arch.label;
      chips.appendChild(chip);
    });
  }
}

function renderTeam() {
  const counts = {};
  ARCHETYPES.forEach((a) => (counts[a.id] = 0));
  teamDocs.forEach((d) => {
    (d.archetypes || []).forEach((id) => {
      if (counts[id] !== undefined) counts[id]++;
    });
  });
  const ranked = ARCHETYPES.map((a) => ({ ...a, count: counts[a.id] })).sort(
    (x, y) => y.count - x.count
  );
  const max = Math.max(1, ...ranked.map((r) => r.count));
  const container = document.getElementById("m4-team-ranking");
  container.innerHTML = "";
  if (teamDocs.length === 0) {
    container.innerHTML = `<p class="empty-note">Personne n'a encore voté.</p>`;
    return;
  }
  ranked.forEach((r) => {
    const row = document.createElement("div");
    row.className = "rank-row";
    row.innerHTML = `
      <span class="rank-label">${r.label}</span>
      <span class="rank-bar-track"><span class="rank-bar-fill" style="width:${(r.count / max) * 100}%"></span></span>
      <span class="rank-count">${r.count}</span>
    `;
    container.appendChild(row);
  });
}

function switchTab(newMode) {
  mode = newMode;
  document.getElementById("m4-tab-mine").classList.toggle("active", mode === "mine");
  document.getElementById("m4-tab-team").classList.toggle("active", mode === "team");
  document.getElementById("m4-mine-panel").hidden = mode !== "mine";
  document.getElementById("m4-team-panel").hidden = mode !== "team";
  if (mode === "team") renderTeam();
}

async function loadMine() {
  if (!db) return;
  const slug = getPrenomSlug();
  const snap = await getDoc(doc(db, "module4", slug));
  selected = snap.exists() ? snap.data().archetypes || [] : [];
  renderSelection();
}

async function save() {
  const name = requirePrenom();
  if (!name) return;
  if (!db) {
    showToast("Base de données non configurée — voir README.md.");
    return;
  }
  const slug = getPrenomSlug();
  await setDoc(doc(db, "module4", slug), {
    prenom: name,
    archetypes: selected,
    updatedAt: new Date().toISOString(),
  });
  showToast("Archétypes enregistrés — merci " + name + " !");
}

function subscribeTeam() {
  if (!db || unsubTeam) return;
  unsubTeam = onSnapshot(collection(db, "module4"), (qs) => {
    teamDocs = qs.docs.map((d) => d.data()).filter((d) => d.prenom);
    if (mode === "team") renderTeam();
  });
}

export function initModule4() {
  buildWheel();
  renderSelection();
  renderDefinitions();
  requestAnimationFrame(() => requestAnimationFrame(layoutWheel));
  window.addEventListener("resize", debounce(layoutWheel, 150));
  window.addEventListener("module-activated", (e) => {
    if (e.detail === "module-4") requestAnimationFrame(layoutWheel);
  });

  document.getElementById("m4-tab-mine").addEventListener("click", () => switchTab("mine"));
  document.getElementById("m4-tab-team").addEventListener("click", () => switchTab("team"));
  document.getElementById("m4-save-btn").addEventListener("click", save);

  onPrenomChange(debounce(loadMine, 150));
  if (getPrenom()) loadMine();
  subscribeTeam();
}
