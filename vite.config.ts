import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@engines': resolve(__dirname, 'src/engines'),
      '@subjects': resolve(__dirname, 'src/subjects'),
      '@platform': resolve(__dirname, 'src/platform'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        pwa: resolve(__dirname, 'pwa/index.html'),
      },
    },
  },
});
