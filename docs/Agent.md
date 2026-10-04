# Agent.md — Project Reference (Quran Memorization App)

> Read this file first in any new session. It holds every decision made so far.
> Details of the meeting live in `questions.md` (same folder). SQL files live in `alotrojah_Backend/docs/database/`.

## 1. What this is
- App for a **non-profit Quran memorization association in Morocco** (one association, currently one center; DB supports many).
- Digitizes a paper **memorization logbook** ("البرنامج المقترح لحفظ القرآن الكريم — فئة غير المتفرغ").
- Reference inspiration: `https://ahlquran.com/`. Domains: app **`https://alotrojah.ma/`**, API **`https://api.alotrojah.ma/api/v1`** (subdomain, not subfolder — CORS `FRONTEND_URLS` must list the app origin on host).
- Users: association **manager** (PC), **3+ teachers** (smartphones only, 3G/4G + *6 social pack), **students use their own account** (same interface, role-scoped — no separate guardians space).
- Maintainer after delivery: the developer (me). MVP deadline: **1 month**.

## 2. Tech decisions (locked)
- **Backend: Laravel** (API). **Frontend: Angular**, mobile-first UI (teachers on phones).
- **DB: MySQL 8**, `utf8mb4 / utf8mb4_unicode_ci`. Import: `quran_memorization_db.sql` then `quran_seed_data.sql`, verify with `quran_check_queries.sql`.
- **i18n: ngx-translate**, 3 JSON files `ar` (default first), `fr`, `en`.
- **No paid WhatsApp API.** Use `wa.me/<phone>` deep links with student numbers from DB (WhatsApp is effectively free for them).
- CORS: `FRONTEND_URLS` env (comma-separated, supports dev ports + prod domains). Verified live: `https://alotrojah.ma` and `https://www.alotrojah.ma` echoed, unknown origins rejected. On host set it to exactly the app origin(s).
- Schema now lives in **Laravel migrations** (9-migration baseline in `alotrojah_Backend/database/migrations` reproducing `quran_memorization_db.sql` exactly — 26 tables, CHECKs, idx_s12_* indexes, 11 views; dev DB registered them as batch 1). The SQL dump stays as the docs copy. Do NOT recreate/delete the old SQL migration chain v1→v5 (consolidated away).

## 3. Pedagogy model (from manager + teachers — do not re-ask)
- **Two student types:** children (+4) and adults (+18) → `students.student_type`.
- **Two memorization modes per student:** by **thumn** (1 hizb = 8 thumn; also rubu/nis f variants) or by **surah+ayah range** (e.g. Baqarah 1–5, full Nas) → `students.memorization_mode`, `memorization_logs.log_mode`.
- **Weekly goal, not day counting:** 3 sessions/week default (Mon/Wed/Fri, editable per group → `groups.schedule_days`); teacher checks goal completion → `weekly_goals.is_completed`.
- **Two teacher types:** `hifz` (enters hifz/tajwid/mowathaba/sarraj per session) and `murajaa` (enters ONE official review score /20 per cycle covering **1–3 weeks**, depending on memorized amount) → `users.teacher_type`, `murajaa_reviews` (span enforced by CHECK). Same page, inputs enabled/disabled by type.
- **Review week:** default template = **6 terms × 7 weeks (6 study + 1 review/quiz) = 42 weeks / 126 sessions**. Fully editable rows (`weeks.week_type`, `sessions.session_type`); manager may do e.g. 4+1. Template = Laravel "new season" button, NOT database constants. Any term count allowed (7+).
- **Delegation:** responsible teacher generates time-limited token link (15/30/60/120 min) sent via WhatsApp so another teacher can enter marks → `delegation_tokens`.
- **Announcements page** with audience `all / teachers / manager / my_students` → `announcements`.
- **Honor board** (`tashji3/انتبه`): decided by teacher AND manager; gifts + family called; final notes sent via WhatsApp.

## 4. Scoring rules (locked — do not re-ask)
- Weekly total **always /20** = SUM of **active** weekly-total modules. Default: **hifz 14 + mowathaba 4 + tajwid 2**. Manager adjusts per-module maxes on a manager-only page; student view `v_scoring_check` must show weekly_total = 20.0.
- **Modular system:** new books (e.g. **السراج في بيان غريب القرآن**) = new `scoring_modules` rows. **R2 adopted:** sarraj is scored per session like hifz but has its **own separate /20 total** (`is_in_weekly_total=0`); weekly average = simple mean of its per-session /20 scores. Inactive modules are grayed/disabled in Angular AND excluded from every view (`is_active=1` filters).
- **Mowathaba /4 is MANUAL per-session input** by the hifz teacher. Never auto-derive from `attendance` (that table is an independent presence register).
- **Murajaa official score /20** comes from `murajaa_reviews` cycles (numeric only — the old جيد جدا/جيد scale is dead). `revision_logs` = optional per-session practice only.
- **Final average formula:** `(avg_murajaa + avg_weekly + SUM(term quiz avgs incl. final)) / (2 + n_terms)` → default 6 terms = ÷8. Computed in Laravel from `v_student_season_avgs` + `v_term_quiz_avgs`. Never hardcode term count.
- Exams: flexible question count; questions generatable as starting ayat from a thumn/hizb, teacher/manager reorders (`sort_order`).

## 5. Database map (26 tables, 11 views)
- **People/org:** `users` (roles: admin/supervisor/teacher/student/board — examiner merged into teacher, any teacher examines via `exams.examiner_id`; id=1 global admin, `center_id` NULL), `centers` (exactly 3 in seed, isolated), `levels` (L1/L2/L3 from book), `groups`, `students`.
- **Calendar:** `academic_seasons`, `terms`, `weeks`, `sessions`.
- **Planning:** `term_plans` (thumn range OR surah range via `plan_mode`), `weekly_goals`.
- **Scoring core:** `scoring_modules`, `session_scores` (UNIQUE student×session×module), `memorization_logs` (amounts + ranges only, NO score columns), `revision_logs`, `murajaa_reviews`, `attendance`.
- **Exams/reports:** `exams`, `exam_questions`, `term_results`, `season_results`.
- **Features:** `delegation_tokens`, `announcements`, `notifications_log`.
- **Reference:** `quran_verses` (6236, Tanzil CC-BY 3.0 — `reference/surahs` feed shape unchanged), `quran_hizb_reference` (60).
- **Views (Chart.js):** `v_session_totals`, `v_weekly_progress`, `v_weekly_murajaa`, `v_attendance_rate`, `v_term_quiz_avgs`, `v_student_season_avgs`, `v_separate_module_avgs`, `v_murajaa_cycles`, `v_scoring_check`, `v_season_dashboard`, `v_announcements_feed`.
- **Isolation invariant:** every operational row belongs to exactly ONE center (`users.center_id` scalar; students/groups linked). Audit queries A2/A3/A4 in check file must return 0 rows.

