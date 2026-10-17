# Responsive baseline — Phase 0

Evidence snapshot taken **2026-10-16** on branch `feature/responsive-design`, before any
responsive code changes, so every later phase can be diffed against it.

## Device classes (agreed with the user)

| Class   | Width      | Rule                                                             |
| ------- | ---------- | ---------------------------------------------------------------- |
| phone   | < 768px    | Complete card/list UI — **no hidden data**; everything reachable |
| tablet  | 768–1023px | Tables retained (they fit); layout may still be tuned            |
| desktop | ≥ 1024px   | Deliberate refactors allowed — take advantage of empty space     |

## How the baseline was captured

- `scripts/shots.mjs` gained a `--viewport phone|tablet|desktop` flag
  (390×844 / 768×1024 / 1440×900). Desktop keeps the flat output dir; phone and tablet
  write into subdirs so filenames never clash.
  - `npm run shots -- --viewport phone` → `screenshots/<day>/phone/`
  - `npm run shots -- --viewport tablet` → `screenshots/<day>/tablet/`
  - `npm run shots -- --viewport desktop` → `screenshots/<day>/` (legacy layout)
  - Any page filter still works: `npm run shots -- --viewport phone students`
- Auth pages are unreachable from `shots.mjs` (it authenticates first), so
  `scripts/_auth-baseline.mjs` captures `/login` + `/register` at all three viewports:
  `screenshots/<day>/auth/`.
- `scripts/audit-responsive.mjs` measures per route: horizontal overflow
  (documentElement.scrollWidth − innerWidth) and sub-44px interactive targets.
  Both scripts are phase-0/1 companions — delete or promote once the redesign lands.

## Baseline numbers

### Horizontal overflow @ 390px

**Every one of the 27 routes overflows by 360–362px** (`documentElement.scrollWidth` ≈ 751–752
vs 390 viewport). Identical offenders on all routes:

| Offender                            | Rect @ 390px        | Effect                                                             |
| ----------------------------------- | ------------------- | ------------------------------------------------------------------ |
| `.top-end` (theme/bell/lang/avatar) | 242w, left −360     | **Entirely off-screen left — unreachable without sideways scroll** |
| `.top-start` (menu + date chips)    | 480–482w, left −106 | Gregorian chip half cut off (clock block is 433w)                  |

Per-route extras: `/registrations` additionally overflows via `span.req-role` (58w).
No other route has non-topbar overflow offenders.

Shell-level sub-44px targets (present on every route):

| Target                                     | Size   |
| ------------------------------------------ | ------ |
| topbar icon buttons (menu/theme/bell)      | 40×44  |
| sidebar brand link                         | 212×42 |
| sidebar settings link (`<a>`, not button)  | 275×36 |
| sidebar search input (dead UI, no handler) | 223×18 |
| topbar language switcher (`dd-btn`)        | 89×40  |

Page-level small targets found: `/groups` (16× row expander 28×44, 2× edit pencil 28×28) ·
`/scoring` (9× checkbox 20×20, 5× mini input 76×34, delete btn 46×32) · `/centers` + `/levels`
(edit/delete btn 50×32) · `/users/new` (pw-eye toggle 38×44) · `/groups/new` (day chips 61×40) ·
`/settings` (3× checkbox 17–20px) · `/planning/calendar` (btn 38×44) · `/students` + `/users`
(unassigned checkbox 26×26). Full data: `screenshots/<day>/audit-phone.json`.

> Capture note: the phone baseline PNGs are _752px wide_, not 390 — the fullPage capture
> includes the topbar's 362px of horizontal overflow. Widths shrinking to 390 after a fix
> is itself the pass signal.

### Auth pages @ 3 viewports (12 shots, `screenshots/<day>/auth/`)

`overflow = 0px` on all 12 (login/register × phone/tablet/desktop × dark/light) — these
pages are shell-less, so no horizontal overflow. Their phone issues are vertical/touch,
visible in the shots:

- card `margin: 31px` + `border-radius: 45px` eats ~62px width and shows a floating card;
- `/register` phone: the bismillah verse **spills above the `.auth-art` panel** (40px
  minimum clamp too large for the wrapped line count);
- `.field-pair` stays 2-col at 390px — inputs ~136px wide (email placeholder barely fits);
- lang pills ~30px tall, theme button ~34px — both sub-44px touch targets.

### Test baselines (pre-change)

