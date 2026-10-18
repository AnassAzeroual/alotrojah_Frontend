import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiClient, QueryParams } from '../api/api-client';
import { CentersService } from '../api/centers.service';
import { AuthService } from '../auth/auth.service';
import { AdminPrefsService } from './admin-prefs.service';

export type AppearanceKind = 'background' | 'pattern';
export type BackgroundType = 'none' | 'color' | 'image' | 'gradient';
export type GradientType = 'linear' | 'radial' | 'conic';
export type BackgroundRepeat = 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y' | 'space' | 'round';
export type BackgroundAttachment = 'scroll' | 'fixed';
export type BackgroundBlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export interface AppearanceOptions {
  background_type: BackgroundType;
  background_color: string;
  gradient_type: GradientType;
  gradient_angle: number;
  gradient_from: string;
  gradient_to: string;
  background_opacity: number;
  background_size: string;
  background_position: string;
  background_repeat: BackgroundRepeat;
  background_attachment: BackgroundAttachment;
  background_blend_mode: BackgroundBlendMode;
  pattern_enabled: boolean;
  pattern_opacity: number;
  pattern_size: number;
  pattern_tint: string | null;
  pattern_invert: boolean;
  backdrop_blur: number;
  glass_tint: string;
  glass_opacity: number;
  orb_enabled: boolean;
  orb_primary: string;
  orb_secondary: string;
  orb_opacity: number;
  scrim_enabled: boolean;
  scrim_color: string | null;
  scrim_opacity: number;
}

interface AppearanceConfig extends AppearanceOptions {
  center_id: number | null;
  background_url: string | null;
  pattern_url: string | null;
  updated_at: string | null;
}

/** Mirrors the server defaults; used before the first load and for reverts. */
export const DEFAULT_APPEARANCE: AppearanceOptions = {
  background_type: 'none',
  background_color: '#0e9f6e',
  gradient_type: 'linear',
  gradient_angle: 135,
  gradient_from: '#0e9f6e',
  gradient_to: '#0b3b2f',
  background_opacity: 100,
  background_size: 'cover',
  background_position: 'center',
  background_repeat: 'no-repeat',
  background_attachment: 'scroll',
  background_blend_mode: 'normal',
  pattern_enabled: true,
  pattern_opacity: 16,
  pattern_size: 120,
  pattern_tint: null,
  pattern_invert: false,
  backdrop_blur: 0,
  glass_tint: '#ffffff',
  glass_opacity: 0,
  orb_enabled: true,
  orb_primary: '#00b8a9',
  orb_secondary: '#8b5cf6',
  orb_opacity: 50,
  scrim_enabled: true,
  scrim_color: null,
  scrim_opacity: 72,
};

/**
 * Per-center appearance shared by everyone signed in to that center. Admins
 * choose which center to edit/preview; every other role is pinned to its own
 * center by the server. The shell renders the layers from one source of truth:
 * the computed root custom properties + layer styles below.
 */
@Injectable({ providedIn: 'root' })
export class AppearanceService {
  private readonly api = inject(ApiClient);
  private readonly auth = inject(AuthService);
  private readonly prefs = inject(AdminPrefsService);
  private readonly centers = inject(CentersService);

  /** Center currently loaded; null when a global admin has selected none. */
  readonly centerId = signal<number | null>(null);
  readonly hasCenter = computed(() => this.centerId() !== null);
  readonly backgroundUrl = signal<string | null>(null);
  readonly patternUrl = signal<string | null>(null);
  readonly loaded = signal(false);