## 6. Seed demo data (what's in the DB now)
- 3 centers (Nour/Algiers, Forqan/Oran, Ihsan/Constantine), 22 users (1 admin, 3 supervisors, 9 teachers, 9 student accounts), 5 groups, 9 students (4+2+3) — 2 students + 1 teacher kept from registration-flow testing (ids 37/38, users 67-69), zero fact rows.
- Students 3 (Baqarah) and 6 (Nas) demo **surah mode**; rest thumn mode.
- Sessions 1–6 logged (42 logs, **168** session_scores incl. sarraj), 3 murajaa cycles by review teacher id=19, mixed attendance (1 absent, 1 late, 1 excused in center 3), 10 exams / 44 questions, 7 term + 7 season results, 1 token, 3 announcements, 4 goals, 2 notifications.
- Center tiers for chart testing: center1 high (~18), center2 medium (~14), center3 low (~12).

## 7. Conventions for code work
- Amounts: hizb `DECIMAL(4,1)` (1.0–60.0), thumn amounts `DECIMAL(5,2)`; 1 hizb = 8 thumn.
- Scores `DECIMAL(4,1)`; exam question scores `DECIMAL(4,2)`; all bounded 0–20 (or module max).
- Every fact row carries `student_id, season_id, term_id, week_id, session_id, (log_)date` — keep this chain on any new fact table.
- Qualitative book checkboxes are `ENUM`s; measurable things are numeric. Never store plannable quantities as free text.
- Status/type changes by UPDATE, never DELETE (students, users, groups).
- New schema changes → **Laravel migration files**, keep SQL dump files untouched unless explicitly asked to regenerate.

## 8. Open / pending (not blockers)
- Real student Excel from association (pending) → import script; live season already started (fasl 1 ends ~3 weeks after meeting).
- Old paper دفتر totals: import only if manager provides them, else fresh start.
- Cross-center comparison pages: allowed (used to motivate students via WhatsApp) with PDF/image export + WhatsApp share button.
- Reports printable like book pages, but freedom to improve layout.