- **Vitest**: `npm test` → 42 files / 251 tests **PASS**, but exit code **1** due to
  1 pre-existing unhandled error (NG04002 router no-match thrown after
  `student-detail.page.spec.ts` finishes). Pre-existing; not caused by this phase.
- **E2E**: `npm run e2e` (full suite, `EXIT=1`, 8.8m) → **46 passed / 5 failed / 8 skipped**
  of 59, with `e2e/` and `src/` byte-identical to `main` at capture time — every failure is
  pre-existing. Classified:

  | #   | Test                  | Failure                                                                                               | Classification                                                                                                                                                   |
  | --- | --------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | 1   | `bootstrap-flow` 4    | `centers total` = 6, expected 0                                                                       | **Out of scope by design** — needs the separate `alotrojah_bootstrap` DB (`run-bootstrap-e2e.ps1`); ran here only because the bare suite includes it. Skips 5–9. |
  | 2   | `calendar-drag` 16    | strict-mode violation: `[data-testid^="cal-date-"]` matches 2 inputs (`cal-date-1`, `cal-date-1-end`) | **Stale spec helper** — the app gained the end-time picker; `openFirstEvent()` wasn't migrated. Skips 17.                                                        |
  | 3   | `calendar-resize` 18  | same strict-mode violation                                                                            | Same stale helper. Skips 19.                                                                                                                                     |
  | 4   | `centers-flow` 22     | new center expected invisible (F7 detector), got 1 row                                                | **DB-state dependent** — the F7 detector only manifests with >20 centers; `verify` currently holds ~6, so the assertion can't hold. Not a regression.            |
  | 5   | `entry-flow` 27 (S19) | `حفظ` save button stayed `disabled` → 60s timeout                                                     | **Pre-existing app/spec issue** — form never became savable; needs its own investigation (out of scope here). Skips 28.                                          |

  Compare-out set for the final phase: the same 4 canonical failures (2–5) must reproduce
  unchanged after the redesign, and no new failure may appear — that is the regression proof.
  `.env` auto-reverted to `alotrojah_dev` after the run (verified; no swap leftovers).

## Route-by-route checklist

Legend: ⚠ = known issue from code review / baseline shots, · = to verify in phase.
Pages without a dedicated route in the shots set are marked (explicit shot).

