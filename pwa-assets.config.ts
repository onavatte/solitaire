import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Génère les icônes PNG de la PWA à partir de public/favicon.svg : `npm run icons`
export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/favicon.svg'],
})

