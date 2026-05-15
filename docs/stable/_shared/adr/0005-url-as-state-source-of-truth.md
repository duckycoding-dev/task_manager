---
created: 2026-05-14
updated: 2026-05-14
summary: For pages with filters, sort, density, column visibility, and detail-panel-open state, the URL is the authoritative store. Bookmarking or sharing a link reconstructs the exact view.
status: accepted
---

# URL as state source of truth

On pages that expose filters / sort / density / column visibility / panel-open state (notably [All tasks](../glossary.md#all-tasks) and [Calendar](../glossary.md#calendar)), the **URL query string is the authoritative store**. Internal state in the frontend reads from and writes back to the URL (using `history.replaceState` for transient changes so back/forward doesn't fill with noise). Sharing a link reconstructs the exact view; bookmarking works; deep-linking from external context works.

A future reader might assume filter state lives in localStorage or a memory store. This ADR is the record that it deliberately does not — URL drives state, and the URL is shareable.

Alternatives considered: client-only state with optional "copy view as URL" button — rejected because shareability is harder to retrofit; URL state is the cleanest default.

See [`03-page-wireframes.md` § All tasks](../design/03-page-wireframes.md).
