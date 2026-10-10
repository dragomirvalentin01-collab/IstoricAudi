import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // injectManifest: pastrez controlul manual peste service worker ca sa pot
      // intercepta evenimentele de PUSH (alerta de schimb ulei)
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: {
        name: 'Istoric Auto',
        short_name: 'Istoric Auto',
        description: 'Urmareste schimburile de ulei si filtre',
        theme_color: '#0b0f14',
        background_color: '#0b0f14',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}']
      },
      devOptions: { enabled: false }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // bibliotecile grele se incarca doar cand chiar ai nevoie de ele
        // (export PDF/Excel), nu la pornirea aplicatiei pe mobil
        manualChunks: {
          pdf:    ['jspdf', 'jspdf-autotable'],
          excel:  ['xlsx'],
          motion: ['framer-motion']
        }
      }
    }
  }
})
