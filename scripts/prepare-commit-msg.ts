import { appendFileSync } from 'fs';

const [_, __, commitMsgFile, source] = process.argv;

// Only inject hints when the editor opens for a new message.
// Skip when -m is used (source === 'message'), during merges
// (source === 'merge'), squashes, etc.
if (source) process.exit(0);

if (!commitMsgFile) {
  console.error('prepare-commit-msg: no commit message file path provided');
  process.exit(1);
}

appendFileSync(
  commitMsgFile,
  `
# Types (scope is optional):  type(scope): subject
# ─────────────────────────────────────────────────
# feat     : new functionality
# fix      : bug fixes
# chore    : maintenance, deps, config
# docs     : CLAUDE.md, README, docs/
# style    : CSS / visual-only changes
# refactor : code restructuring, no behaviour change
# revert   : reverting a previous commit
# perf     : performance work (bundle, dev-mode, etc.)
# test     : adding or changing tests

# Examples:
# feat: add task export endpoint

# ------ Example with scope and body ----------------
# fix(repo): tasks query leaks rows across users

# The .where() chain was rebuilt without and(), so the userId scope
# filter was silently dropped — see ADR-0010 §where-chaining-rule.
# ---------------------------------------------------
`,
);
