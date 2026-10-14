# Solitaire Comics

Solitaire Klondike sans pub, style bande dessinée. PWA installable, 100 % hors-ligne.

**Stack** : React + Vite + TypeScript, vite-plugin-pwa, Vitest.

## Documentation
- [Specs](docs/SPECS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Backlog](docs/BACKLOG.md)
- [Décisions](docs/DECISIONS.md)

## Commandes

| Commande          | Rôle                                                |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Serveur de développement                            |
| `npm test`        | Tests (Vitest)                                      |
| `npm run lint`    | Lint (oxlint)                                       |
| `npm run build`   | Build de production dans `dist/`                    |
| `npm run preview` | Sert le build localement (pour tester la PWA)       |
| `npm run icons`   | Régénère les icônes PWA depuis `public/favicon.svg` |

## Déploiement

Push sur `main` → GitHub Actions (lint, tests, build) → GitHub Pages : <https://onavatte.github.io/solitaire/>

Le sous-chemin `/solitaire/` vient de la variable `BASE_PATH` (voir `vite.config.ts` et `.github/workflows/deploy.yml`). Avec un domaine perso, mettre `BASE_PATH: /`.
