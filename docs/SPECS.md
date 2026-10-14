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

## Direction artistique « Comics »
- **Palette** : papier crème, aplats saturés (rouge, jaune, bleu), contours noirs épais (3–4 px).
- **Typo** : titres style BD (ex. *Bangers*, *Luckiest Guy*), chiffres de cartes lisibles (ex. *Anton*).
- **Effets** : ombres portées dures décalées, trame de points (halftone), onomatopées (« POW! », « ZAP! »), bulles pour l'indice.
- **Cartes** : figures (V, D, R) stylisées en aplats ; dos pop-art ; SVG thémable.
- **Victoire** : explosion de couleurs, bandeau « YOU WIN! », cartes qui rebondissent.
- **Tokens** : variables CSS (`--ink`, `--paper`, `--accent`, `--shadow-offset`…) pour ajouter d'autres thèmes plus tard.
