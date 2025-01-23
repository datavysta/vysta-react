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
          
          // If it's a CSS file
          if (extname === 'css') {
            // If it's the theme CSS
            if (name.includes('theme.css')) {
              return 'style.css';
            }
            
            // For component CSS files, preserve their path relative to src
            const srcIndex = name.indexOf('/src/');
            if (srcIndex >= 0) {
              return name.slice(srcIndex + 5); // +5 to skip '/src/'
            }
          }
          
          return '[name][extname]';
        },
      },
    },
    cssCodeSplit: true,
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