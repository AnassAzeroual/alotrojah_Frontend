import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium, expect } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend = path.resolve(root, '../alotrojah_Backend');
const API = 'http://127.0.0.1:8002';
const WEB = 'http://127.0.0.1:4212';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function percentile(values, percentileValue) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil((percentileValue / 100) * sorted.length) - 1)];
}

export function summarize(samples) {
  const values = samples.map((s) => s.elapsed_ms);
  return {
    n: samples.length,
    p50_ms: percentile(values, 50),
    p95_ms: percentile(values, 95),
    p99_ms: percentile(values, 99),
    max_ms: values.length ? Math.max(...values) : null,
    errors: samples.filter((s) => !s.ok).length,
    statuses: samples.reduce((out, s) => {
      out[s.status] = (out[s.status] ?? 0) + 1;
      return out;
    }, {}),
  };
}

export function safeApiPath(value) {
  if (typeof value !== 'string' || !value.startsWith('/api/v1/')) {
    throw new Error('Only local v1 API paths are allowed');
  }
  const url = new URL(value, API);
  if (url.origin !== API || !url.pathname.startsWith('/api/v1/')) {
    throw new Error('External or escaped API path refused');
  }
  return url.href;
}

export function reachabilityFindings(run) {
  const r = run.reachability;
  const findings = [];
  if (r.matching_dropdown_options < r.fixture_groups) findings.push('GROUP_PICKER_INCOMPLETE');
  if (r.student_selected_season !== run.fixture.examples.season_id)
    findings.push('STUDENT_SEASON_MISMATCH');
  if (!r.student_summary_visible) findings.push('STUDENT_SUMMARY_MISSING');
  if (r.group_statistics.returned_season !== r.group_statistics.expected_current_season)
    findings.push('GROUP_STATS_SEASON_MISMATCH');
  return findings;
}

