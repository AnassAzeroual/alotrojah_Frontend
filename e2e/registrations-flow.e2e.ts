import { expect, test } from '@playwright/test';
import { adminLogin, loginAs } from './api';

test.describe.serial('Registration requests (roadmap S31, S5, S6)', () => {
  const stamp = Date.now();
  const studentEmail = `e2e_student_${stamp}@example.org`;
  const teacherEmail = `e2e_teacher_${stamp}@example.org`;
  const password = 'password123';

  test('public register form queues a student and a teacher request', async ({ page }) => {
    // --- student request ---
    await page.goto('/register');
    await page.getByLabel('الاسم الكامل').fill(`طالب اختبار ${stamp}`);
    await page.getByLabel('البريد الإلكتروني').fill(studentEmail);
    await page.getByLabel('رقم الهاتف').fill('+212600000001');
    await page.getByRole('button', { name: 'الصفة' }).click();
    await page.locator('.dd.open [role="option"]', { hasText: 'طالب' }).click();
    await page.getByLabel('تاريخ الميلاد').fill('2000-01-01');
    await page.getByRole('button', { name: 'الجنس' }).click();
    await page.locator('.dd.open [role="option"]', { hasText: 'ذكر' }).click();
    await page.getByLabel('كلمة المرور', { exact: true }).fill(password);
    await page.getByLabel('تأكيد كلمة المرور').fill(password);
    await page.getByRole('button', { name: 'إنشاء حساب جديد' }).click();
    await expect(page.locator('.reg-success h1')).toHaveText('تم استلام طلبك');

    // --- teacher request ---
    await page.goto('/register');
    await page.getByLabel('الاسم الكامل').fill(`معلم اختبار ${stamp}`);
    await page.getByLabel('البريد الإلكتروني').fill(teacherEmail);
    await page.getByLabel('رقم الهاتف').fill('+212600000002');
    await page.getByRole('button', { name: 'الصفة' }).click();
    await page.locator('.dd.open [role="option"]', { hasText: 'معلم' }).click();
    await page.getByRole('button', { name: 'نوع التعليم' }).click();
    await page.getByRole('option', { name: 'حفظ', exact: true }).click();
    await page.getByLabel('كلمة المرور', { exact: true }).fill(password);
    await page.getByLabel('تأكيد كلمة المرور').fill(password);
    await page.getByRole('button', { name: 'إنشاء حساب جديد' }).click();
    await expect(page.locator('.reg-success h1')).toHaveText('تم استلام طلبك');
  });

  test('admin accepts the student (center, no group) and rejects the teacher', async ({ page }) => {
    await adminLogin(page);

    await page.getByTestId('nav-registrations').click();
    await expect(page).toHaveURL(/\/registrations$/);

    // accept the student into center 1 (مركز النور القرآني), no group
    const studentCard = page.locator('.req-card', { hasText: studentEmail });
    await expect(studentCard).toHaveCount(1);
    await studentCard.getByRole('button', { name: 'قبول', exact: true }).click();
    await page.getByRole('button', { name: 'اختر المركز' }).click();
    await page.locator('.dd.open [role="option"]', { hasText: 'النور' }).click();
    const accepted = page.waitForResponse(
      (r) => r.url().includes('registration-requests') && r.request().method() === 'POST',
    );
    await studentCard.getByRole('button', { name: 'قبول', exact: true }).click();
    await accepted;
    await expect(page.locator('.req-card', { hasText: studentEmail })).toHaveCount(0);

    // reject the teacher (two-step)
    const teacherCard = page.locator('.req-card', { hasText: teacherEmail });
    await expect(teacherCard).toHaveCount(1);
    await teacherCard.getByRole('button', { name: 'إلغاء الطلب' }).click();
    const rejected = page.waitForResponse(
      (r) => r.url().includes('registration-requests') && r.request().method() === 'DELETE',
    );
    await teacherCard.getByRole('button', { name: 'تأكيد الإلغاء' }).click();
    await rejected;
    await expect(page.locator('.req-card', { hasText: teacherEmail })).toHaveCount(0);
  });

  test('S5+S6: accepted student logs in, sees dashboard and center chip', async ({ page }) => {
    await loginAs(page, studentEmail, password);
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    await expect(page.getByRole('heading', { name: 'الطلاب' })).toBeVisible();
    await expect(page.getByTestId('user-center')).toContainText('النور');
  });

  test('rejected teacher account cannot log in', async ({ page }) => {
    await loginAs(page, teacherEmail, password);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText('بيانات الدخول غير صحيحة')).toBeVisible();
  });
});
