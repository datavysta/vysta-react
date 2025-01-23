import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      external: [
        '@datavysta/vysta-react/style.css',
        '@mantine/core/styles.css'
      ]
    }
  }
}); 