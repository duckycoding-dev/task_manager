import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import eslintReact from '@eslint-react/eslint-plugin';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', '.src/routeTree.gen.ts'] },
  {
    extends: [
      js.configs.recommended,
      eslintReact.configs['recommended-typescript'],
      ...tseslint.configs.recommendedTypeChecked,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2025,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...eslintReact.configs['recommended-typescript'].rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
);
