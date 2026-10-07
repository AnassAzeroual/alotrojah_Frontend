import { expect, test } from '@playwright/test';

test.describe.serial('Centers management', () => {
  const stamp = Date.now();
  const name = `E2E Center ${stamp}`;

  test('admin creates a center (F7: past page 1 it vanishes) and edits a visible center', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    await page.getByTestId('nav-centers').click();
    await expect(page).toHaveURL(/\/centers$/);

    // create (empty row inside the table, same pattern as inline edit)
    await page.getByTestId('center-open-create').click();
    await page.getByTestId('center-new-name').fill(name);
    await page.getByTestId('center-new-city').fill('Testville');
    await page.getByTestId('center-new-address').fill('1 Test St');
    await page.getByTestId('center-new-phone').fill('0600000000');
    await page.getByTestId('center-new-manager').fill('E2E Manager');
    const created = page.waitForResponse(
      (r) => r.url().includes('/api/v1/centers') && r.request().method() === 'POST',
    );
    // registered BEFORE save: the success handler's tick++ triggers the reload GET
    const reloaded = page.waitForResponse(
      (r) => r.url().includes('/api/v1/centers') && r.request().method() === 'GET',
    );
    await page.getByTestId('center-new-save').click();
    const createdRes = await created;
    expect(createdRes.status()).toBe(201);
    await reloaded;
    // form closed = the success path ran (tick++ → list reload)
    await expect(page.getByTestId('center-open-create')).toBeVisible();

    // F7: GET /centers paginates at 20 ordered by id and the page renders only
    // page 1 with no pager — once the table exceeds 20 rows, a freshly created
    // center (highest id) saves fine but never appears in the UI.
    await expect(page.locator('.centers-table tbody tr', { hasText: name })).toHaveCount(0);

    // edit coverage: pick the oldest residue E2E center (always on page 1) and
    // edit every field inline — the new center itself is unreachable (F7)
    const row = page.locator('.centers-table tbody tr', { hasText: 'E2E Center' }).first();
    const editName = (await row.locator('strong').innerText()).trim();
    await row.getByTestId(/edit-center-/).click();
    await page.getByTestId('center-edit-city').fill('Newville');
    await page.getByTestId('center-edit-address').fill('12 Test St');
    await page.getByTestId('center-edit-phone').fill('0611111111');
    await page.getByTestId('center-edit-manager').fill('E2E Boss');
    const edited = page.waitForResponse(
      (r) => r.url().includes('/api/v1/centers/') && r.request().method() === 'PUT',
    );
    await page.getByTestId('center-edit-save').click();
    await edited;
    await page.reload();
    const editedRow = page.locator('.centers-table tbody tr', { hasText: editName });
    await expect(editedRow).toHaveCount(1);
    await expect(editedRow).toContainText('Newville');
    await expect(editedRow).toContainText('12 Test St');
    await expect(editedRow).toContainText('E2E Boss');

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
