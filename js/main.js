import { getPrenom, setPrenom, onPrenomChange } from "./identity.js";
import { configured } from "./firebase.js";
import { initModule1 } from "./module1.js";
import { initModule2 } from "./module2.js";
import { initModule3 } from "./module3.js";
import { initModule4 } from "./module4.js";
import { initModule5 } from "./module5.js";

function initPrenomField() {
  const input = document.getElementById("prenom-input");
  input.value = getPrenom();
  input.addEventListener("change", () => setPrenom(input.value));
  input.addEventListener("blur", () => setPrenom(input.value));
  onPrenomChange((name) => {
    document.querySelectorAll(".prenom-echo").forEach((el) => {
      el.textContent = name || "—";
    });
  });
  document.querySelectorAll(".prenom-echo").forEach((el) => {
    el.textContent = getPrenom() || "—";
  });
}

function initNav() {
  const tabs = document.querySelectorAll(".nav-tab");
  const sections = document.querySelectorAll(".module-section");

  function activate(id) {
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.target === id));
    sections.forEach((s) => (s.hidden = s.id !== id));
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    window.dispatchEvent(new CustomEvent("module-activated", { detail: id }));
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.target;
      history.replaceState(null, "", `#${id}`);
      activate(id);
    });
  });

  const initial = location.hash ? location.hash.slice(1) : tabs[0]?.dataset.target;
  if (initial && document.getElementById(initial)) {
    activate(initial);
  } else if (tabs[0]) {
    activate(tabs[0].dataset.target);
  }
}

function initConnectionBanner() {
  const banner = document.getElementById("connection-banner");
  if (!configured) {
    banner.hidden = false;
    banner.textContent =
      "⚠ Base de données non configurée : les réponses ne sont pas encore partagées. Voir README.md pour connecter Firebase.";
  } else {
    banner.hidden = true;
  }
}

initPrenomField();
initNav();
initConnectionBanner();
initModule1();
initModule2();
initModule3();
initModule4();
initModule5();