export function markdownReport(report) {
  const lines = [
    '# Local backend, database and browser performance',
    '',
    `Started: ${report.started_at}. Status: **${report.status}**.`,
    '',
    '## Method and limits',
    '',
    '- Local verify database only; additive, run-tagged fixtures; exact-ID cleanup. No migrations or existing-row updates.',
    '- Optimized Angular lighthouse build. Browser is Chromium desktop 1440x900; API response caching is bypassed; browser asset cache remains warm after first navigation.',
    '- Read-only authenticated API workload, 1/2/4 requests per second with 1/2/4 in-flight caps, 45 seconds per stage. Login is outside timings. No throttle bypass.',
    '- Stop on the first unexpected HTTP failure/429/timeout or MySQL failure. No saturation, breaking-point or production capacity claim.',
    '- PHP built-in server on Windows has one worker: queueing includes server serialization. Browser, generator and MySQL share this host.',
    '- Nearest-rank percentiles; endpoint p99 with fewer than 100 samples is effectively the maximum, not a reliable tail estimate. One run per size is exploratory, not a statistical regression gate.',
    '- SQL profiling runs the Laravel HTTP kernel in-process as an administrator: excludes cold HTTP bootstrap/queueing; console center scoping differs. EXPLAIN is estimated, outside request timings; bindings and response bodies are not saved.',
    '- Browser PASS means functional assertions passed, not a latency target. Actions with zero overlapping load requests ran without measured background traffic; long flows can outlast a 45-second stage.',
    '- No write-load, mobile, teacher/supervisor workload, WAN latency or forced database cold-cache measurements in this pass.',
    '',
    '## Dataset and preservation',
    '',
  ];
  for (const run of report.runs) {
    lines.push(
      `### ${run.size}`,
      '',
      '```json',
      JSON.stringify(run.fixture?.counts ?? {}, null, 2),
      '```',
      '',
      `Cleanup: ${JSON.stringify(run.cleanup ?? 'not completed')}`,
      '',
    );
  }
  lines.push(
    '## HTTP stages',
    '',
    '| Size | Stage | Completed | p50 ms | p95 ms | p99 ms | Errors | Actual req/s | Skipped slots |',
    '|---|---|---:|---:|---:|---:|---:|---:|---:|',
  );
  for (const run of report.runs) {
    for (const stage of run.stages ?? []) {
      const s = summarize(stage.samples);
      lines.push(
        `| ${run.size} | ${stage.name} | ${s.n} | ${s.p50_ms?.toFixed(1)} | ${s.p95_ms?.toFixed(1)} | ${s.p99_ms?.toFixed(1)} | ${s.errors} | ${(s.n / (stage.elapsed_ms / 1000)).toFixed(2)} | ${stage.skipped_slots} |`,
      );
    }
  }
  lines.push(
    '',
    '## Endpoint measurements',
    '',
    '| Size | Endpoint | n | p50 ms | p95 ms | Max ms | Errors |',
    '|---|---|---:|---:|---:|---:|---:|',
  );
  for (const run of report.runs) {
    const samples = (run.stages ?? []).flatMap((s) => s.samples);
    for (const name of new Set(samples.map((s) => s.name))) {
      const s = summarize(samples.filter((v) => v.name === name));
      lines.push(
        `| ${run.size} | ${name} | ${s.n} | ${s.p50_ms?.toFixed(1)} | ${s.p95_ms?.toFixed(1)} | ${s.max_ms?.toFixed(1)} | ${s.errors} |`,
      );
    }
  }
  lines.push(
    '',
    '## Browser actions',
    '',
    '| Size | Stage | Action | Ready ms | API requests | Long-task ms | Longest task ms | Overlapping load requests | Result |',
    '|---|---|---|---:|---:|---:|---:|---:|---|',
  );
  for (const run of report.runs) {
    for (const b of run.browser ?? []) {
      lines.push(
        `| ${run.size} | ${b.stage} | ${b.name} | ${b.elapsed_ms.toFixed(1)} | ${b.api_requests} | ${b.long_task_ms?.toFixed(1) ?? '-'} | ${b.longest_task_ms?.toFixed(1) ?? '-'} | ${b.overlapping_requests} | ${b.ok ? 'PASS' : 'FAIL'} |`,
      );
    }
  }
  lines.push(
    '',
    '## SQL profile',
    '',
    "Full normalized SQL and estimated EXPLAIN plans are in each size's profile.json; query timings do not include EXPLAIN.",
    '',
    '| Size | Endpoint | Iteration | HTTP | Elapsed ms | Queries | SQL ms | Bytes |',
    '|---|---|---:|---:|---:|---:|---:|---:|',
  );
  for (const run of report.runs) {
    for (const s of run.profile?.samples ?? []) {
      lines.push(
        `| ${run.size} | ${s.name} | ${s.iteration} | ${s.status} | ${Number(s.elapsed_ms).toFixed(1)} | ${s.query_count} | ${Number(s.query_ms).toFixed(1)} | ${s.bytes} |`,
      );
    }
  }
  lines.push(
    '',
    '## Browser diagnostics',
    '',
    '```json',
    JSON.stringify(
      report.runs.map((r) => ({
        size: r.size,
        diagnostics: r.diagnostics,
        findings: r.findings,
        reachability: r.reachability,
      })),
      null,
      2,
    ),
    '```',
    '',
    '## Failures / incomplete work',
    '',
    ...(report.failures.length ? report.failures.map((f) => `- ${f}`) : ['- None recorded.']),
    '',
    '## Reproduce',
    '',
    'Run `npm run perf:load` from the frontend repository. Add `-- --headless` for headless Chromium or `-- --baseline-only` for the small fixture only. The runner builds the optimized frontend, refuses busy test ports, creates random test credentials in memory, and removes only its own fixture rows and server processes.',
    '',
    'Interrupted run: use the exact run ID in results.json with `DB_DATABASE=alotrojah_verify APP_ENV=local php artisan performance:fixture cleanup <run>` from the backend. Inspect the manifest first. Do not rerun or clean up after a MySQL failure until the service problem is resolved.',
    '',
  );
  return lines.join('\n');
}

async function portBusy(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
  });
}

