import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { SecureStorageService } from '../storage/secure-storage.service';

interface PrefsShape {
  hideScopePickers?: boolean;
  showCenterId?: boolean;
  showCalDebug?: boolean;
  /** Center whose appearance the admin is currently editing/previewing. */
  appearanceCenterId?: number | null;
}

const keyFor = (userId: number | null): string => `alotrojah_prefs.${userId ?? 'anon'}`;

/**
 * Per-user display prefs. Browser storage via the encrypted vault (no
 * backend): the key carries
 * the user id so accounts sharing a browser never leak prefs into each other.
 * Open to every role — each account only ever changes its own view.
 */
@Injectable({ providedIn: 'root' })
export class AdminPrefsService {
  private readonly auth = inject(AuthService);
  private readonly storage = inject(SecureStorageService);

  /** Kill-switch: hide all per-center scope pickers (forces shared-defaults editing). */
  readonly hideScopePickers = signal(false);
  /** Display pref: show the numeric center id (dev builds only, never prod). */
  readonly showCenterId = signal(true);
  /** Display pref: show the calendar current-view events JSON panel (admin-only). */
  readonly showCalDebug = signal(true);
  /** Center whose appearance is edited and previewed (admin-only selection). */
  readonly appearanceCenterId = signal<number | null>(null);

  private readonly userId = computed(() => this.auth.currentUser()?.id ?? null);

  constructor() {
    // Load synchronously as well: the shell reads the appearance center during
    // its own construction, before the effect below has had a chance to run.
    this.load(this.userId());
    // Reload whenever the signed-in account changes. The computed id narrows
    // the dependency so unrelated currentUser updates never clobber live edits.
    effect(() => {
      this.load(this.userId());
    });
  }

  setHideScopePickers(v: boolean): void {
    this.hideScopePickers.set(v);
    this.save();
  }

  setShowCenterId(v: boolean): void {
    this.showCenterId.set(v);
    this.save();
  }

  setShowCalDebug(v: boolean): void {
    this.showCalDebug.set(v);
    this.save();
  }

  setAppearanceCenterId(centerId: number | null): void {
    this.appearanceCenterId.set(centerId);
    this.save();
  }

  private load(userId: number | null): void {
    let raw: PrefsShape = {};
    try {
      raw = JSON.parse(this.storage.read(keyFor(userId)) ?? '{}') as PrefsShape;
    } catch {
      raw = {};
    }
    this.hideScopePickers.set(raw.hideScopePickers ?? false);
    this.showCenterId.set(raw.showCenterId ?? true);
    this.showCalDebug.set(raw.showCalDebug ?? true);
    this.appearanceCenterId.set(
      typeof raw.appearanceCenterId === 'number' ? raw.appearanceCenterId : null,
    );
  }

  private save(): void {
    const uid = this.auth.currentUser()?.id ?? null;
    this.storage.write(
      keyFor(uid),
      JSON.stringify({
        hideScopePickers: this.hideScopePickers(),
        showCenterId: this.showCenterId(),
        showCalDebug: this.showCalDebug(),
        appearanceCenterId: this.appearanceCenterId(),
      }),
    );
  }
}
