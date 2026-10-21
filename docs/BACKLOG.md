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
- [x] Modal Options ⚙️ : choix pioche (1 ou 3 cartes), désactivation des transitions (retour haptique retiré)
- [x] Animation de distribution pour les nouvelles parties
- [x] Animation de victoire festive (feux d'artifice classiques, comics pop et confettis aléatoires)
- [x] Ajustement du layout des figures (Valet, Dame, Roi)
- [x] Ajustement de l'animation de flip de carte (retournement sur place)
- [ ] Domaine perso `poudlard-home.ca` (CNAME Cloudflare, domaine dans Settings → Pages, `BASE_PATH: /`)
- [ ] Audit Lighthouse PWA, tests sur les deux téléphones

## Jalon 4 — Gameplay, Ergonomie & Finitions interactives
- [x] Animations d'enseignes (onde de symbole semi-transparente de cœur, carreau, pique, trèfle grossissant en fondu quand une carte arrive dans sa fondation)
- [x] *Smart auto-move* sur simple clic (envoi direct sur le meilleur emplacement au lieu du double-clic, avec option dans les réglages)
- [x] Auto-déplacement vers les fondations (montée automatique en fondation des cartes sécurisées / évidentes au fil du jeu)
- [x] Système de score en points (règles de score Klondike standard, affichage en jeu et records dans les statistiques)
- [x] Corriger le bug intermittent de score affiché à `NaN` au démarrage (initialisation / reprise depuis le localStorage)
- [x] Retravailler l'icône / favicon de l'application pour un meilleur rendu sur Android (marges de sécurité pour icône adaptative / maskable)
- [x] Empêcher la montée automatique des As vers les fondations juste après la donne initiale (`game.moves === 0`)
- [x] Ralentir la vitesse de déplacement des cartes (~280 ms) et la cadence de l'autocomplétion (~240 ms)
- [x] Synchroniser l'onde d'enseigne avec l'atterrissage effectif de la carte (éviter l'effet sous la carte)
- [x] Option 3 modes pour l'auto-déplacement vers les fondations (Toutes les cartes, Cartes sûres, Désactivé)
- [x] Empêcher la remontée automatique des cartes redescendues manuellement de la fondation

## Jalon 5 — Audio & Sound Design (qualité App Store)
- [ ] Moteur audio Web Audio API (latence nulle 0 ms, AudioBuffer, mise en cache PWA hors-ligne)
- [ ] Bruitages tactiles de cartes (prise / glissement sur feutrine, dépôt / claquement feutré, retournement)
- [ ] Effet mélodique d'arrivée en fondation (gamme ascendante gratifiante de l'As au Roi)
- [ ] Sons de distribution initiale (battement / riffle shuffle) et de célébration de victoire
- [ ] Musique d'ambiance d'arrière-plan (boucle jazz / lofi détendue)
- [ ] Réglages audio dans la modale d'Options (interrupteurs indépendants pour Bruitages ON/OFF et Musique ON/OFF)

## Idées pour plus tard (v2)
- Mode gaucher
- Habillage comics (typo BD, halftone, onomatopées, explosions)
- Autres thèmes (sombre, bois, moderne)
- Solveur pour garantir des donnes gagnables
- Défi du jour

