---
created: 2026-05-14
updated: 2026-05-14
summary: Component primitives — buttons, inputs, pickers, badges, dialogs, menus, toasts, popovers, navigation parts. States + tokens for each. Framework-agnostic. Sits on tokens (01), shell (02), pages (03).
---

# Component primitives

Fourth doc in the design-system bucket. Defines the **reusable building blocks** behind every page. Tokens from [`01-tokens-and-theme.md`](./01-tokens-and-theme.md) are referenced by name; concrete values live there.

Layout/page-level composition lives in `02-layout-and-navigation.md` and `03-page-wireframes.md`. Motion design and drag/interaction choreography live in `05-motion-and-behavior.md`.

## Conventions

- **Every interactive primitive** has these states unless noted: `default`, `hover`, `active` (pressed), `focus-visible` (keyboard), `disabled`, `loading`. Some add `error` / `selected` / `expanded`.
- **Focus rings** always use `--color-focus-ring` via `--shadow-focus-ring`. Never remove without an equivalent.
- **Touch targets** are ≥ `--touch-target-min` (44px) on mobile. Hit area can extend beyond the visual size.
- **Reduced motion**: all transitions collapse to `0ms` linear when `prefers-reduced-motion: reduce`.

---

## Button

### Variants

| Variant | Token use | When |
|---|---|---|
| `primary` | bg `--color-accent-primary`, text `--color-text-on-accent`, shadow `--shadow-elevated` | One per surface. Main action. |
| `secondary` | bg `--color-bg-surface`, text `--color-text`, border `--color-border` | Companion actions to primary. |
| `ghost` | bg `transparent`, text `--color-accent-primary`, no border | Tertiary actions; nav-bar buttons. |
| `danger` | text `--color-state-danger`, border `--color-state-danger` at low opacity, bg transparent | Destructive (delete, sign out). Pairs with confirmation dialog. |
| `danger-solid` | bg `--color-state-danger`, text white | Final-step confirmation buttons inside destructive dialogs only. |

### Sizes

| Size | Padding | Font | Min height |
|---|---|---|---|
| `sm` | `--space-1` y / `--space-2` x | `--type-small` | 28px |
| `md` (default) | `--space-2` y / `--space-3` x | `--type-body` | 36px |
| `lg` | `--space-3` y / `--space-4` x | `--type-body-strong` | 44px |

All sizes: radius = `--radius-md`. Mobile floor: any button on a tap surface uses `lg` size to hit the 44px touch-target.

### States

- **hover**: bg shifts to `--color-accent-primary-hover` (primary), or border darkens (secondary).
- **active**: bg → `--color-accent-primary-pressed`. Scale 0.98 on the press (no scale if reduced-motion).
- **focus-visible**: `--shadow-focus-ring`.
- **disabled**: opacity 0.4, cursor `not-allowed`, no hover/active.
- **loading**: button text dims, spinner replaces leading icon (or appears centered); button is non-clickable but **not** disabled-styled — keeps the user's spatial expectation.

### Slots

- Leading icon (16px for `sm`/`md`, 18px for `lg`).
- Trailing kbd chip (`⌘K`, `⏎`, etc.) — only for ghost/secondary variants in nav/toolbar contexts.

### A11y

- `<button>` element always (not `<a>` unless it actually navigates). Use `<a>` for "Open project" or "Open task".
- Loading state sets `aria-busy="true"`.
- Disabled buttons remain focusable when they convey state (so screen readers can announce); use `aria-disabled="true"` + click handler that ignores.

---

## Input (text / email / number / search)

### Anatomy

Single-line text entry. Optional leading icon, optional trailing kbd hint, optional clear-× button when populated.

### Sizes

`sm` (28px), `md` (36px default), `lg` (44px touch). Radius = `--radius-md`. Padding scales with size; mono inputs (date/hex) use `--font-mono`.

### States

| State | Treatment |
|---|---|
| default | bg `--color-bg-surface`, border `--color-border`, text `--color-text-strong` |
| hover | border `--color-border-strong` |
| focus | border `--color-accent-primary`, `--shadow-focus-ring` |
| disabled | opacity 0.5, bg `--color-bg-muted` |
| error | border `--color-state-danger`, with red `validator-hint` below |
| readonly | no border, no bg, just text (used for displayed-but-not-editable values like Created/Updated) |

### Search variant

- Leading `⌕` icon, color `--color-text-muted`.
- Trailing kbd chip showing the keyboard shortcut (`⌘K`, etc.) when applicable.
- Clear-× appears when value present, on the trailing edge before any kbd chip.

### Placeholder copy

