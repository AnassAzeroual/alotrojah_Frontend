/**
 * API contract smoke for the unified Hifz/Murajaa workspace + timeline.
 * Requires the demo API (default :8002) with demo users.
 *
 * Run: node scripts/workspace-api-smoke.mjs
 * Env: API_BASE=http://127.0.0.1:8002/api/v1
 */
const BASE = process.env.API_BASE ?? 'http://127.0.0.1:8002/api/v1';
let failures = 0;
const ok = (name, condition, detail = '') => {
  console.log(`${condition ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!condition) failures++;
};

async function login(email) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password: 'password123' }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`login ${email}: ${res.status} ${JSON.stringify(body)}`);
  return body.data.access_token;
}

async function call(path, token, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

const admin = await login('admin@demo.alotrojah.ma');
const hifz = await login('teacher.nour.hifz@demo.alotrojah.ma');
const murajaa = await login('teacher.nour.murajaa@demo.alotrojah.ma');
const student = await login('student.nour.01@demo.alotrojah.ma');
const otherStudent = await login('student.nour.02@demo.alotrojah.ma');

const workspace = await call('/sessions/1/workspace', admin);
ok('workspace loads', workspace.status === 200, `HTTP ${workspace.status}`);
ok('workspace has students', (workspace.body.data?.students?.length ?? 0) > 0);
ok('workspace has modules', (workspace.body.data?.modules?.length ?? 0) >= 5);

const hifzWorkspace = await call('/sessions/1/workspace', hifz);
ok(
  'Hifz teacher permission split',
  hifzWorkspace.body.data?.permissions?.hifz === true &&
    hifzWorkspace.body.data?.permissions?.murajaa === false,
);

const murajaaWorkspace = await call('/sessions/1/workspace', murajaa);
ok(
  'Murajaa teacher permission split',
  murajaaWorkspace.body.data?.permissions?.murajaa === true &&
    murajaaWorkspace.body.data?.permissions?.attendance === false,
);

const studentId = workspace.body.data.students[0].id;
const murajaaModule = workspace.body.data.modules.find((m) => m.code === 'murajaa');
const forbiddenMurajaa = await call('/sessions/1/workspace', hifz, {
  method: 'PUT',
  body: JSON.stringify({
    scores: [{ student_id: studentId, module_id: murajaaModule.id, score: 10 }],
  }),
});
ok('Hifz cannot write Murajaa', forbiddenMurajaa.status === 403, `HTTP ${forbiddenMurajaa.status}`);

const forbiddenAttendance = await call('/sessions/1/workspace', murajaa, {
  method: 'PUT',
  body: JSON.stringify({ attendance: [{ student_id: studentId, status: 'present' }] }),
});
ok(
  'Murajaa cannot write attendance',
  forbiddenAttendance.status === 403,
  `HTTP ${forbiddenAttendance.status}`,
);

const timeline = await call('/students/1/timeline?season_id=1', admin);
ok('timeline loads', timeline.status === 200, `HTTP ${timeline.status}`);
ok('timeline has terms', (timeline.body.data?.terms?.length ?? 0) === 3);
ok('timeline has sessions', (timeline.body.data?.sessions?.length ?? 0) > 0);
const terms = timeline.body.data?.summaries?.terms ?? [];
const expectedSeason =
  terms.filter((t) => t.murajaa_average !== null).length === 0
    ? null
    : Math.round(
        (terms
          .filter((t) => t.murajaa_average !== null)
          .reduce((s, t) => s + t.murajaa_average, 0) /
          terms.filter((t) => t.murajaa_average !== null).length) *
          100,
      ) / 100;
ok(
  'Option B season murajaa average',
  timeline.body.data?.summaries?.season?.murajaa_average === expectedSeason,
  `got ${timeline.body.data?.summaries?.season?.murajaa_average}, expected ${expectedSeason}`,
);

const ownTimeline = await call('/students/1/timeline?season_id=1', student);
ok('student reads own timeline', ownTimeline.status === 200, `HTTP ${ownTimeline.status}`);
const foreignTimeline = await call('/students/1/timeline?season_id=1', otherStudent);
ok(
  'student cannot read another timeline',
  foreignTimeline.status === 403,
  `HTTP ${foreignTimeline.status}`,
);

const invalidSession = await call('/groups/1/sessions', admin, {
  method: 'POST',
  body: JSON.stringify({ week_id: 1, planned_date: '2000-01-01', session_type: 'revision' }),
});
ok(
  'invalid extra session rejected',
  invalidSession.status === 422,
  `HTTP ${invalidSession.status}`,
);

const legacyReviews = await call('/murajaa-reviews', admin);
ok('old review API removed', legacyReviews.status === 404, `HTTP ${legacyReviews.status}`);

console.log(
  failures === 0
    ? '\nWORKSPACE API SMOKE: ALL PASS'
    : `\nWORKSPACE API SMOKE: ${failures} FAILURE(S)`,
);
process.exit(failures === 0 ? 0 : 1);
