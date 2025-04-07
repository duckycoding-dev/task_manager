// eslint 9.20 apparently changed type definitions and broke the eslint config file for tseslint configs
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['apps/**/*.{js,mjs,cjs,ts}'] },
  {
    ignores: [
      './node_modules/**',
      './dist/**',
      'apps/**/dist/**',
      './.vscode/templates/**/*',
    ],
  },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off', // Disable the base rule and use the TypeScript version instead
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