- Helpful, not redundant ("Search tasks, projects…", not "Type here").
- Color `--color-text-faint`.

### A11y

- Always pair with a `<label>` (or `aria-label` when label is implied like in search bars).
- Error messages use `aria-describedby` pointing to the validator hint.
- `inputmode` per type (`numeric`, `email`, etc.).

---

## Textarea

For descriptions, reminder content.

- Min height: `--space-12` (3 lines of body type). Auto-grow up to a max (e.g. 12 lines), then scroll.
- Markdown contexts (description): use `--font-mono` for the Write mode (helps with code blocks); Read mode renders styled markdown using the normal text tokens.
- Same state palette as Input.

---

## Checkbox

- Square box, `--radius-xs`, 16px (`md`). Compact variant 14px for dense list rows.
- Default: border `--color-border-strong`, transparent.
- Checked: bg `--color-accent-primary`, checkmark `--color-text-on-accent`.
- Indeterminate: bg `--color-accent-primary`, dash glyph.
- Focus: `--shadow-focus-ring`.
- Tap target on mobile: 44px hit area regardless of visual 16px.

### Use

- Task list row complete-toggle.
- Bulk-select (when v1.5 lands).
- Filter multi-select inside popovers.
- Settings "Remember me" — uses the same component.

---

## Toggle (switch)

For binary on/off settings (reduce-motion, apply-to-desktop-too).

- Track 32×18px, knob 12px, radius full.
- Off: track `--color-bg-muted`, knob `--color-text-muted`.
- On: track `--color-accent-primary-subtle`, knob `--color-accent-primary`.
- Animates knob position over `--duration-fast` with `--ease-out`.

### When NOT to use

Don't use a toggle for a 3+ option set. Use Segmented Control or Select.

---

## Segmented Control

Mutually-exclusive choice from 2–5 options (theme, density, view-mode, status quick-toggle).

- Container: bg `--color-bg-muted`, border `--color-border-subtle`, `--radius-md`, 2px padding.
- Segment: padding scales with size; active segment bg `--color-accent-primary-subtle` + text `--color-accent-primary` + subtle font-weight bump (500 → 600).
- Inactive segment: text `--color-text-muted`.

### Status variant

Used on Task detail quick-toggle. Active segment color reflects status:

- `todo` → neutral muted tint.
- `in_progress` → accent-primary tint.
- `done` → state-success tint.

Same component, color-of-active-segment is a prop.

---

## Select / Picker

For one or many values from a list.

### Single-select

Trigger = button-styled element showing the current value + ▾ caret. Click → popover with searchable list.

### Multi-select

Trigger shows pills for selected items + a chip-style overflow ("+3 more"). Popover lists items with checkboxes.

### Popover

- `--shadow-pop`, `--radius-lg`, max-height limited (scrolls inside).
- Search input at the top if list >5 items.
- Items: padded rows, hover bg `--color-bg-surface-raised`, selected = check icon on the right.
- "+ Create new …" inline action at the bottom for label/project pickers.
- Keyboard nav: ↑↓ moves selection, Enter commits, Esc closes. `role="listbox"` + `aria-activedescendant`.

---

## Date picker

Used for `dueDate`, `remindAt` (paired with time picker).

- Trigger: input field formatted in user locale + calendar icon.
- Popover: monthly grid (same visual style as the dashboard mini-cal widget). Month-nav arrows + "Today" jump.
- Day cell: hover ring; selected day = filled accent.
- Today indicator: outlined accent border.
- Empty/Clear: "Clear date" footer button.
- Keyboard: arrow keys move selection day-by-day, Page Up/Down = month, Enter commits.

## Time picker

Paired with date picker for `remindAt`. Two flavors:

- **Wheel** (mobile): scrollable hour + minute columns, OS-style.
- **Input + popover** (desktop): mono input `HH:mm` + a 24-cell hour grid popover with quarter-hour rows.

Combined date+time field: shows `Fri 15 May · 09:30`. Click → both pickers open in sequence (date first, then time).

---

## Color picker

Used for project + label colors.

- Trigger: a 16×16 (or 22×22) swatch with the current color. Hover reveals a small ▾ marker.
- Popover: 12-color preset palette in a 6×2 grid (curated for both light/dark mode contrast) + custom hex input.
- Custom hex: mono input + live preview. Validates `#RRGGBB`. Commits on Enter or "Use".
- Selected swatch: outline ring at `--color-text-strong`.

Hash-derived default behavior: when the picker opens for a NEW item (project/label create) and the user hasn't manually picked yet, the default chip pulses to indicate it's algorithmic.

---

