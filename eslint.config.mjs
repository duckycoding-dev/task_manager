import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import eslintReact from '@eslint-react/eslint-plugin';
import pluginQuery from '@tanstack/eslint-plugin-query';

export default tseslint.config(
  {
    // eslint config for the backend
    files: ['apps/backend/src/**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: './apps/backend/',
      },
    },
    extends: [tseslint.configs.recommended, eslintConfigPrettier],
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off', // Disable the base rule and use the TypeScript version instead
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    // eslint config for the react19 package
    files: ['./apps/react19/src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2025,
      globals: globals.browser,
      parserOptions: {
        // Enable project service for better TypeScript integration
        projectService: true,
        tsconfigRootDir: './apps/react19/',
      },
    },
    extends: [
      tseslint.configs.recommended,
      eslintConfigPrettier,
      eslintReact.configs['recommended-typescript'],
    ],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@tanstack/query': pluginQuery,
    },
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
      ...eslintReact.configs['recommended-typescript'].rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@tanstack/query/exhaustive-deps': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'no-console': 'off',
      'no-unused-vars': 'off', // Disable the base rule and use the TypeScript version instead
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
);
