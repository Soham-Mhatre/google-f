import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://google-b-1-y2sb.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: true, // Enable sourcemaps for the production build
  },
});