| Route                | Baseline note (pre-change)                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/login`             | ⚠ card margin 31px + radius 45px eats 62px of a 390px screen; inputs 15px (iOS zoom); art panel pushes form below fold.                   |
| `/register`          | ⚠ same auth issues + `.field-pair` stays 2-col at phone (inputs ~130px wide).                                                             |
| `/` dashboard        | ⚠ page-level overflow from topbar (~362px at 390); KPI cards stack 1-col; charts fine.                                                    |
| `/centers`           | ⚠ topbar overflow; list-table cards OK-ish.                                                                                               |
| `/levels`            | ⚠ topbar overflow; verify row layout at phone.                                                                                            |
| `/students`          | ⚠ topbar overflow; 2-col card grid squeezed; hidden `low` columns in list-table.                                                          |
| `/students/new`      | ⚠ topbar overflow; long form — verify field-pair/grid stacking.                                                                           |
| `/students/:id`      | (explicit shot — ids drift)                                                                                                               |
| `/users`             | ⚠ topbar overflow; list-table cards show a subset of desktop columns (`priority: low` hidden — mandate violation to fix).                 |
| `/users/new`         | ⚠ topbar overflow; form verify.                                                                                                           |
| `/users/:id`         | (explicit shot)                                                                                                                           |
| `/groups`            | ⚠ topbar overflow; verify list cards.                                                                                                     |
| `/groups/new`        | ⚠ topbar overflow; verify form.                                                                                                           |
| `/groups/:id[/edit]` | (explicit shot)                                                                                                                           |
| `/entry`             | ⚠ topbar overflow; picker OK at phone; the entry table itself (post-selection) is a desktop grid — redesigned for phone in a later phase. |
| `/planning`          | ⚠ topbar overflow; season cards verify.                                                                                                   |
| `/planning/new`      | ⚠ topbar overflow.                                                                                                                        |
| `/planning/plans`    | ⚠ topbar overflow.                                                                                                                        |
| `/planning/calendar` | ⚠ topbar overflow; `.cal-month-view` width at phone — verify scroll strategy.                                                             |
| `/scoring`           | ⚠ topbar overflow; verify.                                                                                                                |
| `/exams`             | ⚠ topbar overflow; verify.                                                                                                                |
| `/exams/new`         | ⚠ topbar overflow.                                                                                                                        |
| `/exams/weekly/:id`  | (explicit shot)                                                                                                                           |
| `/reviews`           | ⚠ topbar overflow; picker-gated.                                                                                                          |
| `/results/term`      | ⚠ topbar overflow; results table → verify phone strategy.                                                                                 |
| `/results/season`    | ⚠ topbar overflow.                                                                                                                        |
| `/reports/term`      | ⚠ topbar overflow; print-sheet table has no data-labels — phone strategy needed.                                                          |
| `/reports/season`    | ⚠ topbar overflow; same.                                                                                                                  |
| `/news`              | ⚠ topbar overflow.                                                                                                                        |
| `/delegate`          | ⚠ topbar overflow; picker-gated (generate link).                                                                                          |
| `/notifications`     | ⚠ topbar overflow.                                                                                                                        |
| `/registrations`     | ⚠ topbar overflow; request cards verify.                                                                                                  |
| `/settings`          | ⚠ topbar overflow.                                                                                                                        |

## Systemic issues found in code review (pre-change)

1. **Topbar horizontal overflow at 390px** — the single-row sticky `.topbar` contains
   menu + two full-length date chips (`white-space: nowrap`) + theme + bell (dead button)
   - language switcher + user chip. Min-content ≈ 752px → every page scrolls sideways;
     baseline PNGs are literally wider than 390px (752px captures). This is the root cause
     of the "empty band" in every phone screenshot.
2. **Triple bottom padding on phone** — `body { padding-bottom: var(--nav-height) }`
   (64px, meant for a mobile bottom nav that does not exist) + `.content` and `.page`
   each add `calc(var(--space-6) + var(--nav-height))`. ≈ 160px of dead space at the
   bottom of every phone page.
3. **Double horizontal gutter** — `.content` (16/24px) + `.page` (16px) both pad;
   desktop wastes 40px per side.
4. **Sub-44px targets** — `.icon-btn` 40×40, `.date-chip` height ~28–44, sidebar
   foot `<a>` controls < 44px, auth lang pills ~30px tall.
5. **Input font 14–15px in places** (`.auth-input input` 15px, `.sess input` 14px)
   overrides the global 16px iOS-zoom guard.
6. **`list-table` hides `priority: 'low'` columns on phone** (`.lt-hide-sm`) — violates
   the "no hidden data on phone" mandate.
7. **Drawer a11y** — no Escape-to-close, no focus management, no `aria-expanded`
   on the menu button, no safe-area insets (`viewport-fit=cover` missing).
8. **`.toolbar { top: 64px }`** hardcoded ≠ actual topbar height (57px) — sticky gap.
9. **No max content width** — `.content` stretches unbounded on wide screens.

## Out of scope here

- Tailwind or any UI framework — **rejected by the user; do not re-propose**.
- Behavior changes to data/models; testid renames (e2e depends on stable testids).

## Phase 1 results — foundations + shell + auth (2026-10-17)

Branch `feature/responsive-design`, uncommitted; app code frozen at the gate run below.

### What changed

- **Foundations** — new `down()` mixin (`max-width: $bp - 1px`); `viewport-fit=cover`;
  shell-owned `--topbar-h` (61px measured) replaces the 64px `.toolbar` hardcode; phone
  triple bottom padding gone (`--nav-height` was reserved for a bottom nav that never
  existed); `.content` owns the horizontal gutters (no `.page` double-pad) and gains
  `max-width: 1520px`.
- **Shell** — below `$bp-md` the sidebar is an off-canvas drawer: slides from the
  inline-start edge (RTL-aware), scrim closes, Escape closes, focus moves in and returns
  to the menu button, trigger carries `aria-expanded`. Topbar slims at phone (short date
  chips; theme/bell/language into the drawer foot; avatar stays). Safe-area insets on
  topbar + drawer.
- **Auth** — fluid card edge `clamp(12px, 4vw, 31px)`, `.field-pair` collapses to one
  column below `$bp-sm`, 16px inputs (iOS zoom guard), 44px floors on language pills and
  the password eye.
- **Found + fixed live (latent bugs, pre-existing)** — 4 dead `[data-theme]` shell rules
  and the dead RTL drawer transform (Angular emulated-encapsulation scoping trap — see
  frontend `Agent.md` §STACK), empty date chips (media override lost specificity depth),
  drawer focus timing (zoneless CD: focus landed on `visibility:hidden`), shell CSS
  budget trim.

### Audit results (final)

Post-fix JSON: `screenshots/2026-10-17/audit-{phone,tablet,desktop}.json`; phone PNGs
`screenshots/2026-10-16/phone/` (54, both themes), auth `…/auth/` (12 + `overflow.json`).

| Viewport     | Baseline                                    | After                                                            |
| ------------ | ------------------------------------------- | ---------------------------------------------------------------- |
| Phone 390    | 27/27 overflowed (all captures 752px wide)  | **21/27 @ 0px**; 6 left — all `main.content` min-widths (below)  |
| Tablet 768   | topbar overflow on all 27 (1109px captures) | 27/27 still overflow — pre-existing, unchanged (below); Phase 2+ |
| Desktop 1440 | 0/27 (sub-44 only)                          | 0/27 (same sub-44 families)                                      |

Phone leftovers:

| Route            | Overflow | Content width |
| ---------------- | -------- | ------------- |
| `/`              | 454px    | 844px         |
| `/levels`        | 380px    | 770px         |
| `/centers`       | 271px    | 661px         |
| `/scoring`       | 248px    | 638px         |
| `/registrations` | 52px     | 442px         |
| `/groups`        | 29px     | 419px         |

Tablet: topbar min-content ≈ 823px (`.top-start` 508 + `.top-end` 315) vs ~500px usable
(768 − 268 sidebar) → ~350px overflow on every route; page extras add on `/` (860),
`/centers` (699), `/levels` (816), `/users` (723), `/scoring` (671), `/groups` (1112).
The mechanism is pre-existing: baseline captures were 1109px wide at the same viewport.

> Tooling note: the first post-fix phone audit undercounted (read 23/27) — its `settle()`
> waited for Angular stability but not for data-gated tables. `audit-responsive.mjs` now
> waits for network idle; the 2026-10-17 JSON set and these numbers come from the fixed
> build. (The baseline audit shared the same weakness — its pre-change offender lists are
> topbar-only for the same reason.)

### Still open at phone (Phase 2+ candidates)

- The 6 overflow routes above; tablet topbar + page blocks.
- Sub-44 targets — 106 flags on 10 routes (full data in the JSON): `/centers` edit 50×32
  ×7 · `/levels` edit/delete 50/46×32 ×6 · `/users` search 355×34 + links 90–128×24 ×20 +
  checkbox 26×26 · `/groups` expander 28×44 ×19 + pencils 28×28 ×19 · `/groups/new` day
  chips ~61×40 ×7 · `/scoring` inputs 20×20 ×9 + mini 76×34 ×5 + delete 46×32 ×5 ·
  `/settings` debug toggles ~20×20 ×3 · `/planning/calendar` nav 38×44 ×2 · single
  checkboxes on `/students` and `/users/new`. Desktop carries the same families (plus the
  sidebar search 191×20 — dead UI).
- `.lt-hide-sm` still hides low-priority table columns at phone — violates the
  no-hidden-data mandate; needs per-table card/priority decisions.
- Encapsulation-trap sweep for other components using `[dir='rtl']`/`[data-theme]`
  descendant selectors (see frontend `Agent.md` §STACK).

### Known, deliberately untouched

- Bell button + sidebar search input are dead UI (pre-existing).
- Theme/language controls live in the drawer foot at phone (by design).
- The 2 previously-open a11y findings (dropdown name mismatch ×3, news delete contrast)
  remain open per frontend `Agent.md` §OPEN.

### Interactive probe (19/19)

Drawer open/close, focus in + return, Escape, scrim, chips populated (122/115px), RTL
drawer direction, theme toggle, `--topbar-h` = 61px confirmed. Shots:
`screenshots/2026-10-16/verification/`.

## Phase 2 results — phone card reflow (2026-10-17)

Branch `feature/responsive-design`, uncommitted; app code frozen at the gate run below.

### What changed

- **Root cause fixed** — `.main` (column flex) + `.content`'s `margin-inline:auto` disabled
  cross-axis stretch, so the content box sized to fit-content and wide tables grew the whole
  document (the 6 phone overflows and the tablet page extras). `.content` now sets
  `width:100%` — with the Phase-1 `max-width:1520px` + auto margins it still centers ≥1520.
- **Card reflow** — new `table-cards($selector)` mixin (`_tokens.scss`): below `$bp-md` the
  `thead` hides, every row becomes a card and each `td[data-label]` renders its translated
  label (`::before{content:attr(data-label)}`; label leads, the value or action buttons group
  at the far end via `margin-inline-end:auto` — RTL-correct). Data cells carry
  `[attr.data-label]` in the templates; colspan form cells stay unlabeled and render block,
  so inline create/edit rows keep their layout.
- **Pages** — centers / levels / scoring / dashboard migrated to the mixin (+44px phone
  floors on their buttons, scoring's mini inputs and checkboxes); dashboard's `.panel` shell
  drops out at phone so row-cards sit on the page background; groups keeps its custom card
  block but its breakpoint moves 640→`$bp-md` and `.table-wrap.card` gains `overflow:auto`
  (tablet: the 900px table scrolls inside its card instead of clipping); registrations
  `.req-head` wraps + `.req-who{min-width:0}` (the 52px overflow case) + long emails break
  (`overflow-wrap:anywhere`).
- New i18n `center.stats` ×3 (centers' combined sections/students cell — was `∑`).

### Audit results (final)

Post-fix JSON: `screenshots/2026-10-17/audit-{phone,tablet,desktop}.json`; phone PNGs
`screenshots/2026-10-17/phone/` (54, both themes); Phase-1 JSONs kept as
`audit-*-phase1.json`.

| Viewport     | After Phase 1                     | After Phase 2                                          |
| ------------ | --------------------------------- | ------------------------------------------------------ |
| Phone 390    | 21/27 @ 0px (6 routes overflowed) | **27/27 @ 0px**; sub-44 flags 106→**24** on 6 routes   |
| Tablet 768   | page extras on 6 routes           | extras cleared — sole offender = topbar only (below)   |
| Desktop 1440 | 0/27 (79 sub-44)                  | 0/27 re-confirmed                                      |

Phone sub-44 leftovers — all previously-documented out-of-scope families: `/users` (8×
user link 90–128×24 + search 356×34 + unassigned checkbox 26×26) · `/students` and
`/users/new` (checkboxes 26×26) · `/groups/new` (7× day chip 40px tall) · `/settings`
(3× native debug toggles ~20px) · `/planning/calendar` (2× arrows 38×44). Every in-scope
family cleared: `/centers` edit ×7, `/levels` edit/delete ×6, `/scoring` inputs/checkboxes/
delete (19 flags), `/groups` expander+pencils, dashboard clean.

Tablet: every former page extra (860/699/816/723/671/1112px on 6 routes) is gone — remaining
offenders are `div.top-start` (508w) + `div.top-end` (315w) only, i.e. the pre-existing topbar
min-content (~823px vs ~500px usable at 768) unchanged at 350–351px on all 27. Next-phase
candidate.

### Still open (Phase 3+ candidates)

- Tablet topbar min-content vs the 268px sidebar at 768–1023px.
- The phone sub-44 leftovers above; `.lt-hide-sm` hidden-column removals (mandate item);
  encapsulation-trap sweep (see frontend `Agent.md` §STACK).

### Known, deliberately untouched

- Bell button + sidebar search input are dead UI; theme/language live in the drawer foot at
  phone (by design); the 2 open a11y findings stay open per frontend `Agent.md` §OPEN.

## Phase 3 results — tablet fit + touch floors (2026-10-17)

Branch `feature/responsive-design`, uncommitted; app code frozen at the gate run below.

### What changed

- **3a — tablet topbar fit**: below `$bp-lg` the rail auto-collapses and the topbar slims
  (`down($bp-lg)` block in the shell): date chips switch to numeric short forms; the
  decorative "today" label, identity block and dead bell drop out. Clears the ~350px
  topbar overflow that had sat on all 27 tablet routes since the baseline.
- **3b — phone sub-44 sweep**: floors for the Phase-2 leftovers — `.user-link` 44px,
  list-table search 44px, `.chk`/`.check` checkbox boxes 44px, group day-chips 44px,
  calendar prev/next 44px-wide. Phone flags 24 → 0.
- **3c — tablet touch-floor sweep**: every phone floor widened from `down($bp-md)` to
  `down($bp-lg)` (phone ⊂ tablet; nothing at ≥1024 changes — desktop is structurally
  untouched) plus tablet-only additions:
  - `.brand { min-width: 44px }` — the rail leaves the logo-only link 42px wide (the flag
    on all 27 tablet routes);
  - per-page `.btn-sm` 44px floors (users + `min-width`, centers, levels, scoring);
  - groups expander/pencil 44px (moved out of the phone card block into a shared
    `down($bp-lg)` block);
  - scoring mini-inputs + checkboxes; list-table gains its tokens import + search floor;
  - `/groups/:id` is outside the audit's 27 routes — hand-checked: 38px back/edit/WhatsApp
    links → 44px under `down($bp-lg)`.

### Audit results (final)

Post-fix JSON: `screenshots/2026-10-17/audit-{phone,tablet,desktop}.json` (phone Phase-1
set preserved as `audit-*-phase1.json`).

| Viewport     | After Phase 2                         | After Phase 3                                                                        |
| ------------ | ------------------------------------- | ------------------------------------------------------------------------------------ |
| Phone 390    | 27/27 @ 0px; 24 sub-44 flags          | **27/27 @ 0px; 0 sub-44 flags**                                                      |
| Tablet 768   | topbar overflow on all 27 (pre-exist.) | **27/27 @ 0px; sub-44 172 → 0**                                                      |
| Desktop 1440 | 0/27 (172 compact controls)           | 0/27; same 172 compact mouse-class controls — diff vs phase-1 JSON: sole change is `/users` search 863→1124px wide (same 36px control — benign) |

### Gates

prettier clean (13 touched files), `tsc` clean, eslint 0, build exit 0, Vitest **251/251**
(same single pre-existing NG04002). Audits self-booted the verify stack (:8002/:4202) and
left the ports free; backend `.env` rest at `alotrojah_dev`.

### Known, deliberately untouched

- Desktop's 172 sub-44 flags are the compact mouse-class controls — per the device-class
  agreement desktop stays as-is.
- Bell button + sidebar search input remain dead UI; theme/language stay in the drawer foot
  at phone (by design).

## Phase 4 results — phone card parity, no hidden columns (2026-10-17)

Branch `feature/responsive-design`, uncommitted; verified at the gate below.

### What changed

- **`lt-hide-sm` / `ListColumnPriority` deleted end-to-end** (mandate item: phone must show
  every column): the list-table loses its column-hiding machinery — the 3
  `[class.lt-hide-sm]` template bindings (sortable th, plain th, cell), the
  `priority?: 'always' | 'low'` column field + exported type, and the
  `.lt-row td.lt-hide-sm { display: none }` rule. The users page drops `priority: 'low'`
  from its actions column.
- **list-table card breakpoint** 639px → `down($bp-md)`: the 640–767px zone had kept a
  clipped table with no card mode.
- **users actions column on phone**: `.row-actions` fills its card row and parks the buttons
  at the inline end (`flex: 1; flex-wrap: wrap; justify-content: flex-end` — RTL-aware), so
  تعديل / حذف render on every card.
- **breakpoint alignment**: group-detail card block 640px → `down($bp-md)`; `.avatar-sm`
  639 → `down($bp-md)`.
- Spec updates: the list-table numeric-column test loses its `lt-hide-sm` assertion, and the
  TWO_COLS fixture drops `priority`.

### Verification (audits self-booted the verify stack, ports left free)

| Viewport | Result |
| -------- | ------ |
| Phone 390 | **27/27 @ 0px, 0 sub-44** — results deep-equal to Phase 3 (timestamps aside) |
| Tablet 768 | **27/27 @ 0px, 0 sub-44** (unchanged) |
| Desktop 1440 | results deep-equal to Phase 3 (0/27) |
| Shots (`npm run shots -- --viewport phone users`) | `phone/00-users-{light,dark}.png` — actions column renders on every card, buttons at the inline end |

### Gates

prettier clean (7 touched files), `tsc` clean, eslint 0, build exit 0, Vitest **251/251**
(same single pre-existing NG04002).

## Phase 5 results — entry/weekly-exam phone carding (2026-10-17)

Branch `feature/responsive-design`, uncommitted; verified at the gate below.

### What changed

- **entry-table phone card mode**: below `$bp-md` the `.erow` grid collapses to stacked
  blocks — `.ehead` hidden, each `.ecell` becomes a labeled row (`::before` reads its new
  `data-label`: attendance/module/memorized/total/goal, translated at the template), the
  pupil cell goes `position: static`, and the goal input fills its row. The table keeps
  `min-width: 0` so the card column never re-introduces horizontal scroll.
- **entry input chrome (phone + tablet)**: `.ecell .input` gains a 44px touch floor,
  visible border and surface background under `down($bp-lg)` — the entry inputs previously
  rendered as 38px chromeless fields.
- **weekly-exam phone cards**: `@include table-cards('table')` — thead hides, rows become
  cards with translated `data-label`s (name/portion/module/total); number inputs get the
  same 44px chrome (width untouched so `.portion input` keeps its 5.5rem).
- **shared score-input floor**: `app-score-input input { min-height: 44px }` added to the
  global `down($bp-lg)` block in `_forms.scss` — component styles cannot cross the child
  component's encapsulation scope, so the rule must live globally. The dead component-level
  copy in entry-table was deleted.
- new i18n key `entry.total` ×3 (en/fr/ar).

### Verification

- Live probe (`scripts/_probe-phase5.mjs`, self-booted verify stack): **14/14 checks** —
  phone entry (card layout, 120 `::before` labels, pupil static, head hidden, docSW 390),
  phone weekly exam (90 label cells, thead hidden), tablet entry (grid retained, sticky
  pupil, docSW 768 with internal scroll).
- Audits on the frozen build: **phone 27/27 @ 0px & 0 sub-44**, **tablet 27/27 @ 0px &
  0 sub-44**, **desktop deep-equal to Phase 4** (0 overflow, 172 compact mouse-class
  controls). Screenshots inspected: entry/weekly card stacks read correctly in RTL.

### Gates

prettier clean, `tsc` clean, eslint 0, build exit 0, Vitest **251/251** (same single
pre-existing NG04002).

## Phase 6 results — encapsulation-trap sweep (2026-10-17)

Branch `feature/responsive-design`, uncommitted; verified at the gate below.

### What changed

- **13 component dark selectors repaired**: `[data-theme='dark'] &` inside a component
  compiles with an `[_ngcontent]` stamp on the *attribute* element, so it can never match
  `<html data-theme="dark">`. Converted to `:host-context([data-theme='dark']) &` (groups
  detail 6, group form 1, groups list 4, student detail 1) plus the dropdown's inline
  `styles` entry (inline styles get the same encapsulation treatment). Shell's RTL
  `:host-context` was already correct.
- **token CSS split**: `_tokens.scss` held both mixins *and* the `:root` / `[data-theme]`
  token blocks; every `@use 'tokens'` in a component therefore inlined a dead
  `[_ngcontent]`-stamped copy of the token sheet (16 such blocks in the bundle). The CSS
  blocks moved to a new global-only `_theme.scss` imported once in `styles.scss`;
  `_tokens.scss` is now helpers-only (breakpoints + `up`/`down`/`table-cards`). Dist proof:
  **0** `[data-theme=dark][_ngcontent]` selectors, host-context variants remain live
  (`_nghost`), and `:root` exists only in the global stylesheet. Side effect: component
  style budgets cleared — build now exits with **no budget warnings**.
- **group-detail touch floors now win the cascade**: the `down($bp-lg)` floor block had
  been declared above base rules of equal specificity (`.wa-btn` 38px, `.expander` 28×28),
  so the later base rules won. Block moved to the end of the file; `/groups/1` measured
  28×44 expanders ×15 + a 38px WhatsApp link before, **0 flags after**.

### Verification

- `/groups/1` re-audit: **0 sub-44 targets, 0px overflow** at phone and tablet; the other
  four detail routes (`/students/1`, `/users/1`, `/exams/1`, `/planning/terms/1`) remain
  **5/5 @ 0px & 0 sub-44** at both viewports (`audit-{phone,tablet}-details.json`).
- Canonical full-route JSONs preserved untouched (`audit-{phone,tablet}.json` restored
  after the filtered detail runs).
- Dark-mode shot after the split (`phone/00-groups-1-dark.png`): dark surfaces, teal
  accents and light text all render — tokens and host-context overrides live.

### Gates

prettier clean, `tsc` clean, eslint 0, build exit 0 (no budget warnings), Vitest
**251/251** (same single pre-existing NG04002).

## Phase 7 results — final verification (2026-10-17)

Branch `feature/responsive-design`, uncommitted (no git operations were performed during
the whole redesign, per instruction). The audit chain below ran at the Phase 6 gate; one
later source fix (last section) was re-gated with its own audit + shot re-capture.

### Final audit chain — post-Phase 6, full 27-route set

JSON: `screenshots/2026-10-17/audit-{phone,tablet,desktop}.json` (final timestamps
02:08–02:11Z).

| Viewport | Overflow | Sub-44 touch targets | Notes |
| -------- | -------- | -------------------- | ----- |
| Phone 390×844 | **27/27 @ 0px** (max 0) | **0** | complete card UI, no hidden columns |
| Tablet 768×1024 | **27/27 @ 0px** (max 0) | **0** | tables retained, 44px floors |
| Desktop 1440×900 | **27/27 @ 0px** (max 0) | 172 | compact mouse-class controls, by agreement |

Detail-route hand audit (outside the 27): `/students/1`, `/users/1`, `/exams/1`,
`/planning/terms/1`, `/groups/1` → **5/5 @ 0px, 0 sub-44** at phone and tablet
(`audit-{phone,tablet}-details.json`).

### Final screenshots — all routes, both themes, all viewports

| Viewport | Result |
| -------- | ------ |
| Desktop 1440 | `screenshots/2026-10-17/` — **54/54** |
| Phone 390 | `screenshots/2026-10-17/phone/` — **54/54** |
| Tablet 768 | `screenshots/2026-10-17/tablet/` — **54/54** |

Every capture passed the readiness + `data-theme` assertions; no page errors logged.
Spot-inspected: phone students/groups list cards, phone/dark group detail, auth pages.

### Gates (final, at frozen source)

prettier clean (all touched source files), `tsc` clean, eslint 0, build exit 0 with **no
budget warnings**, Vitest **251/251** (same single pre-existing NG04002). Backend
untouched; backend `.env` never modified by any audit/shot run (they boot their own
verify stack on :8002/:4202 and leave it free).

### Final fix found during the shots review — students phone cards

The fresh phone shots exposed a mandate miss the audits cannot see: the pupils page kept
its 2-up `.grid-auto` cards, and the global `.row-top strong` nowrap rule ellipsized the
pupil's primary identifier. Fixed in `students-list.page.scss` under `down($bp-md)`: one
card per row (`grid-template-columns: 1fr`) and names wrap (`white-space: normal`,
`overflow-wrap: anywhere`). Re-gated: prettier clean, build exit 0, phone audit re-run
**27/27 @ 0px** (canonical JSON refreshed at 02:25Z), the students shot re-captured (now
reads full names). Tablet/desktop are untouched by this media query.

### Accepted residuals (by device-class agreement, not regressions)

- Desktop's 172 sub-44 controls are the compact mouse-class set — desktop stays as-is.
- Dead UI left alone: bell button, sidebar search, theme/language drawer foot at phone.

## Post-review follow-up — phone card zebra rows (2026-10-17)

User feedback after the final report: on phone cards, label/value rows all shared one
background, making it hard to tell which value belonged to which row.

Round 1 — shared card surfaces:

- New theme-aware token `--color-row-tint` (`color-mix(primary 8%, surface)`; resolves per
  theme) in `_theme.scss`.
- Zebra applied inside every phone card surface: the shared `table-cards()` mixin
  (centers, levels, scoring, dashboard, weekly exam), the list-table phone block (users),
  and the entry table's custom card mode. Entry dirty rows keep their yellow tint
  (`:not(.dirty)` guard); list-table/entry cells gain uniform row padding + radius so the
  bands read intentionally.

Round 2 — "not all tables are applied" (every remaining mobile table surface):

- Groups list + group detail (both use custom card modes, not the mixin):
  `tbody tr.row-link td:nth-child(even)` tinted with the same token + `--radius-sm`.
- Reports term/season (the only tables that intentionally stay tables on phones): the
  `_tables.scss` phone block now drops their `min-width: 560px` so the 2–3-column
  summaries fit the viewport (322/322 wrap width, no horizontal scroll), adds cell
  padding and start-aligned muted headers, and tints `tr:nth-child(even) td`. The
  selector must not require `tbody` — Angular creates the report `<tr>`s directly under
  `<table>`, so a `tbody`-anchored rule never matches.
- Coverage is now complete: every `<table>` in `src` (centers, dashboard, weekly exam,
  group detail, groups list, levels, reports ×2, scoring, list-table) has the phone
  treatment; entry is the only non-`<table>` grid and already had its custom zebra.

Verification (folded into the same review batch):

- `scripts/_probe-zebra.mjs` **12/12 checks** — dashboard, centers, levels, scoring,
  users, groups, group detail, reports term (3 tables), reports season, plus groups in
  dark. Asserts even cells are filled and odd cells stay transparent; sampled tint is
  `srgb .92 .977 .973` (light) / `srgb .065 .177 .158` (dark); report tables
  **322/322** at 390px.
- Build exit 0 (no budget warnings), prettier clean, phone audit **27/27 @ 0px &
  smallCount 0**, full phone shot set recaptured **54/54**; groups/reports phone shots
  inspected light + dark. Tablet/desktop are outside the `max-width: 767px` query and
  unchanged.