  readonly backgroundType = signal<BackgroundType>(DEFAULT_APPEARANCE.background_type);
  readonly backgroundColor = signal(DEFAULT_APPEARANCE.background_color);
  readonly gradientType = signal<GradientType>(DEFAULT_APPEARANCE.gradient_type);
  readonly gradientAngle = signal(DEFAULT_APPEARANCE.gradient_angle);
  readonly gradientFrom = signal(DEFAULT_APPEARANCE.gradient_from);
  readonly gradientTo = signal(DEFAULT_APPEARANCE.gradient_to);
  readonly backgroundOpacity = signal(DEFAULT_APPEARANCE.background_opacity);
  readonly backgroundSize = signal(DEFAULT_APPEARANCE.background_size);
  readonly backgroundPosition = signal(DEFAULT_APPEARANCE.background_position);
  readonly backgroundRepeat = signal<BackgroundRepeat>(DEFAULT_APPEARANCE.background_repeat);
  readonly backgroundAttachment = signal<BackgroundAttachment>(
    DEFAULT_APPEARANCE.background_attachment,
  );
  readonly backgroundBlendMode = signal<BackgroundBlendMode>(
    DEFAULT_APPEARANCE.background_blend_mode,
  );
  readonly patternEnabled = signal(DEFAULT_APPEARANCE.pattern_enabled);
  readonly patternOpacity = signal(DEFAULT_APPEARANCE.pattern_opacity);
  readonly patternSize = signal(DEFAULT_APPEARANCE.pattern_size);
  readonly patternTint = signal<string | null>(DEFAULT_APPEARANCE.pattern_tint);
  readonly patternInvert = signal(DEFAULT_APPEARANCE.pattern_invert);
  readonly backdropBlur = signal(DEFAULT_APPEARANCE.backdrop_blur);
  readonly glassTint = signal(DEFAULT_APPEARANCE.glass_tint);
  readonly glassOpacity = signal(DEFAULT_APPEARANCE.glass_opacity);
  readonly orbEnabled = signal(DEFAULT_APPEARANCE.orb_enabled);
  readonly orbPrimary = signal(DEFAULT_APPEARANCE.orb_primary);
  readonly orbSecondary = signal(DEFAULT_APPEARANCE.orb_secondary);
  readonly orbOpacity = signal(DEFAULT_APPEARANCE.orb_opacity);
  readonly scrimEnabled = signal(DEFAULT_APPEARANCE.scrim_enabled);
  readonly scrimColor = signal<string | null>(DEFAULT_APPEARANCE.scrim_color);
  readonly scrimOpacity = signal(DEFAULT_APPEARANCE.scrim_opacity);

  private readonly savedOptions = signal<AppearanceOptions>({ ...DEFAULT_APPEARANCE });
  /** Monotonic guard so a slow response for a previous center can never apply. */
  private loadSeq = 0;
  /** First center id, resolved once for a global admin with no saved pick. */
  private readonly fallbackCenterId = signal<number | null>(null);
  private fallbackSettled = false;

  readonly options = computed<AppearanceOptions>(() => ({
    background_type: this.backgroundType(),
    background_color: this.backgroundColor(),
    gradient_type: this.gradientType(),
    gradient_angle: this.gradientAngle(),
    gradient_from: this.gradientFrom(),
    gradient_to: this.gradientTo(),
    background_opacity: this.backgroundOpacity(),
    background_size: this.backgroundSize(),
    background_position: this.backgroundPosition(),
    background_repeat: this.backgroundRepeat(),
    background_attachment: this.backgroundAttachment(),
    background_blend_mode: this.backgroundBlendMode(),
    pattern_enabled: this.patternEnabled(),
    pattern_opacity: this.patternOpacity(),
    pattern_size: this.patternSize(),
    pattern_tint: this.patternTint(),
    pattern_invert: this.patternInvert(),
    backdrop_blur: this.backdropBlur(),
    glass_tint: this.glassTint(),
    glass_opacity: this.glassOpacity(),
    orb_enabled: this.orbEnabled(),
    orb_primary: this.orbPrimary(),
    orb_secondary: this.orbSecondary(),
    orb_opacity: this.orbOpacity(),
    scrim_enabled: this.scrimEnabled(),
    scrim_color: this.scrimColor(),
    scrim_opacity: this.scrimOpacity(),
  }));

  readonly dirty = computed(() => {
    const current = this.options();
    const saved = this.savedOptions();
    return (Object.keys(saved) as (keyof AppearanceOptions)[]).some(
      (key) => current[key] !== saved[key],
    );
  });

  /** A type with no usable source paints nothing even if its options are set. */
  readonly hasBackground = computed(() => {
    switch (this.backgroundType()) {
      case 'color':
        return true;
      case 'image':
        return this.backgroundUrl() !== null;
      case 'gradient':
        return true;
      default:
        return false;
    }
  });

  readonly gradientCss = computed(() => {
    const from = this.gradientFrom();
    const to = this.gradientTo();
    const angle = this.gradientAngle();
    switch (this.gradientType()) {
      case 'radial':
        return `radial-gradient(circle at center, ${from}, ${to})`;
      case 'conic':
        return `conic-gradient(from ${angle}deg at center, ${from}, ${to})`;
      default:
        return `linear-gradient(${angle}deg, ${from}, ${to})`;
    }
  });

