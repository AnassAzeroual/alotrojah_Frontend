import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { AdminPrefsService } from '../../core/settings/admin-prefs.service';
import { AppearanceService } from '../../core/settings/appearance.service';
import { SettingsPage } from './settings.page';

const USER = {
  id: 1,
  full_name: 'Admin',
  role: 'admin' as const,
  center_id: null,
  teacher_type: 'both' as const,
};

const CONFIG = {
  center_id: null as number | null,
  background_url: null,
  pattern_url: null,
  background_type: 'none' as const,
  background_color: '#0e9f6e',
  gradient_type: 'linear' as const,
  gradient_angle: 135,
  gradient_from: '#0e9f6e',
  gradient_to: '#0b3b2f',
  background_opacity: 100,
  background_size: 'cover',
  background_position: 'center',
  background_repeat: 'no-repeat' as const,
  background_attachment: 'scroll' as const,
  background_blend_mode: 'normal' as const,
  pattern_enabled: true,
  pattern_opacity: 16,
  pattern_size: 120,
  pattern_tint: null as string | null,
  pattern_invert: false,
  backdrop_blur: 0,
  glass_tint: '#ffffff',
  glass_opacity: 0,
  orb_enabled: true,
  orb_primary: '#00b8a9',
  orb_secondary: '#8b5cf6',
  orb_opacity: 50,
  scrim_enabled: true,
  scrim_color: null as string | null,
  scrim_opacity: 72,
  updated_at: null,
};

