import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [react()],
    server: {
      port: env.VITE_PORT ? parseInt(env.VITE_PORT) : 3000,
      open: true
    },
    resolve: {
      alias: {
        '@datavysta/vysta-react': path.resolve(__dirname, '../src'),
        '@datavysta/vysta-react/style.css': path.resolve(__dirname, '../src/style.css')
      }
    }
  }
});