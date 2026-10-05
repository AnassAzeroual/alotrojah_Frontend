# AlOtrojah — Workflow "Cut" Audit (live re-verification)

**Date:** 2026-10-05
**Auditor:** Qoder agent
**Status:** IN PROGRESS — this file is the durable record. Update as checks complete.

> **Why this file exists:** the user asked for every previously reported "cut" to be
> re-verified **live**, because `roadmap.md` may itself be wrong. Findings are split into
> three buckets so a documentation error or an auditor mistake is never reported as an app bug.

---

## 0. What counts as a "cut"

A step in the real workflow where the acting user **cannot proceed**, because:

- the required UI or endpoint is missing,
- it is role-gated so the person who needs it cannot reach it,
- it crashes / spins forever on empty or normal data,
- the frontend cannot satisfy the backend's validation,
- a hard limit breaks the normal flow.

Reference example given by the user: fresh DB → register Admin by hand → log in → roadmap
step 1 says "create supervisor and teacher" → the center dropdown is empty and there is no
obvious UI to create centers → *"in real world the user (admin) can do nothing about it."*

---

## 1. Verification harness (does NOT touch the user's QA database)

| Item | Value |
|---|---|
| Scratch DB | `alotrojah_audit` (created for this audit; disposable) |
| Migrations | `php artisan migrate` alone — **all 13 succeeded on an empty DB** → the "fresh install works" claim holds |
| Admin | dev admin's bcrypt hash copied in → `admin@example.org` / `password123`, `center_id = NULL` |
| Backend | `php artisan serve --host=127.0.0.1 --port=8000` with `DB_DATABASE=alotrojah_audit` (bg id `b6nmd4ypk`, log `/tmp/audit-backend.log`) |
| Frontend | `npx ng serve --port 4200` (bg id `b2xjdj2r7`, log `/tmp/audit-frontend.log`) |
| Frontend API base | `src/environments/environment.ts:3` → `http://localhost:8000/api/v1` (so :4200 talks to the audit backend) |
| Probe scripts | `%TEMP%\audit\*.mjs` (API), `%TEMP%\shot-tool\ui-probe*.js` (headless Chrome via puppeteer-core) — **scratch only, never committed** |
| Screenshots | `%TEMP%\audit\ui-*.png`, `ui2-*.png` |

**MySQL/XAMPP health:** checked repeatedly during this audit. The connection is healthy —
the only DB error seen was a legitimate `Unknown column 'name'` (the column is `full_name`).
**No XAMPP/MySQL outage has recurred.**

### Audit DB contents (seeded by the probes)

Users (id | full_name | email | role | center_id):

```
1  | Admin         | admin@example.org    | admin     | NULL
2  | ناظر النور    | sup.a@audit.test     | supervisor| 1
3  | محفظ النور    | t.hifz@audit.test    | teacher   | 1
4  | مراجع النور   | t.mur@audit.test     | teacher   | 1
6  | طالب النور    | s1@audit.test        | student   | 1
7  | عضو المجلس    | b1@audit.test        | board     | NULL
8  | محفظ الفرقان  | t.hifz2@audit.test   | teacher   | 1   (was 2)
9  | معلم جديد     | new.teacher@audit.test| teacher  | 1
10 | عضو بمركز     | b2@audit.test        | board     | 1
```

(user 5 was deleted during a `DELETE /users` probe.)

Other rows: centers 1 `مركز النور` (**center 2 `مركز الفرقان` was deleted to simulate the
real single-center deployment — see §2.1**); seasons 1 (active, 42 weeks / 126 sessions /
6 terms) + 2; groups 1 `حلقة النور 1` + 2 `حلقة الحذف`; pupils 1–21 (`center_id = NULL`),
22, 24 (23 deleted); exam 1 with questions 3 & 4; revision log 1; attendance 1–2;
scores 1–3; weekly goal 1; term result 1; season result 1; announcements 2 & 3;
delegations 1, 2, 3.

---

## 2. CONFIRMED GENUINE APP BUGS

### 2.1 🔴 B1 — BLOCKER: pupils created by an admin get `center_id = NULL`, and nothing in the UI can fix it

**This is the single worst cut in the app. Roadmap progress stops dead at Phase 4 (Pupils).**

Evidence chain:

1. **API level (proven):** 21/21 admin-created pupils were stored with `center_id = NULL`.
   - teacher `GET /students` → **0 rows**
   - supervisor `GET /students` → **0 rows**
   - teacher/supervisor `GET /students/1` → **404**
   - `PUT` / `PATCH /students/1 {center_id: 1}` → **200 OK but the value stays `null`**
   - `PUT /students/1 {group_id: …}` → **422 `Group belongs to another center.`**
   - `GET /students?unassigned=1` as admin → `total = 21` — **the admin can see the damage but cannot repair it**
2. **The backend is not at fault** when told explicitly: `POST /students` as admin **with**
   `center_id: 1` → **201, `center_id = 1`**. So the defect is that the UI never sends it.
3. **Frontend root cause** — `alotrojah_Frontend/src/app/features/students/student-detail.page.*`:
   - `student-detail.page.html:32` → `@if (centerOptions().length > 1) {` — **the center
     selector is not rendered at all when the deployment has a single center.**
   - `student-detail.page.ts:153` → `center_id: new FormControl<number | null>(null)` with
     **no `Validators.required`** and no auto-select of the only center.
   - `student-detail.page.ts:141-144` → `centersRes` only loads for `admin` / `supervisor`.
   - `student-detail.page.ts:185-193` → `groupsRes` returns `null` when `centerId === null`;
     and the fallback `cid = this.auth.currentUser()?.center_id ?? null` is **also null for an
     admin** (admin `center_id = NULL`) → **the group dropdown is empty for the admin too.**
   - `student-detail.page.ts:269-271` → only `teacher` / `student` get a forced center.
4. **Backend root cause** — `StudentController.php`:
   - `store():41` → `if ($me->role !== 'admin') $data['center_id'] = $me->center_id;`
     i.e. the admin's center comes **only** from the request body; there is no fallback.
   - `StoreStudentRequest` → `'center_id' => ['sometimes','nullable','integer','exists:centers,id']`
     — **nullable, not required.**
   - `update():63` → `unset($data['center_id']);` — the center can never be moved by update.
   - `UpdateStudentRequest` → **has no `center_id` rule at all** (only full_name, group_id,
     level_id, birth_date, gender, status, student_type, memorization_mode, start_hizb, notes).
     So `center_id` is stripped twice: once by validation, once by `unset()`.
   - Net effect: **a NULL-center pupil can only be repaired by a direct DB edit.**

**Why it matters:** a single center is the *normal* case for this non-profit. The bug is
masked in any environment that happens to have 2+ centers (which is why my earlier probe on a
2-center audit DB showed the "اختر المركز" dropdown and looked fine). Center 2 was deleted
from the audit DB specifically to reproduce the production scenario.

