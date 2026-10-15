# Backlog

Légende : `[x]` fait, `[ ]` à faire.

## Jalon 0 — Fondations ✅
- [x] Init Vite + React + TS strict, oxlint, Prettier, Vitest
- [x] PWA installable (manifeste, service worker, icônes provisoires, bandeau de mise à jour)
- [x] Déploiement GitHub Pages par Actions (lint + tests + build)
- [x] Vérifié sur téléphone (installation + hors-ligne)

## Jalon 1 — Moteur (≈ 1 j, TDD) ✅
- [x] Types, paquet de 52 cartes, RNG à graine, mélange
- [x] Distribution initiale
- [x] Coups légaux tableau / fondations, déplacement de séquences
- [x] Pioche 1 ou 3 cartes et recyclage de la défausse
- [x] Détection de victoire
- [x] Historique / annulation illimitée
- [x] Indice
- [x] Autocomplétion (victoire automatique)

## Jalon 2 — UI jouable, thème classique feutrine (≈ 1–1,5 j) ✅
- [x] Plateau responsive portrait (feutrine verte, safe areas)
- [x] Rendu des cartes en SVG standard (figures nettes, enseignes, dos géométrique)
- [x] Tap pour sélectionner/déplacer + double-tap vers fondation
- [x] Drag & drop maison (Pointer Events)
- [x] Barre d'outils : annuler, indice, nouvelle donne, réglages (pioche 1/3)
- [x] Chrono (pause en arrière-plan) et compteur de coups
- [x] Déclenchement autocomplétion & écran de victoire sobre

## Jalon 3 — Finitions MVP (≈ 0,5–1 j)
- [ ] Sauvegarde/reprise de la partie (`localStorage`), stats
- [ ] Animations Framer Motion fluides (déplacement, distribution)
- [ ] Mode gaucher, haptique, respect de `prefers-reduced-motion`
- [ ] Domaine perso `poudlard-home.ca` (CNAME Cloudflare, domaine dans Settings → Pages, `BASE_PATH: /`)
- [ ] Audit Lighthouse PWA, tests sur les deux téléphones

## Idées pour plus tard (v2)
- Habillage comics (typo BD, halftone, onomatopées, explosions)
- Autres thèmes (sombre, bois, moderne)
- Solveur pour garantir des donnes gagnables
- Défi du jour

