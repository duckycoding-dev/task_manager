import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import postcssNesting from 'postcss-nesting';

// https://vite.dev/config/

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  process.env.VITE_PORT = env.PORT || env.VITE_PORT || '5173'; // cli args must have precedence over env vars, and if neither is set, default to 5173 (which is the default Vite port)
  process.env.VITE_BACKEND_PORT =
    env.BACKEND_PORT || env.VITE_BACKEND_PORT || '3001'; // Ensure process.env.VITE_BACKEND_PORT is updated as well in case it is used elsewhere
  // neither is set, default to 3001 (which is the default backend port)

  if (isNaN(Number(process.env.VITE_PORT))) {
    throw new Error(
      `VITE_PORT must be a number, but got: ${process.env.VITE_PORT}`,
    );
  }
  if (isNaN(Number(process.env.VITE_BACKEND_PORT))) {
    throw new Error(
      `VITE_BACKEND_PORT must be a number, but got: ${process.env.VITE_BACKEND_PORT}`,
    );
  }

  if (env.NODE_ENV === 'development') {
    console.log('----------------------------');
    console.log('Frontend envs:');
    console.table({
      VITE_PORT: process.env.VITE_PORT,
      VITE_BACKEND_PORT: process.env.VITE_BACKEND_PORT,
    });
  }

  return {
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
    server: {
      strictPort: true, // if the port is already in use, Vite will throw an error instead of trying to find another port
      port: Number(process.env.VITE_PORT),
    },
  } as const;
});
