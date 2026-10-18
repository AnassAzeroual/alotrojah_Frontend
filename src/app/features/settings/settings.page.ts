import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Center } from '../../core/api/api-models';
import { CentersService } from '../../core/api/centers.service';
import { AuthService } from '../../core/auth/auth.service';
import { AdminPrefsService } from '../../core/settings/admin-prefs.service';
import {
  AppearanceKind,
  AppearanceService,
  BackgroundAttachment,
  BackgroundBlendMode,
  BackgroundRepeat,
  BackgroundType,
  GradientType,
} from '../../core/settings/appearance.service';

type FlashKind = AppearanceKind | 'options';
type SettingsTab = 'general' | 'appearance';

const SIZE_PRESETS = ['cover', 'contain', 'fill', 'tile'];
const SIZE_TOKEN = String.raw`\d{1,4}(?:\.\d+)?(?:px|%)`;
const SIZE_RE = new RegExp(
  String.raw`^(cover|contain|fill|tile|auto|${SIZE_TOKEN}(?:\s+(?:auto|${SIZE_TOKEN}))?)$`,
);
const POSITION_PRESETS = [
  'center',
  'top',
  'bottom',
  'left',
  'right',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];
const X_TOKEN_RE = new RegExp(String.raw`^(?:left|center|right|${SIZE_TOKEN})$`);
const Y_TOKEN_RE = new RegExp(String.raw`^(?:top|center|bottom|${SIZE_TOKEN})$`);

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss',
})
export class SettingsPage {
  readonly prefs = inject(AdminPrefsService);
  readonly appearance = inject(AppearanceService);
  readonly auth = inject(AuthService);
  private readonly centersSvc = inject(CentersService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly tabs: readonly SettingsTab[] = ['general', 'appearance'];
  readonly activeTab = signal<SettingsTab>('general');

  readonly isAdmin = computed(() => this.auth.role() === 'admin');
  readonly centers = signal<Center[]>([]);
  readonly centersLoading = signal(true);
  /** The center may not switch mid-edit; drafts are per center. */
  readonly centerLocked = computed(
    () => this.saving() || this.busy() !== null || this.appearance.dirty(),
  );
  readonly centerReady = computed(() => this.appearance.hasCenter());

  readonly backgroundTypes: readonly BackgroundType[] = ['none', 'color', 'image', 'gradient'];
  readonly gradientTypes: readonly GradientType[] = ['linear', 'radial', 'conic'];
  readonly backgroundSizes: readonly string[] = SIZE_PRESETS;
  readonly backgroundPositions: readonly string[] = POSITION_PRESETS;
  readonly backgroundRepeats: readonly BackgroundRepeat[] = [
    'no-repeat',
    'repeat',
    'repeat-x',
    'repeat-y',
    'space',
    'round',
  ];
  readonly backgroundAttachments: readonly BackgroundAttachment[] = ['scroll', 'fixed'];
  readonly backgroundBlendModes: readonly BackgroundBlendMode[] = [
    'normal',
    'multiply',
    'screen',
    'overlay',
    'darken',
    'lighten',
    'color-dodge',
    'color-burn',
    'hard-light',
    'soft-light',
    'difference',
    'exclusion',
    'hue',
    'saturation',
    'color',
    'luminosity',
  ];

  /** `custom` is a UI-only mode; the stored value is the CSS size string. */
  readonly sizeMode = computed(() =>
    SIZE_PRESETS.includes(this.appearance.backgroundSize())
      ? this.appearance.backgroundSize()
      : 'custom',
  );
  readonly positionMode = computed(() =>
    POSITION_PRESETS.includes(this.appearance.backgroundPosition())
      ? this.appearance.backgroundPosition()
      : 'custom',
  );

  /** Drafts keep invalid intermediate typing local until it becomes valid. */
  private readonly sizeDraft = signal<string | null>(null);
  private readonly positionDraft = signal<{ x: string; y: string } | null>(null);
  readonly customSize = computed(() => this.sizeDraft() ?? this.appearance.backgroundSize());
  readonly customPositionX = computed(
    () => this.positionDraft()?.x ?? this.splitPosition(this.appearance.backgroundPosition())?.x,
  );
  readonly customPositionY = computed(
    () => this.positionDraft()?.y ?? this.splitPosition(this.appearance.backgroundPosition())?.y,
  );
  readonly customSizeInvalid = computed(
    () => this.sizeMode() === 'custom' && !SIZE_RE.test(this.customSize()),
  );
  readonly customPositionInvalid = computed(() => {
    const x = this.customPositionX();
    const y = this.customPositionY();
    return (
      this.positionMode() === 'custom' &&
      (x === undefined || y === undefined || !X_TOKEN_RE.test(x) || !Y_TOKEN_RE.test(y))
    );
  });

  readonly busy = signal<AppearanceKind | null>(null);
  readonly saving = signal(false);
  readonly saved = signal<FlashKind | null>(null);
  /** Armed first click for removal; the second click performs it. */
  readonly armedRemove = signal<AppearanceKind | null>(null);
  /** i18n key of the last failure. */
  readonly error = signal<string | null>(null);
  readonly toast = signal<string | null>(null);
  readonly copiedCss = signal(false);

  private static readonly ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'];
  private static readonly MAX_BYTES = 2 * 1024 * 1024;
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.route.fragment
      .pipe(takeUntilDestroyed())
      .subscribe((fragment) =>
        this.activeTab.set(fragment === 'appearance' ? 'appearance' : 'general'),
      );
    this.appearance.load();
    this.loadCenters();
  }

