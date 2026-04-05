import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        id: '/',
        name: 'Creative Studio: Identity Hub',
        short_name: 'CreativeHub',
        description: 'Elite digital identity and business card designer.',
        theme_color: '#22d3ee',
        background_color: '#060d14',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  root: 'client',
  server: {
    host: true,
    port: 5000,
    strictPort: true,
    cors: true,
    allowedHosts: ['.loca.lt', '.serveousercontent.com', 'd4f7d5441fd5b20e-197-58-157-176.serveousercontent.com'],
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
