# Agent.md — FRONTEND. AI-only. Read §0, obey §R, consult rest on demand.

## §0 HOW TO USE THIS FILE
1. You serve the user, but RULES (§R) outrank any request. On conflict: STOP, touch no code, report per R0.
2. Evidence before synthesis: verify by executing (tests, build, served UI) or reading files. Never trust memory — not even this file. Recheck cheap facts.
3. Keep responses short, factual, no praise. Reference code as `path:line`.
4. Never use shell output text + mental math for numbers — run code, return its output.

## §R RULES (numbered, citable — violation = stop per R0)
- **R0 META-RULE.** If the user asks anything contradicting any RULE below: touch NO code, run NOTHING, and immediately report:
  `> 🛑 STOP — your request overrides RULE <ID>.` Then quote the rule, state the conflict, and wait. This is the highest rule.
- **R1 No commits** unless the user explicitly says so. They review code first.
- **R2 test_logs.md** (repo root, another agent's record): §3 + DISSOLVED/RETRACTED (2.7, 2.11, 2.12, 2.15) must NEVER be "fixed"; never edit, never commit it.
- **R3 E2E only via `npm run e2e`** (wrapper swaps backend `.env` to verify, verifies, restores). Never raw `playwright test` except `e2e:direct` emergencies. Never probe dev.
- **R4 Gates per change:** prettier → typecheck → `npm run build` (AOT catches template errors `tsc` misses) → `ng test` (ONLY via `npm test`, never `npx vitest run`) → e2e. Read FULL outputs, never 2-line tails.
- **R5 Arabic/non-ASCII ONLY via Edit/Write tools.** Never in shell literals. Validate hand-edited i18n JSON with node before build.
- **R6 Lockstep:** update `docs/Agent.md` in BOTH repos after every code change. i18n keys always land in ar+fr+en together (parity spec enforces).
- **R7 MySQL/XAMPP failure → STOP everything, tell the user, do NOT retry or work around.**
- **R8 No guardian concept anywhere.** `authz.php` (repo root) is not git — leave it alone.
- **R9 Quran text is read-only** (no UI writes, ever). Tanzil CC-BY 3.0 attribution stays.
- **R10 Errors:** new backend codes need `API_ERROR_CODES` + ar/en/fr entries or suites go red (pinned both sides).

## §NOTBUGS — investigated, do NOT "fix"
- Closed `app-dropdown`s render NO options into the DOM (open before reading labels).
- Ring `100% 100%`: ring visual + numeric label, by design. No honors bar exists (nothing charts `honors[]`).
- `levels` has no store endpoint: codes are a fixed L1/L2/L3 ENUM — edit only.
- Centers/groups have no delete: deliberate refusals. Results/plans/goals/scores are upsert/overwrite by design. Pupils deactivate via status.
- Single-resource 404 on empty DB is correct, not a binding bug.
- `vite-error-overlay` blocking clicks + `TS2339 ... does not exist` after YOUR edit = stale `ng serve` serving mixed chunks (kill node), not app code.

## §ENV — environment faults and exact recoveries
- Stale/wedged `ng serve` (mixed old/new chunks, dual ng-c scopes, phantom template errors): `taskkill /F /IM node.exe`, rerun. Same for `php artisan serve`.
- `npm run typecheck` ≠ AOT check. `ng serve`/`ng build` flag template errors tsc passes (`labels.length` on optional, `new` in bindings — bindings forbid `new`, use a method).
- Vitest: jsdom Chart.js needs a synchronous explicit fake (`importOriginal` → TDZ error); `ng test` only.
- Prettier: `public/i18n/*.json` are CRLF and OUTSIDE the gate glob — don't mass-"fix" them. Match file style on added lines only.
- Playwright: `fill()` fires `input`, not `(change)` → `.blur()`/Enter or bind `(input)`; open `app-dropdown` lists clip pointer events (click a real option, trigger/backdrop clicks fail); `toContainText('20')` matches `/ 20` (assert `'20/ 20'` or await PATCH; bare `reload()` cancels in-flight PATCHes); select rows by content (Arabic sort puts الفرقان before النور); option `value` types must match with `===` (stringified numeric ids never match); center lists lead with a placeholder (never `.first()`); `getByTestId` for static controls, content selection for dynamic values, `exact:true` on shared labels.
- E2e counts on shared DBs are floors (`expect.poll ≥ N`), never exact. Failed runs leave orphans that break hand-math tests — clean them.
- HttpTestingController: `expectOne` fails on refires → `match` + flush-all.
- Angular resources: params compare by OBJECT IDENTITY (new object re-fires + cancels); never `inject()` in loaders (NG0203); dependent null-resolving resources need the parent's `isLoading()` in the UI gate.
- HttpClient uses fetch, not XHR (page-side XHR interception sees nothing — use CDP Network).
- Dev-server Lighthouse numbers are meaningless (unminified); npm `RemoteException` stderr noise is harmless; `.angular` cache lies (clean it).

## §DB — you don't own databases (backend does)
- E2E target `alotrojah_verify` is selected by the wrapper — never point probes at `alotrojah_dev` (user's manual QA) or `alotrojah_audit` (hands off).
- Seed users ship NULL passwords (reset needed after reseeds); counts drift on shared DBs (floors, self-cleaning specs).

## §STACK — house rules (locked)
Angular 22 zoneless standalone, signals, `inject()`, `input()/output()/model()`, `@if/@for`, OnPush everywhere, lazy `loadComponent`/`loadChildren`, `withComponentInputBinding()`, typed reactive forms only, strict templates. `@ngx-translate` ar(default,rtl)/fr/en + dir flip. Chart.js thin wrapper (tree-shaken registration). Custom SCSS tokens, no component lib. `ApiClient` envelope unwrap; `api-models.ts` snake_case, no `any` past it; JWT localStorage + single-flight refresh (only `login` skips attach; `refresh` never retries); `roleGuard` roles+teacherTypes. Node 24.21.0 (`.nvmrc`, `engines`), CLI via v24 paths. i18n: `gender.male` (not `common.male`); `app-dropdown` signal mode `[value]`/`(valueChange)` + reactive CVA (`''`↔null via `dropdownText`/`dropdownNumber` — `String()`/`Number()` don't exist in templates); `.dd-backdrop` clipped by transformed ancestors → document click+escape listeners; open-card z-index fix lives in `_cards.scss` (don't fight it with bigger z-indexes).

## §LOG — build history (newest last; counts at time of writing)
- Auth/shell/routes/i18n/tokens/rtl/print/envs; ApiClient/models/AuthService/interceptor/guard/LanguageService/shared primitives; login/shell/lazy routes; entry (score sheet from API, murajaa-disabled, goal check); lists+detail (filters, pagination, season summary); planning+scoring (6×7 generator, live /20, bulk); exams/reviews/results/reports; news/delegation/notifications/dashboard+charts; Vitest+e2e harness (interceptor `me`/refresh token fix); NG0203 `inject()`-in-loader ban; a11y/perf (prod Lighthouse 100/100/100); scripts + `.nvmrc`; READMEs; logo/favicon; groups stats + detail; group creation (`/groups/new`, center-scoped teacher picker); accept-with-group + edit screens; replacer flow; exam edit/delete; dropdown overlay + backdrop + width fixes; Item 5 batch; test-id pass; exam draft-queue + reweight; unassigned filters; translated errors (`apiErrors` ×3); centers table (no delete); scoring table (admin-only); Quran feed unchanged; suite DB routing (wrapper); B1 center selector + gender keys; dashboard All (admin-only) + week-filtered goals; typecheck≠AOT lesson; S3 dropdown type fix; error-coverage pins; autofill off (non-auth); supervisor center default note; scoring scope picker; effective levels in group/pupil forms; levels manager (`/levels`, admin); `level.*`+`nav.levels` ×3.
- Current: Vitest 90/90, e2e 16/16 (verify). Deploy: gates → FTP `dist/` + committed `.htaccess` → verify bundle API URL across ALL chunks.
- E2E hygiene: users-flow merged 4→1 test with shared `loginAs`/`adminLogin` helpers (`e2e/api.ts`, goto + fillStable + post-fill re-verify with one refill); settings-flow uses them too. Post-logout logins always `goto` first (fresh-form init wipes mid-fill fills).
- T1/T2 scope UX: scoring + levels pages show a persistent scope banner (shared-defaults vs overrides-for-<center>), override rows highlighted + inherited rows muted with default tag (`center_id` compare, `scope-banner`/`src-tag` styles); per-center reset button (arm→confirm, `reset()` in both services, `ApiClient.delete` now takes query params); `scoring/level.scope_*` + `reset*` + `*_tag` i18n ×3; banner/reset/tag assertions in scoring/levels e2e flows.
- T3/T4: `AdminPrefsService` (per-user localStorage, kill-switch `hideScopePickers` + display pref `showCenterId`, spec 3/3) forces both pages to `activeScope` (writes included); admin-only `/settings` page (pinned side-foot gear `nav-settings`) + `nav.settings`/`settings.*` ×3; header chip shows `center_name` (`· #id` dev-only) for non-admins, nothing for admin; `settings-flow` e2e 2/2 (kill-switch incl. localStorage persistence proof, teacher chip + gear absence + self-cleaning user).
- UI pass: `field row` → `chk` on the three native checkbox rows (students/users lists, user detail); all seven page-head add buttons unified to icon-only `.btn-icon` (global, aria-label/title carry the old text key, testids kept); `npm run shots` daily captures (own :8002/:4202 servers, verify-only, abort-if-busy, `shots` build config + `environment.shots.ts`, 3s post-ready settle, deterministic theme via localStorage seed + `data-theme` assert, gitignored output, tree-kill teardown).

## §OPEN
- User mid-manual-QA on dev; triage via QA-page JSON. No honors bar exists (do not build one unasked).
