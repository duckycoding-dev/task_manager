---
created: 2026-07-03
updated: 2026-07-03
summary: Final UI mockups — one standalone HTML file per surface, containing only the chosen design direction. Visual companions to specs 01–05; the specs stay authoritative.
---

# Final UI mockups

Standalone HTML renders of the **chosen** design for every v1 surface. During the design phase multiple competing mockups were explored; these files keep only what was locked into the sibling specs. Open any file directly in a browser — no build step, all CSS inline.

**The specs are the source of truth.** If a mockup and a spec disagree, the spec wins:

- [`../01-tokens-and-theme.md`](../01-tokens-and-theme.md) — colors, type, spacing, radius, elevation, motion tokens.
- [`../02-layout-and-navigation.md`](../02-layout-and-navigation.md) — app shell.
- [`../03-page-wireframes.md`](../03-page-wireframes.md) — per-page IA + interactions.
- [`../04-components.md`](../04-components.md) — component primitives.
- [`../05-motion-and-behavior.md`](../05-motion-and-behavior.md) — motion + optimistic-UI patterns.

## Files

| File | Surface | Spec |
|---|---|---|
| `tokens.html` | Token composite (dark + light side-by-side) | 01 |
| `layout-shell.html` | App shell — top bar, sidebar (collapsed/pinned), mobile bottom nav + drawer | 02 |
| `dashboard.html` | Dashboard `/` — Today list + calendar/reminders rail | 03 |
| `calendar.html` | Calendar `/calendar` — month grid + day panel | 03 |
| `all-tasks.html` | All tasks `/tasks` — filter chips, toolbar, fixed date grouping | 03 |
| `projects.html` | Projects list `/projects` — card grid | 03 |
| `project-page.html` | Project page `/projects/:id` — board + reminders rail | 03 |
| `task-detail.html` | Task detail — inline panel + dedicated page | 03 |
| `inbox.html` | Inbox `/inbox` — "Now" reminder action-center | 03 |
| `labels.html` | Labels `/labels` — table, two-mode delete, deleted view | 03 |
| `settings-auth.html` | Settings `/settings/*` + auth screens | 03 |
| `components-gallery.html` | All component primitives with states | 04 |
| `motion-gallery.html` | Motion/choreography demos (interactive) | 05 |

## Notes

- Everything scrapped or deferred (v1.5+/v2 features, rejected layout variants) is intentionally absent here — check the specs' "out of scope" sections for what was cut and why.
- The 12-color preset palette shown in color pickers matches the backend's curated palette in `apps/backend/src/utils/color.ts` (`COLOR_PALETTE`).
