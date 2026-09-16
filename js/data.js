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

// Axes fixes de la carte de positionnement à 3 pôles (module 2).
export const TERNARY_AXES = [
  { id: "food", label: "Food" },
  { id: "design", label: "Design" },
  { id: "experience", label: "Experience" },
];

export const AXES_TON = [
  { id: "serieux",     a: "Sérieux",        b: "Drôle" },
  { id: "formel",      a: "Formel",         b: "Décontracté" },
  { id: "respect",     a: "Respectueux",    b: "Impertinent" },
  { id: "enthousiasme", a: "Enthousiaste",  b: "Factuel" },
];

export const ARCHETYPES = [
  {
    id: "innocent",
    label: "Innocent",
    def: "Recherche l'optimisme et la simplicité. Une marque Innocent inspire confiance par son honnêteté, sa transparence et sa promesse de bonheur accessible.",
  },
  {
    id: "sage",
    label: "Sage",
    def: "Cherche la vérité et le savoir. Une marque Sage guide et informe : elle inspire confiance par son expertise et sa capacité à éclairer des choix complexes.",
  },
  {
    id: "explorateur",
    label: "Explorateur",
    def: "Aspire à la liberté et à la découverte. Une marque Explorateur invite à sortir des sentiers battus et à vivre des expériences authentiques et nouvelles.",
  },
  {
    id: "rebelle",
    label: "Rebelle",
    def: "Bouscule les codes établis. Une marque Rebelle assume la rupture et le changement, elle séduit ceux qui veulent se démarquer des normes imposées.",
  },
  {
    id: "magicien",
    label: "Magicien",
    def: "Transforme le réel en expérience mémorable. Une marque Magicien crée l'émerveillement et rend possible ce qui semblait inatteignable.",
  },
  {
    id: "heros",
    label: "Héros",
    def: "Relève des défis avec courage et détermination. Une marque Héros inspire par la performance, la maîtrise et la victoire sur l'adversité.",
  },
  {
    id: "amoureux",
    label: "Amoureux",
    def: "Crée du lien, de l'intimité et du plaisir sensoriel. Une marque Amoureux séduit par l'esthétique, l'émotion et la qualité de la relation qu'elle propose.",
  },
  {
    id: "bouffon",
    label: "Bouffon",
    def: "Fait vivre l'instant présent avec humour et spontanéité. Une marque Bouffon désamorce le sérieux et crée de la complicité par le rire.",
  },
  {
    id: "peuple",
    label: "Homme / femme du peuple",
    def: "Recherche l'appartenance et la proximité. Une marque Peuple valorise l'authenticité, l'accessibilité et les valeurs communes à tous.",
  },
  {
    id: "protecteur",
    label: "Protecteur",
    def: "Prend soin et protège. Une marque Protecteur inspire confiance par sa bienveillance, sa fiabilité et l'attention sincère qu'elle porte aux autres.",
  },
  {
    id: "createur",
    label: "Créateur",
    def: "Imagine et construit ce qui n'existe pas encore. Une marque Créateur valorise l'originalité, le savoir-faire et l'expression d'une vision singulière.",
  },
  {
    id: "souverain",
    label: "Souverain",
    def: "Incarne l'excellence, le contrôle et le prestige. Une marque Souverain inspire le respect par son autorité naturelle et son exigence de qualité.",
  },
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
