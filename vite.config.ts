import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        'index': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        'styles': fileURLToPath(new URL('./src/styles/index.ts', import.meta.url)),
        'mantine/index': fileURLToPath(new URL('./src/components/datavistas/mantine/index.tsx', import.meta.url))
      },
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        '@datavysta/vysta-client',
        'ag-grid-react',
        'ag-grid-community',
        '@mantine/core',
        '@mantine/hooks'
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          const extname = name.split('.').pop();
          
          // Put all CSS files into style.css
          if (extname === 'css') {
            return 'style.css';
          }
          
          return '[name][extname]';
        },
      },
    },
    cssCodeSplit: false,
    target: 'esnext',
    outDir: 'dist',
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]__[hash:base64:5]'
    }
  },
}); 