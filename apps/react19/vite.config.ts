import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import postcssNesting from 'postcss-nesting';
import { parseArgs } from 'util';

// https://vite.dev/config/

export default defineConfig(({ mode }) => {
  const { values: args } = parseArgs({
    args: process.argv,
    options: {
      port: {
        type: 'string',
        short: 'P',
      },
    },
    strict: false, // allow unknown options
    allowPositionals: true,
  });

  const env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const untypedPort = args.port || env.VITE_PORT || '5173'; // cli args must have precedence over env vars, and if neither is set, default to 5173 (which is the default Vite port)

  if (untypedPort !== 'boolean' && isNaN(Number(untypedPort))) {
    throw new Error(`VITE_PORT must be a number, but got: ${untypedPort}`);
  }
  if (typeof untypedPort === 'boolean') {
    throw new Error(`VITE_PORT cannot be a boolean, but got: ${untypedPort}`);
  }
  process.env.VITE_PORT = untypedPort; // Ensure process.env.VITE_PORT is updated as well in case it is used elsewhere

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
      port: Number(process.env.VITE_PORT),
    },
  } as const;
});
