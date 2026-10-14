import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

// Sous-chemin de déploiement. GitHub Pages sert le site sous /solitaire/.
// Avec un domaine perso (poudlard-home.ca), on définira BASE_PATH='/' dans le workflow.
const base = process.env.BASE_PATH ?? '/solitaire/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      // 'prompt' : on avertit l'utilisateur d'une nouvelle version au lieu de recharger en pleine partie
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Solitaire Comics',
        short_name: 'Solitaire',
        description: 'Solitaire Klondike sans pub, style bande dessinée.',
        lang: 'fr',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fff4d6',
        theme_color: '#ffd23f',
        start_url: base,
        scope: base,
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
  },
})
