import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]__[hash:base64:5]'
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VystaReact',
      formats: ['es', 'umd'],
      fileName: (format) => `vysta-react.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@datavysta/vysta-client', 'ag-grid-react', 'ag-grid-community'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@datavysta/vysta-client': 'VystaClient',
          'ag-grid-react': 'AgGridReact',
          'ag-grid-community': 'AgGridCommunity',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css';
          return assetInfo.name;
        },
      },
    },
  },
}); 