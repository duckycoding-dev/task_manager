ALTER TABLE "labels" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "reminders" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
CREATE INDEX "idx_labels_user_active" ON "labels" USING btree ("user_id") WHERE "labels"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_reminders_user_active" ON "reminders" USING btree ("user_id") WHERE "reminders"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_tasks_user_active" ON "tasks" USING btree ("user_id") WHERE "tasks"."deleted_at" IS NULL;