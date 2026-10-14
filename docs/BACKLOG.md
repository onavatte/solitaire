# Backlog

Légende : `[x]` fait, `[ ]` à faire.

## Jalon 0 — Fondations ✅
- [x] Init Vite + React + TS strict, oxlint, Prettier, Vitest
- [x] PWA installable (manifeste, service worker, icônes provisoires, bandeau de mise à jour)
- [x] Déploiement GitHub Pages par Actions (lint + tests + build)
- [x] Vérifié sur téléphone (installation + hors-ligne)

## Jalon 1 — Moteur (≈ 1 j, TDD)
- [ ] Types, paquet de 52 cartes, RNG à graine, mélange
- [ ] Distribution initiale
- [ ] Coups légaux tableau / fondations, déplacement de séquences
- [ ] Pioche 1 ou 3 cartes et recyclage de la défausse
- [ ] Détection de victoire
- [ ] Historique / annulation illimitée
- [ ] Indice
- [ ] Autocomplétion (victoire automatique)

## Jalon 2 — UI jouable, thème neutre (≈ 1–1,5 j)
- [ ] Plateau responsive portrait
- [ ] Rendu des cartes en SVG
- [ ] Tap pour sélectionner/déplacer + double-tap vers fondation
- [ ] Drag & drop maison (Pointer Events)
- [ ] Barre d'outils : annuler, indice, nouvelle donne, réglages
- [ ] Chrono (pause en arrière-plan) et compteur de coups

## Jalon 3 — Habillage comics (≈ 1 j)
- [ ] Tokens CSS + thème, typo BD, trame halftone
- [ ] Vraies icônes de l'app (remplacer les provisoires)
- [ ] Animations : distribution, retournement, déplacement, victoire
- [ ] Onomatopées, haptique

## Jalon 4 — Finitions (≈ 0,5–1 j)
- [ ] Sauvegarde/reprise de la partie, stats
- [ ] Mode gaucher, réduction des animations
- [ ] Domaine perso `poudlard-home.ca` (CNAME Cloudflare, domaine dans Settings → Pages, `BASE_PATH: /`, réinstaller l'app)
- [ ] Audit Lighthouse PWA, tests sur les deux téléphones

## Idées pour plus tard
- Autres thèmes
- Solveur pour garantir des donnes gagnables
- Défi du jour
