import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { SetupStatusResponse } from '../api/models';
import { AdminPrefsService } from './admin-prefs.service';

export type SetupStep = SetupStatusResponse['data']['steps'][number];

/**
 * Admin first-run setup guide. One backend request returns the ordered
 * checklist (center → season → levels → teacher → group → pupils); the shell
 * opens the panel automatically once per account while the checklist is
 * incomplete, and the header button / Settings can reopen it at any time.
 */
@Injectable({ providedIn: 'root' })
export class SetupGuideService {
  private readonly api = inject(ApiClient);
  private readonly prefs = inject(AdminPrefsService);

  readonly open = signal(false);
  readonly loading = signal(false);
  readonly failed = signal(false);
  readonly status = signal<SetupStatusResponse['data'] | null>(null);
  private autoChecked = false;

  readonly steps = computed<SetupStep[]>(() => this.status()?.steps ?? []);
  readonly current = computed(() => this.status()?.current ?? null);
  readonly hasWork = computed(() => this.current() !== null);
  readonly doneSteps = computed(() => this.status()?.done_steps ?? 0);
  readonly totalSteps = computed(() => this.status()?.total_steps ?? 6);
  readonly progress = computed(() =>
    this.totalSteps() === 0 ? 0 : Math.round((this.doneSteps() / this.totalSteps()) * 100),
  );

  show(): void {
    this.open.set(true);
    this.load();
  }

  hide(): void {
    this.open.set(false);
  }

  load(): void {
    this.loading.set(true);
    this.failed.set(false);
    this.api.get<SetupStatusResponse['data']>('/setup/status').subscribe({
      next: (status) => {
        this.status.set(status);
        this.loading.set(false);
      },
      error: () => {
        this.failed.set(true);
        this.loading.set(false);
      },
    });
  }

  /**
   * One auto-open attempt per shell instance. Only for an admin who has not
   * dismissed/seen the guide and whose checklist still has a missing step.
   */
  maybeAutoOpen(): void {
    if (this.autoChecked) return;
    this.autoChecked = true;
    // E2E-only bypass (seeded by playwright.config.ts storageState): the
    // first-run modal would otherwise cover every admin flow on the shared
    // verify DB. Deliberately plaintext, like the HTTP-cache bypass.
    if (globalThis.localStorage?.getItem('alotrojah_e2e_no_setup_guide') === '1') return;
    // Load the status even when the guide was already seen: the header dot
    // must still reflect a missing step; only the auto-open is one-time.
    if (!this.prefs.setupGuideEnabled()) return;
    this.api.get<SetupStatusResponse['data']>('/setup/status').subscribe({
      next: (status) => {
        this.status.set(status);
        if (!this.prefs.setupGuideSeen() && status.current !== null) {
          this.open.set(true);
          this.prefs.markSetupGuideSeen();
        }
      },
      error: () => undefined,
    });
  }
}
