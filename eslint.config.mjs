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

  // 2c. Import sorting (autofixable ordering — see docs/llm/coding-practices.md
  //     §"Import order" for the canonical group definitions this rule encodes).
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
      // Strict-preset rules downgraded to `warn` so they surface drift without
      // blocking commits while the codebase is cleaned up incrementally.
      // Tighten to `error` after a dedicated cleanup pass clears existing
      // call sites (`any` usages, non-null assertions).
      // Note: `no-misused-promises` is type-aware and requires `strictTypeChecked` +
      // projectService on every file; not enabled here. Revisit when adopting full
      // type-aware linting.
      // Zero-`any` rule per coding-practices §"Zero `any` — use `unknown`
      // and narrow". Rare legitimate exceptions opt out with
      // `// eslint-disable-next-line @typescript-eslint/no-explicit-any` +
      // a one-line WHY comment at the site.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },

  // ============================================================
  // SECTION 3: REPO-SPECIFIC RULES — encode rules from
  //            docs/llm/coding-practices.md:
  //              · §"Barrels: public-API only (Pattern B)"
  //              · §"Side-effect-only imports + boot-time top-level side effects"
  //            The comments below cite the rule section those entries
  //            originate from so the rationale stays findable.
  // ============================================================

  // 3a. Barrel discipline — internal backend code must not import feature
  //     barrels. Barrels are the cross-package public-API boundary; sibling
  //     code uses deep paths (./tasks.db, ./tasks.types).
  //     See coding-practices.md §"Barrels: public-API only (Pattern B)"
  //     → "Internal-consumer discipline" paragraph.
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

  // 3b. Ban `export *` and side-effect-only imports outside entries.
  //     Combined in a single rule entry because ESLint coalesces selectors
  //     of the same rule. The side-effect selector exempts CSS/asset
  //     specifiers via regex.
  //     See coding-practices.md §"Barrels: public-API only (Pattern B)"
  //     → "Re-export form" paragraph (the `export *` ban), and
  //     §"Side-effect-only imports + boot-time top-level side effects"
  //     (the side-effect-import ban + carve-outs).
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

  // 3d. Ban `export default` repo-wide — only allowed where an external
  //     contract mandates it (Bun fetch contract, drizzle-kit config, vite
  //     config, tanstack-router file-based routing for HMR-component-export).
  //     See coding-practices.md §"Named exports default;
  //     `export default` only when an external API mandates it".
  {
    rules: {
      'import-x/no-default-export': 'error',
    },
  },

  // 3e. Casing rules — encodes coding-practices.md §"Casing rules".
  //     Set at `'warn'` initially; tighten to `'error'` after observing
  //     drift on real code. Selectors are permissive on purpose to avoid
  //     fighting React/component naming and JSON-shaped property names
  //     (drizzle table columns, BetterAuth fields, etc.).
  {
    rules: {
      '@typescript-eslint/naming-convention': [
        'warn',
        // Module-level frozen data consts: SCREAMING_SNAKE_CASE allowed
        // alongside camelCase + PascalCase (the latter two cover Zod schemas,
        // arrow function exports, and React component consts).
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        // Other variables / parameters / methods: camelCase
        {
          selector: ['variable', 'parameter', 'classMethod'],
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // Functions can also be PascalCase (React components).
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        // Types, interfaces, classes, enums: PascalCase
        { selector: 'typeLike', format: ['PascalCase'] },
        // Type parameters: PascalCase (T, K, V conventions allowed)
        { selector: 'typeParameter', format: ['PascalCase'] },
        // Imports: free-form (library decides their names)
        { selector: 'import', format: null },
        // Object / type property names: free-form. Covers drizzle table
        // column keys, BetterAuth field names, OpenAPI metadata, HTTP
        // verbose status codes, env-var-shaped keys, etc.
        {
          selector: ['objectLiteralProperty', 'typeProperty'],
          format: null,
        },
        // Enum members: free-form (route segment names, status verbose codes).
        { selector: 'enumMember', format: null },
      ],
    },
  },
  {
    files: [
      'apps/backend/src/index.ts',
      'apps/backend/drizzle.config.ts',
      '**/*.config.{ts,js,mjs,cjs}',
      'apps/react19/src/routes/**/*.{ts,tsx}',
    ],
    rules: {
      'import-x/no-default-export': 'off',
    },
  },

  // ============================================================
  // SECTION 4: PER-APP BLOCKS
  // ============================================================

  // 4a. Backend block — Node globals, type-aware parser via projectService,
  //     console allowed (logger-singleton coding-practice; console.* is for
  //     pre-env boot only). Type-aware rules requiring projectService go here.
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
      // Type-aware: fallback `||` → `??` per coding-practices
      // §"Nullish fallback uses `??`, never `||`".
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      // Type-aware: auto-applies `readonly` to class fields set only in
      // the constructor. Per coding-practices §"`readonly` selectively —
      // class fields enforced, …".
      '@typescript-eslint/prefer-readonly': 'error',
      // Type-aware: catches unawaited promises (the classic async footgun).
      // Per coding-practices §"Async iteration — parallel by default, …".
      '@typescript-eslint/no-floating-promises': 'error',
      // Type-aware: catches `.forEach(async ...)`, `if (asyncFn())`, and
      // similar promise-shape mismatches. Same rule section.
      '@typescript-eslint/no-misused-promises': 'error',
      // Bans the "namespace class" pattern (class with only static members)
      // per coding-practices §"Module-level `const`/`function` for utilities;
      // classes only when actually instantiating".
      '@typescript-eslint/no-extraneous-class': 'error',
      'no-console': 'off',
    },
  },

  // 4a-i. React19-specific override for `no-misused-promises`: relax the
  //       `checksVoidReturn.attributes` sub-rule because JSX event handlers
  //       (`onSubmit`, `onClick`, etc.) commonly accept async callbacks and
  //       the underlying React API correctly handles the returned Promise
  //       (it just doesn't await). The rest of the rule stays active —
  //       `.forEach(async)`, `if (asyncFn())`, and mismatched-shape callsites
  //       still error.
  {
    files: ['apps/react19/src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
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
      // Type-aware: fallback `||` → `??` per coding-practices
      // §"Nullish fallback uses `??`, never `||`".
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      // Type-aware: auto-applies `readonly` to class fields set only in
      // the constructor. Per coding-practices §"`readonly` selectively —
      // class fields enforced, …".
      '@typescript-eslint/prefer-readonly': 'error',
      // Type-aware: catches unawaited promises (the classic async footgun).
      // Per coding-practices §"Async iteration — parallel by default, …".
      '@typescript-eslint/no-floating-promises': 'error',
      // Type-aware: catches `.forEach(async ...)`, `if (asyncFn())`, and
      // similar promise-shape mismatches. Same rule section.
      '@typescript-eslint/no-misused-promises': 'error',
      // Bans the "namespace class" pattern (class with only static members)
      // per coding-practices §"Module-level `const`/`function` for utilities;
      // classes only when actually instantiating".
      '@typescript-eslint/no-extraneous-class': 'error',
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
