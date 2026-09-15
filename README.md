# UNION — Outil de positionnement

Outil interactif en 5 modules pour aligner le positionnement de marque des
cinq fondateurs d'UNION. Site statique (HTML/CSS/JS, aucun framework), pensé
pour être hébergé gratuitement sur **GitHub Pages** et partagé par un simple
lien — aucun compte n'est nécessaire pour les fondateurs qui l'utilisent.

Les réponses (curseurs, carte, brand key, archétypes, ton de voix) sont
stockées dans une base **Firestore** (Firebase, gratuit) partagée entre tous
les visiteurs du lien, en temps réel.

## 1. Mise en place de la base partagée (5 minutes, à faire une seule fois)

Cette étape est à faire par une seule personne (vous). Les 4 autres
fondateurs n'auront besoin d'aucun compte : ils ouvriront juste le lien final.

1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
   et connectez-vous avec un compte Google (personnel, pas besoin de compte
   d'entreprise).
2. **Ajouter un projet** → donnez-lui un nom (ex. `union-positionnement`) →
   désactivez Google Analytics (inutile ici) → créez le projet.
3. Dans le menu de gauche, ouvrez **Build → Firestore Database** → **Créer
   une base de données** → choisissez une région proche (ex. `eur3`) →
   démarrez en **mode production**.
4. Une fois la base créée, allez dans l'onglet **Règles** et remplacez le
   contenu par :

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

   Cliquez sur **Publier**. (Ces règles ouvrent la base à quiconque possède
   le lien du site — c'est volontaire pour un outil interne sans compte ;
   voir la section _Sécurité_ plus bas.)

5. Toujours dans la console, cliquez sur l'icône ⚙️ (Paramètres du projet) →
   descendez à **Vos applications** → cliquez sur l'icône **`</>`** (Web) →
   donnez un surnom à l'app → **Enregistrer l'application**. Firebase vous
   affiche un bloc `firebaseConfig = { apiKey: "...", ... }`.
6. Copiez ces valeurs dans le fichier [`js/firebase-config.js`](js/firebase-config.js)
   du projet, à la place des `REMPLACER_...`.

C'est tout — pas de serveur à gérer, pas de facturation (le quota gratuit est
largement suffisant pour 5 personnes).

## 2. Déploiement sur GitHub Pages

Depuis ce dossier (`union-positionnement/`) :

```bash
git add -A
git commit -m "Outil de positionnement UNION"
```

Puis, sur [github.com](https://github.com), créez un nouveau dépôt (public ou
privé — les deux fonctionnent avec GitHub Pages), puis :

```bash
git remote add origin https://github.com/<votre-compte>/<nom-du-depot>.git
git branch -M main
git push -u origin main
```

Enfin, sur GitHub : **Settings → Pages** → sous « Build and deployment »,
Source = **Deploy from a branch**, Branch = **main** / dossier **/ (root)**
→ **Save**. Après une minute, le site est en ligne à une adresse du type :

```
https://<votre-compte>.github.io/<nom-du-depot>/
```

C'est ce lien que vous partagez aux 4 autres fondateurs.

## 3. Utilisation

- Chacun ouvre le lien et renseigne son **prénom** en haut de page (utilisé
  pour retrouver ses propres réponses et distinguer chacun dans les vues
  d'équipe — un simple mot, pas un compte).
- Les modules 1, 4 et 5 (curseurs, archétypes, ton de voix) ont une vue
  « Ma vue » (individuelle, à enregistrer) et une vue « Vue de l'équipe »
  (agrégée, en lecture).
- Le module 2 (carte) et le module 3 (brand key) sont des documents
  partagés : toute modification par une personne est visible par les autres
  en direct, sans bouton « Enregistrer » à part pour la carte qui n'en a pas
  besoin (clic direct) et la brand key (sauvegarde au clic hors du champ).

## 4. Structure du projet

```
index.html          structure de la page, 5 modules
style.css            identité visuelle (noir/crème, UNION)
js/data.js           axes, archétypes, contenu par défaut de la brand key
js/firebase.js       initialisation Firebase
js/firebase-config.js  clés de VOTRE projet Firebase (à remplir, étape 1)
js/identity.js       gestion du prénom (stocké localement par appareil)
js/radar.js          moteur des radars SVG (modules 1 et 5)
js/module1.js .. module5.js   logique de chaque module
js/main.js           point d'entrée, navigation
```

## 5. Sécurité — ce qu'il faut savoir

Les règles Firestore ci-dessus ouvrent la base à quiconque connaît l'URL du
site (lecture **et** écriture). C'est un choix assumé pour un outil interne
partagé entre 5 personnes de confiance, sans friction de compte. Si le lien
venait à être partagé plus largement, n'importe qui pourrait modifier les
données. Pour un usage plus sensible, il faudrait ajouter une authentification
Firebase (ex. connexion par e-mail) — au prix d'un compte à créer pour
chacun des 5 fondateurs.

## 6. Si vous voulez tester en local avant de déployer

Un simple double-clic sur `index.html` ne fonctionnera pas (les modules
JavaScript `import` nécessitent un serveur HTTP). Depuis ce dossier :

```bash
python3 -m http.server 8000
```

puis ouvrez `http://localhost:8000` dans votre navigateur.
