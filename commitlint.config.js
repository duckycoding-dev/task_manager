/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // new functionality
        'fix', // bug fixes
        'chore', // maintenance, deps, config
        'docs', // documentation (CLAUDE.md, README, docs/)
        'style', // CSS / visual-only changes
        'refactor', // code restructuring, no behaviour change
        'revert', // reverting a previous commit
        'perf', // performance work (bundle, dev-mode, etc.)
        'test', // adding or changing tests
      ],
    ],
  },
};