  selectTab(tab: SettingsTab): void {
    if (this.activeTab() === tab) return;

    this.activeTab.set(tab);
    void this.router.navigate([], {
      relativeTo: this.route,
      fragment: tab,
      replaceUrl: true,
    });
  }

  /** Arrow keys follow visual order: reversed in RTL. */
  onTabKeydown(event: KeyboardEvent, index: number): void {
    const rtl = document.documentElement.dir === 'rtl';
    let next: number;

    switch (event.key) {
      case 'ArrowRight':
        next = index + (rtl ? -1 : 1);
        break;
      case 'ArrowLeft':
        next = index + (rtl ? 1 : -1);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = this.tabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const tab = this.tabs[(next + this.tabs.length) % this.tabs.length];
    this.selectTab(tab);
    document.getElementById(`settings-tab-${tab}`)?.focus();
  }

  private loadCenters(): void {
    if (!this.isAdmin()) {
      this.centersLoading.set(false);
      return;
    }

    this.centersSvc.listAll().subscribe({
      next: (centers) => {
        this.centers.set(centers);
        this.centersLoading.set(false);
        this.chooseCenter(centers);
      },
      error: () => this.centersLoading.set(false),
    });
  }

  /** A global admin starts on the first center; a saved choice is kept. */
  private chooseCenter(centers: Center[]): void {
    if (centers.length === 0) {
      this.appearance.setCenter(null);
      return;
    }

    const current = this.appearance.centerId();
    const valid = current !== null && centers.some((c) => c.id === current);
    if (!valid) this.resetDraftsAndCenter(centers[0].id);
  }

  onPick(kind: AppearanceKind, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.saved.set(null);
    this.armedRemove.set(null);

    if (!SettingsPage.ACCEPTED.includes(file.type)) {
      this.error.set('settings.image_type');
      return;
    }
    if (file.size > SettingsPage.MAX_BYTES) {
      this.error.set('settings.image_too_large');
      return;
    }

    this.error.set(null);
    this.busy.set(kind);
    this.appearance.upload(kind, file).subscribe({
      next: () => {
        this.flashSaved(kind);
        this.showToast('settings.toast_uploaded');
      },
      complete: () => this.busy.set(null),
    });
  }

  remove(kind: AppearanceKind): void {
    if (this.armedRemove() !== kind) {
      this.armedRemove.set(kind);
      return;
    }

    this.armedRemove.set(null);
    this.saved.set(null);
    this.error.set(null);
    this.busy.set(kind);
    this.appearance.remove(kind).subscribe({
      next: () => {
        this.flashSaved(kind);
        this.showToast('settings.toast_removed');
      },
      complete: () => this.busy.set(null),
    });
  }

  setBackgroundType(type: BackgroundType): void {
    this.appearance.setOptions({ background_type: type });
  }

  setBackgroundColor(event: Event): void {
    this.appearance.setOptions({
      background_color: (event.target as HTMLInputElement).value,
    });
  }

  setGradientType(event: Event): void {
    this.appearance.setOptions({
      gradient_type: (event.target as HTMLSelectElement).value as GradientType,
    });
  }

  setGradientAngle(event: Event): void {
    this.appearance.setOptions({
      gradient_angle: Number((event.target as HTMLInputElement).value),
    });
  }

  setGradientFrom(event: Event): void {
    this.appearance.setOptions({ gradient_from: (event.target as HTMLInputElement).value });
  }

  setGradientTo(event: Event): void {
    this.appearance.setOptions({ gradient_to: (event.target as HTMLInputElement).value });
  }

  setBackgroundOpacity(event: Event): void {
    this.appearance.setOptions({
      background_opacity: Number((event.target as HTMLInputElement).value),
    });
  }

  onSizeModeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value !== 'custom') {
      this.sizeDraft.set(null);
      this.appearance.setOptions({ background_size: value });
      return;
    }

