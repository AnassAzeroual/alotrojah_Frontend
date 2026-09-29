import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { AnnouncementsService } from '../../core/api/announcements.service';
import { AuthService } from '../../core/auth/auth.service';
import { GroupsService } from '../../core/api/groups.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-news-page',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, SpinnerComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news.page.html',
})
export class NewsPage {
  private readonly news = inject(AnnouncementsService);
  private readonly auth = inject(AuthService);
  private readonly groupsSvc = inject(GroupsService);

  private readonly tick = signal(0);
  readonly saving = signal(false);

  readonly canPost = computed(() => {
    const r = this.auth.currentUser()?.role;
    return r === 'admin' || r === 'supervisor' || r === 'teacher';
  });

  readonly items = resource({
    params: () => ({ t: this.tick() }),
    loader: () => firstValueFrom(this.news.list().pipe(map((p) => p.data))),
  });

  readonly groups = resource({
    params: () => ({}),
    loader: () => firstValueFrom(this.groupsSvc.list().pipe(map((p) => p.data))),
  });

  readonly form = new FormGroup({
    audience: new FormControl('all', { nonNullable: true, validators: [Validators.required] }),
    group_id: new FormControl<number | null>(null),
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    body: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  submit(): void {
    if (this.form.invalid || this.saving()) return;
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.news
      .create({
        audience: v.audience,
        group_id: v.audience === 'my_students' ? (v.group_id ?? undefined) : undefined,
        title: v.title,
        body: v.body,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.form.reset({ audience: 'all', group_id: null, title: '', body: '' });
          this.tick.update((n) => n + 1);
        },
        error: () => this.saving.set(false),
      });
  }

  remove(id: number): void {
    this.news.remove(id).subscribe(() => this.tick.update((n) => n + 1));
  }
}
