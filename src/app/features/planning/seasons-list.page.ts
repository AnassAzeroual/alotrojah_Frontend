import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { SeasonsService } from '../../core/api/seasons.service';
import { apiErrorKey } from '../../core/api/api-errors';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-seasons-list-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe, EmptyStateComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <div class="page-head anim-rise">
        <h1 class="with-add">
          {{ 'planning.title' | translate }}
          <a
            class="btn btn-primary btn-icon"
            routerLink="/planning/new"
            data-testid="seasons-new"
            [attr.aria-label]="'planning.new_season' | translate"
            [attr.title]="'planning.new_season' | translate"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </a>
        </h1>
      </div>
      @if (seasons.isLoading()) {
        <div class="stack" aria-hidden="true">
          <div class="skeleton sk-card"></div>
          <div class="skeleton sk-card"></div>
        </div>
      } @else if ((seasons.value() ?? []).length === 0) {
        <app-empty-state />
      } @else {
        <div class="grid-auto">
          @for (s of seasons.value() ?? []; track s.id) {
            <div class="card anim-rise" [style.--i]="$index">
              <span class="row-top">
                <strong>{{ s.name }}</strong>
                @if (s.is_current) {
                  <small class="cur">{{ 'planning.current' | translate }}</small>
                }
              </span>
              <small class="muted ltr-num">{{ s.total_weeks }} / {{ s.total_sessions }}</small>
              <div class="cluster">
                @if (!s.is_current) {
                  <button type="button" class="btn btn-ghost" (click)="activate(s.id)">
                    {{ 'planning.activate' | translate }}
                  </button>
                }
                @if (s.first_term_id) {
                  <a class="btn btn-ghost" [routerLink]="['/planning/terms', s.first_term_id]">{{
                    'planning.terms' | translate
                  }}</a>
                }
                @if (canManage()) {
                  @if (renamingId() === s.id) {
                    <input
                      type="text"
                      [value]="renameValue()"
                      (input)="renameValue.set($any($event.target).value)"
                      maxlength="50"
                      [attr.aria-label]="'planning.rename_term' | translate"
                      [attr.data-testid]="'rename-season-input-' + s.id"
                    />
                    <button
                      type="button"
                      class="btn btn-primary btn-sm"
                      [disabled]="renameValue().trim() === '' || renameSaving()"
                      [attr.data-testid]="'rename-season-save-' + s.id"
                      (click)="submitRename(s.id)"
                    >
                      @if (renameSaving()) {
                        <app-spinner />
                      } @else {
                        {{ 'common.save' | translate }}
                      }
                    </button>
                    <button
                      type="button"
                      class="btn btn-ghost btn-sm"
                      [disabled]="renameSaving()"
                      (click)="cancelRename()"
                    >
                      {{ 'common.cancel' | translate }}
                    </button>
                  } @else {
                    <button
                      type="button"
                      class="btn btn-ghost btn-sm"
                      [attr.data-testid]="'rename-season-' + s.id"
                      [attr.aria-label]="'planning.rename_term' | translate"
                      (click)="startRename(s)"
                    >
                      {{ 'planning.rename_term' | translate }}
                    </button>
                  }
                  <a
                    class="btn btn-ghost btn-sm"
                    [routerLink]="['/planning', s.id, 'edit']"
                    [attr.data-testid]="'edit-season-' + s.id"
                    [attr.aria-label]="'planning.edit_season' | translate"
                  >
                    {{ 'planning.edit_season' | translate }}
                  </a>
                }
                @if (canDelete()) {
                  @if (!s.is_current) {
                    @if (armingDeleteId() === s.id) {
                      <button
                        type="button"
                        class="btn btn-danger-solid btn-sm"
                        [disabled]="busyId() === s.id"
                        [attr.data-testid]="'confirm-delete-season-' + s.id"
                        (click)="confirmDelete(s.id)"
                      >
                        @if (busyId() === s.id) {
                          <app-spinner />
                        } @else {
                          {{ 'planning.delete_confirm' | translate }}
                        }
                      </button>
                      <button
                        type="button"
                        class="btn btn-ghost btn-sm"
                        [disabled]="busyId() === s.id"
                        (click)="disarmDelete()"
                      >
                        {{ 'common.cancel' | translate }}
                      </button>
                    } @else {
                      <button
                        type="button"
                        class="btn btn-danger-ghost btn-sm"
                        [attr.data-testid]="'delete-season-' + s.id"
                        [attr.aria-label]="'common.delete' | translate"
                        (click)="armDelete(s.id)"
                      >
                        {{ 'common.delete' | translate }}
                      </button>
                    }
                  }
                }
              </div>
              @if (deleteFailed()?.id === s.id) {
                <div class="banner danger">{{ deleteFailed()!.key | translate }}</div>
              }
              @if (renameFailed()?.id === s.id) {
                <div class="banner danger">{{ renameFailed()!.key | translate }}</div>
              }
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class SeasonsListPage {
  private readonly seasonsSvc = inject(SeasonsService);
  private readonly auth = inject(AuthService);

  /** Season delete is admin-only (policy); supervisors see the page read-only. */
  readonly canDelete = computed(() => this.auth.role() === 'admin');
  /** Rename follows the manage ability (admin/supervisor, center-laned server-side). */
  readonly canManage = computed(() => ['admin', 'supervisor'].includes(this.auth.role() ?? ''));
  readonly armingDeleteId = signal<number | null>(null);
  readonly busyId = signal<number | null>(null);
  readonly deleteFailed = signal<{ id: number; key: string } | null>(null);
  readonly renamingId = signal<number | null>(null);
  readonly renameValue = signal('');
  readonly renameSaving = signal(false);
  readonly renameFailed = signal<{ id: number; key: string } | null>(null);

  protected readonly seasons = resource({
    params: () => ({}),
    loader: () => firstValueFrom(this.seasonsSvc.list().pipe(map((p) => p.data))),
  });

  protected activate(id: number): void {
    this.seasonsSvc.activate(id).subscribe(() => this.seasons.reload());
  }

  armDelete(id: number): void {
    this.armingDeleteId.set(id);
    this.deleteFailed.set(null);
  }

  disarmDelete(): void {
    this.armingDeleteId.set(null);
  }

  confirmDelete(id: number): void {
    if (this.busyId() !== null) return;
    this.busyId.set(id);
    this.deleteFailed.set(null);
    this.seasonsSvc.remove(id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.armingDeleteId.set(null);
        this.seasons.reload();
      },
      error: (err: unknown) => {
        // 422 when the season holds recorded facts (terms cascade otherwise).
        this.busyId.set(null);
        this.armingDeleteId.set(null);
        this.deleteFailed.set({ id, key: apiErrorKey(err) });
      },
    });
  }

  startRename(s: { id: number; name: string }): void {
    this.renamingId.set(s.id);
    this.renameValue.set(s.name);
    this.renameFailed.set(null);
  }

  cancelRename(): void {
    this.renamingId.set(null);
    this.renameFailed.set(null);
  }

  submitRename(id: number): void {
    const name = this.renameValue().trim();
    if (name === '' || name.length > 50 || this.renameSaving()) return;
    this.renameSaving.set(true);
    this.renameFailed.set(null);
    this.seasonsSvc.update(id, { name }).subscribe({
      next: () => {
        this.renameSaving.set(false);
        this.renamingId.set(null);
        this.seasons.reload();
      },
      // 422 on duplicate names (unique rule) surfaces here, translated.
      error: (err: unknown) => {
        this.renameSaving.set(false);
        this.renameFailed.set({ id, key: apiErrorKey(err) });
      },
    });
  }
}
