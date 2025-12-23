import { defineConfig } from 'vite';

export default defineConfig({
  base: '/slime-hunter/',  // GitHub Pages base path
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