  readonly backgroundImageCss = computed(() => {
    switch (this.backgroundType()) {
      case 'image': {
        const url = this.backgroundUrl();
        return url ? `url("${url}")` : 'none';
      }
      case 'gradient':
        return this.gradientCss();
      default:
        return 'none';
    }
  });

  readonly backgroundSizeCss = computed(() => {
    const size = this.backgroundSize();
    return size === 'tile' ? 'auto' : size === 'fill' ? '100% 100%' : size;
  });

  readonly backgroundRepeatCss = computed(() =>
    this.backgroundSize() === 'tile' ? 'repeat' : this.backgroundRepeat(),
  );

  readonly backgroundPositionCss = computed(() => this.backgroundPosition().replace('-', ' '));

  /** Inline style for the background layer (color, image or gradient). */
  readonly backgroundLayerStyle = computed<Record<string, string>>((): Record<string, string> => {
    if (!this.hasBackground()) return {};

    return {
      'background-image': this.backgroundImageCss(),
      'background-color':
        this.backgroundType() === 'color' ? this.backgroundColor() : 'transparent',
      'background-size': this.backgroundSizeCss(),
      'background-position': this.backgroundPositionCss(),
      'background-repeat': this.backgroundRepeatCss(),
      'background-attachment': this.backgroundAttachment(),
      'mix-blend-mode': this.backgroundBlendMode(),
      opacity: String(this.backgroundOpacity() / 100),
    };
  });

  /**
   * Inline style for the pattern overlay. A tint repaints the artwork through
   * a CSS mask, so the uploaded/default tile keeps its shape while taking the
   * chosen color; without a tint an uploaded image can be inverted.
   */
  readonly patternLayerStyle = computed<Record<string, string>>((): Record<string, string> => {
    if (!this.patternEnabled()) return { display: 'none' };

    const url = this.patternUrl();
    const tint = this.patternTint();
    const opacity = String(this.patternOpacity() / 100);

    if (tint) {
      const mask = url ? `url("${url}")` : 'var(--pattern-default)';
      return {
        'background-image': 'none',
        'background-color': tint,
        'mask-image': mask,
        '-webkit-mask-image': mask,
        'mask-size': `${this.patternSize()}px auto`,
        '-webkit-mask-size': `${this.patternSize()}px auto`,
        'mask-repeat': 'repeat',
        '-webkit-mask-repeat': 'repeat',
        'mask-position': 'center',
        opacity,
      };
    }

    return {
      ...(url ? { 'background-image': `url("${url}")` } : {}),
      'background-size': `${this.patternSize()}px auto`,
      'background-repeat': 'repeat',
      'background-position': 'center',
      ...(this.patternInvert() ? { filter: 'invert(1)' } : {}),
      opacity,
    };
  });

  /** Inline style for the glassmorphism layer (backdrop blur + tint). */
  readonly glassLayerStyle = computed<Record<string, string>>((): Record<string, string> => {
    if (this.backdropBlur() === 0 && this.glassOpacity() === 0) return {};

    return {
      'backdrop-filter': `blur(${this.backdropBlur()}px)`,
      '-webkit-backdrop-filter': `blur(${this.backdropBlur()}px)`,
      background: `color-mix(in srgb, ${this.glassTint()} ${this.glassOpacity()}%, transparent)`,
    };
  });

  /** Ambient wash colors/intensity; the live preview reads the draft values. */
  readonly orbVars = computed<Record<string, string>>(() => ({
    '--user-orb-primary': this.orbPrimary(),
    '--user-orb-secondary': this.orbSecondary(),
    '--user-orb-opacity': String(this.orbOpacity() / 100),
  }));

  /**
   * Scrim colour + strength. A null colour keeps the theme surface so the veil
   * keeps adapting to light/dark; the shell applies its dark boost on top.
   */
  readonly scrimVars = computed<Record<string, string>>(() => ({
    '--user-scrim-color': this.scrimColor() ?? 'var(--color-bg)',
    '--user-scrim-base': `${this.scrimOpacity()}%`,
  }));

