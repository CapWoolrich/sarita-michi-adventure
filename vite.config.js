import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'Sarita y los michi perdidos',
        short_name: 'Sarita',
        description: 'Una aventura mágica para rescatar gatitos perdidos.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#ffd6e7',
        theme_color: '#ff6b9d',
        categories: ['games', 'kids', 'entertainment'],
        icons: [{ src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          three: ['three'],
          fiber: ['@react-three/fiber', '@react-three/drei'],
          postfx: ['@react-three/postprocessing', 'postprocessing'],
          tone: ['tone']
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
});
