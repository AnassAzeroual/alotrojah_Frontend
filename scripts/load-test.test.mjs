import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  markdownReport,
  percentile,
  reachabilityFindings,
  safeApiPath,
  summarize,
} from './load-test.mjs';

test('nearest-rank percentiles preserve raw samples and expose empty sets', () => {
  const values = [4, 1, 3, 2];
  assert.equal(percentile(values, 50), 2);
  assert.equal(percentile(values, 95), 4);
  assert.equal(percentile([], 99), null);
  assert.deepEqual(values, [4, 1, 3, 2]);
});

test('HTTP failures and timeouts remain in measured distributions', () => {
  assert.deepEqual(
    summarize([
      { elapsed_ms: 100, status: 200, ok: true },
      { elapsed_ms: 200, status: 429, ok: false },
      { elapsed_ms: 10000, status: 0, ok: false },
    ]),
    {
      n: 3,
      p50_ms: 200,
      p95_ms: 10000,
      p99_ms: 10000,
      max_ms: 10000,
      errors: 2,
      statuses: { 0: 1, 200: 1, 429: 1 },
    },
  );
});

test('targets cannot leave the fixed loopback API origin or namespace', () => {
  for (const bad of [
    'https://example.org/api/v1/students',
    '//example.org/api/v1/students',
    '/api/v1/../../admin',
    'students',
    null,
  ]) {
    assert.throws(() => safeApiPath(bad));
  }
  assert.equal(
    safeApiPath('/api/v1/students?page=2'),
    'http://127.0.0.1:8002/api/v1/students?page=2',
  );
});

test('successful HTTP responses do not hide incomplete options or wrong seasons', () => {
  const run = {
    fixture: { examples: { season_id: 22 } },
    reachability: {
      matching_dropdown_options: 0,
      fixture_groups: 20,
      student_selected_season: 30,
      student_summary_visible: false,
      group_statistics: { returned_season: 1, expected_current_season: 22 },
    },
  };
  assert.deepEqual(reachabilityFindings(run), [
    'GROUP_PICKER_INCOMPLETE',
    'STUDENT_SEASON_MISMATCH',
    'STUDENT_SUMMARY_MISSING',
    'GROUP_STATS_SEASON_MISMATCH',
  ]);
  run.reachability.matching_dropdown_options = 20;
  run.reachability.student_selected_season = 22;
  run.reachability.student_summary_visible = true;
  run.reachability.group_statistics.returned_season = 22;
  assert.deepEqual(reachabilityFindings(run), []);
});

test('incomplete reports do not imply passed tests or successful cleanup', () => {
  const output = markdownReport({
    started_at: 'test',
    status: 'incomplete',
    failures: ['interrupted'],
    runs: [{ size: 'baseline' }],
  });
  assert.match(output, /incomplete/);
  assert.match(output, /not completed/);
  assert.match(output, /interrupted/);
  assert.match(output, /not a reliable tail estimate/);
});