## Badge / Pill

Inline status / label markers, not interactive.

### Variants

| Token use | Example |
|---|---|
| `priority-high` — bg `--color-state-danger-subtle`, text `--color-state-danger` | `!high` |
| `priority-medium` — bg `--color-accent-primary-subtle`, text `--color-accent-primary` | `!med` |
| `priority-low` — bg `--color-text-muted` at low opacity, text `--color-text-muted` | `!low` |
| `info` — bg `--color-accent-secondary-subtle`, text `--color-accent-secondary` | labels, project chips |
| `warning` — bg state-warning-subtle, text state-warning | recurring marker |
| `success` — state-success-subtle / state-success | done marker |
| `neutral` | counts, generic chips |

Sizes: 9px / 11px / 13px text. Padding `--space-1` x / 2px y. Radius `--radius-sm` for square-ish, `--radius-full` for pill shape. Pill is the default in this app.

### With color-dot prefix

Project chips and label chips show a `--radius-full` 8px color dot before the text. Color matches the entity's color (project / label).

---

## Avatar

Circular, gradient bg from accent-primary → accent-secondary for the current user (visible identifier even in single-user). Other users (when multi-user lands) use a hash-derived gradient. Size variants: 20 (compact), 28 (default top-bar), 40 (settings).

---

## Card

Generic surface container — task card on board, project card on list, widget on dashboard, auth card.

- Bg `--color-bg-surface`, border `--color-border-subtle`, `--radius-lg`.
- Hover (interactive cards only): border → `--color-border`, optional `--shadow-card`.
- Active card (e.g. a kanban card being dragged) has `--shadow-pop` + slight rotation (1–2°).

Card sub-elements: header (title + count + actions), body (content), footer (actions). Footer-pinned variant useful for dialogs/forms.

---

## Dialog / Modal

Centered, focus-trapped, backdrop-overlay surface for confirmations + small forms.

- Backdrop: `--color-bg-overlay`, `--z-overlay`.
- Card: `--shadow-pop`, `--radius-xl`, max-width 480px (or 600 for forms), full-width minus margin on mobile.
- Header: title (h3) + close-× button top-right.
- Body: content area, padded.
- Footer: right-aligned actions (Cancel + primary), bottom-aligned. Destructive dialogs swap primary for danger-solid + add typed-confirmation if irreversible.

### Two-step destructive confirmation

For irreversible ops (permanently delete account, permanently delete label from deleted-view):

- First click → modal asks "Type X to confirm" with the input + a disabled danger button.
- Button enables only when typed text exactly matches.
- Second click → executes + closes.

---

## Toast

Transient feedback at the bottom (or top) of the viewport. Used for: undo prompts (deletes, completes), background-task results, error/connection messages.

- Container: 320–480px, `--shadow-pop`, `--radius-lg`, `--color-bg-surface-raised`.
- Layout: optional icon + message + optional action ("Undo") + close-×.
- Default duration: 5s for neutral, 8s for actionable (with undo), persistent for errors until dismissed.
- Stack: newest on top, max 3 visible, older scroll off.
- Position: bottom-right on desktop, bottom-center on mobile.

### Variants

- `success` — leading state-success icon.
- `danger` — state-danger icon.
- `info` — neutral.
- `loading` — spinner + auto-dismisses on resolution.

### A11y

`role="status"` for neutral toasts, `role="alert"` for errors. `aria-live="polite"` default, `assertive` for errors only.

---

## Popover

Floating surface anchored to a trigger element. Used for color picker, date picker, dropdown menus, notification bell, command-palette internals.

- Floating positioning anchored to trigger with overflow detection (flip / shift on edges).
- `--shadow-pop`, `--radius-lg`, `--z-popover`.
- Padding scales with content type — picker popovers tighter than menu popovers.
- Closes on: outside click, Esc, blur of internal focusable.
- Open animation: `--duration-base`, `--ease-out`, faint translate-from-trigger + opacity.

---

## Menu (dropdown / context menu)

Vertical list of actions inside a popover.

- Each item: icon + label + optional trailing kbd hint.
- Sectioned with thin dividers + uppercase section labels for groups.
- Item hover: `--color-bg-surface-raised`.
- Destructive items: `--color-state-danger` text + matching hover tint.
- Keyboard: ↑↓ moves, Enter activates, Esc closes.

Used for: row ⋯ menus, ⓘ extra actions, right-click context (desktop), settings sub-menus.

---

## Tabs

Horizontal row of mutually-exclusive view switches. Used inside pages where the URL toggles (project page tabs — Board/List).

