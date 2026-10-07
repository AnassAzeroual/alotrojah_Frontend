import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';

interface PrefsShape {
  hideScopePickers?: boolean;
  showCenterId?: boolean;
}

const keyFor = (userId: number | null): string => `alotrojah_prefs.${userId ?? 'anon'}`;

/**
 * T3 admin display prefs. Per-user localStorage (no backend): the key carries
 * the user id so accounts sharing a browser never leak prefs into each other.
 */
@Injectable({ providedIn: 'root' })
export class AdminPrefsService {
  private readonly auth = inject(AuthService);

  /** Kill-switch: hide all per-center scope pickers (forces shared-defaults editing). */
  readonly hideScopePickers = signal(false);
  /** Display pref: show the numeric center id (dev builds only, never prod). */
  readonly showCenterId = signal(true);

  private readonly userId = computed(() => this.auth.currentUser()?.id ?? null);

  constructor() {
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

  private load(userId: number | null): void {
    let raw: PrefsShape = {};
    try {
      raw = JSON.parse(localStorage.getItem(keyFor(userId)) ?? '{}') as PrefsShape;
    } catch {
      raw = {};
    }
    this.hideScopePickers.set(raw.hideScopePickers ?? false);
    this.showCenterId.set(raw.showCenterId ?? true);
  }

  private save(): void {
    const uid = this.auth.currentUser()?.id ?? null;
    localStorage.setItem(
      keyFor(uid),
      JSON.stringify({
        hideScopePickers: this.hideScopePickers(),
        showCenterId: this.showCenterId(),
      }),
    );
  }
}
