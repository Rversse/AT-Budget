import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),

    tailwindcss(),

    VitePWA({
      registerType:
        'autoUpdate',

      includeAssets: [
        'favicon.ico',
      ],

      manifest: {
        name: 'AT Budget',

        short_name:
          'AT Budget',

        description:
          'Personal finance tracker',

        theme_color:
          '#18181b',

        background_color:
          '#fafafa',

        display: 'standalone',

        start_url: '/',

        icons: [
          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },

          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(
        __dirname,
        './src',
      ),
    },
  },
})