// Curated 12-color palette for project + label color chips. Each color is
// picked to read on both light and dark backgrounds (mid-saturation,
// mid-luminance). Used as the algorithmic default when the user doesn't
// explicitly pick a color. See `docs/stable/_shared/design/04-components.md`
// §"Color picker".
//
// SQL backfill of pre-existing rows uses `'#' || substr(md5(name), 1, 6)`
// directly in the migration — that's deterministic but doesn't index into
// this palette. Acceptable: backfilled rows get a one-time arbitrary
// (but still deterministic) hex; new rows go through `colorFromName` and
// land in the curated palette.

export const COLOR_PALETTE = [
  '#EF4444', // red
  '#F97316', // orange
  '#F59E0B', // amber
  '#EAB308', // yellow
  '#84CC16', // lime
  '#22C55E', // green
  '#10B981', // emerald
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#D946EF', // fuchsia
  '#EC4899', // pink
] as const;

/**
 * Deterministic name → palette-color mapping. Same name always yields the
 * same color from `COLOR_PALETTE`. Cheap FNV-style hash; not cryptographic
 * — the goal is "stable color for a given name", nothing more.
 */
export const colorFromName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % COLOR_PALETTE.length;
  // Non-empty palette length — palette is a literal array of 12 entries,
  // so `idx` is always in range. Cast is safe.
  return COLOR_PALETTE[idx] as string;
};
