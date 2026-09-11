import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],

      // Workbox strategy: cache app shell + handle API offline gracefully
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Network-first for API calls — fall back gracefully offline
            urlPattern: /^https?:\/\/localhost:5000\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Cache-first for static assets (fonts, images)
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },

      manifest: {
        name: 'Smart Expense Tracker',
        short_name: 'ExpenseTracker',
        description: 'Track expenses, set budgets, and take control of your finances with AI-powered insights.',
        theme_color: '#c9a227',
        background_color: '#040404',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/dashboard',
        scope: '/',
        categories: ['finance', 'productivity', 'utilities'],
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Add Expense',
            short_name: 'Add',
            description: 'Quickly add a new expense',
            url: '/dashboard?tab=expenses',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }],
          },
        ],
      },
    }),
  ],
})
