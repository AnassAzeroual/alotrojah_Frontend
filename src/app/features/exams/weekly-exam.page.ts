import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { ExamsService, WeeklyModule } from '../../core/api/exams.service';
import { GroupsService } from '../../core/api/groups.service';
import { ReferenceService } from '../../core/api/reference.service';
import { apiErrorKey } from '../../core/api/api-errors';
import { leaveController } from '../../core/guards/leave-controller';
import { DatePickerComponent } from '../../shared/ui/date-picker/date-picker.component';
import {
  DropdownComponent,
  DropdownOption,
  DropdownValue,
  dropdownNumber,
} from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

interface RowState {
  student_id: number;
  full_name: string;
  mode: 'surah' | 'thumn';
  hizb: number | null;
  thumn: number | null;
  surah: number | null;
  ayah_from: number | null;
  ayah_to: number | null;
  scores: Record<string, number | null>;
}

function todayLocal(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

function portionComplete(r: RowState): boolean {
  return r.mode === 'thumn'
    ? r.hizb !== null && r.thumn !== null
    : r.surah !== null && r.ayah_from !== null;
}

@Component({
  selector: 'app-weekly-exam-page',
  standalone: true,
  imports: [
    FormsModule,
    TranslatePipe,
    DropdownComponent,
    DatePickerComponent,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './weekly-exam.page.html',
  styleUrl: './weekly-exam.page.scss',
})
export class WeeklyExamPage {
  private readonly examsSvc = inject(ExamsService);
  private readonly groupsSvc = inject(GroupsService);
  private readonly refSvc = inject(ReferenceService);

  protected readonly num = dropdownNumber;

  readonly groupId = signal<number | null>(null);
  readonly date = signal(todayLocal());
  readonly rows = signal<RowState[]>([]);
  readonly saving = signal(false);
  readonly savedCount = signal<number | null>(null);
  readonly errorKey = signal<string | null>(null);

  private readonly seededFor = signal<number | null>(null);

  private readonly groupsRes = resource({
    params: () => ({}),
    loader: () => this.groupsSvc.listAll({ is_active: true }),
  });

  protected readonly groupOptions = computed<DropdownOption[]>(() =>
    (this.groupsRes.value() ?? []).map((g) => ({ value: g.id, label: g.name })),
  );

  private readonly surahsRes = resource({
    params: () => ({}),
    loader: () => firstValueFrom(this.refSvc.surahs()),
  });

  protected readonly surahOptions = computed<DropdownOption[]>(() =>
    (this.surahsRes.value() ?? []).map((s) => ({ value: s.id, label: `${s.id} · ${s.name_ar}` })),
  );

  protected surahMax(surahId: number | null): number | null {
    if (surahId === null) return null;
    const found = (this.surahsRes.value() ?? []).find((s) => s.id === surahId);
    return found ? found.ayahs_count : null;
  }

  private readonly tpl = resource({
    params: () => ({ g: this.groupId() }),
    loader: ({ params }) =>
      params.g === null
        ? Promise.resolve(null)
        : firstValueFrom(this.examsSvc.weeklyTemplate(params.g)),
  });

  protected readonly modules = computed<WeeklyModule[]>(() => this.tpl.value()?.modules ?? []);

  constructor() {
    // Seed one editable row per pupil when the group (template) lands;
    // never clobber typed values on refires.
    effect(() => {
      const t = this.tpl.value();
      const g = this.groupId();
      if (!t || g === null || this.seededFor() === g) return;
      this.rows.set(
        t.pupils.map((p) => ({
          student_id: p.id,
          full_name: p.full_name,
          mode: p.memorization_mode,
          hizb: null,
          thumn: null,
          surah: null,
          ayah_from: null,
          ayah_to: null,
          scores: {},
        })),
      );
      this.seededFor.set(g);
      this.savedCount.set(null);
      this.errorKey.set(null);
    });
  }

  protected onGroupPick(v: DropdownValue): void {
    this.groupId.set(this.num(v));
    this.seededFor.set(null);
    this.rows.set([]);
    this.savedCount.set(null);
    this.errorKey.set(null);
  }

  private touch(): void {
    this.dirty.set(true);
    this.savedCount.set(null);
  }

  protected setScore(id: number, code: string, v: string | number): void {
    const t = typeof v === 'number' ? String(v) : v;
    const n = t.trim() === '' ? null : Number(t);
    this.rows.update((rs) =>
      rs.map((r) =>
        r.student_id === id
          ? { ...r, scores: { ...r.scores, [code]: n !== null && Number.isNaN(n) ? null : n } }
          : r,
      ),
    );
    this.touch();
  }

  protected setPortion(
    id: number,
    field: 'hizb' | 'thumn' | 'surah' | 'ayah_from' | 'ayah_to',
    v: string | number,
  ): void {
    const t = typeof v === 'number' ? String(v) : v;
    const n = t.trim() === '' ? null : Number(t);
    this.rows.update((rs) =>
      rs.map((r) =>
        r.student_id === id ? { ...r, [field]: n !== null && Number.isNaN(n) ? null : n } : r,
      ),
    );
    this.touch();
  }

  protected rowTotal(r: RowState): number {
    return round2(Object.values(r.scores).reduce<number>((s, v) => s + (v ?? 0), 0));
  }

  readonly dirty = signal(false);

  /** Dirty guard: touched sheet blocks route leave. */
  readonly leave = leaveController();
  isDirty(): boolean {
    return this.dirty();
  }

  /** Rows with a complete portion — the save ships only these, so a teacher
   * can examine a subset today and the rest another day. */
  readonly readyRows = computed(() => this.rows().filter(portionComplete));

  readonly canSave = computed(() => this.readyRows().length > 0 && !this.saving());

  readonly blockers = computed((): string[] => {
    const out: string[] = [];
    if (this.groupId() === null) out.push('weeklyExam.need_group');
    else if (this.rows().length > 0 && this.readyRows().length === 0) {
      out.push('weeklyExam.need_portion');
    }
    return out;
  });

  protected save(): void {
    const g = this.groupId();
    const ready = this.readyRows();
    if (g === null || ready.length === 0 || this.saving()) return;
    this.saving.set(true);
    this.errorKey.set(null);
    this.examsSvc
      .weeklyBatch({
        group_id: g,
        exam_date: this.date(),
        rows: ready.map((r) => ({
          student_id: r.student_id,
          portion:
            r.mode === 'thumn'
              ? { hizb: r.hizb, thumn: r.thumn }
              : { surah: r.surah, ayah_from: r.ayah_from, ayah_to: r.ayah_to },
          scores: Object.fromEntries(this.modules().map((m) => [m.code, r.scores[m.code] ?? null])),
        })),
      })
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          this.savedCount.set(res.created);
          this.dirty.set(false);
        },
        error: (err: unknown) => {
          this.saving.set(false);
          this.errorKey.set(apiErrorKey(err));
        },
      });
  }
}