  /** Draft values for the live previews (orbs + scrim). */
  readonly sceneVars = computed<Record<string, string>>(() => ({
    ...this.orbVars(),
    ...this.scrimVars(),
  }));

  /**
   * Root-level custom properties consumed by the shell. Binding them on the
   * authenticated shell (never on :root) keeps login/register untouched.
   */
  readonly rootVars = computed<Record<string, string>>(() => ({
    '--user-bg-image': this.backgroundImageCss(),
    '--user-bg-color': this.backgroundType() === 'color' ? this.backgroundColor() : 'transparent',
    '--user-bg-size': this.backgroundSizeCss(),
    '--user-bg-position': this.backgroundPositionCss(),
    '--user-bg-repeat': this.backgroundRepeatCss(),
    '--user-bg-attachment': this.backgroundAttachment(),
    '--user-bg-opacity': String(this.backgroundOpacity() / 100),
    '--user-bg-blend': this.backgroundBlendMode(),
    '--user-bg-blur': `${this.backdropBlur()}px`,
    '--user-glass-tint': this.glassTint(),
    '--user-glass-opacity': `${this.glassOpacity()}%`,
    '--user-pattern-image': this.patternUrl()
      ? `url("${this.patternUrl()}")`
      : 'var(--pattern-default)',
    '--user-pattern-size': `${this.patternSize()}px`,
    '--user-pattern-opacity': String(this.patternOpacity() / 100),
    '--user-pattern-filter': this.patternInvert() ? 'invert(1)' : 'none',
    '--user-pattern-tint': this.patternTint() ?? 'transparent',
    ...this.orbVars(),
    ...this.scrimVars(),
  }));

  /** Copy-ready CSS: the same vars the shell consumes, plus the layer rules. */
  readonly cssSnippet = computed(() => {
    const vars = Object.entries(this.rootVars())
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');

    return `:root {\n${vars}\n}\n\n.app-bg {\n  background-image: var(--user-bg-image);\n  background-color: var(--user-bg-color);\n  background-size: var(--user-bg-size);\n  background-position: var(--user-bg-position);\n  background-repeat: var(--user-bg-repeat);\n  background-attachment: var(--user-bg-attachment);\n  mix-blend-mode: var(--user-bg-blend);\n  opacity: var(--user-bg-opacity);\n}\n\n.app-pattern {\n  background-image: var(--user-pattern-image);\n  background-size: var(--user-pattern-size) auto;\n  opacity: var(--user-pattern-opacity);\n  filter: var(--user-pattern-filter);\n}\n\n.app-glass {\n  backdrop-filter: blur(var(--user-bg-blur));\n  background: color-mix(in srgb, var(--user-glass-tint) var(--user-glass-opacity), transparent);\n}\n\n.app-scrim {\n  position: absolute;\n  inset: 0;\n  --user-scrim-strength: var(--user-scrim-base);\n  background: color-mix(in srgb, var(--user-scrim-color) var(--user-scrim-strength), transparent);\n}\n\n.dark .app-scrim {\n  --user-scrim-strength: min(100%, calc(var(--user-scrim-base) * 1.111));\n}\n\n.app-orb {\n  position: absolute;\n  border-radius: 50%;\n  filter: blur(90px);\n  opacity: var(--user-orb-opacity);\n}\n\n.app-orb-a {\n  background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--user-orb-primary) 35%, transparent), transparent 65%);\n}\n\n.app-orb-b {\n  background: radial-gradient(circle at 60% 40%, color-mix(in srgb, var(--user-orb-secondary) 22%, transparent), transparent 65%);\n}`;
  });

  load(): void {
    const centerId = this.resolveCenterId();
    if (centerId !== this.centerId()) this.reset(centerId);

    // A global admin's first read has neither a saved pick nor a center of
    // their own, and the server answers such reads with bare defaults — the
    // shell would paint the stock pattern instead of any configured center.
    // Resolve the first center once (the dashboard's initial-lock rule) first.
    if (centerId === null && !this.fallbackSettled && this.auth.currentUser()?.role === 'admin') {
      this.resolveFallbackCenter();
      return;
    }

    const seq = ++this.loadSeq;
    this.api.get<AppearanceConfig>('/appearance', this.centerParams()).subscribe({
      // Preserve edits made before the initial GET lands.
      next: (cfg) => {
        if (seq === this.loadSeq) this.apply(cfg, true);
      },
      error: () => {
        if (seq === this.loadSeq) this.loaded.set(true);
      },
    });
  }

