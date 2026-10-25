import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { AdminPrefsService } from '../../settings/admin-prefs.service';
import { SetupGuideService } from '../../settings/setup-guide.service';
import { SetupGuideComponent } from './setup-guide.component';

const STEPS = [
  { key: 'centers', done: true, count: 1, target: '/centers' },
  { key: 'season', done: false, count: 0, target: '/planning/new' },
  { key: 'levels', done: false, count: 0, target: '/levels' },
];

describe('SetupGuideComponent', () => {
  let el: HTMLElement;
  let hide: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    hide = vi.fn();
    const guide = {
      open: signal(true),
      loading: signal(false),
      failed: signal(false),
      status: signal({
        center: { id: 1, name: 'Center A' },
        season: null,
        total_steps: 3,
        done_steps: 1,
        current: 'season',
        steps: STEPS,
      }),
      steps: () => STEPS,
      current: () => 'season',
      doneSteps: () => 1,
      totalSteps: () => 3,
      progress: () => 33,
      hasWork: () => true,
      hide,
      load: vi.fn(),
    } as unknown as SetupGuideService;

    await TestBed.configureTestingModule({
      imports: [SetupGuideComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
        { provide: SetupGuideService, useValue: guide },
        {
          provide: AdminPrefsService,
          useValue: {
            setupGuideEnabled: signal(true),
            setSetupGuideEnabled: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SetupGuideComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('renders the checklist, highlights the current step and links its target', () => {
    expect(el.querySelectorAll('[data-testid^="setup-step-"]').length).toBe(3);
    expect(el.querySelector('[data-testid="setup-step-centers"]')!.classList).toContain('is-done');
    expect(el.querySelector('[data-testid="setup-step-season"]')!.classList).toContain(
      'is-current',
    );
    expect(
      el.querySelector<HTMLAnchorElement>('[data-testid="setup-go-season"]')!.getAttribute('href'),
    ).toBe('/planning/new');
    expect(el.textContent).toContain('setup.next');
  });

  it('closes from the close button and the backdrop', () => {
    (el.querySelector('[data-testid="setup-guide-close"]') as HTMLButtonElement).click();
    expect(hide).toHaveBeenCalledTimes(1);
  });
});
