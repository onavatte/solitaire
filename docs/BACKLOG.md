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

## Jalon 2 — UI jouable, thème classique feutrine (≈ 1–1,5 j)
- [x] Plateau responsive portrait (feutrine verte, safe areas)
- [x] Rendu des cartes en SVG standard (figures nettes, enseignes, dos géométrique)
- [x] Drag & drop maison (Pointer Events)
- [x] Barre d'outils : annuler, indice, nouvelle donne, réglages (pioche 1/3)
- [x] Chrono (pause en arrière-plan) et compteur de coups
- [x] Déclenchement autocomplétion & écran de victoire sobre
- [x] Fix double-clic / double-tap vers fondation
- [x] Inverser la ligne du haut : 4 Fondations (gauche) | Défausse | Pioche (droite, ergonomie droitier)
- [x] Corriger le filigrane des colonnes vides : 'R' au lieu de 'K' (Français)
- [x] Défausse à 3 cartes : éventail horizontal montrant les cartes sous-jacentes
- [x] Autocomplétion cadencée continue (100 ms) + suppression du double-clic en chaîne

## Jalon 3 — Finitions MVP (≈ 0,5–1 j)
- [x] Nouvelles icônes PWA classiques feutrine (remplacer le jaune "comics" de `public/favicon.svg` et régénérer)
- [x] Couleur de barre de statut mobile (`theme_color` PWA et `meta theme-color`) assortie au vert feutrine
- [x] Graphismes & figures : disposition mobile (rang + enseigne horizontaux), figures SVG (Valet, Dame, Roi) et grand symbole central
- [x] Sauvegarde/reprise de la partie (`localStorage`), stats
- [x] Animations de base FLIP GPU (déplacement, pioche 1/3 cartes coordonnée, glisser-déposer sans fantôme)
- [x] Header supérieur : déplacer le chrono et le compteur de coups en haut (libérer l'espace en bas)
- [x] Footer (barre d'actions) : boutons verticaux (icône + libellé compact) de droite à gauche (Annuler ↩, Indice 💡, Nouvelle 🃏, Stats 📊, Options ⚙️)
- [x] Modal Options ⚙️ : choix pioche (1 ou 3 cartes), retour haptique (on/off), désactivation des transitions
- [ ] Animation de distribution pour les nouvelles parties
- [ ] Animation de victoire festive (feux d'artifice / confettis sur le canvas ou SVG)
- [ ] Ajustement du layout des figures (Valet, Dame, Roi)
- [ ] Ajustement de l'animation de flip de carte (retournement sur place)
- [ ] Domaine perso `poudlard-home.ca` (CNAME Cloudflare, domaine dans Settings → Pages, `BASE_PATH: /`)
- [ ] Audit Lighthouse PWA, tests sur les deux téléphones

## Idées pour plus tard (v2)
- Mode gaucher
- Habillage comics (typo BD, halftone, onomatopées, explosions)
- Autres thèmes (sombre, bois, moderne)
- Solveur pour garantir des donnes gagnables
- Défi du jour