async function main() {
  const args = process.argv.slice(2);
  assert(
    args.every((arg) => ['--headless', '--baseline-only'].includes(arg)),
    'Unknown option',
  );
  const id =
    new Date().toISOString().replace(/\D/g, '').slice(0, 14) + '-' + randomBytes(2).toString('hex');
  const out = path.join(root, 'test-results/performance', id);
  mkdirSync(out, { recursive: true });
  const report = {
    started_at: new Date().toISOString(),
    status: 'running',
    runtime: {
      node: process.version,
      platform: process.platform,
      cpu: os.cpus()[0]?.model,
      logical_cpus: os.availableParallelism(),
      ram_bytes: os.totalmem(),
      free_ram_bytes: os.freemem(),
      headed: !args.includes('--headless'),
    },
    runs: [],
    failures: [],
  };
  const save = () => {
    writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2));
    writeFileSync(path.join(out, 'REPORT.md'), markdownReport(report));
  };
  const password = randomBytes(24).toString('base64url');
  const env = {
    ...process.env,
    APP_ENV: 'local',
    APP_DEBUG: 'false',
    DB_DATABASE: 'alotrojah_verify',
    FRONTEND_URLS: WEB,
    PERFORMANCE_PASSWORD: password,
  };
  delete env.DB_URL;
  const servers = [];
  let browser;
  let mysqlFailed = false;
  let databaseSafetyUnknown = false;
  let aborted = false;
  let activeRun;
  const commandChildren = new Set();
  const ensureRunning = () => {
    if (aborted) throw new Error('Run stopped; no further workload will start');
  };
  const envAtRest = () =>
    readFileSync(path.join(backend, '.env'), 'utf8')
      .match(/^DB_DATABASE=(.*)$/m)?.[1]
      ?.trim();
  const detectMysql = (text) => {
    if (/MYSQL_STOP|SQLSTATE\[|PDOException/.test(text)) {
      mysqlFailed = true;
      aborted = true;
      throw new Error('MYSQL_STOP: database error; no retry or automatic database cleanup');
    }
  };
  const sanitizedError = (error) =>
    String(error.message ?? error)
      .replaceAll(password, '[REDACTED]')
      .slice(0, 1500);
  const command = (exe, argv, cwd, label, timeout = 180000, acceptSemanticFailure = false) =>
    new Promise((resolve, reject) => {
      const child = spawn(exe, argv, {
        cwd,
        env,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      commandChildren.add(child);
      let stdout = '';
      let stderr = '';
      let timedOut = false;
      const timer = setTimeout(() => {
        aborted = true;
        timedOut = true;
        child.kill();
      }, timeout);
      child.stdout.on('data', (v) => {
        stdout += v;
      });
      child.stderr.on('data', (v) => {
        stderr += v;
      });
      child.once('error', (e) => {
        clearTimeout(timer);
        commandChildren.delete(child);
        reject(e);
      });
      child.once('close', (code) => {
        clearTimeout(timer);
        commandChildren.delete(child);
        if (timedOut) {
          reject(new Error(`${label} exceeded time budget`));
          return;
        }
        try {
          detectMysql(stdout + stderr);
        } catch (e) {
          reject(e);
          return;
        }
        const semanticFailure =
          acceptSemanticFailure &&
          code === 1 &&
          stderr.trim() === '{"error":"PERFORMANCE_SEMANTIC_FAILED"}';
        if (code !== 0 && !semanticFailure) {
          reject(new Error(`${label} exited ${code}: ${sanitizedError(stderr || stdout)}`));
          return;
        }
        if (label === 'optimized build') {
          writeFileSync(path.join(out, 'build.log'), stdout + stderr);
          if (stderr) console.error(stderr.replaceAll(password, '[REDACTED]'));
        } else if (stderr) console.error(sanitizedError(stderr));
        resolve(stdout);
      });
    });
  const fixture = async (action, run, size) =>
    JSON.parse(
      await command(
        'php',
        ['artisan', 'performance:fixture', action, run, `--size=${size}`, '--no-ansi'],
        backend,
        `fixture ${action}`,
        600000,
        action === 'profile',
      ),
    );
  const checkedFetch = async (url, options) => {
    try {
      const response = await fetch(url, options);
      if (response.status >= 500) {
        databaseSafetyUnknown = true;
        aborted = true;
      }
      return response;
    } catch (error) {
      databaseSafetyUnknown = true;
      aborted = true;
      throw error;
    }
  };
  const startServer = async (argv, cwd, name, url) => {
    const child = spawn('php', argv, {
      cwd,
      env,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    servers.push(child);
    let failed;
    const chunks = [];
    child.once('error', (e) => {
      failed = e;
    });
    for (const stream of [child.stdout, child.stderr])
      stream.on('data', (v) => {
        const text = v.toString();
        try {
          detectMysql(text);
        } catch (e) {
          failed = e;
        }
        chunks.push(text.replaceAll(password, '[REDACTED]'));
      });
    child.once('exit', () => writeFileSync(path.join(out, `${name}.log`), chunks.join('')));
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      if (failed) throw failed;
      if (child.exitCode !== null || aborted) throw new Error(`${name} stopped before readiness`);
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(1000), redirect: 'error' });
        const body = await response.text();
        detectMysql(body);
        if (response.status >= 500) {
          databaseSafetyUnknown = true;
          throw new Error(`${name} readiness returned ${response.status}; no retry`);
        }
        if (response.ok) return;
      } catch (e) {
        if (mysqlFailed || databaseSafetyUnknown) throw e;
      }
      await delay(200);
    }
    throw new Error(`${name} did not become ready`);
  };
  const shutdown = async () => {
    await browser?.close();
    browser = undefined;
    for (const child of servers.reverse()) {
      if (child.exitCode !== null) continue;
      await new Promise((resolve) => {
        child.once('exit', resolve);
        child.kill();
      });
    }
  };
  const stop = () => {
    aborted = true;
    for (const child of commandChildren) child.kill();
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  try {
    assert.equal(
      envAtRest(),
      'alotrojah_dev',
      'Backend .env is not at rest; refusing to change it',
    );
    assert(
      !existsSync(path.join(backend, 'bootstrap/cache/config.php')),
      'Cached backend config must be resolved before running',
    );
    for (const port of [8002, 4212])
      assert(!(await portBusy(port)), `Port ${port} is busy; no listener will be stopped`);
    console.log('Building optimized frontend; existing verify rows will be preserved.');
    const build = await command(
      process.execPath,
      [
        path.join(root, 'node_modules/@angular/cli/bin/ng.js'),
        'build',
        '--configuration',
        'lighthouse',
      ],
      root,
      'optimized build',
      600000,
    );
    console.log(build);
    await startServer(
      [
        '-S',
        '127.0.0.1:8002',
        '-t',
        '.',
        '../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php',
      ],
      path.join(backend, 'public'),
      'backend',
      `${API}/api/v1/health`,
    );
    await startServer(
      ['-S', '127.0.0.1:4212', '-t', 'dist/alotrojah/browser', 'scripts/serve-dist.php'],
      root,
      'frontend',
      WEB,
    );
    browser = await chromium.launch({ headless: args.includes('--headless') });
    report.runtime.browser = browser.version();
    for (const size of args.includes('--baseline-only') ? ['baseline'] : ['baseline', 'scaled']) {
      if (aborted) throw new Error('Run cancelled');
      activeRun = {
        size,
        run: `${id}-${size === 'baseline' ? 'b' : 's'}`,
        stages: [],
        browser: [],
        diagnostics: [],
        reachability: {},
      };
      report.runs.push(activeRun);
      save();
      console.log(`Creating ${size} fixture on verify.`);
      activeRun.fixture = await fixture('seed', activeRun.run, size);
      save();
      ensureRunning();
      console.log(`Profiling ${size} database queries.`);
      activeRun.profile = await fixture('profile', activeRun.run, size);
      writeFileSync(
        path.join(out, `${size}-profile.json`),
        JSON.stringify(activeRun.profile, null, 2),
      );
      save();
      ensureRunning();
      if (activeRun.profile.samples.some((sample) => sample.status >= 500)) {
        databaseSafetyUnknown = true;
        throw new Error('Profile server failure; database cleanup deferred for inspection');
      }
      assert(activeRun.profile.valid, 'Profile semantic validation failed; see saved profile');
      const login = await checkedFetch(`${API}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: activeRun.fixture.admin_email, password }),
        signal: AbortSignal.timeout(10000),
        redirect: 'error',
      });
      const loginText = await login.text();
      detectMysql(loginText);
      assert.equal(login.status, 200, `API login returned ${login.status}`);
      const token = JSON.parse(loginText).data.access_token;
      assert(typeof token === 'string' && token.length > 0, 'Missing access token');
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        reducedMotion: 'reduce',
      });
      await context.addInitScript(() => {
        localStorage.setItem('alotrojah_e2e_no_http_cache', '1');
        window.__perfTasks = [];
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            window.__perfTasks.push({ start: entry.startTime, duration: entry.duration });
        }).observe({ type: 'longtask', buffered: true });
      });
      const page = await context.newPage();
      page.setDefaultTimeout(60000);
      let requests = 0;
      page.on('request', (request) => {
        if (request.url().startsWith(`${API}/api/`)) requests++;
      });
      page.on('console', (msg) => {
        if (msg.type() === 'error')
          activeRun.diagnostics.push({ type: 'console', message: sanitizedError(msg.text()) });
      });
      page.on('pageerror', (e) =>
        activeRun.diagnostics.push({ type: 'pageerror', message: sanitizedError(e) }),
      );
      page.on('response', (response) => {
        if (response.url().startsWith(`${API}/api/`) && response.status() >= 400) {
          activeRun.diagnostics.push({
            type: 'http',
            path: new URL(response.url()).pathname,
            status: response.status(),
          });
          if (response.status() >= 500) databaseSafetyUnknown = true;
          aborted = true;
        }
      });
      page.on('requestfailed', (request) => {
        if (!request.url().startsWith(`${API}/api/`)) return;
        const error = request.failure()?.errorText;
        activeRun.diagnostics.push({
          type: 'requestfailed',
          path: new URL(request.url()).pathname,
          error,
        });
        if (error !== 'net::ERR_ABORTED') {
          databaseSafetyUnknown = true;
          aborted = true;
        }
      });
      await page.goto(`${WEB}/login`, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('auth-email').fill(activeRun.fixture.admin_email);
      await page.getByTestId('auth-password').fill(password);
      await expect(page.getByTestId('auth-email')).toHaveValue(activeRun.fixture.admin_email);
      await page.getByTestId('auth-submit').click();
      await page.waitForURL(`${WEB}/`);
      const apiSamples = [];
      const apiRequest = async (endpoint, stage) => {
        const started = Date.now();
        const start = performance.now();
        let status = 0;
        let bytes = 0;
        let ok = false;
        let error;
        try {
          const response = await fetch(safeApiPath(endpoint.path), {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            signal: AbortSignal.timeout(10000),
            redirect: 'error',
          });
          status = response.status;
          const body = await response.text();
          bytes = Buffer.byteLength(body);
          detectMysql(body);
          ok = status === 200 && JSON.parse(body).success === true;
          if (!ok) error = `Unexpected API status/envelope: ${status}`;
        } catch (e) {
          error = sanitizedError(e);
        }
        const sample = {
          name: endpoint.name,
          path: endpoint.path,
          stage,
          started_at_ms: started,
          ended_at_ms: Date.now(),
          elapsed_ms: performance.now() - start,
          status,
          bytes,
          ok,
          error,
        };
        apiSamples.push(sample);
        if (status >= 500 || status === 0) databaseSafetyUnknown = true;
        if (!ok) aborted = true;
        return sample;
      };
      const measure = async (stage, name, action) => {
        if (aborted) throw new Error('Stopped after an API/server failure or cancellation');
        const start = performance.now();
        const started = Date.now();
        const count = requests;
        await page.evaluate(() => {
          window.__perfTasks = [];
        });
        let ok = false;
        let error;
        try {
          await action();
          ok = true;
        } catch (e) {
          error = sanitizedError(e);
        }
        const elapsed = performance.now() - start;
        const ended = Date.now();
        const stats = await page.evaluate(() => ({
          long_task_ms: (window.__perfTasks ?? []).reduce((sum, t) => sum + t.duration, 0),
          longest_task_ms: Math.max(0, ...(window.__perfTasks ?? []).map((t) => t.duration)),
          dom_nodes: document.querySelectorAll('*').length,
          overflow_px: Math.max(0, document.documentElement.scrollWidth - innerWidth),
          js_heap_bytes: performance.memory?.usedJSHeapSize ?? null,
        }));
        activeRun.browser.push({
          name,
          stage,
          started_at_ms: started,
          ended_at_ms: ended,
          elapsed_ms: elapsed,
          api_requests: requests - count,
          overlapping_requests: apiSamples.filter(
            (s) => s.started_at_ms < ended && s.ended_at_ms > started,
          ).length,
          ...stats,
          ok,
          error,
        });
        save();
        if (!ok) {
          activeRun.diagnostics.push({ type: 'assertion', name, stage, error });
          aborted = true;
          throw new Error(`Browser action failed: ${name}; see diagnostics`);
        }
      };
      const waitForResponse = (predicate) => {
        const pending = page.waitForResponse(predicate);
        pending.catch(() => {});
        return pending;
      };
      const studentResponse = (predicate = () => true) =>
        waitForResponse((r) => {
          const u = new URL(r.url());
          return (
            u.origin === API &&
            u.pathname === '/api/v1/students' &&
            r.request().method() === 'GET' &&
            predicate(u.searchParams)
          );
        });
      const workflows = async (stage) => {
        await measure(stage, 'students navigation', async () => {
          const response = studentResponse();
          await page.goto(`${WEB}/students`, { waitUntil: 'domcontentloaded' });
          assert.equal((await response).status(), 200);
          await expect(page.locator('.students-table tbody tr').first()).toBeVisible();
          await expect(page.locator('.skeleton')).toHaveCount(0);
        });
        await measure(stage, 'typed fixture search (4 keys + fill)', async () => {
          const response = studentResponse((p) => p.get('q') === activeRun.fixture.prefix);
          await page.getByTestId('students-search').pressSequentially('Perf', { delay: 100 });
          await page.getByTestId('students-search').fill(activeRun.fixture.prefix);
          const json = await (await response).json();
          assert.equal(json.data.meta.total, activeRun.fixture.student_ids.length);
          await expect(page.locator('.students-table tbody tr').first()).toContainText(
            activeRun.fixture.prefix,
          );
        });
        await measure(stage, 'students next page', async () => {
          const first = await page.locator('.students-table tbody tr').first().innerText();
          const response = studentResponse((p) => p.get('page') === '2');
          await page.locator('app-paginator button').last().click();
          const json = await (await response).json();
          assert.equal(json.data.meta.current_page, 2);
          await expect(page.locator('app-paginator .ltr-num')).toContainText('2 /');
          await expect(page.locator('.students-table tbody tr').first()).not.toHaveText(first);
        });
        await measure(stage, 'empty search and recovery', async () => {
          const missing = `${activeRun.fixture.prefix} no-such-pupil`;
          const empty = studentResponse((p) => p.get('q') === missing);
          await page.getByTestId('students-search').fill(missing);
          assert.equal((await (await empty).json()).data.meta.total, 0);
          await expect(page.locator('app-empty-state')).toBeVisible();
          const restored = studentResponse(
            (p) => p.get('q') === activeRun.fixture.examples.student_name,
          );
          await page.getByTestId('students-search').fill(activeRun.fixture.examples.student_name);
          assert.equal((await (await restored).json()).data.meta.total, 1);
          await expect(page.locator('.students-table tbody tr')).toHaveCount(1);
        });
        await measure(stage, 'student detail', async () => {
          const summaryResponse = waitForResponse((r) => {
            const u = new URL(r.url());
            return (
              u.pathname === '/api/v1/dashboard/season' &&
              Number(u.searchParams.get('student_id')) === activeRun.fixture.examples.student_id
            );
          });
          const finalResponse = waitForResponse((r) => {
            const u = new URL(r.url());
            return (
              u.pathname === '/api/v1/dashboard/final' &&
              Number(u.searchParams.get('student_id')) === activeRun.fixture.examples.student_id
            );
          });
          await page.locator('.students-table tbody tr').first().click();
          const finalResult = await finalResponse;
          assert.equal(finalResult.status(), 200);
          const finalData = (await finalResult.json()).data;
          const summaryResult = await summaryResponse;
          assert.equal(summaryResult.status(), 200);
          await summaryResult.finished();
          await expect(page).toHaveURL(`${WEB}/students/${activeRun.fixture.examples.student_id}`);
          await expect(page.locator('h1')).toContainText(activeRun.fixture.examples.student_name);
          await expect(page.locator('.skeleton')).toHaveCount(0);
          const finalCard = page.locator('.stat-card.final .stat-value');
          activeRun.reachability.student_summary_visible = (await finalCard.count()) > 0;
          activeRun.reachability.student_selected_season = Number(
            new URL(finalResult.url()).searchParams.get('season_id'),
          );
          if (await finalCard.count())
            await expect(finalCard).toHaveText(String(finalData.final ?? '—'));
        });
        await page.screenshot({ path: path.join(out, `${size}-${stage}-student.png`) });
        await measure(stage, 'groups dashboard', async () => {
          const response = waitForResponse(
            (r) => new URL(r.url()).pathname === '/api/v1/groups/stats',
          );
          await page.goto(`${WEB}/groups`, { waitUntil: 'domcontentloaded' });
          assert.equal((await response).status(), 200);
          await expect(page.locator('tbody tr.row-link').first()).toBeVisible();
          await expect(page.locator('.skeleton')).toHaveCount(0);
        });
        await page.screenshot({ path: path.join(out, `${size}-${stage}-groups.png`) });
      };
      console.log(`${size}: browser checks without background load.`);
      await workflows('idle');
      for (const endpoint of activeRun.fixture.endpoints) {
        await apiRequest(endpoint, 'warmup');
        if (aborted) throw new Error('API warmup failed; refusing to increase load');
        await delay(250);
      }
      for (const rate of [1, 2, 4]) {
        if (aborted) throw new Error('Stopped before next stage');
        const stage = {
          name: `${rate}rps-${rate}inflight`,
          rate,
          concurrency: rate,
          duration_seconds: 45,
          samples: [],
          skipped_slots: 0,
        };
        activeRun.stages.push(stage);
        console.log(`${size}: ${stage.name}, 45 seconds; browser navigation runs concurrently.`);
        const start = performance.now();
        const pending = new Set();
        let index = 0;
        const drive = (async () => {
          let nextStart = start;
          for (let slot = 0; slot < rate * 45 && !aborted; slot++) {
            await delay(Math.max(0, nextStart - performance.now()));
            if (aborted || performance.now() - start >= 45000) break;
            nextStart = performance.now() + 1000 / rate;
            if (pending.size >= rate) {
              stage.skipped_slots++;
              continue;
            }
            const endpoint =
              activeRun.fixture.endpoints[index++ % activeRun.fixture.endpoints.length];
            const request = apiRequest(endpoint, stage.name).then((sample) =>
              stage.samples.push(sample),
            );
            pending.add(request);
            request.finally(() => pending.delete(request));
          }
          await Promise.all(pending);
          stage.elapsed_ms = performance.now() - start;
        })();
        await delay(1000);
        try {
          await workflows(stage.name);
        } finally {
          await drive;
          save();
        }
        if (aborted) throw new Error('Load stopped on first failure; inspect samples');
      }
      activeRun.warmup = apiSamples.filter((s) => s.stage === 'warmup');
      for (const action of activeRun.browser)
        action.overlapping_requests = apiSamples.filter(
          (s) =>
            s.stage !== 'warmup' &&
            s.started_at_ms < action.ended_at_ms &&
            s.ended_at_ms > action.started_at_ms,
        ).length;
      console.log(`${size}: checking that group dropdown options expose the fixture groups.`);
      const groupResponse = waitForResponse((r) => {
        const u = new URL(r.url());
        return u.origin === API && u.pathname === '/api/v1/groups';
      });
      await page.goto(`${WEB}/students`, { waitUntil: 'domcontentloaded' });
      const groupPage = (await (await groupResponse).json()).data;
      await expect(page.locator('.students-table tbody tr').first()).toBeVisible();
      const dropdown = page.locator('app-students-list-page app-dropdown').first();
      await dropdown.locator('.dd-btn').click();
      await expect(dropdown.getByRole('listbox')).toBeVisible();
      // The picker walks every page (GroupsService.listAll), so wait for the
      // full set rather than the first page returned by /groups.
      await expect(dropdown.getByRole('option')).toHaveCount(groupPage.meta.total + 1);
      const options = await dropdown.getByRole('option').allTextContents();
      await page.screenshot({ path: path.join(out, `${size}-group-dropdown.png`) });
      activeRun.reachability = {
        ...activeRun.reachability,
        fixture_groups: activeRun.fixture.group_ids.length,
        matching_dropdown_options: options.filter((v) => v.includes(activeRun.fixture.prefix))
          .length,
        total_options: options.length,
        group_api_total: groupPage.meta.total,
        group_api_page_size: groupPage.data.length,
      };
      const statsResponse = await checkedFetch(
        safeApiPath(`/api/v1/groups/stats?center_id=${activeRun.fixture.examples.center_id}`),
        {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          signal: AbortSignal.timeout(10000),
          redirect: 'error',
        },
      );
      const statsText = await statsResponse.text();
      detectMysql(statsText);
      assert.equal(statsResponse.status, 200);
      const stats = JSON.parse(statsText).data;
      activeRun.reachability.group_statistics = {
        requested_center: activeRun.fixture.examples.center_id,
        expected_current_season: activeRun.fixture.examples.season_id,
        returned_season: stats.season?.id ?? null,
        returned_groups: stats.groups.length,
        groups_without_scores: stats.groups.filter((g) => g.avg_score === null).length,
      };
      activeRun.findings = reachabilityFindings(activeRun);
      await context.close();
      console.log(`Removing only ${size} fixture rows.`);
      activeRun.cleanup = await fixture('cleanup', activeRun.run, size);
      assert(
        activeRun.cleanup.cleaned && activeRun.cleanup.preserved,
        'Fixture preservation check failed',
      );
      save();
      activeRun = undefined;
    }
    report.status = report.runs.some((r) => r.diagnostics.length || r.findings.length)
      ? 'completed-with-findings'
      : 'completed';
  } catch (error) {
    report.status = mysqlFailed ? 'blocked-mysql' : 'incomplete';
    report.failures.push(sanitizedError(error));
    console.error(sanitizedError(error));
    process.exitCode = 1;
  } finally {
    await shutdown();
    if (
      activeRun &&
      !activeRun.cleanup &&
      !mysqlFailed &&
      !databaseSafetyUnknown &&
      existsSync(path.join(backend, 'storage/app/performance', `${activeRun.run}.json`))
    ) {
      try {
        activeRun.cleanup = await fixture('cleanup', activeRun.run, activeRun.size);
      } catch (e) {
        report.failures.push(`Cleanup failed: ${sanitizedError(e)}`);
        process.exitCode = 1;
      }
    }
    report.database_cleanup_deferred = mysqlFailed || databaseSafetyUnknown;
    if (report.database_cleanup_deferred)
      report.failures.push(
        'Database cleanup deferred: inspect the server/database failure before issuing any database command.',
      );
    report.env_at_rest = envAtRest();
    if (report.env_at_rest !== 'alotrojah_dev') {
      report.failures.push('Backend .env is not dev; manual restoration needed');
      process.exitCode = 1;
    }
    report.finished_at = new Date().toISOString();
    save();
    console.log(`Performance report: ${path.join(out, 'REPORT.md')}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href)
  await main();
