import type { APIRequestContext, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

// Runtime seed lookup: log in through the API and read entity names, so specs
// never hardcode seed data (renames, re-seeds and the Item 8 wipe can't break
// them while each center keeps at least one row). UI assertions stay
// content-based — test-ids can't name values unknown at author time.
const API = 'http://127.0.0.1:8000/api/v1';

export async function apiToken(
  request: APIRequestContext,
  email = 'admin@example.org',
  password = 'password123',
): Promise<string> {
  const r = await request.post(`${API}/auth/login`, { data: { email, password } });
  if (!r.ok()) throw new Error(`API login failed: ${r.status()}`);
  const body = await r.json();

  return body.data.access_token as string;
}

/** Fill + verify, retrying across external form-state wipes (dev-server HMR
 *  swaps the form mid-test under full-suite load — observed 4× at one login
 *  step, green in isolation). Bounded: persistent breakage still fails. */
export async function fillStable(locator: Locator, value: string, tries = 3): Promise<void> {
  for (let i = 0; i < tries; i++) {
    await locator.fill(value);
    try {
      await expect(locator).toHaveValue(value, { timeout: 2000 });
      return;
    } catch {
      // wiped beneath us — refill
    }
  }
  await expect(locator).toHaveValue(value);
}

/** full_name values across every page (list endpoints paginate 20/page). */
export async function apiNames(
  request: APIRequestContext,
  token: string,
  path: string,
): Promise<string[]> {
  const out: string[] = [];
  let page = 1;
  for (;;) {
    const sep = path.includes('?') ? '&' : '?';
    const r = await request.get(`${API}${path}${sep}page=${page}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!r.ok()) throw new Error(`GET ${path} failed: ${r.status()}`);
    const body = await r.json();
    for (const row of body.data.data as { full_name: string }[]) out.push(row.full_name);
    const meta = body.data.meta as { current_page: number; per_page: number; total: number };
    if (meta.current_page * meta.per_page >= meta.total) break;
    page++;
  }

  return out;
}
