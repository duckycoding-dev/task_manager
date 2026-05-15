---
created: 2026-05-14
updated: 2026-05-14
summary: Multi-value filters on `GET /tasks` and `GET /reminders` use array or comma-separated query params (`?projectId=A,B&status=todo,in_progress`), not JSON-encoded predicates.
status: accepted
---

# Multi-value filters via array query params

When `GET /tasks` and `GET /reminders` need to filter by multiple values for the same field, the query string uses **array semantics** — either repeated keys (`?projectId=A&projectId=B`) or comma-separated values (`?projectId=A,B`). For range filters, paired params (`dueDateGte=X&dueDateLte=Y`). For text search, a `q` param. Backwards-compatible with the existing single-value behavior.

JSON-encoded predicates (`?where=%7B%22projectId%22%3A%5B%22A%22%2C%22B%22%5D%7D`) were considered and rejected: harder to construct manually, harder to read in logs/curls, harder to share as a URL, and unnecessary given that no v1 filter requires more expressive predicates than AND-of-IN.

See [`backend-changes-summary.md`](../design/backend-changes-summary.md) and [`03-page-wireframes.md` § All tasks](../design/03-page-wireframes.md).
