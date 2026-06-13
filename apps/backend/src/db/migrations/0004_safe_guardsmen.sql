-- projects.color: new column. Added as nullable first so existing rows
-- can be backfilled before the NOT NULL constraint applies. The backfill
-- uses Postgres' `md5()` directly (deterministic + no palette duplication
-- in SQL). Runtime app code uses `colorFromName()` from `utils/color.ts`
-- which maps into the curated 12-color palette; backfilled rows pick up
-- an arbitrary hex from md5 — acceptable, the visual differs only for
-- pre-existing rows and can be re-colored via the picker.
ALTER TABLE "projects" ADD COLUMN "color" text;--> statement-breakpoint
UPDATE "projects" SET "color" = '#' || substr(md5("name"), 1, 6) WHERE "color" IS NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "color" SET NOT NULL;--> statement-breakpoint

-- labels.color: existing nullable column. Backfill nulls with the same
-- md5-derived hex, then enforce NOT NULL.
UPDATE "labels" SET "color" = '#' || substr(md5("name"), 1, 6) WHERE "color" IS NULL;--> statement-breakpoint
ALTER TABLE "labels" ALTER COLUMN "color" SET NOT NULL;
