# Specs fonctionnelles

## Périmètre v1
Klondike seul, style bande dessinée, pour usage personnel (2 utilisateurs). PWA installable, 100 % hors-ligne, sans pub, sans serveur.

| Domaine | Exigence |
|---|---|
| Règles | Klondike standard : 7 colonnes, 4 fondations, pioche + défausse |
| Pioche | Réglage 1 ou 3 cartes (modifiable à la nouvelle donne) |
| Annulation | Illimitée (pile d'historique de l'état complet) |
| Indice | Propose un coup utile et le met en surbrillance |
| Victoire auto | Quand toutes les cartes sont face visible et la pioche vide, les cartes montent seules aux fondations |
| Nouvelle donne | Aléatoire (graine), option « rejouer la même donne » |
| Chrono | Démarre au 1er coup ; en pause quand l'app passe en arrière-plan (`visibilitychange`) |
| Compteur | Nombre de coups |
| Stats | Parties jouées/gagnées, meilleur temps, meilleur nombre de coups |
| Sauvegarde | Partie en cours + stats + préférences en `localStorage` |
| Hors-ligne | 100 % via service worker, installable |
| Langue | Français uniquement (textes en dur) |
| Interactions | Glisser-déposer (Pointer Events maison), tap pour sélectionner/déplacer, double-tap vers fondation |
| Confort | Haptique (`navigator.vibrate`), mode gaucher, réduction des animations, portrait d'abord |

## Hors périmètre v1
Spider, FreeCell, comptes, serveur, pubs, multijoueur, i18n.

## Critères de qualité
- Lancement < 1 s, 60 fps
- Cibles tactiles ≥ 44 px
- Contraste AA
- Fonctionne sans réseau

## Direction artistique MVP « Classique »
- **Palette** : feutrine verte (`#0d5e2a` ou similaire), bordures nettes, cartes blanches à coins arrondis.
- **Typo** : police système sans-serif moderne, épurée et très lisible (chiffres et lettres bien contrastés).
- **Cartes** : rendu vectoriel SVG précis, enseignes traditionnelles (rouge/noir), dos géométrique sobre (losanges/treillis).
- **Tokens** : variables CSS (`--felt`, `--card-bg`, `--card-border`, `--red-suit`, `--black-suit`…) pour permettre le changement de thème ultérieur sans modifier l'UI.

## Direction artistique « Comics » (reportée en v2)
- Palette papier crème, contours noirs épais, typo BD (*Bangers*), trames halftone, onomatopées (« POW! », « ZAP! »), explosion de victoire pop-art.