  /** Switches the center being edited/previewed; drafts are dropped. */
  setCenter(centerId: number | null): void {
    if (centerId === this.centerId()) {
      if (!this.loaded()) this.load();
      return;
    }

    if (this.auth.currentUser()?.role === 'admin') {
      this.prefs.setAppearanceCenterId(centerId);
    }
    this.reset(centerId);
    this.load();
  }

  upload(kind: AppearanceKind, file: File): Observable<AppearanceConfig> {
    const requestCenter = this.centerId();
    const body = new FormData();
    body.append('image', file);
    if (this.auth.currentUser()?.role === 'admin' && requestCenter !== null) {
      body.append('center_id', String(requestCenter));
    }

    return (
      this.api
        .postForm<AppearanceConfig>(`/appearance/${kind}`, body)
        // Keep unsaved control edits when an upload response lands.
        .pipe(tap((cfg) => this.applyIfCurrent(cfg, requestCenter)))
    );
  }

  remove(kind: AppearanceKind): Observable<AppearanceConfig> {
    const requestCenter = this.centerId();
    return this.api
      .delete<AppearanceConfig>(`/appearance/${kind}`, this.centerParams())
      .pipe(tap((cfg) => this.applyIfCurrent(cfg, requestCenter)));
  }

  setOptions(patch: Partial<AppearanceOptions>): void {
    if (patch.background_type !== undefined) this.backgroundType.set(patch.background_type);
    if (patch.background_color !== undefined) this.backgroundColor.set(patch.background_color);
    if (patch.gradient_type !== undefined) this.gradientType.set(patch.gradient_type);
    if (patch.gradient_angle !== undefined) this.gradientAngle.set(patch.gradient_angle);
    if (patch.gradient_from !== undefined) this.gradientFrom.set(patch.gradient_from);
    if (patch.gradient_to !== undefined) this.gradientTo.set(patch.gradient_to);
    if (patch.background_opacity !== undefined) {
      this.backgroundOpacity.set(patch.background_opacity);
    }
    if (patch.background_size !== undefined) this.backgroundSize.set(patch.background_size);
    if (patch.background_position !== undefined) {
      this.backgroundPosition.set(patch.background_position);
    }
    if (patch.background_repeat !== undefined) this.backgroundRepeat.set(patch.background_repeat);
    if (patch.background_attachment !== undefined) {
      this.backgroundAttachment.set(patch.background_attachment);
    }
    if (patch.background_blend_mode !== undefined) {
      this.backgroundBlendMode.set(patch.background_blend_mode);
    }
    if (patch.pattern_enabled !== undefined) this.patternEnabled.set(patch.pattern_enabled);
    if (patch.pattern_opacity !== undefined) this.patternOpacity.set(patch.pattern_opacity);
    if (patch.pattern_size !== undefined) this.patternSize.set(patch.pattern_size);
    if (patch.pattern_tint !== undefined) this.patternTint.set(patch.pattern_tint);
    if (patch.pattern_invert !== undefined) this.patternInvert.set(patch.pattern_invert);
    if (patch.backdrop_blur !== undefined) this.backdropBlur.set(patch.backdrop_blur);
    if (patch.glass_tint !== undefined) this.glassTint.set(patch.glass_tint);
    if (patch.glass_opacity !== undefined) this.glassOpacity.set(patch.glass_opacity);
    if (patch.orb_enabled !== undefined) this.orbEnabled.set(patch.orb_enabled);
    if (patch.orb_primary !== undefined) this.orbPrimary.set(patch.orb_primary);
    if (patch.orb_secondary !== undefined) this.orbSecondary.set(patch.orb_secondary);
    if (patch.orb_opacity !== undefined) this.orbOpacity.set(patch.orb_opacity);
    if (patch.scrim_enabled !== undefined) this.scrimEnabled.set(patch.scrim_enabled);
    if (patch.scrim_color !== undefined) this.scrimColor.set(patch.scrim_color);
    if (patch.scrim_opacity !== undefined) this.scrimOpacity.set(patch.scrim_opacity);
  }

  /** Drops unsaved edits, restoring the last values returned by the server. */
  revertOptions(): void {
    this.writeOptions(this.savedOptions());
  }

