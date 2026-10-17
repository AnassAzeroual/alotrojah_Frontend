import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { ApiClient } from '../api/api-client';
import { CurrentUser } from '../api/api-models';
import { AuthService } from '../auth/auth.service';
import { AdminPrefsService } from './admin-prefs.service';
import { AppearanceService, DEFAULT_APPEARANCE } from './appearance.service';

const ADMIN: CurrentUser = {
  id: 1,
  full_name: 'Admin',
  role: 'admin',
  center_id: null,
  teacher_type: 'both',
};

const SUPERVISOR: CurrentUser = {
  id: 2,
  full_name: 'Supervisor',
  role: 'supervisor',
  center_id: 2,
  teacher_type: 'both',
};

function config(centerId: number | null, patch: Record<string, unknown> = {}) {
  return {
    center_id: centerId,
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
    ...patch,
  };
}

describe('AppearanceService', () => {
  let service: AppearanceService;
  let user: WritableSignal<CurrentUser | null>;
  let prefCenter: WritableSignal<number | null>;
  let api: {
    get: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    postForm: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    user = signal<CurrentUser | null>(null);
    prefCenter = signal<number | null>(null);
    api = {
      get: vi.fn(),
      patch: vi.fn(),
      postForm: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: ApiClient, useValue: api },
        { provide: AuthService, useValue: { currentUser: user } },
        {
          provide: AdminPrefsService,
          useValue: {
            appearanceCenterId: prefCenter,
            setAppearanceCenterId: (id: number | null) => prefCenter.set(id),
          },
        },
      ],
    });
    service = TestBed.inject(AppearanceService);
  });

  it('loads a non-admin center without sending a center parameter', () => {
    user.set(SUPERVISOR);
    api.get.mockReturnValue(of(config(2, { pattern_size: 210 })));

    service.load();

    expect(api.get).toHaveBeenCalledWith('/appearance', undefined);
    expect(service.centerId()).toBe(2);
    expect(service.patternSize()).toBe(210);
    expect(service.loaded()).toBe(true);
  });

  it('lets an admin target the selected center', () => {
    user.set(ADMIN);
    prefCenter.set(3);
    api.get.mockReturnValue(of(config(3, { pattern_size: 320 })));

    service.load();

    expect(api.get).toHaveBeenCalledWith('/appearance', { center_id: 3 });
    expect(service.centerId()).toBe(3);
    expect(service.patternSize()).toBe(320);
  });

  it('falls back to the admin own center and permits no center at all', () => {
    user.set({ ...ADMIN, center_id: 1 });
    api.get.mockReturnValue(of(config(1)));
    service.load();
    expect(api.get).toHaveBeenCalledWith('/appearance', { center_id: 1 });

    user.set(ADMIN);
    prefCenter.set(null);
    api.get.mockReturnValue(of(config(null)));
    service.load();
    expect(api.get).toHaveBeenLastCalledWith('/appearance', undefined);
    expect(service.hasCenter()).toBe(false);
  });

  it('sends the selected center on save, delete and upload', () => {
    user.set(ADMIN);
    prefCenter.set(2);
    api.get.mockReturnValue(of(config(2)));
    service.load();

    api.patch.mockReturnValue(of(config(2, { pattern_size: 250 })));
    service.setOptions({ pattern_size: 250 });
    service.save().subscribe();
    expect(api.patch).toHaveBeenCalledWith('/appearance', {
      ...DEFAULT_APPEARANCE,
      pattern_size: 250,
      center_id: 2,
    });

    api.delete.mockReturnValue(of(config(2)));
    service.remove('background').subscribe();
    expect(api.delete).toHaveBeenCalledWith('/appearance/background', { center_id: 2 });

    api.postForm.mockReturnValue(of(config(2)));
    service.upload('pattern', new File(['x'], 'p.png', { type: 'image/png' })).subscribe();
    const body = api.postForm.mock.calls[0][1] as FormData;
    expect(body.get('center_id')).toBe('2');
  });

  it('drops drafts and ignores an in-flight response when switching centers', () => {
    user.set(ADMIN);
    prefCenter.set(2);
    const first = new Subject<ReturnType<typeof config>>();
    api.get.mockReturnValueOnce(first.asObservable());

    service.load();
    service.setOptions({ pattern_size: 400 });
    expect(service.dirty()).toBe(true);

    api.get.mockReturnValueOnce(of(config(3, { pattern_size: 180 })));
    service.setCenter(3);
    expect(service.centerId()).toBe(3);
    expect(service.dirty()).toBe(false);

    first.next(config(2, { pattern_size: 999 }));
    first.complete();
    expect(service.patternSize()).toBe(180);
    expect(service.dirty()).toBe(false);
  });

  it('keeps unsaved edits when the same center reloads', () => {
    user.set(SUPERVISOR);
    api.get.mockReturnValue(of(config(2)));
    service.load();
    service.setOptions({ pattern_size: 250 });

    api.get.mockReturnValue(of(config(2)));
    service.load();

    expect(service.patternSize()).toBe(250);
    expect(service.dirty()).toBe(true);
  });

  it('builds the gradient layer with free-form size and position', () => {
    user.set(SUPERVISOR);
    api.get.mockReturnValue(of(config(2)));
    service.load();
    service.setOptions({
      background_type: 'gradient',
      gradient_type: 'linear',
      gradient_angle: 90,
      gradient_from: '#111111',
      gradient_to: '#222222',
      background_size: '50% 20%',
      background_position: 'right 20px',
      background_opacity: 60,
      background_repeat: 'repeat-x',
      background_attachment: 'fixed',
      background_blend_mode: 'screen',
    });

    expect(service.gradientCss()).toBe('linear-gradient(90deg, #111111, #222222)');
    expect(service.backgroundLayerStyle()).toEqual({
      'background-image': 'linear-gradient(90deg, #111111, #222222)',
      'background-color': 'transparent',
      'background-size': '50% 20%',
      'background-position': 'right 20px',
      'background-repeat': 'repeat-x',
      'background-attachment': 'fixed',
      'mix-blend-mode': 'screen',
      opacity: '0.6',
    });

    service.setOptions({ gradient_type: 'radial' });
    expect(service.gradientCss()).toBe('radial-gradient(circle at center, #111111, #222222)');

    service.setOptions({ gradient_type: 'conic', gradient_angle: 45 });
    expect(service.gradientCss()).toBe('conic-gradient(from 45deg at center, #111111, #222222)');
  });

  it('maps tile/fill presets and hyphenated positions to CSS values', () => {
    user.set(SUPERVISOR);
    api.get.mockReturnValue(of(config(2)));
    service.load();

    service.setOptions({ background_type: 'color', background_size: 'tile' });
    expect(service.backgroundSizeCss()).toBe('auto');
    expect(service.backgroundRepeatCss()).toBe('repeat');

    service.setOptions({ background_size: 'fill' });
    expect(service.backgroundSizeCss()).toBe('100% 100%');

    service.setOptions({ background_size: 'contain', background_position: 'bottom-right' });
    expect(service.backgroundPositionCss()).toBe('bottom right');
  });

  it('paints a tinted pattern through a mask and inverts an untinted one', () => {
    user.set(SUPERVISOR);
    api.get.mockReturnValue(of(config(2)));
    service.load();

    service.setOptions({ pattern_tint: '#ff0000', pattern_size: 200, pattern_opacity: 40 });
    expect(service.patternLayerStyle()).toMatchObject({
      'background-image': 'none',
      'background-color': '#ff0000',
      'mask-image': 'var(--pattern-default)',
      '-webkit-mask-image': 'var(--pattern-default)',
      'mask-size': '200px auto',
      opacity: '0.4',
    });

    service.setOptions({ pattern_tint: null, pattern_invert: true });
    expect(service.patternLayerStyle()).toMatchObject({
      'background-size': '200px auto',
      filter: 'invert(1)',
      opacity: '0.4',
    });

    service.setOptions({ pattern_enabled: false });
    expect(service.patternLayerStyle()).toEqual({ display: 'none' });
  });

  it('builds the glass layer and root variables from the same options', () => {
    user.set(SUPERVISOR);
    api.get.mockReturnValue(of(config(2)));
    service.load();

    expect(service.glassLayerStyle()).toEqual({});

    service.setOptions({
      background_type: 'color',
      background_color: '#112233',
      backdrop_blur: 12,
      glass_tint: '#000000',
      glass_opacity: 30,
      pattern_tint: '#ff0000',
    });

    expect(service.glassLayerStyle()).toEqual({
      'backdrop-filter': 'blur(12px)',
      '-webkit-backdrop-filter': 'blur(12px)',
      background: 'color-mix(in srgb, #000000 30%, transparent)',
    });

    const vars = service.rootVars();
    expect(vars['--user-bg-image']).toBe('none');
    expect(vars['--user-bg-color']).toBe('#112233');
    expect(vars['--user-bg-blur']).toBe('12px');
    expect(vars['--user-glass-opacity']).toBe('30%');
    expect(vars['--user-pattern-tint']).toBe('#ff0000');
    expect(service.cssSnippet()).toContain('--user-bg-color: #112233;');
    expect(service.cssSnippet()).toContain('.app-glass {');
  });

  it('drives the ambient orbs from their own options', () => {
    user.set(SUPERVISOR);
    api.get.mockReturnValue(of(config(2)));
    service.load();

    expect(service.orbEnabled()).toBe(true);
    expect(service.orbVars()).toEqual({
      '--user-orb-primary': '#00b8a9',
      '--user-orb-secondary': '#8b5cf6',
      '--user-orb-opacity': '0.5',
    });

    service.setOptions({
      orb_enabled: false,
      orb_primary: '#123456',
      orb_secondary: '#abcdef',
      orb_opacity: 20,
    });

    expect(service.orbEnabled()).toBe(false);
    expect(service.orbVars()).toEqual({
      '--user-orb-primary': '#123456',
      '--user-orb-secondary': '#abcdef',
      '--user-orb-opacity': '0.2',
    });
    expect(service.rootVars()['--user-orb-primary']).toBe('#123456');
    expect(service.cssSnippet()).toContain('--user-orb-opacity: 0.2;');
    expect(service.cssSnippet()).toContain('.app-orb-a {');
  });

  it('drives the background scrim colour and strength from their own options', () => {
    user.set(SUPERVISOR);
    api.get.mockReturnValue(of(config(2)));
    service.load();

    expect(service.scrimEnabled()).toBe(true);
    expect(service.scrimVars()).toEqual({
      '--user-scrim-color': 'var(--color-bg)',
      '--user-scrim-base': '72%',
    });
    expect(service.sceneVars()['--user-scrim-base']).toBe('72%');

    service.setOptions({
      scrim_enabled: false,
      scrim_color: '#112233',
      scrim_opacity: 40,
    });

    expect(service.scrimEnabled()).toBe(false);
    expect(service.scrimVars()).toEqual({
      '--user-scrim-color': '#112233',
      '--user-scrim-base': '40%',
    });
    expect(service.rootVars()['--user-scrim-color']).toBe('#112233');
    expect(service.cssSnippet()).toContain('--user-scrim-base: 40%;');
    expect(service.cssSnippet()).toContain('.app-scrim {');
    expect(service.cssSnippet()).toContain('.dark .app-scrim {');
  });

  it('requires an uploaded URL before painting image mode', () => {
    user.set(SUPERVISOR);
    api.get.mockReturnValue(of(config(2, { background_type: 'image' })));
    service.load();
    expect(service.hasBackground()).toBe(false);
    expect(service.backgroundImageCss()).toBe('none');

    api.get.mockReturnValue(
      of(config(2, { background_type: 'image', background_url: '/storage/bg.png' })),
    );
    service.load();
    expect(service.hasBackground()).toBe(true);
    expect(service.backgroundLayerStyle()).toMatchObject({
      'background-image': 'url("/storage/bg.png")',
    });
  });
});
