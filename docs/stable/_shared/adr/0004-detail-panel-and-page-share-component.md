---
created: 2026-05-14
updated: 2026-05-14
summary: The inline task detail panel (opened over any list page via `?task=<id>`) and the dedicated `/tasks/:id` page render the same component. The dedicated page's two-column layout collapses to the panel layout below the `xl` breakpoint.
status: accepted
---

# Detail panel and dedicated page share one component

Tasks are viewable in two render contexts: the inline [detail panel](../glossary.md#detail-panel) that opens via `?task=<id>` over any list page, and the dedicated `/tasks/:id` route page. Rather than maintain two implementations, they share **one** component — only the chrome around it differs (close ✕ + prev/next in the panel; breadcrumbs + back-button on the page). At desktop wide the page renders a two-column layout (main + aside); below the `xl` breakpoint (1280px) the layout collapses to the panel's single-column shape, so narrow desktop and mobile see the same affordances regardless of route.

Alternatives considered: two separate components with shared sub-pieces — rejected because it doubles the maintenance surface for any field/picker change. A single source of truth means edits propagate automatically.

See [`02-layout-and-navigation.md`](../design/02-layout-and-navigation.md) and [`03-page-wireframes.md` § Task detail](../design/03-page-wireframes.md).
