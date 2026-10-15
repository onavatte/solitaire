# Décisions

Journal des décisions techniques (ADR allégé). Les plus récentes en bas.

| Date | Décision | Raison / conséquences |
|---|---|---|
| 2026-10-13 | **PWA** plutôt qu'app native | Pas de validation Google Play, installable via Chrome |
| 2026-10-13 | **React + Vite + Framer Motion** (scénario B) | Meilleur équilibre rapidité / qualité visuelle / maintenance |
| 2026-10-13 | **Moteur TS pur + reducer** | Testable sans UI ; annulation = pile d'états |
| 2026-10-13 | **Drag & drop maison** (Pointer Events) | Contrôle du tactile, pédagogique, aucune dépendance |
| 2026-10-13 | **GitHub Pages** | Gratuit, déploiement par Actions |
| 2026-10-13 | **Français seulement** | Pas de lib i18n |
| 2026-10-13 | **Chrono + nombre de coups** | `elapsedMs` + `moves` dans l'état ; pause en arrière-plan |
| 2026-10-13 | **oxlint** (fourni par le template Vite) au lieu d'ESLint | Rapide, configuré par défaut |
| 2026-10-13 | **Mise à jour PWA par `prompt`** | Évite de recharger l'app en pleine partie |
| 2026-10-13 | **Domaine perso reporté** | Nécessite `BASE_PATH=/` ; réinstaller l'app après changement d'URL |
| 2026-10-14 | **Mulberry32 PRNG pur** | Aléatoire déterministe avec graine sans dépendance externe |
| 2026-10-14 | **Autocomplétion pas-à-pas** | `autocompleteStep` unitaire pour permettre les animations visuelles en UI |

## Stratégie d'usage des modèles IA
| Phase | Modèle conseillé |
|---|---|
| Specs, architecture, décisions de fond, relecture finale | Opus 5.5 |
| Moteur de jeu, UI React, drag & drop | Sonnet 5.5 |
| Débogage subtil | Opus 5.5 si Sonnet échoue après 2 essais |
| CSS/thème, SVG | Sonnet 5.5 puis Gemini 3.8 Flash |
| Config, tests simples, README, tâches mécaniques | Gemini 3.8 Flash |

Les tests Vitest du moteur servent de filet pour déléguer à un modèle moins cher.


## Sécurité
- 2026-10-13 : repo public conservé (requis pour GitHub Pages gratuit). Règle : aucune donnée sensible dans git (clés, jetons, .env) ; voir AGENTS.md. .gitignore exclut .env*, *.pem, *.key.