describe('SettingsPage tabs', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    sessionStorage.clear();
    const prefCenter = signal<number | null>(null);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'settings', component: SettingsPage }]),
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
        {
          provide: AuthService,
          useValue: {
            role: signal(USER.role),
            currentUser: signal(USER),
            isLoggedIn: signal(true),
          },
        },
        {
          provide: AdminPrefsService,
          useValue: {
            appearanceCenterId: prefCenter,
            hideScopePickers: signal(false),
            showCenterId: signal(true),
            showCalDebug: signal(true),
            setAppearanceCenterId: (id: number | null): void => {
              prefCenter.set(id);
            },
          },
        },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => http.verify());

  function flushAppearance(centerId: number | null): void {
    http
      .match((r) => r.method === 'GET' && r.url.includes('/appearance'))
      .forEach((r) =>
        r.flush({ success: true, message: null, data: { ...CONFIG, center_id: centerId } }),
      );
  }

  /** Flushes the appearance GET and the paginated centers walk. */
  function flushBoot(centerId: number | null): void {
    flushAppearance(centerId);
    http
      .match((r) => r.method === 'GET' && r.url.includes('/centers'))
      .forEach((r) =>
        r.flush({
          success: true,
          message: null,
          data: {
            data: [{ id: 1, name: 'Center One' }],
            meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
          },
        }),
      );
    // Choosing the first center triggers a second, center-scoped GET.
    flushAppearance(centerId);
  }

  it('defaults to General and switches to Appearance with a URL fragment', async () => {
    await harness.navigateByUrl('/settings', SettingsPage);
    flushBoot(null);
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    const el = harness.fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="settings-panel-general"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="settings-panel-appearance"]')).toBeNull();

    (el.querySelector('[data-testid="settings-tab-appearance"]') as HTMLButtonElement).click();
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    expect(el.querySelector('[data-testid="settings-panel-appearance"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="settings-panel-general"]')).toBeNull();
    expect(TestBed.inject(Router).url).toBe('/settings#appearance');
  });

  it('hydrates the active tab from the URL fragment', async () => {
    await harness.navigateByUrl('/settings#appearance', SettingsPage);
    flushBoot(null);
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    const el = harness.fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="settings-panel-appearance"]')).not.toBeNull();
    expect(
      el.querySelector('[data-testid="settings-tab-appearance"]')?.getAttribute('aria-selected'),
    ).toBe('true');
  });

  it('moves tab focus with the arrow keys in visual order', async () => {
    await harness.navigateByUrl('/settings', SettingsPage);
    flushBoot(null);
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    const el = harness.fixture.nativeElement as HTMLElement;
    const general = el.querySelector('[data-testid="settings-tab-general"]') as HTMLButtonElement;
    general.focus();
    general.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    expect(document.activeElement?.id).toBe('settings-tab-appearance');
    expect(el.querySelector('[data-testid="settings-panel-appearance"]')).not.toBeNull();
  });

  it('switches background modes and renders the matching fields', async () => {
    await harness.navigateByUrl('/settings#appearance', SettingsPage);
    flushBoot(null);
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    const el = harness.fixture.nativeElement as HTMLElement;
    const service = TestBed.inject(AppearanceService);

    (el.querySelector('[data-testid="appearance-type-color"]') as HTMLButtonElement).click();
    harness.fixture.detectChanges();
    expect(service.backgroundType()).toBe('color');
    expect(el.querySelector('[data-testid="appearance-bg-color"]')).not.toBeNull();

    (el.querySelector('[data-testid="appearance-type-gradient"]') as HTMLButtonElement).click();
    harness.fixture.detectChanges();
    expect(el.querySelector('[data-testid="appearance-gradient-strip"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="appearance-gradient-angle"]')).not.toBeNull();

    (el.querySelector('[data-testid="appearance-type-image"]') as HTMLButtonElement).click();
    harness.fixture.detectChanges();
    expect(el.querySelector('[data-testid="appearance-background-input"]')).not.toBeNull();
  });

  it('toggles and edits the ambient color controls', async () => {
    await harness.navigateByUrl('/settings#appearance', SettingsPage);
    flushBoot(null);
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    const el = harness.fixture.nativeElement as HTMLElement;
    const service = TestBed.inject(AppearanceService);

    const toggle = el.querySelector('[data-testid="appearance-orb-enabled"]') as HTMLInputElement;
    expect(toggle.checked).toBe(true);
    toggle.checked = false;
    toggle.dispatchEvent(new Event('change'));
    harness.fixture.detectChanges();

    expect(service.orbEnabled()).toBe(false);
    expect(service.dirty()).toBe(true);
    expect(
      (el.querySelector('[data-testid="appearance-orb-primary"]') as HTMLInputElement).disabled,
    ).toBe(true);

    toggle.checked = true;
    toggle.dispatchEvent(new Event('change'));
    harness.fixture.detectChanges();

    const primary = el.querySelector('[data-testid="appearance-orb-primary"]') as HTMLInputElement;
    primary.value = '#123456';
    primary.dispatchEvent(new Event('input'));
    const secondary = el.querySelector(
      '[data-testid="appearance-orb-secondary"]',
    ) as HTMLInputElement;
    secondary.value = '#abcdef';
    secondary.dispatchEvent(new Event('input'));
    const intensity = el.querySelector(
      '[data-testid="appearance-orb-opacity"]',
    ) as HTMLInputElement;
    intensity.value = '25';
    intensity.dispatchEvent(new Event('input'));
    harness.fixture.detectChanges();

    expect(service.orbPrimary()).toBe('#123456');
    expect(service.orbSecondary()).toBe('#abcdef');
    expect(service.orbOpacity()).toBe(25);
    expect(el.querySelector('.p-orb')).not.toBeNull();
  });

  it('toggles and edits the background scrim controls', async () => {
    await harness.navigateByUrl('/settings#appearance', SettingsPage);
    flushBoot(null);
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    const el = harness.fixture.nativeElement as HTMLElement;
    const service = TestBed.inject(AppearanceService);

    (el.querySelector('[data-testid="appearance-type-color"]') as HTMLButtonElement).click();
    harness.fixture.detectChanges();

    const themeColor = el.querySelector(
      '[data-testid="appearance-scrim-theme-color"]',
    ) as HTMLInputElement;
    expect(themeColor.checked).toBe(true);
    expect(el.querySelector('[data-testid="appearance-scrim-color"]')).toBeNull();
    expect(el.querySelector('.p-scrim')).not.toBeNull();

    themeColor.checked = false;
    themeColor.dispatchEvent(new Event('change'));
    harness.fixture.detectChanges();

    expect(service.scrimColor()).toBe('#000000');
    const color = el.querySelector('[data-testid="appearance-scrim-color"]') as HTMLInputElement;
    expect(color).not.toBeNull();
    color.value = '#102030';
    color.dispatchEvent(new Event('input'));
    const opacity = el.querySelector(
      '[data-testid="appearance-scrim-opacity"]',
    ) as HTMLInputElement;
    opacity.value = '40';
    opacity.dispatchEvent(new Event('input'));
    harness.fixture.detectChanges();

    expect(service.scrimColor()).toBe('#102030');
    expect(service.scrimOpacity()).toBe(40);
    expect(service.dirty()).toBe(true);

    const enabled = el.querySelector(
      '[data-testid="appearance-scrim-enabled"]',
    ) as HTMLInputElement;
    enabled.checked = false;
    enabled.dispatchEvent(new Event('change'));
    harness.fixture.detectChanges();

    expect(service.scrimEnabled()).toBe(false);
    expect(
      (el.querySelector('[data-testid="appearance-scrim-opacity"]') as HTMLInputElement).disabled,
    ).toBe(true);
    expect(el.querySelector('.p-scrim')).toBeNull();
  });

  it('validates custom size and position drafts before storing them', async () => {
    await harness.navigateByUrl('/settings#appearance', SettingsPage);
    flushBoot(null);
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    const el = harness.fixture.nativeElement as HTMLElement;
    const service = TestBed.inject(AppearanceService);

    (el.querySelector('[data-testid="appearance-type-gradient"]') as HTMLButtonElement).click();
    harness.fixture.detectChanges();

    const sizeSelect = el.querySelector(
      '[data-testid="appearance-background-size"]',
    ) as HTMLSelectElement;
    sizeSelect.value = 'custom';
    sizeSelect.dispatchEvent(new Event('change'));
    harness.fixture.detectChanges();

    const sizeInput = el.querySelector(
      '[data-testid="appearance-custom-size"]',
    ) as HTMLInputElement;
    expect(service.backgroundSize()).toBe('320px 200px');
    sizeInput.value = 'banana';
    sizeInput.dispatchEvent(new Event('input'));
    harness.fixture.detectChanges();
    expect(service.backgroundSize()).toBe('320px 200px');
    expect(sizeInput.getAttribute('aria-invalid')).toBe('true');

    sizeInput.value = '50% 20%';
    sizeInput.dispatchEvent(new Event('input'));
    harness.fixture.detectChanges();
    expect(service.backgroundSize()).toBe('50% 20%');
    expect(sizeInput.getAttribute('aria-invalid')).toBe('false');

    const posSelect = el.querySelector(
      '[data-testid="appearance-background-position"]',
    ) as HTMLSelectElement;
    posSelect.value = 'custom';
    posSelect.dispatchEvent(new Event('change'));
    harness.fixture.detectChanges();

    const posX = el.querySelector('[data-testid="appearance-custom-pos-x"]') as HTMLInputElement;
    posX.value = 'left + 10';
    posX.dispatchEvent(new Event('input'));
    harness.fixture.detectChanges();
    expect(service.backgroundPosition()).toBe('20% 30%');
    expect(posX.getAttribute('aria-invalid')).toBe('true');

    posX.value = 'right';
    posX.dispatchEvent(new Event('input'));
    harness.fixture.detectChanges();
    expect(service.backgroundPosition()).toBe('right 30%');
  });
});
