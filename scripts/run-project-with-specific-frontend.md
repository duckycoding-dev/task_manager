# Run Project with Specific Frontend Script

This script allows you to quickly start both the backend and a specific frontend package in development mode with a single command.\
This is not a bulletproof command, as it is only possible to simply run the two packages simultaneously and providing the ports on which they should run, nothing more for now.\
Still, this is very good for development, especially when you will need to quickly open multiple instances of the project to compare different frontends and not mix the backend logs for each.

## How it works

The script automatically detects which frontend package to run based on the npm script name that triggered it. It then:

1. **Extracts the frontend package name** from `import.meta.env.npm_lifecycle_event` (the npm script name)
2. **Validates the package exists** in the `apps/` directory (excluding the backend)
3. **Starts the backend server** on the specified port if provided via the `be_port` arg (default: 3001)
4. **Starts the frontend server** on the specified port if provided via the `fe_port` arg (default: 3002)
5. **Sets up environment variables** for the frontend to communicate with the backend: in particular, the frontend receives the backend port; we could later be passing the frontend port to the backend as well if needed.

## Usage

### Adding new commands

To add a new frontend package command, simply add a script to the root `package.json` that follows this pattern:

```json
{
  "scripts": {
    "PACKAGE_NAME:dev": "bun run scripts/run-project-with-specific-frontend.ts"
  }
}
```

**Important**: The script name before the colon (`:`) must **exactly match** the directory name inside `apps/`.

### Examples

For a package at `apps/react19/`, add:

```json
"react19:dev": "bun run scripts/run-project-with-specific-frontend.ts"
```

For a package at `apps/vue-app/`, add:

```json
"vue-app:dev": "bun run scripts/run-project-with-specific-frontend.ts"
```

### Running the commands

```bash
# Start backend + react19 frontend
bun run react19:dev

# Start with custom ports
bun run react19:dev --be_port 3005 --fe_port 3006
```

## Command line options

- `--be_port`: Backend server port (default: 3001)
- `--fe_port`: Frontend server port (default: 3002)

## Requirements

- The frontend package directory must exist in `apps/`
- The frontend package must have a `dev` script in its `package.json`
- The backend must have a `bun:dev` script that accepts a `--port` argument

## Environment variables

- In general, cli arguments that are then saved in environment variables have precedence over .env files: this means that if a variable is defined both as cli arg and in the .env file, the cli arg overrides the other
- The backend automatically handles the PORT variable in the `env.ts` file: if a cli arg is provided, the variable is overridden by that, else the value is taken from an existing .env file, falling back to a default value of 3001 if neither exist.
  This value is also saved in the typesafe `env` variable that is exported.
- The script automatically sets `BACKEND_PORT` for the frontend to use the correct backend port, and `PORT` as the port that the frontend itself should be using.
- The script provides only env variables to the frontend, without any cli to avoid possible errors: for example, Vite does not accept any extra cli args beside those it expects, thus we need to pass env variables to overcome this.

## What should each frontend package do before running

On startup, the frontend should be saving and or using the backend and frontend ports provided by the script.\
Depending on the tech used to run the frontend, you may need to handle things differently: it could be needed to just save them in the process envs, or also use them directly in the config.

You can find an example in the `apps/react19` package (which uses Vite), in which we set the process env variables by following the Vite requirements (eg: we save the originally called BACKEND_PORT as VITE_BACKEND_PORT, and PORT as VITE_PORT to make them publicly available in the Vite app) and we parse the PORT env to make sure it's a number, to then use it directly like so:

```ts
// vite.config.ts
return {
  ...
    server: {
      port: Number(env.VITE_PORT),
    },
  ...
}
```

## Notes (add details to pay attention to here)

- make sure that whenever a new frontend app is added, the default backend port matches the one defined in the backend package (we could be creating a `common` package to share these kind of things later, if it gets complicated to manage)