- Bottom border indicator under the active tab, color `--color-accent-primary`.
- Active text: `--color-accent-primary`, weight 600.
- Inactive: `--color-text-muted`.
- Optional count chip per tab.

Tabs are nav (URL-changing) when the underlying surface is a distinct route; otherwise consider Segmented Control.

---

## Breadcrumbs

Compact horizontal trail of ancestors.

- Each level: link (`--color-text-muted`) + separator `›` (faint).
- Last segment is the current page, non-link, `--color-text`.
- Truncates with `…` segments in the middle when over 3 levels (rare in v1).

---

## Tooltip

Small floating label, transient, attaches to a trigger.

- Single-line, `--type-small`, `--color-bg-surface-raised`, `--shadow-pop`, max-width 240px.
- Show delay: 500ms hover. Hide instantly on blur.
- Position: auto-flip near viewport edge.
- Keyboard: focus also triggers (after 500ms).
- A11y: `role="tooltip"`, `aria-describedby` on the trigger.

---

## Skeleton

Placeholder shape during loading.

- Same dimensions as the real element it stands in for.
- Bg cycles between `--color-bg-surface` and `--color-bg-muted` over `--duration-slow` linear.
- Respects `prefers-reduced-motion`: shown at one static state, no cycling.
- Replaced by real content on data-arrival; cross-fade `--duration-fast`.

---

## Empty state

Repeated pattern, one component:

- Icon (illustrated, ~64px) using muted accent-tinted strokes.
- Title: `--type-h4`, `--color-text-strong`.
- Description: `--type-body`, `--color-text-muted`, max-width 40ch.
- Primary action button (the obvious next step).
- Optional secondary link.

Per-page copy decided in spec 03 per page; the visual recipe lives here.

---

## Top bar

(See spec 02 for layout slots.) Component-level details:

- Height fixed: 44 desktop, 48 mobile.
- Bg `--color-bg-surface`, border-bottom `--color-border-subtle`.
- Icon buttons inside: `ghost` variant of Button at `sm` size, with `--space-1` gap from each other.
- Logo: short wordmark; the bullet between `task` and `mgr` uses `--color-accent-primary`.

---

## Sidebar

(See spec 02.) Component:

- Two states (collapsed / pinned) toggled via the pin button at the rail top.
- Nav items: 7px y / 10px x padding, `--radius-md` row.
- Active: bg `--color-accent-primary-subtle`, text/icon `--color-accent-primary`.
- Sections separated by uppercase section labels.
- Project rows: color-dot prefix (12px) + name + count.

---

## Bottom nav (mobile)

(See spec 02.) Component:

- 60px tall, 5 slots, FAB centered (44px) overlapping half-into-bar.
- Active item: text + icon `--color-accent-primary`.
- Inactive: `--color-text-faint`.
- Safe-area inset added below for iOS notch.

---

## Drawer

(See spec 02.) Sliding panel from the handedness-preference side.

- Width 86vw, max 320px.
- Backdrop overlay closes on tap.
- Swipe-to-close from the drawer edge.
- Animates over `--duration-base` `--ease-out`.

---

## Bottom sheet (mobile)

Mobile counterpart of the inline detail panel.

- Drag-handle bar at top (40×4px, `--color-border-strong`).
- Max-height 90vh, scroll inside.
- Drag-down-to-close.
- Backdrop overlay.
- Used for: task detail (mobile), calendar day detail, FAB-triggered task create form.

---

## Command palette

(See spec 02 for trigger + behavior.) Component anatomy:

- Modal at `--z-popover`, 15vh from top, 520px wide (desktop), full-width sheet (mobile).
- Search input pinned at top with ⌕ leading + Esc kbd hint.
- Results scroll area below, grouped by section labels (Tasks · Projects · Actions · Navigation).
- Highlighted match: bold of matched substring + slight accent tint of the row.
- Selected (keyboard): `--color-accent-primary-subtle` row bg.
- Action rows: trailing kbd hint (e.g. `⌘N`).

A11y: `role="dialog"` + `aria-modal="true"`; result list `role="listbox"`.

---

## Detail panel (inline)

(See spec 02 + task-detail in spec 03.) Component:

- Anchored right edge (or left when handedness-mirror is on), `--z-modal`.
- Width 360–480px, resizable on desktop via a 4px-wide drag handle on the inner edge. Width persisted to user prefs (`detailPanelWidth`).
- Slides in from edge over `--duration-base` `--ease-out`.
- Inside: header (✕ close · `[`/`]` prev-next · "Open full page ↗") + scrollable body using the task-detail layout (per spec 03).

---

## Inline quick-add (column / list)

