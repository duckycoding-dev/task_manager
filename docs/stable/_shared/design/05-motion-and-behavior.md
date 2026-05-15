---
created: 2026-05-14
updated: 2026-05-14
summary: Motion design + interaction choreography + optimistic-UI patterns. Defines when things animate, how, and the rollback rules. Reduced-motion fallbacks per pattern. Sits on motion tokens (01), shell (02), pages (03), components (04).
---

# Motion & behavior

Fifth (and final v1) design doc. Defines **how things move and respond to interaction**. Durations + easings are tokens (see [`01-tokens-and-theme.md`](./01-tokens-and-theme.md) §Motion); this doc applies them to specific surfaces.

## Principles

1. **Motion is feedback, not decoration.** Every animation answers a question the user is asking: "did my click register?" / "where did that thing go?" / "is something loading?".
2. **Direction is meaning.** Entering surfaces come *from* a meaningful place (panel from the right edge, sheet from the bottom). Exits return the same way.
3. **Match physical intuition.** `--ease-out` for things appearing (decelerate into rest). `--ease-in` for exits (accelerate away). `--ease-in-out` for object-to-object morphs.
4. **Optimistic by default.** User actions register instantly; the server confirms in the background. Rollback only on failure, with a clear toast.
5. **Reduced motion always has a fallback.** Either instant transition (`0ms` linear) or no animation at all. The intent of the motion must still be communicated through state (e.g. via color/icon).

## Surface-level animations

### Detail panel (inline)

- **Open**: slide in from the panel edge over `--duration-base` (220ms) with `--ease-out`. Opacity 0 → 1 in parallel.
- **Close**: reverse — slide out + fade over `--duration-base` with `--ease-in`. Element unmounts after the transition.
- Resize (drag handle): no animation; tracks pointer 1:1.
- Reduced motion: snap open/close (no slide), instant opacity 1.

### Bottom sheet (mobile)

- **Open**: translate-y from `100%` to `0` over `--duration-slow` (360ms) `--ease-out`. Backdrop fades in over `--duration-base`.
- **Close (tap backdrop / drag down past threshold / X)**: reverse, `--ease-in`. If drag-velocity high, complete the close at increased speed.
- Drag-down: tracks pointer; threshold ~30% of sheet height OR velocity > 0.5 px/ms.
- Reduced motion: snap-show, snap-hide.

### Drawer (mobile sidenav)

- Same model as bottom sheet, but translate-x from the handedness-preference side.
- Swipe-to-close from the drawer's outer edge.
- Backdrop fades in/out independently over `--duration-base`.

### Dialog / Modal

- **Open**: scale `0.96 → 1` + opacity `0 → 1` over `--duration-base` `--ease-out`. Backdrop fades over `--duration-base`.
- **Close**: scale `1 → 0.96` + opacity to `0` over `--duration-fast`.
- Focus moves to the first focusable element in the dialog when open; returns to the trigger on close.

### Popover / Menu / Tooltip

- **Open**: translate-y `4px → 0` (or `-4px → 0` if anchored below) + opacity over `--duration-fast` `--ease-out`. Origin = the trigger edge.
- **Close**: reverse `--duration-instant`.
- Tooltip enter delay: 500ms hover/focus.

### Command palette

- **Open**: translate-y `-12px → 0` + opacity over `--duration-base` `--ease-out`. Backdrop fade in parallel.
- **Close**: opacity to 0 + translate-y to `-8px` over `--duration-fast`.
- Result list internal selection: highlighted row bg changes instantly (`0ms`) — keyboard nav feels immediate.

### Toast

- **Enter**: translate-y from `+8px` to `0` + opacity over `--duration-base` `--ease-out`, stacking adjusts older toasts.
- **Exit (timeout or dismiss)**: opacity → 0 + slide-out `+12px` over `--duration-fast` `--ease-in`. Stack collapses with a layout transition over `--duration-base`.

### Sidebar pin/collapse

