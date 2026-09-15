import { slugify } from "./data.js";

const STORAGE_KEY = "union_prenom";
const listeners = new Set();

export function getPrenom() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

export function getPrenomSlug() {
  return slugify(getPrenom());
}

export function setPrenom(name) {
  localStorage.setItem(STORAGE_KEY, name.trim());
  listeners.forEach((fn) => fn(name.trim()));
}

export function onPrenomChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function requirePrenom() {
  const name = getPrenom();
  if (!name) {
    const field = document.getElementById("prenom-input");
    if (field) {
      field.focus();
      field.classList.add("shake");
      setTimeout(() => field.classList.remove("shake"), 500);
    }
    return null;
  }
  return name;
}
