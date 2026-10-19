import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      sizes: [512],
      padding: 0,
      resizeOptions: { background: '#206b3a' },
    },
  },
  images: ['public/favicon.svg'],
})

