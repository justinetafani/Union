// Données de référence partagées par plusieurs modules.

export const AXES_CLASSIQUES = [
  { id: "sur_mesure",   a: "Sur-mesure",          b: "Standardisé" },
  { id: "format",       a: "Format intime",       b: "Grand format" },
  { id: "budget",       a: "Budget mesuré",       b: "Budget premium" },
  { id: "codes",        a: "Codes classiques",    b: "Créativité forte" },
  { id: "ceremonie",    a: "Décontracté",         b: "Cérémoniel" },
  { id: "confidentiel", a: "Confidentiel",        b: "Médiatique" },
  { id: "convive",      a: "Convive passif",      b: "Convive acteur" },
  { id: "recurrence",   a: "Événement unique",    b: "Série récurrente" },
  { id: "lieu",         a: "Lieu existant",       b: "Lieu transformé" },
  { id: "posture",      a: "Exécutant (traiteur)", b: "Studio auteur" },
];

export const AXES_UNION = [
  { id: "ancrage",      a: "Ancrage neutre",      b: "Racines viet-français" },
  { id: "recit",        a: "Histoire décor",      b: "Récit au cœur" },
  { id: "cuisine",      a: "Cuisine gastro",      b: "Cuisine familiale" },
  { id: "scenographie", a: "Décor fixe",          b: "Scéno évolutive" },
  { id: "service",      a: "Service à l'assiette", b: "Partage collectif" },
  { id: "rituel",       a: "Animation minimale",  b: "Rituel vécu ensemble" },
  { id: "discours",     a: "Discours factuel",    b: "Récit incarné" },
];

export const AXES_ALL = [...AXES_CLASSIQUES, ...AXES_UNION];

export const AXES_TON = [
  { id: "serieux",     a: "Sérieux",        b: "Drôle" },
  { id: "formel",      a: "Formel",         b: "Décontracté" },
  { id: "respect",     a: "Respectueux",    b: "Impertinent" },
  { id: "enthousiasme", a: "Enthousiaste",  b: "Factuel" },
];

export const ARCHETYPES = [
  { id: "innocent",   label: "Innocent" },
  { id: "sage",        label: "Sage" },
  { id: "explorateur", label: "Explorateur" },
  { id: "rebelle",     label: "Rebelle" },
  { id: "magicien",    label: "Magicien" },
  { id: "heros",       label: "Héros" },
  { id: "amoureux",    label: "Amoureux" },
  { id: "bouffon",     label: "Bouffon" },
  { id: "peuple",      label: "Homme / femme du peuple" },
  { id: "protecteur",  label: "Protecteur" },
  { id: "createur",    label: "Créateur" },
  { id: "souverain",   label: "Souverain" },
];

export const BRAND_KEY_FIELDS = [
  {
    id: "essence",
    label: "Essence",
    default: "Le repas comme histoire commune. Faire événement, c'est d'abord faire union.",
  },
  {
    id: "valeurs",
    label: "Valeurs",
    default: "Équilibre, transmission, partage.",
  },
  {
    id: "personnalite",
    label: "Personnalité",
    default:
      "Témoin du passé qui va vers l'avenir — un pont, pas une rupture. Chaleureux, exigeant, ancré dans l'héritage vietnamien et français des fondateurs.",
  },
  {
    id: "benefices",
    label: "Bénéfices / preuves",
    default:
      "Une expérience conçue de bout en bout (lieu, repas, récit, scénographie, vin, communication) par une seule équipe pluridisciplinaire, jamais un format dupliqué.",
  },
  {
    id: "cible",
    label: "Cible",
    default:
      "Entreprises familiales en passation, maisons de luxe et de tradition, gestion de patrimoine, directions RH, fondations culturelles, diaspora, clients privés pour leurs grandes réunions de famille.",
  },
];

// Palette catégorielle fixe (ordre jamais permuté), calée sur l'identité UNION.
// Valeurs assombries par rapport aux teintes d'accent pour rester lisibles
// en traits fins sur fond crème comme sur fond noir.
export const FOUNDER_PALETTE = [
  "#C1272D", // rouge UNION
  "#B8860B", // doré (dérivé du jaune UNION, plus lisible en trait fin)
  "#3E7C8C", // bleu pétrole
  "#7A6FB0", // violet
  "#4F8B5B", // vert sauge
  "#C15F22", // ocre
  "#B0518F", // magenta discret
  "#5C6670", // gris bleuté
];

export function slugify(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "anonyme";
}

export function colorForName(name) {
  const slug = slugify(name);
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return FOUNDER_PALETTE[hash % FOUNDER_PALETTE.length];
}
