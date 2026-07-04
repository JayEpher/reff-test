import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@activities': resolve(__dirname, './src/activities'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        checkin: resolve(__dirname, 'checkin/index.html'),
        halloween: resolve(__dirname, 'halloween/index.html'),
        'mini-game': resolve(__dirname, 'mini-game/index.html'),
        team: resolve(__dirname, 'team/index.html'),
      },
    },
    outDir: 'dist',
  },
  server: {
    port: 3000,
  },
});