  save(): Observable<AppearanceConfig> {
    const requestCenter = this.centerId();
    const body = { ...this.options() };
    return (
      this.api
        .patch<AppearanceConfig>(
          '/appearance',
          this.auth.currentUser()?.role === 'admin' && requestCenter !== null
            ? { ...body, center_id: requestCenter }
            : body,
        )
        // Edits made while the PATCH is in flight survive the response.
        .pipe(tap((cfg) => this.applyIfCurrent(cfg, requestCenter)))
    );
  }

  private resolveCenterId(): number | null {
    const user = this.auth.currentUser();
    if (!user) return null;
    if (user.role !== 'admin') return user.center_id;
    return this.prefs.appearanceCenterId() ?? user.center_id ?? this.fallbackCenterId();
  }

  /** One-shot: the first center becomes the global admin's implicit center. */
  private resolveFallbackCenter(): void {
    this.fallbackSettled = true;
    this.centers.list().subscribe({
      next: (page) => {
        const first = page.data[0];
        if (first) this.fallbackCenterId.set(first.id);
        this.load();
      },
      // No centers (or a failed read): keep today's defaults-only rendering.
      error: () => this.load(),
    });
  }

  private centerParams(): QueryParams | undefined {
    if (this.auth.currentUser()?.role !== 'admin') return undefined;
    const centerId = this.centerId();
    return centerId === null ? undefined : { center_id: centerId };
  }

  /** Ignores a response that belongs to a center the admin already left. */
  private applyIfCurrent(cfg: AppearanceConfig, requestCenter: number | null): void {
    if (cfg.center_id === requestCenter) this.apply(cfg, true);
  }

  private reset(centerId: number | null): void {
    this.centerId.set(centerId);
    this.backgroundUrl.set(null);
    this.patternUrl.set(null);
    this.savedOptions.set({ ...DEFAULT_APPEARANCE });
    this.writeOptions(DEFAULT_APPEARANCE);
    this.loaded.set(false);
  }

  private apply(cfg: AppearanceConfig, preserveLocalOptions = false): void {
    const wasDirty = this.dirty();
    this.backgroundUrl.set(cfg.background_url);
    this.patternUrl.set(cfg.pattern_url);
    const server = this.optionsFrom(cfg);
    this.savedOptions.set(server);
    if (!preserveLocalOptions || !wasDirty) this.writeOptions(server);
    this.loaded.set(true);
  }

  private writeOptions(options: AppearanceOptions): void {
    this.backgroundType.set(options.background_type);
    this.backgroundColor.set(options.background_color);
    this.gradientType.set(options.gradient_type);
    this.gradientAngle.set(options.gradient_angle);
    this.gradientFrom.set(options.gradient_from);
    this.gradientTo.set(options.gradient_to);
    this.backgroundOpacity.set(options.background_opacity);
    this.backgroundSize.set(options.background_size);
    this.backgroundPosition.set(options.background_position);
    this.backgroundRepeat.set(options.background_repeat);
    this.backgroundAttachment.set(options.background_attachment);
    this.backgroundBlendMode.set(options.background_blend_mode);
    this.patternEnabled.set(options.pattern_enabled);
    this.patternOpacity.set(options.pattern_opacity);
    this.patternSize.set(options.pattern_size);
    this.patternTint.set(options.pattern_tint);
    this.patternInvert.set(options.pattern_invert);
    this.backdropBlur.set(options.backdrop_blur);
    this.glassTint.set(options.glass_tint);
    this.glassOpacity.set(options.glass_opacity);
    this.orbEnabled.set(options.orb_enabled);
    this.orbPrimary.set(options.orb_primary);
    this.orbSecondary.set(options.orb_secondary);
    this.orbOpacity.set(options.orb_opacity);
    this.scrimEnabled.set(options.scrim_enabled);
    this.scrimColor.set(options.scrim_color);
    this.scrimOpacity.set(options.scrim_opacity);
  }

  /** Old/shorter payloads fall back to the shipped defaults field by field. */
  private optionsFrom(config: Partial<AppearanceOptions>): AppearanceOptions {
    const options = { ...DEFAULT_APPEARANCE };
    for (const key of Object.keys(options) as (keyof AppearanceOptions)[]) {
      const value = config[key];
      if (value !== undefined) (options as Record<string, unknown>)[key] = value;
    }
    return options;
  }
}