- Width morph `56px ↔ 220px` over `--duration-base` `--ease-in-out`.
- Nav item labels fade in/out independently over `--duration-fast` (delay slightly so they don't blink during the morph).
- Reduced motion: no width transition; instant.

### Theme switch (light ↔ dark)

- The `<html data-theme="…">` attribute change causes every token-bound color to transition over `--duration-fast` linear. Affects bg, text, borders, shadows simultaneously.
- Exception: focus rings + interactive states inherit the new tokens immediately; no cross-fade on the focus ring color.

### Tab switch (project page Board ↔ List)

- Outgoing content fades out + translates `-4px` over `--duration-fast`.
- Incoming content fades in + translates `from +4px` over `--duration-base`.
- Slight overlap (~50ms) for fluidity.

### Section collapse / expand (e.g. "Past · 12" in Inbox)

- Body height animates from `0 → auto` (measured) over `--duration-base` `--ease-out`. Body opacity 0 → 1 with a 50ms lag.
- Collapse: reverse, `--ease-in`.
- Caret rotates 90° in parallel over `--duration-fast`.

### Scroll & sticky behavior

- Sticky section headers stay pinned to the top of their scroll container while their section is in view.
- Page scroll uses native momentum. No custom scroll restoration in v1.

## Per-component micro-interactions

### Button

- Hover: bg/border tint shift over `--duration-fast`.
- Press: scale `1 → 0.98` over `--duration-instant`, returns on release with `--ease-out`.
- Focus-visible: shadow ring transitions in/out over `--duration-fast`.
- Reduced motion: skip the scale; everything else is fine (color is meaningful, not decorative).

### Checkbox

- Check appears (scale `0 → 1`) over `--duration-fast` `--ease-out`.
- Box bg fills in parallel.
- Indeterminate → checked: dash glyph fades out as check fades in.

### Toggle

- Knob translates over `--duration-fast` `--ease-out`. Bg tint shifts simultaneously.

### Filter chip

- Add: translate-y `-6px → 0` + opacity over `--duration-base` `--ease-out`. The "+ Add filter…" dashed chip slides right with a layout animation as the new chip pushes in.
- Remove (× click): chip scales `1 → 0.8` + opacity to 0 over `--duration-fast`. Layout animation closes the gap.

### Skeleton

- Pulse cycle: bg color tweens between `--color-bg-surface` and `--color-bg-muted` over `--duration-slow` linear, infinite.
- Real content arrival: skeleton fades out over `--duration-fast` as the real content fades in. Same position; no layout jump.
- Reduced motion: skeleton is shown at one static state (no pulse); replaced instantly with content.

### Card hover (interactive cards: tasks, projects, etc.)

- Border tint shifts to `--color-border` from `--color-border-subtle` over `--duration-fast`.
- No transform/scale on hover for v1 — too noisy on lists. Active drag uses transform.

## Optimistic UI patterns

### Task complete (checkbox click)

1. Checkbox flips to checked instantly.
2. Row transitions: opacity `1 → 0.5`, title gets strikethrough over `--duration-fast`.
3. POST request fires.
4. Toast appears: "Task completed · Undo". 8s timer.
5. On API success → toast stays its full duration, then fades.
6. On API failure → toast becomes "Couldn't update · Retry" (danger), row state animates back to unchecked over `--duration-fast`.

### Drag-to-status (kanban card)

1. Pointer-down on card → card lifts: `--shadow-pop` appears, slight tilt (1°), opacity 0.9, position follows pointer.
2. Hover over target column → faint accent-tinted drop zone appears in the column body (placeholder with dashed accent border).
3. Drop → card snaps into the new column position over `--duration-base` `--ease-out`. PATCH fires.
4. On success → card settles into resting state, no further animation.
5. On failure → card animates back to origin over `--duration-base`, "Couldn't move · Retry" toast.

### Inline quick-add submit

1. User types title + Enter.
2. POST fires.
3. New card appears in the column at the end (or in the appropriate dashboard section): opacity `0 → 1` + translate-y `4px → 0` over `--duration-base` `--ease-out`. Background pulses once with `--color-accent-primary-subtle` over `--duration-slow`.
4. "click to edit ✎" hint visible for ~3s, then fades over `--duration-fast`.
5. Input stays focused, value cleared.
6. On failure → row removed with the inverse animation; "Couldn't create · Retry" toast.

### Soft-delete (reminder × / task delete / label delete)

1. Row exits with opacity → 0 + translate-x to the action side over `--duration-fast` `--ease-in`.
2. Surrounding rows close the gap with layout transition `--duration-base`.
3. Toast appears: "Deleted · Undo". 8s.
4. On Undo click → row animates back into position with the reverse animation; backend writes `deletedAt = null`.
5. On API failure → row reappears with toast "Couldn't delete · Retry".

### Snooze (reminder Snooze ▾)

1. User picks a duration.
2. Row exits with translate-y down + opacity → 0 over `--duration-fast`.
3. Toast: "Snoozed · until tomorrow 09:00 · Undo".
4. On Undo → row returns with reverse animation, `remindAt` reverts.

### Inline edit commit (title, label name, etc.)

1. Click ✓ or Enter.
2. Field flashes accent-tinted bg briefly (`--duration-fast` fade out).
3. PATCH fires. On success → no further visible change.
4. On failure → field bg flashes danger-tinted, input re-opens with the previous value preserved; toast "Couldn't save".

### Status quick-toggle on detail panel/page

- Click a different segment → segment selection flips instantly (no transition besides the segmented-control hover).
- PATCH fires. On success → silent.
- On failure → segment animates back to its previous value over `--duration-fast`; toast "Couldn't update".

## Interaction patterns

### Keyboard navigation

- Focus moves visibly between elements (focus ring) over `--duration-instant`. Never invisible.
- Modal/dialog/panel: focus trapped while open. Tab cycles within. Esc closes.
- Lists: arrow keys move selection where applicable (command palette, filter popovers). Selected row scrolls into view if out of viewport.
- Detail panel: `[` and `]` cycle through the underlying list. The list re-fetches lazily, panel updates content with the tab-switch animation (fade + slight slide).

### Drag-and-drop

v1: kanban card across columns only.

- Pointer-down + 4px movement threshold → drag start.
- Native HTML5 drag is acceptable for v1; switch to pointer-event-based custom DnD if HTML5 styling is too restrictive.
- Visual: card lifts (per Optimistic UI / Drag-to-status above).
- Drop zones: every column body is a valid drop target. Dashed accent border + faint accent bg overlay when the dragged card is over the target.
- Drop on the same column = no-op (no PATCH).
- Touch: long-press 250ms then drag. Same visual treatment.

Deferred (v1.5+): card reorder within a column (needs `position` field), drag reminders, drag list items to reorder, drag to multi-select.

### Hover-reveal actions

Used sparingly to keep UI calm.

- Per-row ⋯ menu trigger appears on row hover (desktop). Mobile: always visible (or replaced by a long-press handler — pick one at impl).
- Reminder rail icon-strip (when collapsed): label tooltip on hover.
- Sidebar collapsed nav items: tooltip with label + count on hover.

### Empty-state appearance

- After data loads and result set is empty: empty-state component fades in over `--duration-base` `--ease-out` (no skeleton intermediate beyond ~150ms of data fetch — go straight to empty state if data was empty).
- If filters caused the empty state: action button shows "Clear filters" instead of the default "+ New …".

### Error states

- Form field error: border color transitions to `--color-state-danger` over `--duration-fast`; error hint slides down from above the field over `--duration-fast`.
- Network/server errors at page level: toast-based, not inline-blocking.
- Auth failures (login/signup): error banner appears at the top of the card, slides down over `--duration-base`.

### Pull-to-refresh (mobile)

Not implemented in v1. List pages refetch on focus or after explicit user actions (filter change / row mutate). v1.5+ can add it on the major mobile list pages (Today, All-tasks, Inbox).

## Page transitions

v1: **no page-level transition animations**. Route changes swap content with no shared-element animation. Reasons:

- App-like, not content-site; users navigate decisively.
- Avoids the "where did my context go" disorientation of half-baked transitions.
- Simpler implementation, less to maintain.

Exception: the detail panel acts as a *non-routing* in-place transition over any list page — the page underneath stays mounted, the panel slides in.

v1.5+ may add subtle fade-on-route-change (~150ms) once base UX is solid.

## Loading states

| Surface | Loading behavior |
|---|---|
| Page first paint | Page chrome (top bar / sidebar / bottom nav) renders immediately. Content area shows skeleton structure matching what'll arrive. |
| Filter change | Inline spinner replaces the result-count subtitle while fetching. Existing rows stay (don't unmount); replaced after data arrives with a fade. |
| Pagination / load-more | Sentinel-triggered. New rows append with the same opacity-fade-in as quick-add results. |
| Detail panel open | Title + status + meta render from cached row data; description / reminders / activity sections show skeleton until full task fetched. |
| Optimistic actions (above) | No loading state visible; the action appears instantly. Toast indicates background work for slow ops only. |
| Form submit | Button shows spinner; form stays enabled but the submit button is non-clickable (per spec 04). |

## Animation cleanup rules

- **Cancel ongoing animations on user input.** If a panel is mid-close-animation and the user clicks another task to open, the close fast-finishes and the new panel opens immediately.
- **Don't animate during initial render.** First mount of any surface skips its entrance animation (use a `data-mounted` flag or similar at impl time). Animations are for subsequent state changes.
- **Coalesce rapid actions.** Multiple soft-delete toasts stack with the last 3 visible; the rest queue or are dropped.

## A11y notes specific to motion

- `prefers-reduced-motion: reduce` honored globally. Per-pattern fallback documented above.
- Animations conveying meaning (e.g. row sliding away on delete) **also update accessible state** — `aria-live` for added/removed list rows, focus management on dialog open/close, etc.
- Auto-dismissing toasts don't disappear before being read; the durations above are minimums.
- Parallax / decorative motion: none in v1. Avoids vestibular triggers.

## What v1 does NOT animate

Deliberate restraint:

- Tooltip arrow/tail position adjustments.
- Color-band edges on project cards.
- Theme-switch decorative flourish (a global fade only — no swipe wipe etc.).
- Background gradients / blobs on auth pages (static).
- Decorative micro-states on idle (no "breathing" buttons, etc.).
- Page-level transitions (per above).
- Stagger animations on initial list render.

Each can be revisited in v1.5+ when the base motion is settled.

## Tokens recap (from 01)

```
--duration-instant : 80ms   (focus, instant feedback)
--duration-fast    : 150ms  (hover, color changes, small state changes)
--duration-base    : 220ms  (most enter/exit, dialog, panel)
--duration-slow    : 360ms  (sheet, drawer, large layout shifts)

--ease-out         : cubic-bezier(0.16, 1, 0.3, 1)
--ease-in          : cubic-bezier(0.7, 0, 0.84, 0)
--ease-in-out      : cubic-bezier(0.65, 0, 0.35, 1)
--ease-linear      : linear
```

When in doubt: `--duration-base` + `--ease-out` is the safe default for an enter; `--duration-fast` + `--ease-in` for an exit.

---

## Design phase complete

This is the last of the v1 design docs. Spec list:

1. ✅ `01-tokens-and-theme.md`
2. ✅ `02-layout-and-navigation.md`
3. ✅ `03-page-wireframes.md`
4. ✅ `04-components.md`
5. ✅ `05-motion-and-behavior.md` (this doc)

Next: consolidating `backend-changes-summary.md` so the upcoming backend planning round has a single checklist to work from, then the original-roadmap phases 2–4 (backend refactor, lint/format port, doc updates, ADRs), then implementation.
