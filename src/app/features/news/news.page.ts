import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { AnnouncementsService } from '../../core/api/announcements.service';
import { leaveController } from '../../core/guards/leave-controller';
import { apiErrorKey } from '../../core/api/api-errors';
import { AuthService } from '../../core/auth/auth.service';
import { GroupsService } from '../../core/api/groups.service';
import { DropdownComponent } from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-news-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    DropdownComponent,
    SpinnerComponent,
    EmptyStateComponent,
  ],
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

  readonly submitErrorKey = signal<string | null>(null);

  readonly editingId = signal<number | null>(null);
  readonly draftTitle = signal('');
  readonly draftBody = signal('');
  private readonly editSeed = signal<{ title: string; body: string } | null>(null);

  /** Dirty guard: half-typed post or touched edit row blocks route leave. */
  readonly leave = leaveController();
  isDirty(): boolean {
    if (this.form.dirty) return true;
    if (this.editingId() === null) return false;
    const seed = this.editSeed();
    if (!seed) return true;
    return this.draftTitle() !== seed.title || this.draftBody() !== seed.body;
  }
  readonly editSaving = signal(false);
  readonly editErrorKey = signal<string | null>(null);

  canEdit(authorId: number | undefined): boolean {
    const me = this.auth.currentUser();
    return !!me && (me.role === 'admin' || me.id === authorId);
  }

  startEdit(id: number, title: string, body: string): void {
    this.editingId.set(id);
    this.draftTitle.set(title);
    this.draftBody.set(body);
    this.editSeed.set({ title, body });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editSeed.set(null);
    this.editErrorKey.set(null);
  }

  saveEdit(id: number): void {
    const title = this.draftTitle().trim();
    const body = this.draftBody().trim();
    if (title === '' || body === '' || this.editSaving()) return;
    this.editSaving.set(true);
    this.editErrorKey.set(null);
    this.news.update(id, { title, body }).subscribe({
      next: () => {
        this.editSaving.set(false);
        this.editingId.set(null);
        this.editSeed.set(null);
        this.tick.update((n) => n + 1);
      },
      error: (err: unknown) => {
        this.editSaving.set(false);
        this.editErrorKey.set(apiErrorKey(err));
      },
    });
  }

  readonly groups = resource({
    params: () => ({}),
    loader: () => firstValueFrom(this.groupsSvc.list().pipe(map((p) => p.data))),
  });

  readonly audienceOptions = [
    { value: 'all', labelKey: 'audience.all' },
    { value: 'teachers', labelKey: 'audience.teachers' },
    { value: 'manager', labelKey: 'audience.manager' },
    { value: 'my_students', labelKey: 'audience.my_students' },
  ];
  readonly groupOptions = computed(() => [
    { value: '', label: '—' },
    ...(this.groups.value() ?? []).map((g) => ({ value: g.id, label: g.name })),
  ]);

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
    this.submitErrorKey.set(null);
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
        error: (err: unknown) => {
          this.saving.set(false);
          this.submitErrorKey.set(apiErrorKey(err));
        },
      });
  }

  remove(id: number): void {
    this.news.remove(id).subscribe(() => this.tick.update((n) => n + 1));
  }
}
