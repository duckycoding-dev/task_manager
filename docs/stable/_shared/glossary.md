---
created: 2026-05-14
updated: 2026-05-14
summary: Living glossary of domain terms, entities, concepts, and behaviors used across this codebase + design docs. Single source of truth for terminology. Updated via the Grill-with-me protocol in docs/llm/behavior.md.
---

# Glossary

Authoritative names + definitions for everything in this app's domain and UX. When two terms could mean the same thing, only one is canonical here; the other is listed under "avoid aliases".

When you (LLM or human) encounter a term not in this doc, **stop and grill the user** before proceeding — see [`docs/llm/behavior.md` § Grill-with-me](../../llm/behavior.md#grill-with-me--terminology-discipline).

Entries are linked with markdown cross-references. Add new entries alphabetically within their section (Entities / UX concepts / Backend concepts / Domain rules / Workflow).

---

## Entities

### Task

A single actionable item the user owns. Backed by `apps/backend/src/features/tasks/tasks.db.ts`. Fields:

- `id`, `userId`, `projectId?`, `title`, `description?`, `status`, `priority`, `dueDate?`, `recurringInterval`, `createdAt`, `updatedAt`, `deletedAt?` *(soft delete — planned, see backend-changes-summary)*.
- M2M with [Label](#label) via `task_labels`.
- 1:N with [Reminder](#reminder).

Avoid aliases: ~~todo~~ (overloaded with the `todo` status value), ~~ticket~~ (suggests issue-tracker semantics not present here), ~~item~~ (too generic).

Related: [Status](#status), [Priority](#priority), [Recurrence](#recurrence), [Project](#project), [Label](#label), [Reminder](#reminder).

### Project

A user-owned grouping of tasks. Backed by `apps/backend/src/features/projects/projects.db.ts`. Single-user in v1 (the `users_projects` table exists but isn't used by UX yet).

- `id`, `userId`, `name`, `description?`, `color` *(planned NOT NULL — backend-changes-summary)*, `createdAt`.
- Each [Task](#task) can reference one project (`projectId`) or none.

Avoid aliases: ~~workspace~~, ~~board~~ (the board is a [View mode](#view-mode), not the project itself), ~~folder~~.

### Label

A tag the user defines and applies to one or more tasks. Per-user. Backed by `apps/backend/src/features/labels/labels.db.ts`.

- `id`, `userId`, `name`, `color` *(planned NOT NULL)*, `deletedAt?` *(planned soft delete)*.
- M2M with [Task](#task) via `task_labels` (composite PK on `taskId + labelId`).

Avoid aliases: ~~tag~~ (use "label" everywhere — code, UI, docs).

Related: [Two-mode delete](#two-mode-delete-labels).

### Reminder

A timed notification linked to a [Task](#task) for the user. Backed by `apps/backend/src/features/reminders/reminders.db.ts`.

- `id`, `taskId` *(required, NOT NULL)*, `userId`, `title`, `content`, `remindAt`, `deletedAt?` *(planned)*.
- Always tied to a task — no standalone reminders in v1.
- "Acknowledged vs dismissed" distinction deferred to v1.5 (`acknowledgedAt` field).

Avoid aliases: ~~alarm~~, ~~notification~~ (notification = a future broader concept; reminder is the user-set, task-bound thing), ~~ping~~.

### User

The owner of all data. Authenticated via [BetterAuth](#betterauth). Single-user app semantics in v1; no sharing, no roles.

---

## UX concepts

### Dashboard

The default landing page at `/` route. Also called **"Today"** in copy and the sidebar. Composes a [Task list](#task-list-rendering) (Overdue / Today / Coming up sections) in the main column plus a slim right rail with the [Mini-calendar widget](#mini-calendar-widget) and the [Reminders widget](#reminders-widget).

**Important distinction**: this is *not* a generic "dashboard of widgets". It's a focused execute surface with two glanceable side widgets. Widgets are read-mostly summaries — they link out to the [Calendar](#calendar) page and the [Inbox](#inbox) for full interaction.

Avoid aliases: ~~home~~, ~~overview~~ (overview implies more chrome than this page has).

### Calendar

The page at `/calendar`. Temporal lens on tasks + reminders. Default view is the month grid; switcher allows Week / Day. Day cells show the first N item pills + "+N more" link.

Includes a [Day-detail panel](#day-detail-panel) on the right showing the selected day's full task + reminder list.

### Inbox

The page at `/inbox`. v1 = single section showing reminders where `remindAt <= now AND deletedAt IS NULL` — i.e. reminders awaiting action. Future buckets (Today / Upcoming / Past) deferred to "later backend update".

Avoid aliases: ~~Notifications~~ (notifications is a planned but separate concept; inbox is currently reminder-only). The name "Inbox" is chosen specifically to leave room for future notification types alongside reminders.

### Detail panel

GitLab-style inline panel that opens via `?task=<id>` query param over whatever page you're on. Right edge (or left when handedness-mirror is on). Resizable. Same component renders inside the panel and on the dedicated task page.

Avoid aliases: ~~drawer~~ (drawer = mobile sidenav, see below), ~~side panel~~ (ambiguous), ~~sidebar~~ (sidebar = the main nav).

Related: [Dedicated page](#dedicated-page-for-an-entity).

### Dedicated page (for an entity)

The standalone route for a task / reminder / etc., e.g. `/tasks/:id`. Same component as the [Detail panel](#detail-panel), more chrome, two-column layout that collapses to single-column below `xl`. Bookmarkable, shareable.

### View mode

A way of rendering a list of tasks. v1 has two:

- **Board** — kanban with 3 fixed columns (`todo / in_progress / done` per backend status enum). Cards drag between columns to change status.
- **List** — vertical scroll of task rows, with filters / columns picker / density selector. Uses the same component as the [All tasks](#all-tasks) page, scoped by `projectId` when inside a [Project](#project).

Future view modes (Calendar embed, Table) are deferred.

### All tasks

The page at `/tasks`. Master list of all the user's tasks. Has filters / columns picker / density / sort / URL state. Date-grouped sections (Overdue / Today / Tomorrow / This week / Later / No date / Completed-collapsed).

### Quick-add

A title-only flat input that creates a task with sensible defaults on Enter. Three contexts:

- **Dashboard quick-add** — at the top of the Today list. Defaults to `dueDate=today`.
- **Column quick-add** (board) — inline-expanding row at the bottom of a kanban column. Inferred status + projectId.
- **FAB / ⌘N** — opens the full-form modal/sheet instead of the title-only flat input. (Different surface, different shape.)

Defined as a primitive in `04-components.md`.

### Side rail (project page)

The collapsible 220px panel on the right of a [Project page](#project) showing reminders for tasks in that project. Distinct from the [Detail panel](#detail-panel) and from the [Day-detail panel](#day-detail-panel) — same edge, different content + lifecycle.

### Day-detail panel (calendar)

The 280px panel on the right of the [Calendar](#calendar) page showing the selected day's tasks + reminders. Default state on page load: today's panel open. Below `xl` viewport, this panel relocates **below** the grid (full width, two-col inside).

### Mini-calendar widget

The compact month grid in the [Dashboard](#dashboard) right rail. v1: click a day → navigates to [All tasks](#all-tasks) filtered by that date. v1.5: hover popover.

### Reminders widget

The compact upcoming-reminders list in the [Dashboard](#dashboard) right rail. Shows ~4 rows, each with time + title + parent-task + quick-delete ×. Links to the [Inbox](#inbox) via "Inbox →".

---

## Backend concepts

### Status (task)

Enum on `tasks.status`. Values: `todo`, `in_progress`, `done`. Renders as kanban columns in [View mode](#view-mode) "Board"; as a [Segmented control](#segmented-control) on the [Detail panel](#detail-panel).

The word "todo" here is **a status value**, never a synonym for the [Task](#task) entity itself.

### Priority

Enum on `tasks.priority`. Values: `low`, `medium`, `high`. Default `medium`. Rendered as a badge (`!high` / `!med` / `!low`).

### Recurrence

What `tasks.recurringInterval` (enum: `none / daily / weekly / monthly`) encodes. The backend's separate `isRecurring` boolean is **planned for removal** — the enum value alone determines whether a task recurs (`none` = single occurrence; anything else = recurring with that cadence). See `backend-changes-summary.md`.

User-facing picker: single popover with 4 options (Never / Daily / Weekly / Monthly).

Avoid aliases: ~~repeating~~, ~~repeat~~ (use "recurring" / "recurrence" consistently).

### Soft delete

Convention: items aren't hard-deleted; instead, a `deletedAt: timestamp` is set on the row. All list endpoints filter `deletedAt IS NULL` by default. An `includeDeleted=true` param flips the filter for admin/restore views.

Applies to: [Task](#task), [Reminder](#reminder), [Label](#label).

Counter-pattern: hard delete is reserved for the **permanent delete** action available only from a deleted-items view (currently designed for [Label](#label) only; tasks/reminders may follow).

### Two-mode delete (labels)

[Label](#label) deletion offers the user a choice:

1. **Soft-delete · keep task links** (default) — `labels.deletedAt = now`; `task_labels` rows untouched. Restoring later re-shows the label on every previously-tagged task.
2. **Soft-delete · remove from tasks** — same `deletedAt` write + `DELETE FROM task_labels WHERE labelId = :id`. Restoring later returns the label without any tags.

A third tier (permanent delete) lives only on the deleted-labels view; it does a hard `DELETE FROM labels` with FK cascade on `task_labels`.

### BetterAuth

The authentication library mounted at `/auth/*` on the backend (`apps/backend/src/utils/auth.ts`). Handles sign-in, sign-up, sessions (HTTP-only cookies), password rules (8–30 chars). `autoSignIn: true` configured — signup logs the user in immediately. Email verification stays available in the schema (`verifications` table) but is **disabled by UX** in v1.

### Hono RPC

The typed RPC client exported from `@task-manager/backend/hc`. Frontends consume the backend via this — no manual fetch wrappers needed. Routes are typed end-to-end via `@hono/zod-openapi`.

---

## Domain rules

### Auth-gated routing

Every client route except `/auth/*` requires an authenticated session. Unauthenticated requests redirect to `/auth/login?next=<encoded original URL>`. After sign-in, the user lands on `next` (validated same-origin) or `/`. See `03-page-wireframes.md` cross-page surfaces.

### Handedness preference

User-set preference: `left` or `right` (default). Controls:

- **Mobile (always)**: which side the hamburger menu sits on + which side the drawer slides in from.
- **Desktop (opt-in via "Apply to desktop too")**: sidebar mirrors to the chosen side; the [Detail panel](#detail-panel) flips to the opposite edge so the two never overlap.

### Default theme behavior

Three modes for the theme preference: `system` (default), `light`, `dark`. `system` watches `prefers-color-scheme`. Stored as `theme` preference; set via the `<html data-theme="…">` attribute at runtime.

---

## Workflow concepts

### Quick-add (cross-page primitive)

See [Quick-add](#quick-add) above; this is the canonical pointer.

### Optimistic UI

Frontend convention: actions register instantly in the UI before the server confirms. Rollback on failure with a toast. Documented per pattern in `05-motion-and-behavior.md` (task complete, drag-to-status, soft-delete, snooze, inline edit, status quick-toggle).

### URL state

Filter / density / columns / sort / panel-open state are reflected in the URL where appropriate. Sharing the URL reconstructs the exact view. Push vs replace: changes within a page use `replace` to avoid history spam; navigation between routes uses `push`.

### Segmented control

A 2–5 option mutually-exclusive UX primitive. Used for theme / density / view-mode toggles + the status quick-toggle on task detail (where the active segment also shifts color to reflect status).

### Snooze

Acting on a [Reminder](#reminder) in the [Inbox](#inbox) "Now" bucket by deferring its `remindAt` to a future time. Backend = `PATCH /reminders/:id { remindAt }`. UI presets: 15m / 1h / 3h / tomorrow morning / pick a specific time.

### Drag-to-status

Kanban interaction on a [Project page](#project) board. Drag a task card from one column to another → `PATCH /tasks/:id/status`. Optimistic with rollback animation on failure. Within-column reordering NOT supported v1 (no `position` field; deferred).

---

## Things that are NOT concepts here (yet)

These will be grilled into proper entries when they actually arrive:

- **Notification** (system) — distinct from [Reminder](#reminder). Not in v1.
- **Comment** — not in v1.
- **Activity log entry / Task event** — not in v1.
- **Attachment** — not in v1.
- **Subtask** — not in v1.
- **Watcher / collaborator** — not in v1 (single-user).
- **Saved view** (All-tasks views with stored filters) — deferred to v1.5.

If you hit any of these in a conversation or codebase analysis, surface them under the Grill-with-me protocol before treating them as understood.
