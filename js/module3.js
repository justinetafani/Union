import { BRAND_KEY_FIELDS } from "./data.js";
import { getPrenom } from "./identity.js";
import { formatTime, showToast } from "./utils.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";

function buildFields() {
  const container = document.getElementById("m3-fields");
  container.innerHTML = "";
  BRAND_KEY_FIELDS.forEach((f) => {
    const card = document.createElement("div");
    card.className = "brandkey-card";
    card.innerHTML = `
      <h3>${f.label}</h3>
      <textarea id="m3-field-${f.id}" rows="3"></textarea>
      <p class="brandkey-meta" id="m3-meta-${f.id}"></p>
    `;
    container.appendChild(card);
    const textarea = card.querySelector("textarea");
    textarea.value = f.default;
    let valueOnFocus = "";
    textarea.addEventListener("focus", () => (valueOnFocus = textarea.value));
    textarea.addEventListener("blur", () => {
      if (textarea.value !== valueOnFocus) saveField(f.id, textarea.value);
    });
  });
}

async function ensureSeeded() {
  if (!db) return;
  const ref = doc(db, "module3", "brandkey");
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const data = {};
    BRAND_KEY_FIELDS.forEach((f) => (data[f.id] = f.default));
    data.updatedBy = null;
    data.updatedAt = null;
    await setDoc(ref, data);
  }
}

async function saveField(id, value) {
  if (!db) return;
  await updateDoc(doc(db, "module3", "brandkey"), {
    [id]: value,
    updatedBy: getPrenom() || "Anonyme",
    updatedAt: new Date().toISOString(),
  });
  showToast("Modification enregistrée.");
}

function subscribe() {
  if (!db) return;
  onSnapshot(doc(db, "module3", "brandkey"), (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    BRAND_KEY_FIELDS.forEach((f) => {
      const textarea = document.getElementById(`m3-field-${f.id}`);
      const meta = document.getElementById(`m3-meta-${f.id}`);
      const val = data[f.id] ?? f.default;
      if (document.activeElement !== textarea) {
        textarea.value = val;
      }
      meta.textContent = data.updatedBy
        ? `Modifié par ${data.updatedBy} · ${formatTime(data.updatedAt)}`
        : "";
    });
  });
}

export async function initModule3() {
  buildFields();
  await ensureSeeded();
  subscribe();
}
