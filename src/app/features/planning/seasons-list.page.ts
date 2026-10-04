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
        <h1>{{ 'planning.title' | translate }}</h1>
        <div class="actions">
          <a class="btn btn-primary" routerLink="/planning/new" data-testid="seasons-new">{{
            'planning.new_season' | translate
          }}</a>
        </div>
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
                <a class="btn btn-ghost" [routerLink]="['/planning/terms', s.id]">{{
                  'planning.terms' | translate
                }}</a>
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
  readonly armingDeleteId = signal<number | null>(null);
  readonly busyId = signal<number | null>(null);
  readonly deleteFailed = signal<{ id: number; key: string } | null>(null);

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
}