## 9. Backend build log (S1 → …)
- **S1 (done):** PHP 8.4.25 (winget) + Composer 2.10.3. Gotchas: winget PHP `extension_dir` pointed at `C:\php\ext` (fixed in php.ini); enabled mbstring/pdo_mysql/openssl/fileinfo/tokenizer/sodium/curl/zip. Shell sessions load stale PATH → prepend real dirs every call. User terminal is fine after restart (registry PATH correct).
- **S2 (done):** `alotrojah_dev` on XAMPP MariaDB 10.4.32 (root/no-password). Dedicated user `alotrojah` (see S3 summary for password — stored in backend `.env`, never root). **Encoding lesson:** importing SQL via PowerShell `Get-Content | mysql` DESTROYS Arabic (stored as `?`, HEX `3F…`). Always import via .NET UTF-8 read → no-BOM temp file → mysql `SOURCE` with `--default-character-set=utf8mb4`. Verify with `SELECT HEX(name_ar) FROM surahs WHERE id=2;` → must be `D8A7D984D8A8D982D8B1D8A9`. If the main HeidiSQL DB shows `3F…`, re-import it the same way.
- **S3 (done):** Laravel 12.69.2 in `alotrojah_Backend` (temp-dir + move, `.git`/docs kept). `.env`: `alotrojah_dev`, timezone `Africa/Casablanca`, `CACHE_STORE=file` + `QUEUE_CONNECTION=sync` (L12 DB defaults need framework tables that don't exist). PowerShell `-replace` needs `(?m)` + `#\s?` for commented `.env` lines.
- **S4 (done):** 18 enums (DB values + Arabic `label()`), 27 schema-generated models (fillable/casts/relations/scopes; hand-fixed: relation-class bug, missing `center()` relations where no FK exists). Base API controller, `ForceJsonResponse`, real `ScoringService` / `SeasonTemplateService` (42-week) / `DelegationService` / `DashboardService`, `CenterScoped` + Student/Group policies, Student request/resource exemplars, `SessionScoreObserver`, `/api/v1` skeleton.
- **S5 (done, live-tested):** JWT via `php-open-source-saver/jwt-auth` (needed `ext-sodium`). Password column is `password_hash` → `User::getAuthPassword()` overridden; claims = role/center_id/teacher_type. login/me/refresh/logout + 401s verified. L12 `redirectGuestsTo` default calls `route('login')` → overridden to `null` for JSON 401s.
- **S6 (done, live-tested):** users/centers/groups/students CRUD, center auto-forcing, cross-center 403s, validation 422s. Fixed: `center_id` must be nullable in store rules (controller forces it); added missing relations.
- **S7 (done, live-tested):** bulk attendance + module scores (max from DB rows, murajaa-teacher 403, all-or-nothing), follow-up page endpoint, weekly-goal upsert. Sarraj correctly excluded from /20 total (18.0 for 13+3+2+17).
- **S8 (done, live-tested):** season template generation, 42-week default verified (mini-template counts exact), activate switching, module bulk rebalance guarded to sum 20 (422 + rollback), term-plan hizb/ayah validation, reference feeds. **Rebuilt dev DB once** due to the encoding lesson above; dev passwords re-set (admin/supervisor/teachers/murajaa = `password123`, dev only).
- **S9 (done, live-tested):** murajaa cycles (span 1-3 enforced, hifz-teacher 403) + revision practice rows; exams (conducted by teachers — examiner role later merged, see post-S13 note) + flexible bulk questions with dup/ayah validation and auto-recomputed `overall_avg`; term/season result upserts (honor teacher+manager); delegation full cycle — generate (responsible only) → redeem (binds first teacher) → cross-center score allowed → revoke → blocked again. `DelegationService::canActAs` integrated into `ScoreEntryService`. Fixed: `Exam::questions()` alias (generator named it `examQuestions`), generated-column `.fresh()` for `weeks_covered`, GroupPolicy `generate` alias (Gate resolves policy by model class). Test-only: login throttle is 6/min (hit it during rapid tests).
- **S10 (done, live-tested):** announcements with visibility matrix (`Announcement::scopeVisibleTo`: all/staff-same-center/manager-admin+supervisor/my_students-group; admin-authored = global); notifications with `wa.me` links + sent/failed marking; dashboard endpoints (season/weekly/center/final with transparent components+divisor — hizb_completion excluded from final by design); composite term/season report endpoints for print pages. Fixed: `stdClass::toArray` in centerCards, final divisor filter, global-author visibility. Verified final math by hand: (18+18.25+17.6+17.43)/4 = 17.82 ✓.
- **S11 (done, live-tested):** security pass. No hardcoded secrets (grep clean). `config/cors.php` created, locked to `FRONTEND_URL`. `CenterScope` global scope on Student/Group/User/Center (skips console/admin/board). Caught infinite recursion (scope → auth()->user() → scoped User query → scope…) — fixed with re-entrancy guard. Delegation bypasses scope explicitly in `ScoreEntryService` (verified cross-center entry still works post-scope). All dashboard/report inputs moved to FormRequests. Examiner role forced as own `examiner_id`. Throttle 30/min on bulk + redeem. Note: scoped route-model binding turns cross-center direct reads into 404 (safe). Console/tinker unaffected (7 students).
- **S12 (done, tested):** performance pass. Bulk paths preloaded, 8 composite `idx_s12_*` indexes (dev + dump), dashboard cached 300s with bust observers, PHPUnit 5/19 green, 130–160ms dev timings, queues stay `sync`, opcache on host (S14).
- **S13 (done, tested):** 24 tests / 57 assertions green (`PerformanceTest` + `PolicyTest` + `DelegationScoringTest`, transaction-wrapped). Tests caught 4 REAL issues: (1) the new `student` role was locked out of its own list (`viewAny` was staff-only — fixed); (2) `users.role` ENUM lacked `student` though code+meeting assume it (added: dev + dump + `Role` enum); (3) sarraj averages used `COALESCE→0` instead of NULL when inactive (fixed in 2 views, dev + dump); (4) duplicate policy imports (fatal only at runtime). Test-harness lessons: JWT guard caches its user per app instance → multi-user tests MUST use `actingAs()`, never two tokens; in-test console skips `CenterScope` so cross-center reads 403 via policy (live HTTP gives 404 via scope) — both safe, expectations annotated.
- Dev passwords: admin id=1, supervisor id=2, teachers id=3,5,7, murajaa id=19 → all `password123` (DEV ONLY, rotate before prod).
- **Pre-Angular gate (passed):** full PHPUnit suite 24/58 green + 24 live end-to-end checks green (auth→S11, incl. delegation cycle, final math, CORS, cross-center). Cleanup lesson: upserts on seed rows must be RESTORED afterwards (term_results/term_plans), created rows deleted — canonical counts: scores 168, attendance 42, goals 4, plans 14, reviews 3, tokens 1.
- **Post-S13 change - examiner role REMOVED (examiner = teacher):** `users.role` ENUM, `Role` enum, all policies/scopes/requests cleaned; `exams.examiner_id` column stays (holds the conducting teacher); seed examiners converted to teachers; 24 tests / 58 assertions green.
- **Swagger UI (done):** `dedoc/scramble` — `/docs/api` UI + `/docs/api.json`, 65 paths auto-documented, bearer scheme global (login marked public). Fixed: docs routes run `web` middleware whose DB session driver wrote into OUR `sessions` table → `SESSION_DRIVER=file` (also in `.env.example`). Prod: gate/disable docs (`RestrictedDocsAccess`).

## 10. Frontend build log (F1 → …)- **F1 (done):** Node 25.9 default too new (CLI warns/refuses odd versions) → installed Node **24.21.0 LTS** via existing nvm-windows, CLI **22.2.0** global under the 24 install. Project commands use the v24 paths explicitly; user default stays 25.
- **F2 (done):** `ng new` (SCSS, routing, zoneless, strict) moved into `alotrojah_Frontend` preserving `.git`/`docs`. Fixes: CLI did not write `strict`/`strictTemplates`, added explicitly; renamed project `alotrojah_new` to `alotrojah`. Verified: no `zone.js` dep, dev build green.
- **F3 (done, verified live):** `@ngx-translate/core@18` + http-loader + `chart.js` (no ng2-charts wrapper — version risk, own thin chart component later). `ar`/`fr`/`en` JSON under `public/assets/i18n` (shell/auth/nav/roles/status keys). Design system: `_tokens.scss` (green/gold, spacing, radius, mobile-first `min-width` breakpoints + `up()` mixin), `_rtl.scss`, `_print.scss` (book-faithful reports). `index.html` ar/rtl + Cairo font. `environments.{ts,prod.ts}` + prod fileReplacements. Gotchas: `provideTranslateLoader` is exported from CORE not the loader package; loader needs `() => new TranslateHttpLoader()` factory; launch dev-server via `cmd /c` wrapper (direct ng.cmd Start-Process fails silently). Verified: build green, serve 200, ar.json served with title.
- **F4 (done, build green):** core `ApiClient` (envelope unwrap, typed), `api-models.ts` (no `any` past it), `AuthService` (signals, single-flight refresh, APP_INITIALIZER session restore), `auth.interceptor` (Bearer + silent refresh, auth routes excluded), `role.guard` (roles + teacherTypes route data), `LanguageService` (ar/fr/en + dir flip + persist). Shared dumb OnPush primitives: spinner, empty-state, status-badge, score-input (model I/O). Standards: standalone only, `inject()`, `input()`/`output()`/`model()`, `@if/@for`, strict templates clean.
- **F5 (done, verified live):** login page (typed reactive form, 401 flag, spinner), shell (header + user chip + language switcher + logout, responsive bottom-nav/sidebar), home placeholder, lazy routes with `roleGuard` shell. Fixed: stale `TranslatePipe` import broke the build (strict catches it). Verified: build green, `/` + `/login` serve 200.
- **F6 (done, verified live):** daily entry — group/week/session pickers, attendance grid (4-state segmented), score sheet generated from `scoring-modules` API (inactive grayed, sarraj separate section, live /20 totals, murajaa sees disabled + notice), per-row goal check. Patterns: `resource({params})` (ng22 renamed `request`), computed edit-maps (no effects), `viewChild`-free parent refresh via `savedTick`. Backend gap fixed: teachers can now READ weeks/sessions (`viewCalendar`). Gotchas: missing `)` on `computed(` cascades weird errors — read tsc output head; stale `.angular` cache can lie (clean it). Verified: strict build green; live combos groups=2, group-students=2, weeks=42, week-sessions=3, modules=5; `/entry` serves 200.
- **F7 (done, verified live):** lists + detail — students (search + group/level/status/mode filters, pagination, detail with season summary + final + honor badge), groups cards; reference + dashboard API services; `withComponentInputBinding` for `:id`; nav extended per role. Gotchas: feature files are 2 levels deep (`../../core`, not `../../../`); hand-edited i18n JSON breaks easily (validate with node before build). Verified: strict build; live search=1, surah-filter respects center scope, all 4 routes serve 200.
- **F8 (done, verified live):** planning + manager scoring — seasons list/create (dynamic terms FormArray prefilled 6x7, 42-week default), activate, term detail (weeks list, study/review toggle, sessions inline date/status/type edit), plans page (student search, term select, thumn/surah toggle, ayah-max from surahs API, client range checks mirroring backend), scoring page (live sum-to-20 indicator, atomic bulk rebalance, add-book form). Shared badge extended with `week` kind. Verified: strict build; live terms=6, term weeks=7/sessions=3; all 5 routes serve 200.
- **F9 (done, verified live):** exams (list + new with student search, detail with inline score edit, add-question, auto average), reviews (cycles list + 1-3-week form, murajaa-only entry surfaced), results (term/season upserts with honor), printable term/season reports (`print-sheet` + print button, typed composites). Gotchas: `resource({params})` again; TS forbids direct `as` from `Promise<Record>` (typed the service instead); duplicate local interfaces removed. Verified: strict build; live exams=3, cycles=1, term result 18.47; all 8 routes serve 200.
- **F10 (done, verified live):** finale — news (audience targeting + group picker), delegation (generate with one-time link + wa.me share + copy, redeem page via `?token=`, revoke list), notifications outbox (queue, tap-to-send wa.me link, sent/failed, delete), dashboard (center cards + honors bar + attendance doughnut, per-student weekly bars) with thin `app-chart` wrapper (RTL tooltips, create/update/destroy). Home placeholder replaced by real dashboard. Verified: strict build; live news=3, center cards + honors + attendance, weekly=2 weeks; all 5 routes serve 200.
- **F11 (done, 26 unit + 3 e2e green):** Vitest suite (api-client envelope, auth login/logout/single-flight refresh, interceptor attach+refresh-retry, role guard matrix, language switch/persist/restore, badge classes, score-input I/O, score-sheet totals/sarraj-exclusion/save) + Playwright e2e (guest redirect, admin login → 7 students → 5 groups → charts → logout, reload persistence, read-only). REAL BUG caught by user report (not tests): interceptor excluded ALL `/auth/*` from the token, so `me()`/`refresh` went credential-less and every reload logged out. Fixed: only `login` skips attach; `refresh` never retries (loop-safe). Regression: unit (me/refresh carry token) + e2e reload test. `test:cov` fixed (`--coverage`, not Karma-era `--code-coverage`; needed `@vitest/coverage-v8`): 83.6% stmts / 84% branch / 62.9% funcs — pages mostly untested, acceptable pre-deploy. Compiler hygiene: zero NG81xx warnings (unused imports, needless `??` removed when spotted in e2e serve output). Caught over time: missing `provideTranslateHttpLoader()` (boot crash — build passes, only runtime shows it), dev CORS origins (browser-only failure), single-flight needed `shareReplay` (cold observable = N calls), unlabeled `<select>` breaks getByLabel (wrapped; also better a11y), e2e must target the right combobox (language switcher was first). E2E lesson: a test only guards visited pages — the NG0203 bug survived because e2e never opened /groups; row-count assertions on every list page now. Fixed a false alarm of mine: dashboard `seasonId` resource already returned a number — reverted my wrong "fix".
- **Post-F11 fix (from user console):** `inject()` inside `resource()` loaders throws NG0203 (loaders run outside injection context) — groups lists spun forever. Rule: always field-inject services, never `inject()` in a loader. Audited all features, clean.
- **F12 (done):** a11y + perf. Icon-only buttons labeled, `:focus-visible` ring, gold-dark for small text (contrast), chart `role=img` labels, score-input label. Lighthouse PROD build: performance 100, a11y 100, best-practices 100, SEO 82 (SPA-inherent; added meta description). Dev-server numbers are meaningless (unminified). Lesson: non-ASCII breaks in my SHELL strings (use edit tool for Arabic/symbols, never shell literals).
- **Scripts (done):** `package.json` best practice — `start`/`start:prod`, `build` (=prod) + `build:dev`, `test` (CI-safe, no watch) + `test:watch` + `test:cov`, `e2e`/`e2e:ui`, `format`/`format:check` (prettier, one-time normalization applied), `typecheck` (fast tsc). `.nvmrc` pins Node 24.21.0 + `engines: ^24`. Verified: format clean, typecheck clean, 25/25 tests green.
- **READMEs (done):** full guides in both repos (prereqs, setup, commands, env keys, API contract, deploy pointers). `.env.example` documents all AlOtrojah keys (timezone, FRONTEND_URLS, file/sync, JWT TTLs). Lesson: phpdotenv first-occurrence-wins + edit tool chokes on CRLF multi-line matches (use single-line anchors). Angular standards (signals, standalone, zoneless, @if/@for, OnPush, lazy routes, typed forms) from this file § developments — treat as law.
- **F13 (done, fix/priority-review):** review-fix pass — tree-shook the Chart.js registration in `app-chart` (smaller bundle), cleared the shell clock interval on destroy (leak), rewired the dashboard to live API data (dropped `DEMO_STUDENTS`). Docs synced: guardians removed everywhere (students own their accounts, no separate space — §1/§5/§6 + build logs), schema note points at the Laravel migration baseline (§2). Vitest now 38 tests / 12 files green.
- **F14 (done, feature/registration):** self-registration — backend `registration_requests` table + `POST /auth/register` (public, throttle 6/min) + admin list/accept/reject endpoints + feature tests; frontend register page (typed form, i18n, success state), admin approval page + nav item. Register page lives at `/register`; `/` routes to `/login`. Both auth pages share `styles/_auth.scss`.
- **F15 (done, mockup-verified):** register/login restyled to manager mockup (style-only; inputs/logic untouched) — split layout with teal/purple gradient stage (boosted saturation), glass gradient-border card (padding-box/border-box trick), gold-underlined title (i18n key `auth.create_account` = "Create new account"), gray rounded lock-icon password fields, segmented AR|FR|EN pills + filled-circle theme toggle top-left (`direction: ltr` + `inset-inline-start` — logical props resolve against the element's own direction), carousel nav buttons mid-left. Verified by headless screenshots (puppeteer-core + system Chrome; force theme via `localStorage alotrojah_theme`; Git Bash mangles leading-slash args — use `MSYS_NO_PATHCONV=1`).
- **F16 (done):** new app logo — `public/assets/logo.jpg` is the source of truth; sidebar brand is a white rounded tile (`brand-mark` 42px, `object-fit: cover`), `favicon.png` regenerated 64x64. The old logo is still baked into the auth carousel photos (`public/assets/auth/slide-1.jpg`, `slide-2.jpg`) — changing that needs new slide images.
- **F17 (done, unit + e2e green):** groups stats feature — backend added `GET /groups/stats` + `GET /groups/{id}/detail` (feature tests; suite now 42 tests / 121 assertions). Frontend: `/groups` overview rewritten (KPI strip, 5 charts, search/filter/sort/paginate table with expandable rows + day/breakdown chips, CSV export with BOM) + new `/groups/:id` detail (teacher card with wa.me link, capacity bar, 3 charts: score trend / band distribution / mode doughnut, students table → `/students/:id`). Gotchas: PHP serializes empty breakdowns as `[]` → `Array.isArray` guard before `Object.entries`; Playwright `fill()` does NOT fire Angular `(change)` — commit with `.blur()`; fixed a stale e2e student-count assertion the same way (`expect.poll` count ≥ 7 — registration-flow tests add students); jsdom Chart.js mock must be a synchronous explicit fake module (`importOriginal` factory → TDZ `__vi_import_1__` error); Arabic default name sort puts 'الفرقان' before 'النور' — select rows by content, not DOM position; single-series charts need `noLegend` (`{plugins:{legend:{display:false}}}`) to kill the "undefined" legend. Vitest 71 tests / 16 files green (17 new: 10 list + 7 detail); Playwright 4/4 green (new `groups-flow.e2e`: overview → search → expand → drill → back → dark → fr; auth-flow groups assertion updated to `.kpi` / `.row-link`). Visual check: light/dark × ar/fr × desktop/mobile screenshots.
- **F19 (done, all gates green):** group creation — `/groups/new` route (roleGuard admin/supervisor, declared before `:id`) with a signal-form page (individual signals + `canSave` computed, mirroring the group-detail edit card): name, center dropdown (admin only — supervisors are scoped to their own `currentUser.center_id`), level dropdown, teacher picker fed `users?role=teacher&center_id=<effective>` (resets when center changes, "بدون معلم" placeholder option), capacity number input, 7 day chips → `schedule_days` CSV. `CreateGroupPayload` added to api-models + `GroupsService.create()`. Groups list gained an إضافة مجموعة (`grp.create`) button behind `canCreate` (admin/supervisor) — key added to all 3 locales. Backend side: `GroupPolicy::create` (admin/supervisor; server force-scopes non-admin center_id, 422 cross-center teacher) + 3 PolicyTest cases → backend 51 tests / 150 assertions. Vitest 4 new tests (admin exact payload + navigation, teacher list center-scoped, supervisor auto-scoped without center field, save-disabled progression) → 80 tests / 18 files. Playwright 8/8: new "admin creates a group and finds it in the overview" test (writes 1 group/run → group-row counts in groups-flow AND auth-flow are `expect.poll ≥ 5` floors; no group-DELETE endpoint exists, so the groups table only grows). Lessons: app-dropdown's `.dd-backdrop` intercepts pointer events while open — Playwright cannot close it via the trigger or the backdrop; close it by clicking a real option (`choose()` closes). Spec harness: AuthService stub via `useFactory` closure reading an outer `role` variable set per test before `mount()` (mount per test, NOT beforeEach, so stale fixtures don't break `http.verify()`). Verified light/dark/mobile via headless screenshots; `ng build` clean.
- **F18 (done, unit green + headless-verified):** accept-with-group + edit screens — admin approval dialog gained an optional group picker (center dropdown first, group list loads per chosen center; teacher requests assign `groups.teacher_id`, student requests `students.group_id`); `/groups/:id` gained an edit card (name/level/teacher/capacity/schedule days/active → `PUT /groups/{id}`; teacher dropdown behind `UserPolicy::viewAny` admin/supervisor-only feed → teachers get read-only); `/students/:id` gained a group-assign card (admin/supervisor always, same-center teacher; `PUT /students/{id}` `{group_id}`, null = ungroup; dirty-tracking dropdown + save). REAL BUG root-caused during headless verification: student detail flashed content → skeleton → content. Cause: `summary`/`final` resources resolve `Promise.resolve(null)` while the season id is unknown → `loading()` false when the student lands → seasons 200 flips `season.value()` identity → params effect re-runs → resources re-fire → skeleton again. Fix: `loading()` = `student.isLoading() || season.isLoading() || summary.isLoading()`. Recorded Angular resource patterns: (1) params compare by OBJECT IDENTITY — any effect re-run producing a new params object re-fires the loader and cancels in-flight requests; (2) never `await whenStable()` with an unflushed dependent resource — order: flush parent → `setTimeout(0)` → `detectChanges()` → flush dependent (any parent reload re-fires identity-compared dependents → flush the dependent feed again); (3) dependent resources that null-resolve while a parent loads MUST have the parent's `isLoading()` in the UI loading gate. Vitest 76 tests / 17 files green. Verification: Angular 22 HttpClient uses **fetch, not XHR** — page-side XHR interception logs nothing, use CDP Network domain (`Network.enable`, `requestWillBeSent`) for request truth; seeded a pending registration via `POST /auth/register`, logged in as admin, captured approval-dialog / group-edit / student-assign screens in both themes (`.shot-tool/verify-f18.js`).

- **F20 (done, all gates green):** teacher delete with replacer — users table gained an admin-only two-step delete (`UsersService.delete()`); `DELETE /users/:id` returns 422 `NEED_REPLACER` when the teacher owns active groups (dialog → `/users/:id/replace` page, admin-only route) else deletes directly (inactive groups nulled, authored announcements + delegation tokens removed, examiner/entered_by refs nulled). `POST /users/:id/replace {replacer_id}` moves active groups + exam/review history to the replacer in one transaction, then deletes. Replacer rules (client + server, strict): active teacher, same center, same `teacher_type` or `both` (both→both only), free = no active group. i18n keys (`users.cannot_delete_*`, `users.replace_*`, `users.choose_replacer`, `users.no_candidate`) in all 3 locales. Backend `UserReplaceTest` 8 tests; Playwright users-flow 4/4 (new transfer test writes 2 teachers + 1 group per run; also guards the "بدون حلقة نشطة" unassigned checkbox, `GET /users?unassigned=1`, `users.unassigned_only` in all 3 locales). Lessons: `users`/`groups` list feeds paginate 20 — scope replace-page feeds by `center_id` or new rows hide on later pages; groups search needed a `data-testid="groups-search"` hook + Enter commit (`(change)` binding); group-create requires a day chip or the server 422s (`schedule_days`).

---

- **F21 (done, all gates green):** exam edit + delete (plan Item 4) — `exam-detail` gained an edit card (date + type dropdown + term picker for non-final, signals + `canSaveEdit`, edit gating via `manage`: admin/supervisor/teacher) reusing the store term/season derivation, and an admin/supervisor-only two-step delete (questions cascade server-side, zero orphans — verified by `ExamManageTest`). Backend went first: `UpdateExamRequest` lacked `exam_type`/`term_id` (date/examiner-only) — added both + derivation in `ExamController@update`. i18n `exam.edit`/`exam.delete_confirm` ×3. Playwright `exams-flow.e2e` (create term_batch → edit date + flip to final → reload-persist → delete → absent from list). Lesson: never `page.reload()` right after save — assert the tick-driven UI change (heading flip) first or the PATCH loses the race.

- **F22 (done, unit + e2e green):** `app-dropdown` overlay fixes (dark-theme report): (1) open list painted UNDER following cards — CDP forensics (`elementFromPoint` + ancestor computed-style scan, `dd-probe` script) proved containment, not competition: `.anim-rise` cards and `section.page` keep fill-retained transforms = permanent stacking contexts, trapping any inner z-index (user's `--z-dropdown: 100000` experiment changed nothing — reverted to 25). Fix: `.card:has(.dd.open) { position: relative; z-index: var(--z-dropdown) }` in `_cards.scss`; verified 7/7 options hit their own buttons (last needed list scroll — max-height fold, not a bug). (2) narrow triggers clipped long labels — list was `inset-inline: 0`, now `inset-inline-start: 0; min-width: 100%; width: max-content; max-width: min(92vw, 340px)` + wrapping spans (RTL-safe). (3) click-away sometimes didn't close — fixed `.dd-backdrop` is clipped by transformed ancestors, so added contains-guarded `document:click` + `document:keydown.escape` listeners. 3 new unit tests; e2e 11/11. Follow-up lesson: center feeds paginate 20 — 21 center-1 teachers broke the replacer AND group-create pickers the same week → added `UsersService.listAll`/`GroupsService.listAll` (walk every page), used in replace page + group-form. Same hazard applies to other picker feeds (registrations/groups, group-detail, student-assign) — migrate them on next touch.

- **F23 (done, all gates green):** Item 5 batch — season delete (two-step, admin-only button, current season guarded client-side, 422 facts-banner; terms/weeks/sessions cascade underneath), term rename (inline input, `renameTerm` composes with `PATCH /terms` `name_ar` — kept the method), attendance per-row clear on the entry grid (`EntryService.deleteAttendance`, existing-record only, `savedTick` reload), revision-log list + admin/supervisor delete on reviews page (`ReviewsService.logs/deleteLog`), announcement inline edit (title/body, admin-or-author gate, `AnnouncementsService.update` added — backend existed). i18n `planning.delete_confirm/has_facts/rename_term`, `news.edit`, `review.practice` ×3. `Item5ManageTest` (attendance delete, revision delete + teacher-403); news-flow e2e (create→edit→delete, self-cleaning) + seasons-flow e2e (create→delete net-zero, rename with seed restore). Lessons: text locators die across edit mode (title moves into inputs) — anchor on position (`article.first()`); `planning.use_template` is "نموذج الافتراضي" (no ال); failed e2e runs leave orphans that break hand-math tests (deleted 2 orphan exams, suite back to green) — Item 7 wipe exists for exactly this drift.

- **F24 (done, all gates green):** test-id pass over the whole e2e suite — every static control locator is now `getByTestId` (login `auth-*`, `nav-*` links + logout + theme, per-page create/save/search/checkbox hooks, shared `DropdownComponent.testId` input for triggers incl. `lang-switcher`). Dynamic values (entity names in options/rows, seed-name assertions, fr heading) keep content selection — test-ids can't name unknown values. One transient `.auth-error` flake seen once in a full run (green on rerun + isolated file green); watch, don't chase yet. E2e 14/14.

- **F25 (done, all gates green):** Item 6 frontend — add-question is now a draft queue (single adds could never total 20 under hard-20, so rows accumulate locally + one atomic bulk save gated on total==20 client-side too), live weights X/20 indicator, score inputs capped per max, reweight mode (edit all + save once), delete surfacing. i18n `exam.weight/weights/reweight` ×3. E2E `e2e/api.ts` helper (API login + paged name lookup — runtime seed lookup, immune to renames/wipe; applied to groups teacher scoping + exams student pick). Exams-flow rewritten (bare exam → 7+7+6 draft → full marks → header 20/20 → delete). Lessons: `toContainText('20')` matches the `/ 20` suffix — assert exact `'20/ 20'` or wait PATCH responses (bare `page.reload()` CANCELS in-flight PATCHes — proven by trace forensics); `signal.update()` returns void (read after); narrowing dies inside closures (destructure first).
- **F26 (done, all gates green):** unassigned-everywhere + stale-filter bug — the users checkbox hid behind `@if (role === 'teacher')` while its signal stayed applied; now always visible. `GET /students?unassigned=1` + checkbox (`students.unassigned_only` ×3); `StudentFilterTest`; e2e presence proof. Users-test-2 flaked 4× full-runs-only at one login fill — root-caused to a STALE `ng serve` serving mixed old/new chunks (banner rendered old `common.error` without the new hook; dual ng-c scopes in traces), NOT app code — killed + restarted, 14/14 since. `fillStable` helper kept as hardening.
- **F27 (done, all gates green):** Item 7 translated API errors — backend `fail()` auto-attaches stable `errors.code` from a message map (exact + prefix; explicit codes never overwritten; 1 file, ~35 sites covered, zero behavior change) + `ApiCodesTest` (ADMIN_ONLY/CROSS_CENTER/SEASON_HAS_FACTS/WEIGHTS_TOTAL; validation-bag codes arrive as arrays — first wins). Frontend `apiErrorKey` parser (code → `apiErrors.*`, field tokens → auth keys, duplicate-email heuristic → `auth.email_taken`, status fallbacks → `common.error`) + `apiErrors` map ×3 locales + unit spec; all existing error banners show translated keys (users/planning/exams/registrations/groups/students + new exam-new/news submit banners). E2E duplicate-email proof (translated banner, net-zero rows). Lessons: a stale `ng serve` (wedged watcher) serves mixed old/new chunks and mimics app bugs (dual ng-c scopes in traces!) — kill + restart when UI contradicts fresh code; failed edits are atomic (whitespace-exact oldString).

- **F28 (done, all gates green):** Item 9 centers page (un-deferred by the wipe — fresh DB proved centers weren't manageable in-app). Table (name/city/manager/phone/counts) + create + per-row full-field edit; NO delete button (policy refuses 100%: isolation anchor, endpoint 403s — tested). `CentersService.create/update`, `Center.title/create/edit/name/city/address/phone/manager` ×3, `nav-centers` + building icon (admin-only route). `CenterManageTest` (create+rename/supervisor-403/delete-refused); centers-flow e2e (create → edit all → reload-persist). Lesson: single-resource 404s on an empty DB are correct, not binding bugs — verify row existence first.

- **F29 (done, all gates green):** Item 10 scoring table — cards replaced by a filterable table (search + scope + status) keeping drafts+bulk-save (any single max change breaks the 20-sum alone, so atomic save stays); per-row two-step delete (unused only, translated refusal); add-book modal kept. Route + writes admin-only (supervisors lose the page per owner call). `ScoringModuleManageTest` (incl. the binding-trap regression); self-cleaning scoring-flow e2e. Backend 87/87 (verify clone), e2e 16/16 (verify clone), dev residue zero.

- **F30 (done):** Item 11 Quran verses — backend-only, frontend untouched (`reference/surahs` feed shape identical). Noted here for lockstep: `quran_verses` (6236 Tanzil rows) replaces the `surahs` stub; surah pickers/validation behave identically. QURAN IMMUTABILITY LAW: verses are append-once by migration `000013` only — never update/delete/re-seed from any code; `QuranVerse` model throws on writes.

# Modern Angular Development Standards & AI Coding Guidelines

This document serves as both a human-readable best practices guide and an AI prompt instruction set (`.cursorrules` / `copilot-instructions.md`) for Angular development.

---

## 1. Modern Reactivity & Signals

### Guidelines & Rules
* **Default State to Signals:** Use `signal()`, `computed()`, and `effect()` for managing local and synchronous UI state instead of manual RxJS `BehaviorSubject` instances or mutable properties.
* **Functional Signal Inputs & Queries:** Never use legacy decorator syntax (`@Input()`, `@Output()`, `@ViewChild()`). Always use functional signal primitives.
* **Limit `effect()` Usage:** Do not use `effect()` to update other signals to prevent infinite loops and race conditions. Reserve `effect()` solely for external side effects (e.g., logging, manual DOM manipulation, local storage).
* **RxJS Integration:** Use RxJS strictly for asynchronous events, HTTP calls, and complex stream transformations. Convert Observables to Signals using `toSignal()` for template consumption.

### Code Examples

```typescript
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from './user.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  template: `
    <h2>{{ upperName() }}</h2>
    <p>Status: {{ status() }}</p>
    <button (click)="select.emit(userId())">Select User</button>
  `
})
export class UserProfileComponent {
  private userService = inject(UserService);

  // Modern Signal Inputs & Outputs
  readonly userId = input.required<string>();
  readonly select = output<string>();

  // Computed State
  readonly user = toSignal(this.userService.getUser(this.userId()));
  readonly upperName = computed(() => this.user()?.name.toUpperCase() ?? '');
  readonly status = signal<'active' | 'idle'>('active');
}

2. Component & Application Architecture
Guidelines & Rules
100% Standalone Architecture: Do not create or use NgModule. All components, directives, and pipes must be standalone (standalone: true).

Root Providers: Bootstrap applications using bootstrapApplication() in main.ts and configure providers in app.config.ts.

Functional Dependency Injection: Use inject(Service) instead of constructor injection for improved type inference, easier inheritance, and cleaner class headers.

Domain Driven Organization: Group files by feature/domain (src/app/features/auth, src/app/features/dashboard) rather than technical role (components/, services/). Shared presentational UI elements belong in src/app/shared/ui/.

Zoneless app no zone.js or ngzone

3. Control Flow & Template Syntax
Guidelines & Rules
Built-in Control Flow: Always use native @if, @for, and @switch syntax. Never use structural directives (*ngIf, *ngFor, *ngSwitch).

Mandatory Loop Tracking: Every @for loop must specify a unique tracking expression (track item.id). Tracking by array index (track $index) is strictly forbidden unless the dataset is static and immutable.

<!-- User List Template -->
@if (isLoading()) {
  <app-spinner />
} @else {
  <ul class="user-list">
    @for (user of users(); track user.id) {
      <li>
        <span>{{ user.name }}</span>
        <button (click)="deleteUser(user.id)">Delete</button>
      </li>
    } @empty {
      <li class="empty-state">No users found in the system.</li>
    }
  </ul>
}


4. Performance & Rendering Optimization
Guidelines & Rules
OnPush Change Detection: Set changeDetection: ChangeDetectionStrategy.OnPush on every component.

Deferrable Views (@defer): Lazy-load heavy or below-the-fold components using @defer blocks to optimize initial bundle size and First Contentful Paint (FCP).

Image Optimization: Use NgOptimizedImage (ngSrc) for all images. Apply the priority attribute to Above-the-Fold images (Largest Contentful Paint).

SSR & Hydration: Avoid direct DOM references (window, document, ElementRef.nativeElement). Use Renderer2 or condition code using isPlatformBrowser.

<!-- Deferrable View with Viewport Trigger -->
@defer (on viewport) {
  <app-analytics-chart [data]="chartData()" />
} @placeholder {
  <div class="chart-skeleton">Loading Chart...</div>
} @error {
  <p>Failed to load analytics module.</p>
}

<!-- Optimized Image -->
<img ngSrc="/assets/hero.webp" width="800" height="400" priority alt="Application Banner" />

5. Routing & HTTP Network Layer
Guidelines & Rules
Lazy-Loaded Routes: Always load route components using dynamic import() via loadComponent or loadChildren.

Component Input Binding: Enable withComponentInputBinding() so route parameters and query parameters bind directly into component input() signals.

Functional Interceptors and Guards: Define HTTP interceptors (HttpInterceptorFn) and route guards (CanActivateFn) as standalone functions rather than injectable class services.

// Functional HTTP Interceptor
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};

// Route Definition
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard/:id',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  }
];

6. Typed Forms & State Management
Guidelines & Rules
Strongly Typed Reactive Forms: Do not use untyped reactive forms or template-driven forms for complex UI logic. Explicitly type all FormGroup and FormControl instances.

Signal-Based Local State: Use @ngrx/signals (SignalStore) or lightweight custom Signal services for local/global state management instead of verbose Redux boilerplate.

import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <input formControlName="email" type="email" placeholder="Email" />
      <input formControlName="password" type="password" placeholder="Password" />
      <button type="submit" [disabled]="loginForm.invalid">Log In</button>
    </form>
  `
})
export class LoginComponent {
  readonly loginForm = new FormGroup<LoginForm>({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.getRawValue();
      console.log('Submitting credentials:', credentials);
    }
  }
}

7. Tooling, TypeScript & Code Quality
Guidelines & Rules
Strict Typing: Set "strict": true and "strictTemplates": true in configuration files. Avoid the any type under all circumstances.

Auto-Unsubscribe: Avoid manual .subscribe(). When subscriptions are required outside templates, manage memory lifecycles using takeUntilDestroyed() within an injection context.

// Section 7: Tooling, TypeScript & Code Quality Example
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

@Component({
  selector: 'app-clean-subscription',
  standalone: true,
  template: `<p>Check console for clean timer logs.</p>`
})
export class CleanSubscriptionComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // Automatically unsubscribes when the component is destroyed
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        console.log('Timer tick:', val);
      });
  }
}

