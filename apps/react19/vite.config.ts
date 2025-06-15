import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import postcssNesting from 'postcss-nesting';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
  ],
  css: {
    postcss: {
      plugins: [postcssNesting], // we can actually avoid using this plugin because vite supports css nesting natively; the only reason we use it is so that it transpiles to css that works in older browsers
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
