# Solitaire Comics — règles pour les agents

PWA Klondike (React + Vite + TypeScript), style bande dessinée, pour 2 utilisateurs. Sans pub ni serveur.
Lire d'abord : `docs/SPECS.md`, `docs/ARCHITECTURE.md`, `docs/BACKLOG.md`, `docs/DECISIONS.md`.

## Méthode de travail
- L'utilisateur (architecte UI/UX, à l'aise avec Angular/React) veut **apprendre** : expliquer chaque étape **avant** de coder (quoi, pourquoi, alternatives), puis exécuter après son accord.
- Répondre en **français**. Rester concis.
- Travailler jalon par jalon (voir `docs/BACKLOG.md`). À la fin d'un jalon : cocher le backlog, mettre à jour `docs/DECISIONS.md` et `docs/ARCHITECTURE.md` si le design a changé, commit et push.
- Ne pas ajouter de dépendance sans en discuter. Ne pas élargir le périmètre (voir « Hors périmètre » dans `docs/SPECS.md`).

## Commandes
- `npm run dev` : développement
- `npm test` : tests Vitest
- `npm run lint` : oxlint
- `npm run build` : build de production (vérifie aussi les types)
- `npm run icons` : régénère les icônes PWA depuis `public/favicon.svg`

Avant de commit : lint, tests et build doivent passer (la CI bloque sinon le déploiement).

## Architecture (non négociable)
- `src/engine/` : TypeScript pur. **Aucun import de React, du DOM, de `window` ni de `localStorage`.** Fonctions pures `état + action -> nouvel état`, états immuables.
- Toute règle du jeu est développée en **TDD** : le test d'abord dans `src/engine/*.test.ts`.
- L'annulation repose sur une pile d'états immuables, pas sur des actions inverses.
- La persistance (`localStorage`) vit uniquement dans `src/state/`.
- Le drag & drop est fait maison avec les Pointer Events, sans bibliothèque (`src/ui/input/`).
- Thème : variables CSS (`--ink`, `--paper`, `--accent`…) ; cartes en SVG.

## Conventions
- TypeScript `strict` + `noUncheckedIndexedAccess` : pas de `any`, gérer les `undefined` des accès aux tableaux.
- Prettier : sans point-virgule, guillemets simples. Textes de l'interface en français, en dur.
- Mobile d'abord (portrait) : cibles tactiles ≥ 44 px, safe areas, respecter `prefers-reduced-motion`.

## Pièges connus
- Le site est servi sous `/solitaire/` : `base` de Vite vient de `BASE_PATH` (voir `vite.config.ts` et `.github/workflows/deploy.yml`). Avec un domaine perso, `BASE_PATH=/`.
- Le service worker met l'app en cache : tester les mises à jour avec `npm run build && npm run preview`, pas avec `npm run dev`.
- Le chrono se met en pause quand l'app passe en arrière-plan (`visibilitychange`).
- Les gestes tactiles se testent sur un vrai téléphone ; l'émulation du navigateur ne suffit pas.

## Outils utiles
- MCP `context7` : vérifier l'API des bibliothèques récentes (Vite 8, Vitest 5, vite-plugin-pwa 2) avant de coder.
- MCP `chrome-devtools` : lancer l'app, émuler un téléphone, captures, console, Lighthouse (surtout à partir du jalon 2).
- Skills `modern-web-guidance`, `a11y-debugging`, `debug-optimize-lcp` pour l'UI, l'accessibilité et les performances.
- `gh` (GitHub CLI) pour consulter les exécutions GitHub Actions.