## 11. Hosting + deploy (Heberjahiz Standard shared, Morocco)- No SSH assumed (FTP + panel only). PHP up to 8.4, 5 subdomains (site + api. + test. later fit), 5 MySQL DBs, free SSL, urlRewrite OK, no cron (unused: no jobs/scheduler).
- Constraints: build artifacts on runner (composer install --no-dev, 
g build); FTP transfer with excludes; .env uploaded once via file manager then EXCLUDED from deploys; NO config:cache/storage:link possible without SSH (unneeded: no uploads, file cache, sync queue); opcache via panel if offered.
- MUST verify day-0: PHP extensions on server (mbstring, pdo_mysql, openssl, fileinfo, tokenizer, curl, zip, sodium for JWT); subdomain document-root control (api. -> laravel public dir); FTP host + 5 accounts; DB creation + phpMyAdmin UTF-8 import.
- Secrets live in GitHub repo Settings > Secrets and variables > Actions (never chat, never code).
- Prod checklist: APP_ENV=production, APP_DEBUG=false, FRONTEND_URLS=https://alotrojah.ma,https://www.alotrojah.ma, docs 403 check, CORS + login smoke.
- Prod DB LIVE (alotr15q_prod): panel CREATE DATABASE forbidden -> strip those lines before import; host rejects generated columns (#1901) -> weeks_covered is plain + API-computed; host DB default was latin1 -> 27 tables now carry explicit utf8mb4_unicode_ci + ALTER DATABASE; verified 19/168 + Arabic reads. Import order: dump -> seed, charset utf8mb4 on the form. Prod patch `alotrojah_Backend/docs/database/prod_patch_2026-10-02.sql` applied and verified 2026-10-03 (guardians removed, `v_student_season_avgs` follows current season, role ENUM shrunk, `registration_requests` created → 27 tables). Future prod schema changes: FTP-only host (no artisan) — full workflow in `.qoder/skills/ftp-only-prod-db-patching/SKILL.md` (identical copy in both repos).
- **D1 (workflows live, first runs debugging):** `deploy-backend.yml` (PHP 8.4 + MariaDB service + canonical SQL import + PHPUnit gate → FTP `api/`, `.env` from secrets, verify incl. docs-403) + `deploy-frontend.yml` (format/typecheck/Vitest/build gates → FTP dist + committed `.htaccess` SPA fallback → verify incl. bundle API URL). Fixed: `ubuntu-24.04` pin (26 migration notice), `checkout@v5` (node20 warning; setup-node has no v5 — warning stays, cosmetic), frontend `format:check` failure on interceptor spec (normalized). Pushed from local clones directly (remote auth works). OPEN: backend `test` job's real error unknown — awaiting failing-step log from user if the new run still fails.

- Deploy verify iteration: frontend verify now prints HTML bytes + bundle name + bundle HTTP code, and fails if dev URL leaks into prod. GitHub AI suggestions are generic - diagnose from live bytes instead.

- Deploy verify lesson: grep ALL script bundles, not just main-*.js - tree-shaken shared code (ApiClient + env URL) lives in chunk-*.js. Read live bytes (fetched the actual bundle) instead of trusting pattern theories.

- CI import lesson: never rely on CREATE/USE inside SQL files in CI - pass the DB explicitly (mysql db < file + pre-CREATE). Fixes the ERROR 1046 No database selected class regardless of cause.
