import eslintReact from '@eslint-react/eslint-plugin';
import pluginQuery from '@tanstack/eslint-plugin-query';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  // ============================================================
  // SECTION 1: FOUNDATION (order matters — do not edit unless
  //            you know what you're doing)
  // ============================================================

  // 1a. Global ignores — MUST be a standalone object with ONLY `ignores`
  //     (no `files` key), otherwise ESLint treats it as a per-config
  //     filter instead of a true global ignore.
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.tsbuildinfo',
      '.claude/**',
      '.superpowers/**',
      '.husky/**',
      '.vscode/**',
      'docs/**',
      'bun.lock',
      'apps/backend/src/db/migrations/**',
      'apps/react19/src/routeTree.gen.ts',
      '**/*.md',
      '**/*.mdx',
      // Imported reference file kept for manual comparison vs the merged
      // eslint.config.mjs. Not part of the linted source tree.
      'other_project_eslint.config.js',
    ],
  },

  // 1b. TypeScript strict rules (syntactic only, no type-aware rules).
  //     To upgrade to type-aware linting for .ts files, replace with
  //     ...tseslint.configs.strictTypeChecked and add a projectService
  //     config block scoped to **/*.{ts,tsx}.
  ...tseslint.configs.strict,

  // 1c. Prettier integration — reports formatting diffs as ESLint errors
  //     so that `eslint --fix` also formats code.
  eslintPluginPrettierRecommended,

  // 1d. Disable type-aware rules for plain JS config files (they are not
  //     covered by any tsconfig).
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
  },

  // ============================================================
  // SECTION 2: PROJECT RULES (edit freely)
  // ============================================================

  // 2a. ESLint core rules
  {
    rules: {
      'prefer-const': 'error',
      semi: 'error',
      'consistent-return': 'off',
      'func-names': 'off',
      'max-len': [
        'warn',
        {
          code: 80,
          ignoreComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
    },
  },

  // 2b. Import rules (eslint-plugin-import-x)
  {
    plugins: { 'import-x': importX },
    rules: {
      'import-x/no-extraneous-dependencies': 'off',
      'import-x/no-unresolved': 'off',
      'import-x/prefer-default-export': 'off',
      'import-x/extensions': 'off',
      'import-x/newline-after-import': 'warn',
    },
  },

  // 2c. Import sorting (autofixable ordering — Phase Z Topic 3)
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1. Side-effect imports (non-CSS polyfills, init modules)
            ['^\\u0000'],
            // 2. External packages — Node built-ins first, then everything else
            //    (pure alphabetical, no anchor list).
            ['^node:', '^@?\\w'],
            // 3. Monorepo workspace packages
            ['^@task-manager/'],
            // 4. Path aliases — react19 `@/` + backend bare-name (utils/, types/, src/)
            ['^@/', '^(utils|types|src)/'],
            // 5. Relative parent (`../`, `../..`, etc.)
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // 6. Relative sibling (non-CSS)
            ['^\\./(?=.*/)', '^\\.(?!/?$)', '^\\./?$'],
            // 7. CSS tail bucket — plain/side-effect CSS first, CSS Modules second
            ['^.+(?<!\\.module)\\.s?css$', '^.+\\.module\\.s?css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },

  // 2d. Unused imports (autofixable removal)
  {
    plugins: { 'unused-imports': unusedImports },
    rules: {
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // 2e. TypeScript-specific rules
  {
    rules: {
      // Disabled — handled by unused-imports above.
      '@typescript-eslint/no-unused-vars': 'off',
      // Strict-preset rules downgraded to `warn` per D1 (config-merge plan).
      // Tighten to `error` after Phase Z mechanical-renames + Topic-6 cleanup PR.
      // Note: `no-misused-promises` is type-aware and requires `strictTypeChecked` +
      // projectService on every file; not enabled here. Revisit when adopting full
      // type-aware linting.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },

  // ============================================================
  // SECTION 3: PHASE Z RULES — encode locked decisions from
  //            docs/llm/coding-practices.md (Topic 2)
  // ============================================================

  // 3a. Barrel discipline (Q2.2f): internal backend code must not import
  //     feature barrels. Barrels are the cross-package public-API boundary;
  //     sibling code uses deep paths (./tasks.db, ./tasks.types).
  {
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './apps/backend/src',
              from: './apps/backend/src/features/*/index.ts',
              message:
                'Internal backend code must not import feature barrels. Barrels are the cross-package public-API boundary; sibling code uses deep paths (e.g. ./tasks.db, ./tasks.types).',
            },
          ],
        },
      ],
    },
  },

  // 3b. Ban `export *` (Q2.2c) and side-effect-only imports outside
  //     entries (Q2.5/A2). Combined in a single rule entry because
  //     ESLint coalesces selectors of the same rule.
  //     The side-effect selector exempts CSS/asset specifiers via regex.
  {
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportAllDeclaration',
          message:
            'Star re-exports are forbidden. Use explicit named re-export lists per coding-practices · Barrels: public-API only (Pattern B).',
        },
        {
          selector:
            'ImportDeclaration[specifiers.length=0]:not([source.value=/\\.(s?css|less|styl|svg|png|jpg|jpeg|webp|gif|ico|woff2?|ttf|otf|eot)$/])',
          message:
            'Side-effect-only imports are forbidden outside per-app entry files. Wrap the effect in an exported initX() function called from entry. CSS/asset imports are exempt.',
        },
      ],
    },
  },

  // 3c. Side-effect-import carve-out for per-app entry files. The
  //     `no-restricted-syntax` rule is re-declared so the ExportAllDeclaration
  //     selector remains active; only the ImportDeclaration selector is
  //     dropped (since flat-config replaces rather than merges rule arrays).
  {
    files: ['apps/backend/src/index.ts', 'apps/react19/src/app.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportAllDeclaration',
          message:
            'Star re-exports are forbidden. Use explicit named re-export lists per coding-practices · Barrels: public-API only (Pattern B).',
        },
      ],
    },
  },

  // ============================================================
  // SECTION 4: PER-APP BLOCKS
  // ============================================================

  // 4a. Backend block — Node globals, type-aware parser via projectService,
  //     console allowed (logger-singleton coding-practice; console.* is for
  //     pre-env boot only).
  {
    files: ['apps/backend/src/**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-console': 'off',
    },
  },

  // 4b. React19 block — browser globals, React 19 + TanStack Router/Query
  //     + react-refresh rules.
  {
    files: ['apps/react19/src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2025,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    extends: [eslintReact.configs['recommended-typescript']],
    plugins: {
      // @ts-expect-error — eslint-plugin-react-hooks `configs.flat` shape lags the
      // flat-config Plugin type; runtime behavior is fine.
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      // @ts-expect-error — pluginQuery types lag the flat-config API
      '@tanstack/query': pluginQuery,
    },
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
      ...eslintReact.configs['recommended-typescript'].rules,
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
          // TanStack Router's file-based routing exports `Route` alongside the
          // component; whitelist it so the rule doesn't fire on every route file.
          allowExportNames: ['Route'],
        },
      ],
      '@tanstack/query/exhaustive-deps': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'no-console': 'off',
    },
  },

  // 4c. Node-scripted root files (commitlint config, prettier config,
  //     scripts/ runners) — Node globals only.
  {
    files: ['*.config.{js,mjs,cjs,ts}', 'scripts/**/*.{js,mjs,cjs,ts}'],
    languageOptions: { globals: globals.node },
  },

  // ============================================================
  // SECTION 5: PRETTIER (last — disables ESLint stylistic rules
  //            that conflict with Prettier formatting)
  // ============================================================
  eslintConfigPrettier,
);
