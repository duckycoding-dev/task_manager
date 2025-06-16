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
  const {
    be_port: backendPort,
    fe_port: frontendPort,
    ...remainingArgs
  } = args;

  const formattedRemainingArgs = Object.entries(remainingArgs).flatMap(
    ([key, value]) => {
      if (value === undefined || value === false) {
        return []; // Skip undefined or false values
      } else if (value === true) {
        return [`--${key}`]; // For boolean true, just return the flag
      } else {
        return [`--${key}`, value];
      }
    },
  );
  console.log(`Remaining args: ${formattedRemainingArgs}`);

  if (typeof backendPort === 'boolean' || isNaN(Number(backendPort))) {
    console.error(`❌ Backend port must be a number, but got: ${backendPort}`);
    process.exit(1);
  }
  if (typeof frontendPort === 'boolean' || isNaN(Number(frontendPort))) {
    console.error(
      `❌ Frontend port must be a number, but got: ${frontendPort}`,
    );
    process.exit(1);
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
    process.exit(1);
  }

  // run the backend server
  const backendPath = `${import.meta.dir}/../apps/backend`;
  Bun.spawn(
    ['bun', 'run', 'bun:dev', '--port', `${backendPort}`].concat(
      formattedRemainingArgs,
    ),
    {
      cwd: backendPath,
      ...spawnOptions,
    },
  );

  // run the frontend server
  const frontendPath = `${frontendAppsPath}/${frontendPackage}`;
  const frontendCommand = [
    'bun',
    'run',
    'dev',
    '--port',
    `${frontendPort}`,
  ].concat(formattedRemainingArgs);
  Bun.spawn(frontendCommand, {
    cwd: frontendPath,
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
  process.exit(1);
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