    const current = this.appearance.backgroundSize();
    const draft = SIZE_PRESETS.includes(current) ? '320px 200px' : current;
    this.sizeDraft.set(draft);
    this.appearance.setOptions({ background_size: draft });
  }

  onCustomSizeInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.sizeDraft.set(value);
    if (SIZE_RE.test(value)) this.appearance.setOptions({ background_size: value });
  }

  onPositionModeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value !== 'custom') {
      this.positionDraft.set(null);
      this.appearance.setOptions({ background_position: value });
      return;
    }

    const current = this.appearance.backgroundPosition();
    const draft = POSITION_PRESETS.includes(current)
      ? { x: '20%', y: '30%' }
      : (this.splitPosition(current) ?? { x: '20%', y: '30%' });
    this.positionDraft.set(draft);
    this.applyCustomPosition();
  }

  onCustomPositionInput(axis: 'x' | 'y', event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    const current = this.positionDraft() ??
      this.splitPosition(this.appearance.backgroundPosition()) ?? { x: '20%', y: '30%' };
    this.positionDraft.set({ ...current, [axis]: value });
    this.applyCustomPosition();
  }

  setBackgroundRepeat(event: Event): void {
    this.appearance.setOptions({
      background_repeat: (event.target as HTMLSelectElement).value as BackgroundRepeat,
    });
  }

  setBackgroundAttachment(event: Event): void {
    this.appearance.setOptions({
      background_attachment: (event.target as HTMLSelectElement).value as BackgroundAttachment,
    });
  }

  setBackgroundBlendMode(event: Event): void {
    this.appearance.setOptions({
      background_blend_mode: (event.target as HTMLSelectElement).value as BackgroundBlendMode,
    });
  }

  setPatternEnabled(event: Event): void {
    this.appearance.setOptions({
      pattern_enabled: (event.target as HTMLInputElement).checked,
    });
  }

  setPatternInvert(event: Event): void {
    this.appearance.setOptions({
      pattern_invert: (event.target as HTMLInputElement).checked,
    });
  }

  setPatternTintEnabled(event: Event): void {
    const enabled = (event.target as HTMLInputElement).checked;
    this.appearance.setOptions({
      pattern_tint: enabled ? (this.appearance.patternTint() ?? '#0e9f6e') : null,
    });
  }

  setPatternTint(event: Event): void {
    this.appearance.setOptions({
      pattern_tint: (event.target as HTMLInputElement).value,
    });
  }

  setPatternOpacity(event: Event): void {
    this.appearance.setOptions({
      pattern_opacity: Number((event.target as HTMLInputElement).value),
    });
  }

  setPatternSize(event: Event): void {
    this.appearance.setOptions({ pattern_size: Number((event.target as HTMLInputElement).value) });
  }

  setBackdropBlur(event: Event): void {
    this.appearance.setOptions({
      backdrop_blur: Number((event.target as HTMLInputElement).value),
    });
  }

  setGlassTint(event: Event): void {
    this.appearance.setOptions({ glass_tint: (event.target as HTMLInputElement).value });
  }

  setGlassOpacity(event: Event): void {
    this.appearance.setOptions({
      glass_opacity: Number((event.target as HTMLInputElement).value),
    });
  }

  setOrbEnabled(event: Event): void {
    this.appearance.setOptions({
      orb_enabled: (event.target as HTMLInputElement).checked,
    });
  }

  setOrbPrimary(event: Event): void {
    this.appearance.setOptions({ orb_primary: (event.target as HTMLInputElement).value });
  }

  setOrbSecondary(event: Event): void {
    this.appearance.setOptions({ orb_secondary: (event.target as HTMLInputElement).value });
  }

  setOrbOpacity(event: Event): void {
    this.appearance.setOptions({
      orb_opacity: Number((event.target as HTMLInputElement).value),
    });
  }

  setScrimEnabled(event: Event): void {
    this.appearance.setOptions({
      scrim_enabled: (event.target as HTMLInputElement).checked,
    });
  }

  setScrimThemeColor(event: Event): void {
    const useTheme = (event.target as HTMLInputElement).checked;
    this.appearance.setOptions({ scrim_color: useTheme ? null : '#000000' });
  }

  setScrimColor(event: Event): void {
    this.appearance.setOptions({ scrim_color: (event.target as HTMLInputElement).value });
  }

  setScrimOpacity(event: Event): void {
    this.appearance.setOptions({
      scrim_opacity: Number((event.target as HTMLInputElement).value),
    });
  }

  onCenterChange(event: Event): void {
    if (this.centerLocked()) return;

    const id = Number((event.target as HTMLSelectElement).value);
    this.resetDraftsAndCenter(Number.isInteger(id) && id > 0 ? id : null);
  }

  discard(): void {
    if (this.saving()) return;
    this.sizeDraft.set(null);
    this.positionDraft.set(null);
    this.appearance.revertOptions();
    this.saved.set(null);
    this.error.set(null);
  }

  save(): void {
    if (this.saving() || !this.appearance.dirty()) return;

    this.saved.set(null);
    this.error.set(null);
    this.saving.set(true);
    this.appearance.save().subscribe({
      next: () => {
        this.flashSaved('options');
        this.showToast('settings.toast_saved');
      },
      complete: () => this.saving.set(false),
    });
  }

  async copyCss(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.appearance.cssSnippet());
      this.copiedCss.set(true);
      setTimeout(() => this.copiedCss.set(false), 2000);
    } catch {
      this.error.set('settings.copy_failed');
    }
  }

  /** Maps a hyphenated value key to its i18n key (`top-left` → `top_left`). */
  positionKey(position: string): string {
    return `settings.bg_pos_${position.replaceAll('-', '_')}`;
  }

  optionKey(prefix: string, value: string): string {
    return `settings.${prefix}_${value.replaceAll('-', '_')}`;
  }

  private applyCustomPosition(): void {
    const position = this.positionDraft();
    if (!position) return;
    if (X_TOKEN_RE.test(position.x) && Y_TOKEN_RE.test(position.y)) {
      this.appearance.setOptions({
        background_position: `${position.x} ${position.y}`,
      });
    }
  }

  private splitPosition(value: string): { x: string; y: string } | null {
    const [x, y, extra] = value.trim().split(/\s+/);
    return x && y && !extra ? { x, y } : null;
  }

  private resetDraftsAndCenter(centerId: number | null): void {
    this.sizeDraft.set(null);
    this.positionDraft.set(null);
    this.saved.set(null);
    this.error.set(null);
    this.armedRemove.set(null);
    this.appearance.setCenter(centerId);
  }

  private flashSaved(kind: FlashKind): void {
    this.saved.set(kind);
    setTimeout(() => {
      if (this.saved() === kind) this.saved.set(null);
    }, 2500);
  }

  private showToast(key: string): void {
    this.toast.set(key);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 3200);
  }
}