**📏 Measured blast radius (audit DB, after the probe #3 / #4 runs):**
```sql
SELECT center_id, group_id, COUNT(*) FROM students GROUP BY center_id, group_id;
-- NULL / NULL -> 22      1 / 1 -> 2      1 / 2 -> 1      TOTAL 25
```
**22 of 25 pupils (88%) are center-less.** They are invisible to every teacher and supervisor
(`CenterScope` skips `center_id IS NULL` for non-admins — corroborated live: `t.mur@audit.test`
→ `GET /students?q=طالب` → **`total = 3`**), and they are **also invisible to the admin's own
dashboard**, which auto-locks to center 1 with no "all centers" option → **see §2.19**.

#### ✅ LIVE UI PROOF (single center, probe #2 `ui-probe2.js`)

`GET /centers` → `{total: 1, names: ["مركز النور"]}`. Then `/students/new` as admin:

| | 2 centers (probe #1) | **1 center (probe #2)** |
|---|---|---|
| Labels rendered | `الاسم الكامل *`, **`اختر المركز`**, `الحلقة`, `المستوى`, `الجنس`, `النوع`, `النمط *`, `الحالة *`, `ملاحظات` | `الاسم الكامل *`, `الحلقة`, `المستوى`, `الجنس`, `النوع`, `النمط *`, `الحالة *`, `ملاحظات` — **no center field at all** |
| `app-dropdown` count | 8 | **7** |
| Body contains "المركز" | yes | **`hasCenterWord: false`** |

Dropdown options actually rendered on the single-center form:

```
dd-0 اللغة   = ["العربية","Français","English"]
dd-1 الحلقة  = ["بدون حلقة"]        <-- ONLY "no group", although group 1 exists
dd-2 المستوى = ["المستوى الأول — نصف في الأسبوع","المستوى الثاني — 3 أثمان في الأسبوع","المستوى الثالث — ربع في الأسبوع"]
dd-3 الجنس   = ["common.male","common.female"]   <-- RAW I18N KEYS (see §2.17)
dd-4 النوع   = ["طفل","كبير"]
dd-5 النمط   = ["بالسورة","بالثمن"]
dd-6 الحالة  = ["نشط","موقوف","متخرج"]
```

**`dd-1 الحلقة = ["بدون حلقة"]` is the second half of the blocker:** with no center selected,
`groupsRes` short-circuits to `null`, so even the **group** dropdown is empty for the admin.
The admin therefore cannot attach the new pupil to a center *or* to a group — the pupil is
born orphaned and, per the backend behaviour above, can never be adopted through the UI.

Screenshots: `%TEMP%\audit\ui2-student-new-1center.png`, `ui2-centers-1.png`, `ui2-user-new.png`.

#### ✅ END-TO-END UI PROOF — admin creates an orphaned pupil (probe #3 `ui-probe3.js`)

Single-center install, logged in as `admin@example.org`, real clicks on the real form:

```
unassignedBefore                       = 21
[data-testid="student-name"] found     = true
typedValue                             = "فحص أحادي المركز"
save button                            = {type:"submit", disabled:false, cls:"btn btn-primary"}
network on click                       = 204 OPTIONS /students
                                         201 POST /students          <-- created
                                         200 GET /students/25
                                         200 GET /dashboard/season?student_id=25&season_id=1
                                         200 GET /dashboard/final?student_id=25&season_id=1
landed on                              = /students/25
detail page shows                      = "فحص أحادي المركز | — · بالثمن | نشط |
                                          تعيين الحلقة | بدون حلقة | حفظ"
unassignedAfter                        = 22   <-- the new pupil is in the UNASSIGNED bucket
```

**So the whole chain is now proven through the UI, not just the API:** an admin on a normal
one-center install fills in the only required field, clicks `حفظ`, gets a green `201`, is
routed to the pupil's own detail page — and has silently created a pupil with
`center_id = NULL` that **no teacher, supervisor or board member will ever see**, and that
**the admin cannot repair**. `GET /students?unassigned=1` total goes 21 → 22.

(Note: `unassignedAfter.newest` listed ids 18/19/20 rather than 25 — that is §2.2's 20-row
cap biting inside the very query used to inspect the damage.)

#### ✅ The repair path is also dead (probe #3, `/students/1` as admin)

Opening an existing NULL-center pupil as admin renders:

```
labels     = []                      <-- no editable form fields at all
dropdowns  = [ {aria:"اللغة"}, {aria:"تعيين الحلقة", shown:"بدون حلقة"} ]
page text  = "تعديل بيانات الطالب | ط | طالب الاختبار 01 | — · بالسورة | نشط |
              تعيين الحلقة | بدون حلقة | حفظ"
```

The admin's only affordance is **"تعيين الحلقة" (assign group) with the single option
"بدون حلقة" (no group)**. There is no center field and no group to choose, because
`groupsRes` needs a `center_id` the pupil does not have. Clicking `حفظ` cannot help.
**Confirmed: a NULL-center pupil is unrecoverable from the UI.** Matches
`StudentController::update():63 unset($data['center_id'])` and the missing `center_id` rule
in `UpdateStudentRequest`.

Screenshots: `%TEMP%\audit\ui3-pupil-create.png`, `ui3-pupil-1.png`.

**Impact on the roadmap:** Phases 5–10 all read pupils through a center scope, so every
teacher, supervisor and board member sees an empty app. This is exactly the user's
*"the App is not even an MVP"* complaint, one phase later.

**Suggested fix (smallest safe change):**
- FE: always render the center selector for admin/supervisor (drop the `> 1` gate), mark
  `center_id` required for admin, and auto-select when exactly one center exists.
- BE: in `StudentController::store`, fall back to the sole center when the admin omits
  `center_id`; add a `center_id` rule to `UpdateStudentRequest` and stop `unset()`-ing it
  for admins, so existing NULL-center pupils can be repaired through the UI.

---

### 2.2 🔴 B2 — `GET /students` silently truncates at 20 and ignores `per_page`

`StudentController::index():36` → `return $this->ok(StudentResource::collection($q->paginate(20))->…);`

- Live: response contains **20 rows** while `meta.total = 21`, `meta.last_page = 2`.
- `GET /students?per_page=100` → **ignored**, `meta.per_page` stays `20`.
- Consequence: the daily-entry grid and pupil pickers can never address pupils 21+. Any
  center with more than 20 pupils per page and no paginator in the calling screen loses data.

**⚠️ Correction after probe #4 — the `/entry` grid is NOT affected the way I predicted.**
`entry.page.ts:93-98` loads its roster with `studentsSvc.list({ group_id: params.g })` — the
same `paginate(20)` endpoint, but **group-filtered**. A single حلقة will not realistically hold
>20 pupils, so the daily-entry grid is safe in practice. The cap bites the **unfiltered**
callers instead: `/students` (25 pupils, no visible paginator beyond page 1) and the dashboard
pupil table (§2.19). Live on `/entry`: heading `إدخال اليوم`, dropdowns `الحلقة→— الأسبوع→—
الحصة→—`, message `اختر الحلقة والأسبوع والحصة للبدء`, network `200 GET /groups`,
`200 GET /scoring-modules`, `200 GET /weeks`, `rows: 0` — all correct for an unselected session.

---

### 2.3 🔴 A2-LEAK — student-role users can read every pupil's grades in their center

`ResultController.php:16-79` (`index`, and the same pattern in `indexSeasons`):

```php
$q = TermResult::orderBy('id');
if ($me->role !== 'admin') {
    $q->whereHas('student', fn ($s) => $s->where('students.center_id', (int) $me->center_id));
}
```

Combined with `ResultPolicy::viewAny` → `isStaff($user) || $user->role === 'student'`.

- Live: `GET /season-results` and `GET /term-results` **as a student → 200 with other
  pupils' grades.**
- **Important nuance found by the browser pass:** the UI does *not* expose this. The student's
  nav is only `الرئيسية / الطلاب / الأخبار`, and navigating to `/results/season` by URL is
  bounced by `roleGuard` back to `/`. So this is an **API-only vulnerability**, not a
  user-visible workflow cut — but it is still a real privacy defect and must be fixed
  (a student should only ever see their own results).

---

### 2.4 🔴 SEASON → TERM id mismatch on the planning page (Phase 2)

`alotrojah_Frontend/src/app/features/planning/seasons-list.page.ts:57` (inline template):

```html
<a class="btn btn-ghost" [routerLink]="['/planning/terms', s.id]">{{ 'planning.terms' | translate }}</a>
```

`s.id` is a **SEASON** id, but the route is `planning/terms/:id` →
`term-detail.page.ts:33,38-40` → `this.planning.termDetail(params.id)`, which loads a **TERM**.

**Live proof (audit DB: season 1 has terms 1–6; season 2 exists):**

| Link rendered on `/planning` | Lands on | Actually shows |
|---|---|---|
| `الفصول` → `/planning/terms/2` (row for **season 2**) | `path=/planning/terms/2`, no error | heading **`الفصل 2`**, weeks **8–14** — i.e. **season 1's** term 2 |
| `الفصول` → `/planning/terms/1` (row for **season 1**) | `path=/planning/terms/1` | heading `الفصل 1`, weeks 1–7 |

So clicking "الفصول" on **season 2** silently shows **season 1's الفصل 2**. No error, no
404 — the admin edits the wrong term's weeks and session types. Silent data corruption risk.

**Fix:** the link must resolve a term belonging to that season (e.g. link to
`/planning?season={id}` and list that season's terms, or expose the season's first term id
in the season resource).

---

### 2.5 🔴 Delegation link points at the wrong page (Phase 11)

`alotrojah_Backend/app/Services/DelegationService.php:52,54`

```php
$base = rtrim(config('app.frontend_url', config('app.url')), '/');
return $base.'/delegate?token='.$d->token;
```

**Live proof:** `POST /groups/1/delegations {minutes:60}` as admin → **201**

```json
{"success":true,"message":"Share this link via WhatsApp.",
 "data":{"delegation":{"id":3,"group_id":1,"duration_minutes":60,
 "expires_at":"2026-10-05T15:42:12.000000Z","used_by_teacher_id":null,"is_revoked":false},
 "token":"4LJqTj4IK0fessDnwLHrNC5uzTew2IF6hMhD9fh0HRgGWe1hprbDSvETOfTIFYiO",
 "link":"http://localhost:4200/delegate?token=4LJqTj4IK0fessDnwLHrNC5uzTew2IF6hMhD9fh0HRgGWe1hprbDSvETOfTIFYiO"}}
```

Following that exact link in the browser:

- lands on `path=/delegate`, `search=?token=4LJq…`
- page body = the **generator** UI (`التفويض / الحلقة / —`)
- `hasTokenUi = false` — **no redeem affordance at all**; the token is ignored.

Route table (`features/delegate/delegate.routes.ts`): `path:''` → `DelegatePage`
(roleGuard admin/supervisor/teacher, the generator, 93 lines, **no token handling**);
`path:'redeem'` → `RedeemPage` (unguarded) — `redeem.page.ts:8` comment: *"Opened from the
WhatsApp link: /delegate/redeem?token=…"*, `:31 readonly token = input<string | null>(null)`.

So: **the host is correct, the path is wrong.** Every delegated teacher who taps the WhatsApp
link lands on a page that cannot redeem their token. Redeem itself works when called properly
(`POST /delegations/redeem` by the teacher → 200 "Access granted…").

**Fix:** `DelegationService.php:54` → `$base.'/delegate/redeem?token='.$d->token;`

---

### 2.6 🟠 Nobody can delete a group (`GroupPolicy::delete` gap)

- `DELETE /groups/2` as **admin** → **403**
- `DELETE /groups/1` as the responsible **teacher** → **403**
- By contrast `DELETE /users/5` as admin → **200**, and `CenterController::destroy` →
  a deliberate `403 'Centers cannot be deleted.'`

So group deletion is blocked for *every* role. A mis-created group (a very common admin
mistake) is permanent unless someone edits the DB. Either implement it for admin/supervisor
or return an explicit "groups cannot be deleted" message like centers do — right now it is
just a dead 403.

---

### 2.7 ⚪ → **DISSOLVED — by design, not a cut** A teacher cannot delete their own review cycle / revision log (Phase 7)

`alotrojah_Backend/app/Policies/MurajaaPolicy.php`:
- `manageReviews` → `admin|supervisor` OR teacher with `teacher_type in ['murajaa','both']`
- **`delete` → `admin|supervisor` ONLY**

Live: the murajaa teacher creates a cycle (**201**) and a revision log (**201**), then
`DELETE` of **their own** record → **403**. A supervisor delete → **200**.

**Why this is NOT a bug.** The frontend enforces the same rule explicitly, and the delete
button is **never rendered** for a teacher:

`alotrojah_Frontend/src/app/features/reviews/reviews.page.ts:47-51`
```ts
/** Practice-row deletes are admin/supervisor-only (policy). */
readonly canManage = computed(() => {
  const r = this.auth.currentUser()?.role;
  return r === 'admin' || r === 'supervisor';
});
```
`alotrojah_Frontend/src/app/features/reviews/reviews.page.html:59` → `@if (canManage())` gates
the log delete button; `:37-44` gates the cycle delete button. So FE and BE **agree exactly**.
The 403 is only reachable by calling the API by hand, which is not a user workflow.
Probe #4 re-confirmed: `DELETE /revision-logs/1` as `t.mur@audit.test` (who is the
`entered_by = 4` author of that row) → **403**.

**Also dissolved: the "`rows: 0` on `/reviews`" worry at the bottom of this section.**
The page is **student-picker driven** — `reviews.page.html:30 @if (pickedStudent() !== null)` —
so the cycles/logs lists are *empty by design* until the user searches for and selects a pupil
(`reviews.page.ts:53 search`, `:54 pickedStudent`, `:58-63 found` → `studentsSvc.list({q})`,
`:87-92 cycles` → `reviews.cycles({student_id})`, `:95 logs`). `rows: 0` before picking is
correct, not a missing-data bug.

**Residual item worth raising to the user (product decision, not a defect):** a teacher who
mistypes a revision log **cannot correct it themselves** — they must ask an admin or a ناظر to
delete the row. If that is the intended audit posture (nobody silently edits memorization
records), leave it and it is fine. If teachers are expected to self-correct, widen
`MurajaaPolicy::delete` to the author. **Ask the user.**

---

### 2.8 🟠 A3 — a `board` user can be created without a center, and is then completely inert

`app/Policies/Concerns/CenterScoped.php`: `isAdmin()` is strictly `role === 'admin'`;
`sameCenter()` **requires `user->center_id !== null`**; `isStaff()` includes `board`.

Live with `b1@audit.test` (`board`, `center_id = NULL`):

| Endpoint | Result |
|---|---|
| `GET /centers` | 200, **0 rows** |
| `GET /students` | 200, **0 rows** |
| `GET /groups` | 200, **0 rows** |
| `GET /groups/stats` | 200, **all zeros** |
| `GET /dashboard/*` | **403** |
| `GET /reports/season` | **403** |
| `GET /registration-requests` | **403** |
| `GET /users` | **403** |
| `GET /announcements` | 200 ✅ (the only thing that works) |

Live with `b2@audit.test` (`board`, `center_id = 1`) — **everything works**:
`/centers` (1 row), `/students` (3 rows), `/groups` (2), `/groups/stats`
(groups 2, students 3, avg_score 17, attendance 100), `/dashboard/center`,
`/dashboard/season`, `/reports/season`, `/season-results`, `/term-results`,
`/scoring-modules`, `/exams` all 200 with real data. Still 403 for `/registration-requests`
and `/users`; `PUT /season-results` → 403; `POST /announcements` → 201 (id 3).

**Conclusion: the `board` role is NOT broken — the cut is that the system lets you create a
board user with no center**, producing an account that can log in and see nothing. Fix: make
`center_id` required for `board` (and `supervisor`/`teacher`) at creation, or have the UI
refuse to submit without one.

#### ✅ UI PROOF that a center-less user can be created (probe #2)

`/users/new` as admin, with a single center:

```
dropdownCount = 3
user-dd-0 اللغة   = ["العربية","Français","English"]
user-dd-1 الصفة   = ["مدير","ناظر","معلم","طالب","مجلس الإدارة"]
user-dd-2 المركز  = ["اختر المركز","مركز النور"]     <-- first option is a blank placeholder
labels = ["الاسم الكامل *","البريد الإلكتروني *","رقم الهاتف","كلمة المرور *","الصفة *",
          "المركز\nاختر المركز"]                     <-- note: NO asterisk on المركز
```

The center dropdown's first entry is the placeholder `اختر المركز` ("choose a center") and the
label carries **no `*`**, while `الاسم الكامل`, `البريد الإلكتروني`, `كلمة المرور` and `الصفة`
all do. So **center is optional in the UI** and `مجلس الإدارة` (board) can be selected with the
center left blank → exactly how `b1@audit.test` came to exist.

Also worth noting: `مدير` (admin) **is** in the role dropdown, so an existing admin can create
further admins through the UI — §2.9 is only about the *very first* admin.

#### ✅ UI PROOF that the center-less board account is silently inert (probe #3)

Logging in as `b1@audit.test` (`board`, `center_id = NULL`) in the browser:

```
POST /auth/login            -> 200, token stored
GET /centers                -> 200      (not 403!)
GET /reference/levels       -> 200
GET /seasons                -> 200
GET /students?page=1        -> 200
lands on "/" and stays there for 11s of sampling (token=true throughout)
page renders: اجمالي الطلاب — | متوسط النقاط — | متوسط السراج — | معدل الالتزام —
              (empty table) | لا توجد بيانات | توزيع الحفظ | لا توجد بيانات
```

No error, no warning, no "you are not attached to a center" message — just an empty dashboard
forever. Note the contrast with the **student** role on the very same page, which gets hard
`403`s (§2.16): for `board`, `CenterController::index` runs
`$q->where('id', (int) $me->center_id)` → `where id = 0` → **200 with zero rows** rather than
403. Two different failure shapes for the same "no data" outcome.

Screenshot: `%TEMP%\audit\ui3-board-null.png`.

> ⚠️ Process note: probes #1 and #2 both reported a *login failure* for this user
> (`Waiting failed: 15000ms exceeded`). That was a **probe artifact** — my `login()` helper
> awaited `!location.pathname.startsWith('/login')`, which misfired after
> `localStorage.clear()` on a guarded route. The API and probe #3 both confirm login works
> (`POST /auth/login → 200`, token stored, lands on `/`). **Do not report it as a bug.**

---

### 2.9 🔴 A1 — BLOCKER: there is no admin bootstrap path, and the shipped seeder crashes

`POST /auth/register` with `role: 'admin'` → **422 "The selected role is invalid."**

The open question from the previous pass ("verify whether `database/seeders` creates the
first admin") is now **settled — it does not, and it cannot even run**:

`database/seeders/DatabaseSeeder.php` is the **untouched Laravel 12 stub**, and
`database/factories/UserFactory.php` is the **untouched stub factory**. Both write a `name`
column. The real `users` table (migration `2026_10_02_000001_create_people_and_org_tables.php:14`)
has `full_name`, not `name`. Live proof on a freshly migrated scratch DB:

```
$ php artisan db:seed
   Illuminate\Database\QueryException
  SQLSTATE[42S22]: Column not found: 1054 Unknown column 'name' in 'field list'
  (Connection: mysql, Database: alotrojah_audit,
   SQL: insert into `users` (`name`, `email`, `email_verified_at`, `password`,
        `remember_token`, `created_at`) values (Test User, test@example.com, ...))
```

So on a truly empty database:

| Attempt to create the first admin | Result |
|---|---|
| `POST /auth/register {role:'admin'}` | **422** — `admin` is not in the allowed roles |
| `php artisan db:seed` | **QueryException** — stub seeder writes a non-existent `name` column |
| Any other artisan command | none exists — no `make:admin`, no first-run wizard |
| Manual `INSERT` into MySQL | works — **this is what the user did** ("i did wipe out the database and register by hand only Admin") |

This is the **hard blocker at roadmap step 0**, before anything else can be tried. It also
explains the user's original complaint precisely: they had to hand-register the admin
because the app offers no other way, and then hit the empty center dropdown at step 1.

Note the contrast with §4: once an admin *does* exist, `/users/new` offers `مدير` (admin) in
the role dropdown, so **only the very first admin** is unbootstrappable.

Also worth noting: the stub seeder's failure is a latent trap for anyone who follows the
standard Laravel install instructions (`migrate --seed`) — it fails *after* migrating, so
the DB is left migrated-but-empty with a scary stack trace.

---

### 2.10 🟡 Exam weights: a UX trap, not a deadlock (Phase 8)

`ExamQuestionController.php:77-130` — weights must total **exactly 20** (±0.009), and
`reweight` returns **422 `SCORE_OVER_MAX`** if a recorded score exceeds a new weight.

Live:
- `POST /exams/1/questions` totalling **19** → 422 `WEIGHTS_TOTAL`
- single `PUT /exam-questions/3 {max_score:12}` → 422 `WEIGHTS_TOTAL`
  (message: *"Weights must total 20 (got N) — use question-weights to rebalance."*)
- `PUT /exams/1/question-weights [{max_score:8},{max_score:12}]` → 422 `SCORE_OVER_MAX` (a score of 9 is already recorded)
- `… [{5},{5}]` → 422 `SCORE_OVER_MAX`
- `… [{9},{11}]` → **200** ✅

The escape hatch exists and the frontend **does** wire it correctly
(`core/api/exams.service.ts:81-82` → `PUT /exams/{id}/question-weights` with the right
`{id, max_score}[]` shape; `exam-detail.page.ts:295-309` has a reweight mode with
`reweightSaving` / `reweightErrorKey`). **Downgraded from my earlier report** — the remaining
issue is only that the inline single-question edit 422s with a message that tells you to use
a different control. Cosmetic/UX.

#### ✅ Probe #5 settled the "422 message" question — and found a different, real defect

The translation chain is **fine**. Live `PUT /exams/1/question-weights` with weights `9 + 8 = 17`:

```json
{"success":false,"message":"Weights must total 20 (got 17).","errors":{"code":"WEIGHTS_TOTAL"}}
```

`Controller.php:57-71 fail()` derives `errors.code` from a message-prefix map
(`:35 'Weights must total 20' => 'WEIGHTS_TOTAL'`), `api-errors.ts` recognises it, and both
`ar.json:90` / `en.json:90` translate it (`"يجب أن يساوي مجموع الأوزان 20"` / `"Weights must total exactly 20"`).
Weights are restored afterwards (200, back to `9,11`) so the audit DB is unchanged.

**But the two weight-editing flows are not held to the same standard**, and the reweight one is the
weaker of the pair:

| | Add-question flow | Reweight flow |
|---|---|---|
| Live running total shown | ✅ `{{ 'exam.weights' \| translate: { total: draftTotal() } }}` (`exam-detail.page.html:265`) — `draftTotal()` sums the **draft** rows | ❌ header uses `weightsTotal()` (`exam-detail.page.ts:132-137`), which sums **`exam.value().questions`** — i.e. the **already-saved** weights. It never moves while you type |
| Save disabled until total = 20 | ✅ `[disabled]="draftTotal() !== 20 \|\| saving()"` (`.html:271`) | ❌ `[disabled]="reweightSaving()"` **only** (`.html:130`) |
| Out-of-range / cleared input | n/a (form validators) | ❌ `submitReweight()` (`.ts:294-298`) does a bare `return` — **no banner, no disabled state** |

Consequences, in the order a user would hit them:

1. **Silent dead button.** Clear a weight box (or type `25`) and click Save: `payload.some(p =>
   p.max_score === null || < 0.01 || > 20)` is true, the method returns without setting
   `reweightErrorKey`, and *nothing at all happens*. The button still looks enabled. This is the
   same class of defect as the silent `roleGuard` redirect (§2.18) — an action that produces no
   feedback.
2. **No running total.** Because `weightsTotal()` reads saved rows, the user rebalancing three
   questions gets zero feedback until they press Save and receive a 422. The roadmap promises
   *"weights must read exactly 20/20 or save is rejected"* — in reweight mode they cannot *read* it.
3. If they had somehow sent it, the backend's own validation bag carries **no `errors.code`**
   (`{"weights.0.max_score":["…must not be greater than 20."]}`), so `apiErrorKey()` would fall
   through to the generic `apiErrors.validation` = *"Check the entered fields"* and the useful
   detail would be lost. Unreachable today only because of the silent `return` in (1) — two bugs
   currently masking each other.

**Smallest fix:** mirror the add-flow — add a `reweightTotal = computed()` over `weights()`, render it
in the header while `reweighting()`, add `|| reweightTotal() !== 20` to the Save `[disabled]`, and set
`reweightErrorKey` instead of returning silently.

---

### 2.11 🟡 → **re-scoped, see §2.18** Supervisor cannot save scoring rules (Phase 5)

- supervisor `GET /scoring-modules` → 200; `GET /scoring-check` → 200 `{valid:true, total:20}`
- supervisor `PUT /scoring-modules` → **403** (admin-only)
- teacher `PUT /scoring-modules` → **403**

The "silent Save-button bounce" I predicted **does not happen**, because
`scoring.routes.ts:9` guards the page with `data: { roles: ['admin'] }` — a supervisor never
reaches the form at all. So the API and the route agree: scoring rules are admin-only.

The real bug is one level up, in the **navigation**: `shell.component.ts:81` lists `/scoring`
for `roles: ['admin', 'supervisor']`. The supervisor is shown a menu item that the router
then silently refuses. That is §2.18.

Module weights confirmed: `hifz 14 / mowathaba 4 / tajwid 2 / murajaa 20 / sarraj 20`.
✅ **RECONCILED (was "suspicious, not yet explained").** `ScoringService.php:28-35 scoringCheck()`
sums `max_points` only where `is_active` **and** `is_in_weekly_total` **and** `scope = 'weekly'`:

```php
$total = (float) ScoringModule::where('is_active', true)
    ->where('is_in_weekly_total', true)->where('scope', 'weekly')->sum('max_points');
return ['valid' => abs($total - 20.0) < 0.001, 'total' => $total];
```

So `murajaa` is excluded by **scope** even though its flag says `true`, and `sarraj` is excluded by
the **flag** even though its scope is `weekly`. The total of 20 is correct, but the seed data uses
**two mutually inconsistent mechanisms** for "not in the weekly total", and the `is_in_weekly_total:
true` shown for `murajaa` in `GET /scoring-modules` is actively misleading to whoever reads that
response. Flipping *either* module's exclusion in the UI pushes the weekly total to **40** and makes
`scoring-check` report `valid:false`. Full write-up in **§8.3**.

---

### 2.12 🟡 → **mostly dissolved** Supervisor scope gaps (Phase 0–1)

- `POST /centers` → **403** (admin only)
- `POST /users` → **201** ✅
- `POST /seasons` → **201** ✅
- `GET /registration-requests` → **403**

I originally flagged these as scope gaps and worried that the supervisor — the role most
likely to handle enrolments — was locked out of `طلبات الانتساب` while still being shown the
link. **The nav matrix (§2.18) disproves the second half:** the frontend never offers those
screens to a supervisor in the first place, so there is no broken button and no dead link.

| Endpoint | API | Nav shows it to supervisor? | Verdict |
|---|---|---|---|
| `POST /centers` | 403 | ❌ `/centers` is `roles:['admin']` | consistent |
| `GET /registration-requests` | 403 | ❌ `/registrations` is `roles:['admin']` | consistent |
| `POST /users` | 201 | ✅ `/users` is `['admin','supervisor']` | consistent |
| `POST /seasons` | 201 | ✅ `/planning` is `MANAGER = ['admin','supervisor']` | consistent |

What remains is a **product decision to confirm with the user, not a code bug**: should a
supervisor (ناظر) be able to approve enrolment requests? Today only the admin can, and the UI
is honest about it. The roadmap should state this explicitly.

---

### 2.13 🟡 A plain teacher can write season results

`PUT /season-results {hifz_total: 15}` as `t.hifz@audit.test` (a **hifz** teacher) → **201**.

Supervisor `PUT /term-results {honor_flag:'tashji3'}` → 201 and
`PUT /season-results {honor_flag:'intibah'}` → 201 (both fine).
`ResultPolicy::manage` = `admin|supervisor|teacher` — so this is by design, but it means any
teacher can publish official season results for their centre. Flag for the user's decision,
not necessarily a bug.

---

### 2.14 🟡 Dashboard / report data quality (Phase 9–10) — **partially interpreted (probe #4)**

- `GET /dashboard/weekly` → `data: []`
- `GET /dashboard/final` → `final: null`, `divisor: 3`, `avg_murajaa: null`, `avg_sarraj: null`
- `GET /dashboard/center` → `avg_score "8.50"` — **counts pupils with no scores as 0**,
  which drags the average down. Real distortion once the app goes live.
- honors bar → `[{honor_flag:"none", n:1}]` — **the "none" bucket is charted as if it were an
  honor**. Check whether the dashboard renders it.

**✅ UI check done (probe #4, admin on `/` and `/dashboard`, both 200 OK, no console errors):**
the page renders `cards: 8` and these KPI tiles verbatim:
```
◉ اجمالي الطلاب 2      ◎ متوسط النقاط 8.50      ▣ متوسط السراج —      معدل الالتزام 100% 100%
```
Interpretation:
- **`متوسط السراج —`** — the em-dash is a *correct* empty-state rendering of `avg_sarraj: null`.
  No crash, no `NaN`, no raw key. **Not a bug.**
- **`معدل الالتزام 100% 100%`** — the value is duplicated in the tile. Cosmetic, but it looks
  broken. Worth a glance at the KPI template.
- **`اجمالي الطلاب 2`** — this is **not** a data-quality nit, it is the §2.19 center lock: the
  KPI is computed over center 1 only, while the DB holds 25 pupils. **Escalated to §2.19.**
- **`متوسط النقاط 8.50`** — consistent with the `avg_score` distortion above (pupils with no
  scores counted as 0). Still stands as a real reporting defect.
- The honors bar could not be evaluated: with 22 of 25 pupils invisible, only 3 pupils' data
  reaches the chart. **Deferred** until §2.19 is fixed, otherwise any judgment is about the
  audit fixture rather than the app.

**`/reports/term` (probe #4):** heading `تقرير الفصل`, body ends `الطالب الفصل —`, `rows: 0`.
This is **picker-driven and correct** — the report needs a pupil and a term selected first, the
same pattern as `/reviews` (§2.7). No 4xx/5xx in the trace. **Not a bug.**

---

### 2.15 ⚪ ~~Two unexplained 403s on the murajaa teacher's `/reviews` page~~ — **RETRACTED, not reproducible**

Probe #1 captured two `403 Forbidden` responses while loading `/reviews` as
`t.mur@audit.test`. **Probe #2 re-ran the identical step on a clean session and recorded
`networkIssues: []` — no 403, no console error.** The probe #1 readings were carry-over from
the preceding admin session (the listener was not reset until after that navigation).

**Not a bug. Do not fix anything here.**

What *is* confirmed about that page: as the murajaa teacher it renders `cards: 1`, `rows: 0`,
body `المراجعة / الطالب`, and **`deleteButtons: []`** — no delete affordance is rendered at
all. The teacher's nav is
`الرئيسية / الطلاب / الحلقات / إدخال اليوم / الاختبارات / المراجعة / النتائج / التقارير / الأخبار / التفويض / المراسلات`
— no `المراكز`, `المستخدمون`, `التخطيط`, `التنقيط`, `طلبات الانتساب`. That gating looks correct.

Screenshot: `%TEMP%\audit\ui2-reviews-mur.png`.

---

### 2.16 🟡 Two unexplained 403s on the student's home page

Browser pass captured **two `403 Forbidden` + two `HttpErrorResponse`** on `/` as
`s1@audit.test`. The student's nav is only `الرئيسية / الطلاب / الأخبار`.
Endpoint names **not yet identified** — §5.

Known-consistent 403s for the student role (all by design except the leak in §2.3):
`GET /centers` 403, `GET /groups` 403, `POST /students` 403, `/dashboard/season` 403,
`/reports/season` 403, `GET /students` → 200 but **0 rows**.

⚠️ A pupil row is only ever linked to a user account by
`RegistrationRequestController.php:70` (`user_id`) — **never by the pupil form**, which has no
user-account field. So a student created directly by an admin has no login, and a
self-registered student has no pupil record unless an admin approves the request. Confirm this
is intentional.

#### ✅ The two 403s are now identified (probe #2)

Loading `/` as `s1@audit.test` produces exactly:

```
403 GET /centers
403 GET /seasons
```
(plus the two matching Angular `HttpErrorResponse` console errors).

The page renders but every KPI is a placeholder and the table is empty:

```
الطلاب | متابعة حفظ القرآن الكريم | الحالة: الكل | المستوى: الكل
اجمالي الطلاب —   متوسط النقاط —   متوسط السراج —   معدل الالتزام —
ID | اسم الطالب | الحلقة | النمط | الحالة      (no rows)
تقييم التحفيظ الشهري / اخر 6 اشهر
اختر طالبًا من الجدول لعرض تطوره الأسبوعي
توزيع الحفظ — لا توجد بيانات
```

So the student's landing screen fires two admin-only requests it can never satisfy, and shows
**nothing at all** — no "you have no linked pupil record" explanation. Combined with §2.16
(a pupil row is never linked to a user account by the pupil form), **a self-registered or
admin-created student logs into a completely blank app.** This is a real Phase-1 cut.

Navigating to `/results/season` by URL as a student → **redirected to `/`** by `roleGuard`
(confirms the §2.3 leak is API-only, not reachable through the UI).

---

### 2.17 🟠 Raw i18n keys `common.male` / `common.female` on the pupil form — **CONFIRMED**

`alotrojah_Frontend/src/app/features/students/student-detail.page.ts:117-118`

```ts
{ value: 'male',   labelKey: 'common.male' },
{ value: 'female', labelKey: 'common.female' },
```

Locale files `public/assets/i18n/{ar,en,fr}.json` define the keys under **`gender`**, not `common`:

```
ar.json:118  "gender": { "male": "ذكر",   "female": "أنثى" }
en.json:118  "gender": { "male": "Male",  "female": "Female" }
fr.json:118  "gender": { "male": "Garçon","female": "Fille" }
```
and the `common` block (`:64`) has **no `male` / `female`** entries.

**Live proof:** opening the `الجنس` dropdown on `/students/new` renders literally
`["common.male","common.female"]` (probe #2, `dd-3`).

The rest of the app uses the correct key — `register.page.ts:88` uses `gender.male`, and
`groups-list.page.spec.ts:169` / `group-detail.page.spec.ts:289` **assert** `gender.male`.
So this is a one-line typo confined to the pupil form.

**Fix:** `student-detail.page.ts:117-118` → `gender.male` / `gender.female`.

> ⚠️ Note on process: probe #1 reported `rawKeys: []` and I briefly recorded this as a false
> positive. That was wrong — probe #1 scanned `document.body.innerText` while the dropdown was
> **closed**, so the option labels were not in the DOM. Probe #2 opened the dropdown and the
> raw keys are plainly visible. **The bug is real.**

---

### 2.18 🟠 The supervisor is shown a "التنقيط" (scoring) menu item that the router then refuses

I compared **every** nav entry in `core/layout/shell.component.ts` against the
`data: { roles: [...] }` guard in the matching `*.routes.ts`. Exactly one disagrees:

| Nav item | `shell.component.ts` roles | route `data.roles` | Match |
|---|---|---|---|
| `/` dashboard | admin, supervisor, teacher, student, board | same | ✅ |
| `/centers` | admin | admin | ✅ |
| `/students` | admin, supervisor, teacher, student | `STAFF_FAMILY` = same | ✅ |
| `/users` | admin, supervisor | admin, supervisor | ✅ |
| `/groups` | admin, supervisor, teacher | same | ✅ |
| `/entry` | admin, supervisor, teacher | same | ✅ |
| `/planning` | admin, supervisor | `MANAGER` = admin, supervisor | ✅ |
| **`/scoring`** | **admin, supervisor** | **`['admin']`** | ❌ **MISMATCH** |
| `/exams` | admin, supervisor, teacher | `STAFF` = same | ✅ |
| `/reviews` | admin, supervisor, teacher | same | ✅ |
| `/results/term` | admin, supervisor, teacher | `STAFF` = same | ✅ |
| `/reports/term` | admin, supervisor, teacher | `STAFF` = same | ✅ |
| `/news` | all five | all five | ✅ |
| `/delegate` | admin, supervisor, teacher | same | ✅ |
| `/notifications` | admin, supervisor, teacher | same | ✅ |
| `/registrations` | admin | admin | ✅ |

- `shell.component.ts:78-82` → `path: '/scoring', roles: ['admin', 'supervisor']`
- `features/scoring/scoring.routes.ts:9` → `data: { roles: ['admin'] }`

`role.guard.ts:22-25` handles the disagreement by **silently redirecting to `/`**:

```ts
if (roles && !roles.includes(user.role)) {
  void router.navigate(['/']);
  return false;
}
```

No toast, no explanation. So a supervisor clicks **التنقيط** in the sidebar and the app just
throws them back at the dashboard. This is the classic "cut" the user described — a control
that is visibly offered and does nothing.

**Live confirmation (probe #4, `sup.a@audit.test`):** the rendered supervisor sidebar is
`الرئيسية · الرئيسية · الطلاب · المستخدمون · الحلقات · إدخال اليوم · التخطيط · التنقيط ·
الاختبارات · المراجعة · النتائج · التقارير · الأخبار · التفويض · المراسلات` — **التنقيط is
there**, while `المراكز` and `طلبات الانتساب` are correctly absent.

**Fix:** either add `'supervisor'` to `scoring.routes.ts:9` *and* allow `PUT /scoring-modules`
for supervisors in the backend policy, or drop `'supervisor'` from `shell.component.ts:81`.
Which one is right depends on the intended role of the ناظر — **ask the user**.

Also worth noting as a general robustness point: `roleGuard` redirecting to `/` with no message
means *any* future nav/route drift fails silently the same way. A guard rejection that surfaces
a "you don't have access to this page" toast would turn this whole class of bug from
"mysterious bounce" into an obvious error.

---

### 2.19 🔴 The admin's dashboard is permanently locked to ONE center — there is no "all centers" option

This is the second half of the B1 disaster and it is what makes the 22 orphaned pupils
**invisible even to the one role that can see everything**.

**The mechanism — `alotrojah_Frontend/src/app/features/dashboard/dashboard.page.ts`:**

```ts
:66  private readonly autoCenter = effect(() => {
:67    if (this.pickedCenter() === null) {
:69      if (first) this.pickedCenter.set(first.id);   // <-- silently locks to center #1
       }
     });

:79  readonly statusOptions = computed(() => [ this.allOption('list.status'), ...STATUSES.map(...) ]);
:83  readonly levelOptions  = computed(() => [ this.allOption('list.level'),  ...this.levels().map(...) ]);

:87  readonly centerOptions = computed(() =>
:88    this.centers().map((c) => ({ value: String(c.id), label: c.name })),
:89  );                                        // <-- *** NO allOption() ***
```

`statusOptions` and `levelOptions` both prepend `this.allOption(...)` — a "— All —" entry whose
value is `''`. **`centerOptions` does not.** So once `autoCenter` fires, the center dropdown
can only ever be switched to *another real center*; it can never be cleared. And because the
audit DB (and, per the user's own report, a fresh install) has exactly **one** center, the
dropdown has exactly **one** option: the admin cannot change it at all.

`pickedCenter` then feeds both dashboard resources:

```ts
:113 centerData = resource({ params: () => ({ c: this.pickedCenter(), s: this.seasonId.value() }) ... })
:121 students   = resource({ params: () => ({ q, s, l, c: this.pickedCenter(), p: this.page() }),
:134   loader: ... if (params.c !== null) query['center_id'] = params.c; ... })
```

i.e. **the dashboard's pupil table is always center-filtered, and the filter cannot be removed.**

**✅ LIVE PROOF (probe #4, `admin@example.org`, audit DB with 25 pupils — 22 of them `center_id = NULL`):**

| Route | Rendered |
|---|---|
| `/` | `rows: 3`, `cards: 8`, `kpis: ["◉ اجمالي الطلاب 2", "◎ متوسط النقاط 8.50", "▣ متوسط السراج —", "معدل الالتزام 100% 100%"]` |
| `/dashboard` | identical (`rows: 3`, same KPIs) — `/` and `/dashboard` are the **same** lazy route, see `app.routes.ts:22-25` and `:88-91` |

Network trace for the dashboard load:
```
200 GET /students?page=1                      <-- first, unfiltered
200 GET /students?page=1&center_id=1          <-- autoCenter fires, re-queries FILTERED
200 GET /dashboard/center?center_id=1&season_id=1
```
The `page=1` → `page=1&center_id=1` pair is the auto-lock happening in real time. Result: the
KPI reads **"اجمالي الطلاب 2"** while the DB holds **25** pupils, and the table shows only
pupils 22/23/24. **The admin is told there are 2 students.**

**`/students` is not a way out either.** `students-list.page.ts` has an `allOption` helper at
`:44` and uses it for `list.group` (`:51`), `list.level` (`:55`), `list.status` (`:59`) and
`list.mode` (`:63`) — but there are **zero `center` references** in either `students-list.page.ts`
or `students-list.page.html` (which contains exactly 4 `app-dropdown`s). So the one page that
lists *all* pupils has **no center filter and no center column**: you can see that a pupil is
missing from the dashboard, but you cannot see *why*, and you cannot repair it there either
(the pupil detail page has no center field — §2.1).

**How this completes the B1 kill-chain** (all four links live-verified):

1. Admin creates a pupil through the UI → `center_id = NULL` (§2.1 — no center field on the form).
2. Admin's own dashboard auto-filters to center 1 with **no "all" option**, so the pupil is
   **invisible on `/` and in the KPI count** (§2.19 — this entry).
3. `/students` is unfiltered but capped at 20 rows out of 25, so the pupil may sit on page 2
   with no visible pagination control (§2.2).
4. No teacher or supervisor can ever see them — `CenterScope` excludes `center_id IS NULL` for
   every non-admin. Corroborated live: `t.mur@audit.test` → `GET /students?q=طالب` → **`total = 3`**
   (only pupils 22, 23, 24).

**Blast radius, measured on the audit DB:**
```sql
SELECT center_id, group_id, COUNT(*) FROM students GROUP BY center_id, group_id;
-- center_id NULL, group_id NULL -> 22
-- center_id 1,    group_id 1    -> 2
-- center_id 1,    group_id 2    -> 1
-- TOTAL 25
```
**22 of 25 pupils (88%) are center-less** and therefore invisible to every dashboard, every
KPI, every report and every non-admin user in the system.

**Fix (smallest):** add `this.allOption('dash.center')` to `centerOptions` in
`dashboard.page.ts:87-89` so the admin can clear the center filter. That alone restores the
true total on `/`. The real fix is §2.1 (put a center field on the pupil form) so pupils stop
being orphaned in the first place.

---

### 2.20 🔴 Weekly goals vanish from the UI as soon as a newer goal exists (Phase 6, step 4)

**Reported earlier as "weekly-goal state loss from week 2". Now reproduced live and root-caused.
The data is never lost — it is simply never displayed again.** This breaks roadmap Phase 6 step 4
(*"Weekly goal check per row"*) and Phase 7-adjacent teacher trust: a teacher who saved a goal last
week sees an empty box this week and will conclude the app ate it.

#### Root cause

`goal-list.component.ts:37-39` loads goals with **no filter at all**:

```ts
private readonly goals = resource({
  params: () => ({ t: this.tick() }),
  loader: () => firstValueFrom(this.entry.goals({}).pipe(map((p) => p.data))),
});
```

`EntryService.goals()` (`entry.service.ts:81-82`) is `GET /weekly-goals`, and
`WeeklyGoalController::index` **does** support `week_id` and `student_id` filters
(`WeeklyGoalController.php:24-25`) — the component just never sends them. It then collapses the
result into a per-pupil map and blanks anything that is not for the selected week
(`goal-list.component.ts:48-61`):

```ts
const byStudent = new Map((this.goals.value() ?? []).map((g) => [g.student_id, g]));
const wid = this.weekId();
return this.students().map((st) => {
  const existing = byStudent.get(st.id) ?? null;
  const matchesWeek = existing?.week_id === wid;
  ...
  target: d?.target ?? (matchesWeek ? (existing?.target_text ?? '') : ''),
```

`index` is `orderBy('id')`, so for a pupil with goals in several weeks the **last row wins the Map
key** — i.e. the *most recently created* goal, whatever week it belongs to. Every other week's goal
for that pupil is unreachable: `matchesWeek` is false and the row renders `''`.

#### Live proof (probe #5c, scratch `alotrojah_audit` DB)

Pupil 23 in `حلقة النور 1`; two goals saved via the real endpoint:

| Step | Result |
|---|---|
| `PUT /weekly-goals {student_id:23, week_id:1, target_text:"W1 goal: Surah Al-Mulk"}` | **201**, id 2 |
| `PUT /weekly-goals {student_id:23, week_id:43, target_text:"W2 goal: Surah Al-Qalam"}` | **201**, id 3 |
| `GET /weekly-goals` (unfiltered — what the component does) | 200, **both** rows present, `total:3` |
| → emulated `byStudent.get(23)` | week **43**, `"W2 goal: Surah Al-Qalam"` |
| → UI while viewing **week 1** | `matchesWeek=false` → renders **`""` (BLANK)** |
| → UI while viewing **week 43** | `matchesWeek=true` → renders the text |
| `GET /weekly-goals?week_id=1` (the call the component *should* make) | 200 → **1 row**, `"W1 goal: Surah Al-Mulk"` ✅ still in the DB |
| cleanup `DELETE /weekly-goals/2` and `/3` as admin | **200** each (DB left as found) |

So the backend is correct and the week filter works; the frontend throws the filter away.

#### Second defect in the same component: unsaved drafts bleed across weeks

`drafts` (`goal-list.component.ts:41-43`) is keyed by **student id only** and is never cleared when
`weekId()` changes — no effect watches the input, and `@for` tracks `row.student.id`
(`goal-list.component.html:4`), so the same `<input [value]="row.target">` elements are reused across
a week switch. Type a target for week 1, do **not** press Save, select week 2 → the week-1 text is
still in the box (`d?.target ?? …` short-circuits before the week check), and pressing Save there
writes it to **week 2** (`upsertGoal(row.student.id, this.weekId(), d.target …)`).

#### Third: another silent 50-row ceiling

`WeeklyGoalController::index` ends in `->paginate(50)`, and `per_page` is **ignored** — probe sent
`?per_page=500` and got `meta.per_page: 50`. Once a center accumulates more than 50 goal rows in
total (2 pupils × 26 weeks already exceeds it), the unfiltered page 1 stops containing even the
"latest" goal, and the box goes blank for everyone. Same family as §2.2. (`GET /weeks` also
`paginate(50)`; the probe season has 46 weeks across 2 seasons, so it is one season away from the
same cliff.)

#### Fix (smallest)

Make the loader depend on the selected week and drop the `matchesWeek` guesswork:

```ts
private readonly goals = resource({
  params: () => ({ weekId: this.weekId(), t: this.tick() }),
  loader: ({ params }) =>
    params.weekId === null
      ? Promise.resolve([] as WeeklyGoal[])
      : firstValueFrom(this.entry.goals({ week_id: params.weekId }).pipe(map((p) => p.data))),
});
```

then key `byStudent` on the returned rows as today (they are now all for one week), and clear
`drafts` in an `effect` on `weekId()` so unsaved text cannot travel between weeks. The `params`
object already exists on the resource and is currently ignored — this is a two-line change, not a
redesign.

---

## 3. MY OWN EARLIER FALSE POSITIVES — **NOT** cuts

Recorded so they are not "fixed":

| Earlier claim | Reality |
|---|---|
| Register form is missing `birth_date` / `gender` | **Wrong.** `register.page.ts` has both controls; `:87-89` uses the correct `gender.male` / `gender.female` keys; `:137-146` conditionally adds `Validators.required` for `role=student`; `:166-167` includes them in the payload. **Register is fine.** |
| `honor_flag` frontend values are wrong | **Wrong.** `season-results.page.ts:35-38` uses `none` / `tashji3` / `intibah`, matching `app/Enums/HonorFlag.php`; `:76` defaults to `'none'`. Badges render in `season-results.page.html:33`, `reports/season-report.page.html:45`, `reports/term-report.page.html:54`. My 422s came from sending `'good'`/`'excellent'` — **my probe error.** |
| The pupil form renders raw i18n keys `common.male` / `common.female` | **This one was RIGHT — I wrongly retracted it, then re-confirmed it.** See **§2.17**. Probe #1 missed it because it read `body.innerText` with the dropdown closed. |
| A murajaa cycle can't be created by a teacher (403) | **Wrong.** The 403 was because I called as the **hifz** teacher. As the **murajaa** teacher → **201**. Correct per `MurajaaPolicy::manageReviews`. **My probe error.** |
| The delegation link has the wrong host | **Wrong about the host, right about the path.** `FRONTEND_URL=http://localhost:4200` resolves correctly (Laravel 12 merges the framework's default `config/app.php`, so `config('app.frontend_url')` comes from `vendor/laravel/framework/config/app.php:60`). Only the **path** is wrong — see §2.5. |
| `config('app.frontend_url')` never resolves | **Wrong.** See above. `.env:74 FRONTEND_URL=http://localhost:4200`, `.env:5 APP_URL=http://localhost:8000`, and `bootstrap/cache/` holds only `packages.php` + `services.php` (**no config cache**), so `.env` is read live. |
| The exam reweight feature isn't wired in the frontend | **Wrong.** See §2.10 — it is wired correctly. My 422 came from sending a **map** instead of an **array of `{id, max_score}`**. **My probe error.** |
| Cross-center isolation is broken | **Wrong — it works.** The center-2 teacher got **404** on a center-1 group and saw only `مركز الفرقان`. |
| "Empty-body 422" on results endpoints | **Wrong.** Caused by a precedence bug in my own `msg()` helper (`j?.message ?? j?.errors ? … : …`), not by the API. |
| The `board` role is fundamentally broken | **Wrong.** It works fully with a center assigned — see §2.8. The real defect is allowing a center-less board user. |

---

## 4. Things already confirmed **working** (so they are not re-litigated)

- Fresh-DB migration: all 13 migrations run clean on an empty database.
- Login contract: response key is **`data.access_token`** (not `data.token`),
  `token_type: bearer`, `expires_in: 3600`.
- Resource envelope: `{success, message, data:{data:[…], links, meta}}` — pagination is at `json.data.meta`.
- `GET /scoring-check` → `{valid:true, total:20}`.
- Admin nav is complete: `الرئيسية / المراكز / الطلاب / المستخدمون / الحلقات / إدخال اليوم / التخطيط / التنقيط / الاختبارات / المراجعة / النتائج / التقارير / الأخبار / التفويض / المراسلات / طلبات الانتساب` + theme/logout/language controls.
- `/centers` (with 2 centers): heading `المراكز`, **2 rows**, an `add` button carrying
  **both `aria-label="إضافة مركز"` and `title="إضافة مركز"`** (`class="btn btn-primary btn-plus"`),
  and per-row `تعديل` buttons. `iconOnlyButtons = 0`.
  → **This partially retracts my earlier "no UI to create centers" claim: the control exists
  and is labelled/titled.** It is icon-only *visually*, so on a fresh empty install the admin
  has to notice a `+` in the page header. That is a **discoverability** problem, not a missing
  feature. Still worth a text label, because it is what triggered the user's MVP complaint.
- `/users/new` renders: `الاسم الكامل *`, `البريد الإلكتروني *`, `رقم الهاتف`,
  `كلمة المرور *`, `الصفة *`, `المركز / اختر المركز`.
- `/students/new` renders: `الاسم الكامل *`, `اختر المركز`, `الحلقة`, `المستوى`, `الجنس`,
  `النوع`, `النمط *`, `الحالة *`, `ملاحظات`, `إلغاء`, `حفظ`.
- Notifications create/delete work; `POST /notifications` returns a working `wa.me` link.
- `DELETE /announcements/{id}` by a **non-author** teacher → 403 (by design).
- `DELETE /users/5` as admin → 200.
- Angular `withComponentInputBinding()` is enabled (`app.config.ts:24`), so query params bind
  to component `input()`s — this is how `redeem.page.ts:31` reads `token`.

---

## 5. CHECK STATUS

### ✅ Done

| # | Check | Result |
|---|---|---|
| 1 | §2.1 UI proof, single center — is the center dropdown absent? | **Absent** (7 dropdowns, no center, `hasCenterWord:false`); pupil created with `center_id=NULL` via a real `201 POST /students`; group dropdown offers only `بدون حلقة` |
| 1b | Can the admin repair a NULL-center pupil from `/students/1`? | **No** — `labels: []`, only `تعيين الحلقة → بدون حلقة` |
| 2 | §2.8 UI proof — can a board user be made without a center? | **Yes** — `/users/new` center dropdown leads with the placeholder `اختر المركز` and its label has no `*` |
| 3 | `/centers` with one center — is the `+` still there? | **Yes** — `rows:1`, `addBtn:true`, `addBtnVisible:true`, labelled `إضافة مركز` |
| 4 | §2.15 / §2.16 — name the 403 endpoints | student `/` → **`403 GET /centers`** and **`403 GET /seasons`**; `/reviews` as murajaa teacher → **none** (§2.15 retracted) |
| 5 | §2.7 UI — delete button shown to a murajaa teacher? | **No delete button rendered** → 403 unreachable via UI. **§2.7 now DISSOLVED as by-design** (`reviews.page.ts:47-51 canManage()` + `.html:59 @if (canManage())`); the `rows:0` worry is also dissolved — the page is student-picker driven (`.html:30 @if (pickedStudent() !== null)`) |
| 6 | §2.11 UI — does `/scoring` show a supervisor a Save button that silently bounces? | **No — the question was wrong.** `scoring.routes.ts:9` guards `/scoring` with `roles:['admin']`, so a supervisor never reaches the page. The real defect is that the **nav still offers it**: → **new §2.18** |
| 7 | §2.14 UI — how do the honors bar / `weekly []` / `final null` render? | **Done, partially** — `متوسط السراج —` is a correct empty state; `معدل الالتزام 100% 100%` duplicates its value (cosmetic); `اجمالي الطلاب 2` is **not** a data-quality nit but the center lock → **new §2.19**. Honors bar **deferred** until §2.19 is fixed |
| 8 | Phase 6 UI — the 20-pupil cap on the daily-entry grid | **Not reproducible, and my prediction was wrong.** `entry.page.ts:93-98` loads the roster via `studentsSvc.list({ group_id })`, i.e. **group-filtered**, so a single حلقة never hits the cap. The cap bites `/students` and the dashboard table instead → §2.2 corrected |
| 9 | `/registrations` nav visibility for supervisor / board | **Consistent** — nav is `roles:['admin']` (`shell.component.ts:134-138`) and `GET /registration-requests` → 403 for a supervisor. Supervisor's rendered sidebar has **no** طلبات الانتساب. Live: `/registrations` → bounced to `/` |
| 10 | `/delegate` nav visibility for supervisor | **Works, not a cut** — `shell.component.ts:120-124` lists it for `admin|supervisor|teacher`; live as supervisor `/delegate` → `landed:"/delegate"`, heading `التفويض`, `200 GET /groups`, no 403 |
| 11 | `/reviews` lists 0 cycles for the teacher who created one | **Dissolved** — picker-driven, see row 5 |
| 13 | §2.9 — does `database/seeders` create the first admin? | **No, and it crashes.** `DatabaseSeeder.php` + `UserFactory.php` are untouched Laravel stubs writing a `name` column; the real column is `users.full_name`. Live `php artisan db:seed` → `SQLSTATE[42S22] 1054 Unknown column 'name'`. → **§2.9 escalated to 🔴 BLOCKER** |
| — | Board-with-NULL-center browser login (missed by probe #1) | **Works** — the earlier "failure" was a probe artifact (see §2.8) |
| — | Raw i18n keys on the pupil form | **Confirmed** `common.male` / `common.female` → new §2.17 |
| — | Full nav-vs-route matrix (all 16 nav entries × their `data.roles`) | **Built** — exactly **one** mismatch (`/scoring`) → §2.18. All other entries agree |
| — | Center-less board account nav (probe #4) | **Only `nav-dashboard` + `nav-news`** (+ logout/theme) — a near-empty app with no explanation, corroborates §2.8 |
| — | Admin dashboard center filter | **No "all centers" option exists** — `dashboard.page.ts:87-89 centerOptions()` omits the `allOption()` that `statusOptions`/`levelOptions` have, and `:66-70 autoCenter` locks to center 1 → **new §2.19 🔴** |
| 12 | `scoring-modules`: `murajaa max_points 20` + `is_in_weekly_total:true` yet `scoring-check` still says `total 20` | **Reconciled** — `ScoringService.php:28-35` sums only `is_active` **and** `is_in_weekly_total` **and** `scope='weekly'`. `murajaa` is excluded by *scope*, `sarraj` by the *flag* — two inconsistent mechanisms, so one UI toggle on either makes the total 40. → **§8.3** |
| 14 | **`roadmap.md` accuracy review** | **Done** — 28 claims verified live against the scratch DB. 4 genuine documentation errors, 2 internal inconsistencies, 1 frontend-only claim, and everything else reproduces **exactly**. → **§8** |
| 17 | Phase 8 UI — the exam inline-weight 422 message | **Done, and the worry was misplaced.** `fail()` (`Controller.php:57-71`) derives `errors.code` from a message-prefix map, so live `PUT /exams/1/question-weights` with total 17 → `{"message":"Weights must total 20 (got 17).","errors":{"code":"WEIGHTS_TOTAL"}}`, translated in `ar.json:90` + `en.json:90`. **But** the reweight mode has no live draft total, does not disable Save, and `submitReweight()` returns **silently** on a cleared/out-of-range weight → dead button. → **§2.10 updated** |
| 16 | Phase 6 UI — weekly-goal state loss from week 2 | **Done — CONFIRMED as a 🔴 real cut, not a nit.** `goal-list.component.ts:37-39` calls `goals({})` with no `week_id`, then blanks any goal whose week ≠ the selected one, so only the newest goal per pupil is ever visible. Reproduced live: week-1 goal saved (201), then invisible in the UI while `?week_id=1` still returns it. Plus drafts bleed across weeks and a silent `paginate(50)`. → **new §2.20** |
| 19 | Phase 3 UI — `/groups/new` form contract | **Done at the API + source level.** `StoreGroupRequest.php:16-25` requires `name`, `center_id`, `level_id`; `teacher_id` is `nullable|exists:users,id` with **no same-center and no availability check**; the schedule field is `schedule_days` (a free `string max:60`) — my `weekdays:[1,3]` was silently ignored. A teacher already owning 2 groups is accepted (201). |

### ⏳ Still pending

15. **`docs/Agent.md` lockstep** — after any code change, update both repos.
18. **Honors bar rendering** — blocked behind §2.19 (needs >1 visible pupil).

### Probe history

| Script | Outcome | Artefacts |
|---|---|---|
| `ui-probe.js` (#1) | admin / murajaa-teacher / student sections completed; **crashed** on the board login (`Waiting failed: 15000ms`) | `%TEMP%\audit\ui-probe.json`, `ui-centers.png`, `ui-student-new.png`, `ui-seasons.png`, `ui-terms-after-click.png`, `ui-user-new.png`, `ui-dashboard-admin.png`, `ui-delegate.png`, `ui-delegate-link-follow.png`, `ui-reviews-mur.png`, `ui-student-dash.png` |
| `ui-probe2.js` (#2) | completed; board section hit the same probe artifact | `ui-probe2.json`, `ui2-student-new-1center.png`, `ui2-student-new-after-submit.png`, `ui2-user-new.png`, `ui2-centers-1.png`, `ui2-reviews-mur.png`, `ui2-student-home.png` |
| `ui-probe3.js` (#3) | completed cleanly; settled the pupil-create chain and the board login | `ui-probe3.json`, `%TEMP%\audit\probe3.log`, `ui3-board-null.png`, `ui3-pupil-create.png`, `ui3-pupil-1.png` |
| `ui-probe4.js` (#4) | completed cleanly (exit 0, 32 `note` lines); settled the nav matrix, the scoring dead link, the dashboard center lock, and dissolved §2.7 | `%TEMP%\audit\ui-probe4.json`, `%TEMP%\audit\probe4.log`, `ui4-sup-nav.png`, `ui4-sup-scoring-click.png`, `ui4-mur-reviews.png`, `ui4-hifz-entry.png`, `ui4-admin-home.png`, `ui4-admin-dashboard.png`, `ui4-admin-reports.png` |
| `checks4-7.mjs` (API #4b) | the roadmap accuracy sweep behind **§8** — 28 claims, all four 422 codes, both delegation guards, announcement authorship, results/honor flags, season arithmetic | `%TEMP%\audit\checks4.log` … `checks7.log` |
| `checks8.mjs` / `checks8b.mjs` (API #5) | settled §2.10: `WEIGHTS_TOTAL` body shape confirmed; out-of-range weights return a **codeless** Laravel validation bag; weights restored to `9,11` afterwards | `%TEMP%\audit\checks8.log`, `checks8b.log` |
| `checks8c.mjs` (API #5c) | reproduced **§2.20** end-to-end (2 goals → newest-only display), proved `?week_id=` works, proved `per_page=500` is capped at 50, then deleted both probe goals (200) so the DB is unchanged | `%TEMP%\audit\checks8c.log` |

**Lessons recorded for future probes:**
- Always open a dropdown before reading its option labels (closed `app-dropdown`s render
  nothing into `body.innerText`), and reset the network listener *before* the navigation you
  intend to measure — otherwise the previous session's requests are attributed to the wrong page.
- **Never touch `localStorage` before the first same-origin `goto`.** On `about:blank` there is
  no origin, and `localStorage.clear()` throws
  `SecurityError: Failed to read the 'localStorage' property from 'Window': Access is denied
  for this document.` (this killed probe #4's first run). Do the `goto` first, then combine
  clear + set in a single `try/catch`-wrapped `evaluate`.
- Wrap every `goto`/`reload` in `try/catch` with a timeout: pages that poll never reach
  `networkidle0`, but they are usually perfectly usable afterwards.
- **When inserting a section before an existing heading with the Edit tool, always re-emit that
  heading in `new_string`.** I deleted `## 3.` this way and had to restore it.

---

## 6. Cleanup owed at the end of the audit

- [ ] Stop background servers `b6nmd4ypk` (backend :8000) and `b2xjdj2r7` (frontend :4200)
- [ ] Decide whether to drop the `alotrojah_audit` database
- [ ] Delete `/tmp/audit-backend.log`, `/tmp/audit-frontend.log`
- [ ] Delete `%TEMP%\audit\*.mjs`, `%TEMP%\audit\*.json`, `%TEMP%\audit\*.png`, `%TEMP%\shot-tool\ui-probe*.js`
- [ ] **Never commit any of the above.** `authz.php` is not part of git — leave it alone.
- [ ] **No commits without an explicit request from the user** (standing instruction).

---

## 7. Standing constraints from the user (verbatim)

- *"if showed again stop executing anything and tell me the mysql of xampp has issue again"*
- *"just don't auto-commit if i didn't say that, i need to review the code"*
- *"authz.php is not part of git just leave it"*
- *"keep everything guardian-free"*
- Non-ASCII (Arabic) edits only via the Edit/Write tools — **never** shell string literals.
- Update `docs/Agent.md` in **both** repos after every change (lockstep).
- Vitest only via `ng test` — never `npx vitest run`.
- Prod host is FTP-only: prod DB changes = idempotent patch SQL via phpMyAdmin, no SSH/artisan,
  never touch prod's `migrations` table.

---

## 8. `roadmap.md` ACCURACY REVIEW

*(explicitly requested: "i have a roadmap.md file that show's the steps but can be wrong".
Every row below was verified **live** against the scratch `alotrojah_audit` DB and the real API, or
against the frontend source where the claim is UI-only. Nothing here is an inference.)*

**One-line verdict:** the roadmap is *accurate about the app's rules* and *wrong about four of its own
instructions*. "20 is law", "1–3 weeks", "reweight keeps scores", the honor flags, the delegation
minutes and the announcement-authorship rules all reproduce **exactly**. What fails is the very first
line ("zero users"), one Phase-7 instruction, one Rules-of-thumb bullet, and the Phase-10 dashboard claim.

### 8.1 Claim-by-claim

| # | Roadmap claim (as written) | Verdict | Live evidence |
|---|---|---|---|
| 1 | Preamble — *"Starting state: fully migrated database, **zero users**"* | 🔴 **UNREACHABLE** | All 13 migrations do run clean on an empty DB, but there is no admin bootstrap and `php artisan db:seed` crashes (`SQLSTATE[42S22] 1054 Unknown column 'name'` — the stub factory writes `name`, the real column is `users.full_name`). Reaching the roadmap's own starting state needs a hand-written MySQL INSERT — exactly what the user had to do. → **§2.9** |
| 2 | Phase 0 — *"there is no delete — the endpoint refuses deletion"* | ✅ **TRUE** | `DELETE /centers/1` → **403**. Caveat: `CenterPolicy` denies first, so the caller sees the generic `"This action is unauthorized."`, never the intended `'Centers cannot be deleted.'` from `CenterController.php:43-48`. Cosmetic, but the message the code was written to show is dead code. |
| 3 | Phase 1 — *"a teacher owning groups can't be hard-deleted; the app asks for a replacer"* | ✅ **EXACTLY TRUE** | `DELETE /users/{teacher}` → **422 `NEED_REPLACER`** with a rich payload: `{teacher, groups:[حلقة النور 1, حلقة الحذف], counts:{exams:1,...}}`, and `POST /users/{id}/replace` takes **`replacer_id`**. |
| 4 | Phase 1 — *"login as each new account works immediately"* | ✅ **TRUE** | `POST /users` → 201, then login → 200 with `access_token`. With `is_active:false` login is blocked. A group-less teacher `DELETE /users/{id}` → 200. |
| 5 | Phase 2 — *"6 terms × 7 weeks = 42 weeks / 126 sessions"* | ✅ **EXACTLY TRUE** | Verified from source *and* live. `season-create.page.ts:22-29 DEFAULT_TERMS` = 6 Arabic names; `:93` pushes `row(n, 7)` per term; `:76 sessions_per_week` default **3** → 6 × 7 × 3 = 126. API echo: `total_weeks:42, total_sessions:126, terms_count:6`. `POST /seasons/{id}/activate` → 200 `is_current:true`. *(I activated the probe season then reverted to season 1 and deleted season 3 to leave the audit DB as found.)* |
| 6 | Phase 3 — *"a group with no teacher shows `بدون معلم` and works fine"* | ✅ **TRUE** | `POST /groups` with `teacher_id:null` → **201**, response `teacher:null`, `students_count:0`, `fill_pct:0`. |
| 7 | Phase 3 — *"the teacher list filters to this center … only **free** same-center teachers are listed"* | ⚠️ **HALF TRUE — "same-center" yes, "free" no, and neither is enforced server-side** | **FE does filter by center**: `group-form.page.ts:94-100` loads teachers with `usersSvc.listAll({role:'teacher', center_id: effectiveCenterId()})`, and `:110-114 onCenterChange()` clears the pick when the center changes. **FE does NOT filter by availability** — a teacher who already owns a group is listed and selectable. **Backend enforces neither**: `StoreGroupRequest.php:16-25` has `'teacher_id' => ['nullable','integer','exists:users,id']` with no center and no availability rule. Live: assigning a teacher who already owns 2 groups → **201**. Only a nonexistent `teacher_id:999` → 422. (A true cross-center probe was impossible — the audit DB has only 1 center.) |
| 7b | Phase 3 — *"Name, center, level, teacher, capacity, **weekdays chips**, `حفظ`"* | ✅ **EXACTLY TRUE** | `group-form.page.html:78-89` renders real `.day-chip` toggles with `aria-pressed` and `data-testid="day-<key>"`; `group-form.page.ts:116-118 toggleDay()` and `:140 schedule_days: this.days().join(',')` send them as the comma string the API expects. `level_id` carries the `*` required marker (`.html:41`) matching the API. **Bonus (good design, not in the roadmap):** for a non-admin the center dropdown is deliberately never loaded (`:80-84 params.allow = isAdmin()`), `effectiveCenterId()` falls back to the supervisor's own center (`:60-62`), and `canSave` forces an admin to pick one (`:68`) — so supervisors cannot cross centers from this form at all. |
| 8 | Phase 4 — *"assign via the group card on the pupil page"* | 🔴 **BROKEN by B1** | Admin-created pupils get `center_id = NULL`, so `PUT /students/1 {group_id}` → **422 "Group belongs to another center."** The roadmap's own Phase-4 step 2 is impossible for the admin until §2.1 is fixed. |
| 9 | Phase 5 — *"any change must still sum to exactly 20 or the save is rejected (422, **now with a translated message**)"* | ✅ **TRUE** | `SCORING_TOTAL`, `WEIGHTS_TOTAL`, `SPAN_INVALID`, `NEED_REPLACER` are all present in **both** `ar.json` and `en.json`. Default modules do read `total: 20`. |
| 10 | Phase 6 — *"one input per active module … live /20 totals"* + score cap | ✅ **TRUE, and server-enforced** | hifz `score:99` and `score:15` → **422 "Must be between 0 and 14.00."**; `score:14` → **201**; a valid row set reached `weekly_totals` exactly **20**. |
| 11 | Phase 6 — *"Murajaa-type teachers see disabled inputs + notice"* | ✅ **TRUE, and server-enforced** | As the murajaa teacher, `POST /scores/bulk` → **403 "Review teachers enter murajaa cycles, not weekly scores."** The UI disabled state is not the only guard. |
| 12 | Phase 7 — *"week range (**1–3 weeks**, enforced)"* | ✅ **EXACTLY TRUE** | 1–3 → **201**; 1–4 and 1–5 → **422 `SPAN_INVALID`**. |
| 13 | Phase 7 — *"Cycles list per pupil; **delete from the list**"* (written for the murajaa teacher) | 🟠 **ROADMAP ERROR** | The **author** teacher `DELETE /revision-logs/{id}` → **403**; only **admin** → 200. The frontend never renders the button for a teacher (`reviews.page.ts:47-51 canManage()` + `reviews.page.html:59 @if (canManage())`). The roadmap instructs the teacher to do something the app deliberately forbids. → **§2.7** (dissolved as by-design; the *roadmap* is what's wrong). Residual product question for the user: a teacher who mistypes a revision log cannot self-correct. |
| 14 | Phase 8 — *"weights must read exactly **20/20** or save is rejected"* | ✅ **EXACTLY TRUE — and cumulative** | First batch `7+7+6` → **201**. A second batch of 20 on the same exam → **422 "Weights must total 20 (got 40)."** So there is no "add another 20 later" hole. The FE pre-guards the same rule client-side (`exam-detail.page.ts` `draftTotal() !== 20` blocks `saveDraft()`), and it *batches* rows — `addQuestion()` only pushes to `draft()`, one `POST /exams/{id}/questions` carries them all. |
| 15 | Phase 8 — *"Then score each (capped at its own weight)"* | ✅ **TRUE** | `score:99` → 422 (global max 20); `score:8` on a **weight-7** question → **422 `SCORE_OVER_MAX`**; `score:7` → 200. Per-question cap, not just the global one. |
| 16 | Phase 8 — *"header average = **sum** of question scores (7+7+6 with full marks → 20/20)"* | ✅ **EXACTLY TRUE** | `overall_avg = 20`. |
| 17 | Phase 8 — *"A reweight mode exists for fixing weights without losing scores"* | ✅ **EXACTLY TRUE** | `PUT /exams/{id}/question-weights`. A reweight that would orphan a score → **422 `SCORE_OVER_MAX`** ("A recorded score exceeds its new weight."). A valid `7+7+6` → **200** with the scores still `7,7,6`. |
| 18 | Phase 8 — *"`حذف` removes exam + questions (cascade, no orphans)"* | ✅ **TRUE** | `DELETE /exams/{id}` → 200, then `GET /exams/{id}` → **404**; no orphaned `exam_questions` rows. |
| 19 | Phase 9 — honor flag *`تشجيع`/`انتبه`* | ✅ **TRUE** | `PUT /term-results` with `tashji3` / `intibah` / `none` → **201**; `excellent` / `good` → **422** (`Rule::enum(HonorFlag::class)`). |
| 20 | Phase 9 — *"decided **jointly** by teacher and manager"* | 🟡 **AUTHZ QUESTION, not a doc error** | Live: `PUT /term-results` as the **murajaa teacher → 201 ALLOWED**. So one teacher can unilaterally set the flag that drives the honor board and the family calls. Nothing in the app makes it "joint". → reinforces **§2.13**. |
| 21 | Phase 10 — *"The dashboard fills itself as data accumulates: **center cards**, honors bar…"* | 🔴 **CONTRADICTED** | `dashboard.page.ts:66-70 autoCenter` locks the admin to center 1, and `:87-89 centerOptions()` omits the `allOption()` that `statusOptions`/`levelOptions` do have. With the roadmap's own 3-center setup (C1 النور / C2 الفرقان / C3 الإحسان) the admin's home page shows **only C1**, permanently. → **§2.19** |
| 22 | Phase 11 الأخبار — *"edit/delete own posts (admin edits all)"* | ✅ **EXACTLY TRUE** | Author `PUT` → 200; **other** teacher `PUT` → **403**; **admin** `PUT` → 200; author `DELETE` → 200; authorship preserved after an admin edit. |
| 23 | Phase 11 التفويض — *"time-limited link (**15/30/60/120** min)"* | ✅ **EXACTLY TRUE** | `GenerateDelegationRequest.php:18` `'minutes' => ['required','integer','in:15,30,60,120']`. All four → **201** with the correct `expires_at`; `45` and `0` → **422**. |
| 24 | Phase 11 التفويض — *"**responsible teacher** generates"* | ✅ **TRUE server-side, ⚠️ leaky nav** | `POST /groups/{id}/delegations` as a **supervisor → 403** and as a **non-owner teacher → 403** (matches `DelegationPolicy::generate`). But the nav still shows `/delegate` to supervisors and the page loads fine — they can walk into a form that will always bounce. Same class of defect as **§2.18**. |
| 25 | Rules — *"**Same-center everywhere**: teachers, pupils, groups and exams never cross centers (403s otherwise)"* | 🔴 **FALSE IN PRACTICE for pupils** | `GET /students?per_page=100` → the `per_page` is **ignored** (20 rows, `meta.total=25`, `meta.per_page=20`), and **all 20 returned rows had `center_id === null`**. `?unassigned=1` → total 22. So 22 of 25 pupils (88%) belong to *no* center: they are invisible to every center-scoped view and unassignable to a group. → **§2.1**, **§2.2**, **§2.19** |
| 26 | Rules — *"**Deactivate, don't delete**, living records (users, pupils, **groups**). Delete = typos/test rows only"* | 🟠 **WRONG FOR GROUPS** | `DELETE /groups/3`, `/4`, `/5` → **403 even for the admin**. The roadmap tells the admin that a typo group can be deleted; it cannot. Three undeletable probe groups are now permanently stuck in `alotrojah_audit`. → re-confirms **§2.6** |
| 27 | Rules — *"**Order matters**: users → season (+activate) → groups → pupils → …"* | 🟡 **INTERNALLY INCONSISTENT** | This ordering list **omits centers**, while Phase 0 says centers must exist before any non-admin account or group can reference them. A reader who starts from the "Rules of thumb" summary skips Phase 0 and lands in the exact dead end the user hit. |
| 28 | Phase 5 — *"weekly total must read **20** (default `الحفظ 14 + المواظبة 4 + التجويد 2`)"* | ✅ **TRUE**, but fragile | See §8.3 — the total is right for the wrong reason. |

### 8.2 The four genuine roadmap errors (documentation, not code)

1. **The preamble's starting state cannot be reached** (row 1). "zero users" + "fully migrated" is not
   a state the app can produce. Either ship a working `db:seed`/`UserFactory` (§2.9) or change the
   preamble to document the manual INSERT.
2. **Phase 7 tells the murajaa teacher to "delete from the list"** (row 13) — the author gets 403 and
   the button is never rendered. Fix the sentence to "…delete from the list (admin/supervisor only)",
   or decide the teacher *should* be able to delete their own mistake and change the policy instead.
3. **"Deactivate, don't delete … groups"** (row 26) — group delete is 403 for everyone including admin,
   so the advice is unactionable. Either allow admin group-delete (§2.6) or drop "groups" from that bullet.
4. **Phase 10's "the dashboard fills itself"** (row 21) — with the roadmap's own 3 centers the admin's
   dashboard is locked to C1 (§2.19). This is the one place where a *doc* claim hides a 🔴 code bug.

### 8.3 Two internal inconsistencies + one fragile invariant

- **"Order matters" omits centers** (row 27) while Phase 0 requires them first.
- **"Same-center everywhere"** (row 25) is contradicted by the app's own pupil records: 88% of them are
  center-less, and the `/students` list applies no center filter at all.
- **The weekly total of 20 is right for the wrong reason.** `ScoringService.php:28-35`
  (`scoringCheck()`) sums only modules where `is_active` **and** `is_in_weekly_total` **and**
  `scope = 'weekly'`. The seeded data excludes the two /20 modules by **two different mechanisms**:
  `murajaa` has `is_in_weekly_total = true` but `scope = 'murajaa'` (excluded by *scope*), while
  `sarraj` has `scope = 'weekly'` but `is_in_weekly_total = false` (excluded by the *flag*).
  Either one alone would suffice; having both means **a single UI toggle on either module pushes the
  weekly total to 40** and flips `scoring-check` to `valid:false`. That reconciles the old §5 item 12
  (`murajaa max_points 20` + `is_in_weekly_total:true` yet `total 20`) — the answer is the `scope`
  filter, and the flag on that row is misleading.

### 8.4 Classification the user asked for

- **(a) Genuine app bugs surfaced by the roadmap walk:** §2.9 (no admin bootstrap / broken seeder),
  §2.1 + §2.2 (NULL-center pupils + 20-row pagination), §2.6 (groups undeletable even by admin),
  §2.19 (dashboard center lock), §2.18 (nav offers role-blocked pages), §2.13 (a teacher alone can set
  the honor flag), §2.17 (raw `common.male` / `common.female` i18n keys), §2.20 (weekly goals
  disappear from the UI once a newer goal exists), the reweight dead Save button (§2.10), and the
  unenforced teacher rules on `POST /groups` (row 7 — the *frontend* filters by center, the
  *backend* enforces neither center nor availability).
- **(b) Roadmap documentation errors:** the four in §8.2 plus the two inconsistencies in §8.3.
- **(c) My own false positives during this review** — all were *probe* errors, never app bugs, and are
  recorded so nobody re-flags them: `POST /exams` needs **`exam_type`** (enum `term_batch` /
  `hizb_completion` / `final_season`), not `type`; results live at **`PUT /term-results`** and
  **`PUT /season-results`**, not `/results/term`; delegations need **`minutes`**, not
  `expires_in_minutes`; replace needs **`replacer_id`**, not `replacement_user_id`; bulk scores need
  **`records`** with `records.*.score`, not `scores`; `POST /groups` **requires `level_id`**; the group
  schedule field is **`schedule_days`** (a string), not `weekdays` — my `weekdays:[1,3]` was silently
  ignored; and levels are at **`GET /reference/levels`** (`reference.service.ts:27-28`), so my earlier
  `/levels` 404 was mine, not the app's. The empty-`weights` 422 and `PUT /exam-questions/undefined`
  404 were pure cascade from those bad payloads.

### 8.5 One extra number worth keeping

`StoreScoresBulkRequest.php:18-25` accepts **`records` up to `max:400`**, while `StudentController::index`
paginates at **20**. So the *write* path is not the bottleneck for a big حلقة — only the *read* path is.
That corroborates §2.2's corrected scope: the cap hurts `/students` and the dashboard table, never the
daily-entry grid (which is group-filtered, `entry.page.ts:93-98`).