Single-input rapid-capture pattern.

- Idle: a `+ Add task` ghost-button at the column footer.
- Active: expands into a row with the title input + helper text ("⏎ save · esc cancel"). 
- Save: POST + brief pulse on the new row + "click to edit ✎" hint + input stays focused for next entry.
- Cancel: Esc / explicit Cancel collapses back to button.

Used wherever context determines defaults (project board column for status/projectId, dashboard for due-today).

---

## Filter chip

Composable predicate chip in filter rows.

- Inline pill, `--radius-sm` square-pill.
- Active filter: bg `--color-accent-primary-subtle`, text `--color-accent-primary`, border at same accent low-alpha.
- Unset (placeholder): bg transparent, dashed `--color-border-subtle`, text `--color-text-muted` ("+ Add filter…").
- Editable parts: clicking the value opens a value picker popover; the operator can be edited via the chip's left-side operator letter (≥, ∈, etc.).
- × button on the right removes the chip.

---

## Density picker

(Toolbar control on All-tasks.) Three options as a Segmented Control: `Compact 32 · Default 40 · Comfortable 48`. The numbers refer to row heights in the active list view. Persisted via URL + preferences.

---

## Columns picker

(Toolbar control on All-tasks + Project list-view.) Popover with checkbox list of toggleable columns. Some columns are pinned (Title) and shown disabled-but-checked. Order of columns is a v1.5 addition; v1 columns render in a fixed order.

---

## Kanban column

(Project page Board.) Component:

- Card container: bg `--color-bg-muted`, border `--color-border-subtle`, `--radius-lg`, header + body + footer.
- Header: status name (uppercase label, color-coded — `todo` neutral, `in_progress` accent-primary, `done` state-success) + count chip + `+` icon (alias for the inline quick-add).
- Body: scrollable vertical stack of kanban cards.
- Footer: inline quick-add anchor (collapsed by default).
- Drop zone (when dragging): dashed accent-primary border + faint accent-primary bg overlay.

---

## Kanban card

Compact task card inside a column.

- Bg `--color-bg-surface`, border `--color-border-subtle`, `--radius-sm`.
- Title (1–2 lines, ellipsis), meta row (priority badge, label badges, due-relative mono).
- Drag handle implicit (whole card is draggable); cursor changes to `grab`.
- Dragging state: `--shadow-pop`, tilt 1°, opacity 0.85.
- Done cards: opacity 0.6, strikethrough title.

---

## Project card

(Projects list grid.) Component:

- Bg `--color-bg-surface`, border `--color-border-subtle`, `--radius-lg`.
- Top color band (3px height, accent the project's color).
- Body: name + color-dot, description (2-line clamp), stats row (3 metrics with mono numerals), meta footer.
- "Add new" variant: dashed border, accent text + icon, hover lights up the border + faint bg tint.

---

## Reminder row

(Inbox + Project reminder rail + Task detail reminder list.) Component:

- Left: time block (HH:mm + relative under).
- Middle: title (medium weight) + optional content (muted) + parent-task link chip.
- Right: actions cluster (Done / Snooze ▾ / ×).
- Bordered variant: accent-primary border for "now / awaiting action" rows.

---

## Sort selector

Toolbar control, single-field + asc/desc.

- Trigger: pill labelled "Sort: <field> <↑/↓>".
- Popover: list of available sort fields + a separate asc/desc toggle.
- Persists in URL state.

---

## Form layout

Generic form pattern (used in settings, label create, etc.):

- Each row: meta column (name + description) on the left, control on the right.
- Top-aligned across the row.
- Grouped rows inside a `--color-bg-surface` card with `--radius-lg`.
- Section headers between groups (`--type-label` uppercase).

---

## A11y summary

- Every interactive primitive: keyboard-accessible, focus ring visible, role + aria attributes per pattern (button / link / listbox / dialog / etc.).
- Color is **never** the sole signal — pair with icon / label / position for status, priority, etc.
- Touch targets ≥ 44px on mobile (hit area may extend beyond visual).
- Reduced-motion respected on all transitions (`prefers-reduced-motion: reduce` → instant or no animation).
- Color-blind safety: all semantic states pair with non-color cues.
- Forced-colors (high contrast Windows): primitives must remain usable; specifics in 05.

## Out of scope (v1.5+)

- Rich-text editor surface (mentions, slash commands).
- Color picker with eyedropper.
- Drag-reorder of list items (rows / reminders / labels) — see 05 for the motion design but actual reorder is v1.5.
- Custom theme builder (user-defined accents).
- Data table component (the All-tasks table-view variant was deferred to v1.5 too).
