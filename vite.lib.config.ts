import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'glasskit-emit-styles',
      closeBundle() {
        mkdirSync('dist-lib', { recursive: true });
        copyFileSync('src/glasskit/styles/glasskit.css', 'dist-lib/styles.css');
      },
    },
  ],
  publicDir: false,
  build: {
    outDir: 'dist-lib',
    emptyOutDir: false,
    lib: {
      entry: 'src/glasskit/index.ts',
      name: 'GlassKit',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
