// script to run both bun and tsc in parallel (probably not the best way to do it and `bun run dev:tsc & bun run dev:bun` would be the same thing)
import type { SpawnOptions } from 'bun';
import { readdir } from 'node:fs/promises';
import { parseArgs } from 'util';

const spawnOptions: SpawnOptions.OptionsObject<
  'inherit',
  'inherit',
  'inherit'
> = {
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit',
};

const run = async (
  frontendPackage: string,
  args: { [key: string]: string | boolean | undefined },
) => {
  console.log(`Running project with frontend package: ${frontendPackage}`);
  const { be_port: backendPort, fe_port: frontendPort } = args;

  if (typeof backendPort === 'boolean' || isNaN(Number(backendPort))) {
    console.error(`❌ Backend port must be a number, but got: ${backendPort}`);
    process.exitCode = 1;
    throw new Error(`Backend port must be a number, but got: ${backendPort}`);
  }
  if (typeof frontendPort === 'boolean' || isNaN(Number(frontendPort))) {
    console.error(
      `❌ Frontend port must be a number, but got: ${frontendPort}`,
    );
    process.exitCode = 1;
    throw new Error(`Frontend port must be a number, but got: ${frontendPort}`);
  }

  const frontendAppsPath = `${import.meta.dir}/../apps`;
  const listOfFrontendPackages = (await readdir(frontendAppsPath)).filter(
    (packageName) => packageName !== 'backend',
  );

  if (!listOfFrontendPackages.includes(frontendPackage)) {
    console.error(`❌ Frontend package "${frontendPackage}" not found`);
    console.log('Available frontend packages:');
    console.log('----------------------------------');
    console.table(listOfFrontendPackages);
    process.exitCode = 1;
    throw new Error(
      `Frontend package "${frontendPackage}" not found in ${frontendAppsPath}`,
    );
  }

  // run the backend server
  const backendPath = `${import.meta.dir}/../apps/backend`;
  Bun.spawn(['bun', 'run', 'bun:dev'], {
    cwd: backendPath,
    env: {
      ...(process.env as Record<string, string | undefined>), // need to cast as vite extends ImportMetaEnv by adding boolean values, and the process.env should only include strings or undefined values
      FRONTEND_PORT: frontendPort, // Set the frontend port for the backend to use: we need to use envs instead of cli args because to avoid having issues with some tools when extra cli args are provided; for example, vite does not accept extra arguments beside those it expects: https://github.com/vitejs/vite/issues/7065
      PORT: backendPort,
    },
    ...spawnOptions,
  });

  // run the frontend server
  const frontendPath = `${frontendAppsPath}/${frontendPackage}`;
  const frontendCommand = ['bun', 'run', 'dev'];
  Bun.spawn(frontendCommand, {
    cwd: frontendPath,
    env: {
      ...(process.env as Record<string, string | undefined>), // need to cast as vite extends ImportMetaEnv by adding boolean values, and the process.env should only include strings or undefined values
      BACKEND_PORT: backendPort, // Set the backend port for the frontend to use: we need to use envs instead of cli args because to avoid having issues with some tools when extra cli args are provided; for example, vite does not accept extra arguments beside those it expects: https://github.com/vitejs/vite/issues/7065
      PORT: frontendPort,
    },
    ...spawnOptions,
  });

  process.on('SIGINT', async () => {
    console.log(); // add a new line for better readability
    console.log('Cleaning up...');
  });
};

let frontendPackage = import.meta.env.npm_lifecycle_event;

if (frontendPackage?.includes(':')) {
  frontendPackage = frontendPackage.split(':')[0]; // Remove any script suffix like "dev" or "build"
}

if (!frontendPackage) {
  console.error('❌ No frontend package specified');
  process.exitCode = 1;
  throw new Error(
    'No frontend package specified. Please provide a package name.',
  );
}

const { values: args } = parseArgs({
  args: Bun.argv,
  options: {
    be_port: {
      type: 'string',
      default: '3001', // Default backend port, should match backend's env.PORT
    },
    fe_port: {
      type: 'string',
      default: '3002', // Default frontend port, should match frontend's port defined in vite.config.ts
    },
  },
  strict: false,
  allowPositionals: true,
});

run(frontendPackage, args);
