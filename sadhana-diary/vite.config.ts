import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // Bypass strict TS mismatch with "as any"
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-icon.svg'],
      manifest: {
        name: 'Sadhana Diary',
        short_name: 'Sadhana',
        description: 'ISKCON Daily Sadhana Tracker',
        theme_color: '#fdfaf5',
        background_color: '#fdfaf5',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    }) as any
  ]
})