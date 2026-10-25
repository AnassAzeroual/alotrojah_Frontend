import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ExamsService } from '../../core/api/exams.service';
import { GroupsService } from '../../core/api/groups.service';
import { PlanningService } from '../../core/api/planning.service';
import { ReferenceService } from '../../core/api/reference.service';
import { StudentsService } from '../../core/api/students.service';
import {
  CalendarTermsResponse,
  ExamType,
  StoreExamRequest,
  StudentExamBriefResponse,
} from '../../core/api/models';
import { LanguageService } from '../../core/i18n/language.service';
import {
  DropdownComponent,
  DropdownOption,
  DropdownValue,
  dropdownNumber,
} from '../../shared/ui/dropdown/dropdown.component';
import { DatePickerComponent } from '../../shared/ui/date-picker/date-picker.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

type Brief = StudentExamBriefResponse['data'];
type BriefQuestion = NonNullable<Brief['exams'][number]['questions']>[number];
type LiveQuestion = {
  key: number;
  question_no: number;
  prompt_text: string;
  max_score: number | null;
  score: number | null;
  notes: string;
};
type PaperRow = {
  key: number;
  surah: number | null;
  ayah_from: number | null;
  ayah_to: number | null;
  weight: number;
  score: number | null;
  notes: string;
};
type PaperVariant = 'model1' | 'model2';
type TypeCard = {
  key: ExamType;
  titleKey: string;
  descKey: string;
  tone: 'teal' | 'indigo' | 'amber' | 'rose';
};

function todayLocal(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

@Component({
  selector: 'app-exams-list-page',
  standalone: true,
  imports: [
    RouterLink,
    TranslatePipe,
    DropdownComponent,
    DatePickerComponent,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exams-list.page.html',
  styleUrl: './exams-list.page.scss',
})
export class ExamsListPage {
  private readonly auth = inject(AuthService);
  private readonly examsSvc = inject(ExamsService);
  private readonly studentsSvc = inject(StudentsService);
  private readonly groupsSvc = inject(GroupsService);
  private readonly planning = inject(PlanningService);
  private readonly ref = inject(ReferenceService);
  private readonly i18n = inject(TranslateService);
  private readonly language = inject(LanguageService);
  private readonly router = inject(Router);

  protected readonly num = dropdownNumber;

  readonly isStudent = computed(() => this.auth.role() === 'student');
  readonly canCreate = computed(() => !this.isStudent());

  readonly groupId = signal<number | null>(null);
  readonly studentId = signal<number | null>(null);
  readonly selectedType = signal<ExamType>('term_batch');
  readonly termId = signal<number | null>(null);
  readonly examDate = signal(todayLocal());
  readonly saving = signal(false);
  readonly errorKey = signal<string | null>(null);

  readonly live = signal(false);
  readonly liveQuestions = signal<LiveQuestion[]>([]);
  private liveSeq = 0;

  /** Paper-style term/final sheet: two printable variants, one saved. */
  readonly paperModel1 = signal<PaperRow[]>([]);
  readonly paperModel2 = signal<PaperRow | null>(null);
  readonly activeVariant = signal<PaperVariant>('model1');
  readonly isPaper = computed(
    () => this.selectedType() === 'term_batch' || this.selectedType() === 'final_season',
  );

  readonly weightsTotal = computed(
    () =>
      Math.round(
        (this.liveQuestions().reduce((sum, q) => sum + (q.max_score ?? 0), 0) + Number.EPSILON) *
          100,
      ) / 100,
  );
  readonly scoresTotal = computed(
    () =>
      Math.round(
        (this.liveQuestions().reduce((sum, q) => sum + (q.score ?? 0), 0) + Number.EPSILON) * 100,
      ) / 100,
  );
  readonly liveValid = computed(() => {
    const qs = this.liveQuestions();
    if (qs.length === 0 || this.weightsTotal() !== 20) return false;
    const numbers = qs.map((q) => q.question_no);
    if (new Set(numbers).size !== numbers.length) return false;
    return qs.every(
      (q) =>
        q.question_no >= 1 &&
        q.prompt_text.trim() !== '' &&
        q.max_score !== null &&
        q.max_score > 0 &&
        q.score !== null &&
        q.score >= 0 &&
        q.score <= q.max_score,
    );
  });

  readonly paper1Total = computed(
    () =>
      Math.round(
        (this.paperModel1().reduce((sum, q) => sum + q.weight, 0) + Number.EPSILON) * 100,
      ) / 100,
  );
  readonly paper2Total = computed(() => this.paperModel2()?.weight ?? 0);
  readonly paperValid = computed(() => {
    if (this.activeVariant() === 'model1') {
      const rows = this.paperModel1();
      return (
        rows.length > 0 &&
        this.paper1Total() === 20 &&
        rows.every(
          (r) =>
            r.surah !== null &&
            r.ayah_from !== null &&
            r.score !== null &&
            r.score >= 0 &&
            r.score <= r.weight,
        )
      );
    }
    const row = this.paperModel2();
    return (
      row !== null &&
      row.surah !== null &&
      row.ayah_from !== null &&
      row.ayah_to !== null &&
      row.score !== null &&
      row.score >= 0 &&
      row.score <= row.weight
    );
  });
  readonly activeValid = computed(() => (this.isPaper() ? this.paperValid() : this.liveValid()));

  readonly hizb = signal<number | null>(null);
  readonly thumn = signal<number | null>(null);
  readonly surah = signal<number | null>(null);
  readonly ayahFrom = signal<number | null>(null);
  readonly ayahTo = signal<number | null>(null);
  private readonly seededFor = signal<number | null>(null);

  private readonly groupsRes = resource({
    params: () => ({}),
    loader: () => this.groupsSvc.listAll({ is_active: true }),
  });

  readonly groups = computed(() => this.groupsRes.value() ?? []);
  readonly groupName = computed(
    () => this.groups().find((g) => g.id === this.groupId())?.name ?? null,
  );

  /** Staff pick a section first; a pupil's list is already self-only server-side. */
  private readonly pupilsRes = resource({
    params: () => ({ g: this.groupId(), own: this.isStudent() }),
    loader: ({ params }) => {
      if (params.own) {
        return firstValueFrom(this.studentsSvc.list({ per_page: 1 })).then((p) => p.data);
      }
      return params.g === null
        ? Promise.resolve([])
        : this.studentsSvc.listAll({ group_id: params.g });
    },
  });

  readonly pupils = computed(() => this.pupilsRes.value() ?? []);
  readonly pupilName = computed(
    () =>
      this.student()?.full_name ??
      this.pupils().find((s) => s.id === this.studentId())?.full_name ??
      null,
  );

  // A pupil lands on their own exam card without a picker.
  private readonly ownPick = effect(() => {
    if (!this.isStudent()) return;
    const row = this.pupils()[0];
    if (row && this.studentId() !== row.id) this.studentId.set(row.id);
  });

  readonly brief = resource({
    params: () => ({ id: this.studentId() }),
    loader: ({ params }) =>
      params.id === null
        ? Promise.resolve(null)
        : firstValueFrom(this.studentsSvc.examBrief(params.id)),
  });

  readonly student = computed(() => this.brief.value()?.student ?? null);
  readonly group = computed(() => this.brief.value()?.group ?? null);
  readonly summary = computed(() => this.brief.value()?.summary ?? null);
  readonly memorization = computed(() => this.brief.value()?.memorization ?? null);
  readonly exams = computed(() => this.brief.value()?.exams ?? []);
  readonly mode = computed(() => this.student()?.memorization_mode ?? 'thumn');
  readonly isThumn = computed(() => this.mode() === 'thumn');

  readonly sourceKey = computed(() => {
    const source = this.brief.value()?.current?.source;
    return source === 'last_exam' || source === 'last_log'
      ? `exam.source_${source}`
      : 'exam.source_manual';
  });

  private readonly surahsRes = resource({
    params: () => ({}),
    loader: () => firstValueFrom(this.ref.surahs()),
  });

  protected readonly surahOptions = computed<DropdownOption[]>(() =>
    (this.surahsRes.value() ?? []).map((s) => ({
      value: s.id,
      label: `${s.id} · ${s.name_ar}`,
    })),
  );

  protected surahMax(): number | null {
    return this.surahMaxFor(this.surah());
  }

  protected surahMaxFor(id: number | null): number | null {
    if (id === null) return null;
    return (this.surahsRes.value() ?? []).find((s) => s.id === id)?.ayahs_count ?? null;
  }

  protected surahName(id: number | null): string {
    if (id === null) return '—';
    return (this.surahsRes.value() ?? []).find((s) => s.id === id)?.name_ar ?? String(id);
  }

  private readonly termsRes = resource({
    params: () => ({
      s: this.brief.value()?.season?.id ?? null,
      termType: this.isTermType(),
    }),
    loader: ({ params }) =>
      params.s === null || !params.termType
        ? Promise.resolve([] as CalendarTermsResponse['data'])
        : firstValueFrom(this.planning.terms(params.s)),
  });

  protected readonly termOptions = computed<DropdownOption[]>(() => [
    { value: '', label: '—' },
    ...(this.termsRes.value() ?? []).map((t) => ({ value: t.id, label: t.name_ar })),
  ]);

  private readonly autoTerm = effect(() => {
    if (!this.isTermType()) return;
    const rows = this.termsRes.value() ?? [];
    if (rows.length === 0) return;
    if (this.termId() !== null && rows.some((t) => t.id === this.termId())) return;
    this.termId.set(rows[0].id);
  });

  readonly typeCards: readonly TypeCard[] = [
    {
      key: 'hizb_completion',
      titleKey: 'examType.hizb_completion',
      descKey: 'exam.type_hizb_hint',
      tone: 'teal',
    },
    {
      key: 'term_batch',
      titleKey: 'examType.term_batch',
      descKey: 'exam.type_term_hint',
      tone: 'indigo',
    },
    {
      key: 'weekly',
      titleKey: 'examType.weekly',
      descKey: 'exam.type_weekly_hint',
      tone: 'amber',
    },
    {
      key: 'final_season',
      titleKey: 'examType.final_season',
      descKey: 'exam.type_final_hint',
      tone: 'rose',
    },
  ];

  readonly isTermType = computed(
    () => this.selectedType() === 'hizb_completion' || this.selectedType() === 'term_batch',
  );

  readonly portionValid = computed(() => {
    if (this.isThumn()) {
      const h = this.hizb();
      const t = this.thumn();
      return h !== null && h >= 1 && h <= 60 && (t === null || (t >= 1 && t <= 8));
    }
    const s = this.surah();
    const from = this.ayahFrom();
    const to = this.ayahTo();
    if (s === null || from === null || to === null) return false;
    const max = this.surahMax();
    return from >= 1 && to >= from && (max === null || to <= max);
  });

  readonly portionLabel = computed(() => {
    this.language.current();
    if (this.isThumn()) {
      const h = this.hizb();
      if (h === null) return this.i18n.instant('exam.portion_empty');
      const t = this.thumn();
      return t === null
        ? this.i18n.instant('exam.portion_hizb', { hizb: h })
        : this.i18n.instant('exam.portion_thumn', { hizb: h, thumn: t });
    }
    const s = this.surah();
    if (s === null) return this.i18n.instant('exam.portion_empty');
    const from = this.ayahFrom();
    const to = this.ayahTo();
    return this.i18n.instant('exam.portion_surah', {
      surah: this.surahName(s),
      from: from ?? '—',
      to: to ?? '—',
    });
  });

  readonly blockers = computed((): string[] => {
    const out: string[] = [];
    if (this.studentId() === null) out.push('exam.need_student');
    if (this.isTermType() && this.termId() === null) out.push('exam.need_term');
    // The portion is a suggestion, not a hard gate: an exam can start blank
    // and the teacher can compose questions on the detail page.
    return out;
  });

  protected pickGroup(id: number): void {
    if (this.live()) this.closeLive();
    this.groupId.set(id);
    this.studentId.set(null);
    this.seededFor.set(null);
  }

  protected pickPupil(id: number): void {
    if (this.live()) this.closeLive();
    this.studentId.set(id);
    this.seededFor.set(null);
  }

  protected backToGroups(): void {
    if (this.live()) this.closeLive();
    this.groupId.set(null);
    this.studentId.set(null);
    this.seededFor.set(null);
  }

  protected backToPupils(): void {
    if (this.live()) this.closeLive();
    this.studentId.set(null);
    this.seededFor.set(null);
  }

  protected selectType(type: ExamType): void {
    if (this.live()) return;
    this.selectedType.set(type);
    if (!this.isTermType()) this.termId.set(null);
  }

  protected pickSurah(v: DropdownValue): void {
    this.surah.set(this.num(v));
    this.ayahFrom.set(null);
    this.ayahTo.set(null);
  }

  /** Seed the editable portion from the brief once per pupil. */
  private readonly seedPortion = effect(() => {
    const b = this.brief.value();
    const id = this.studentId();
    if (!b || id === null || b.student.id !== id || this.seededFor() === id) return;
    const c = b.current;
    this.hizb.set(c.hizb);
    this.thumn.set(c.thumn);
    this.surah.set(c.surah);
    this.ayahFrom.set(c.ayah_from);
    this.ayahTo.set(c.ayah_to);
    this.seededFor.set(id);
  });

  protected logPortion(log: NonNullable<Brief['memorization']['last']>): string {
    this.language.current();
    if (log.log_mode === 'thumn') {
      if (log.hizb_no === null)
        return `${log.thumn_amount} ${this.i18n.instant('exam.thumn_unit')}`;
      return log.thumn_no === null
        ? this.i18n.instant('exam.portion_hizb', { hizb: log.hizb_no })
        : this.i18n.instant('exam.portion_thumn', { hizb: log.hizb_no, thumn: log.thumn_no });
    }
    if (log.surah_ref === null)
      return `${log.thumn_amount} ${this.i18n.instant('exam.thumn_unit')}`;
    return this.i18n.instant('exam.portion_surah', {
      surah: this.surahName(log.surah_ref),
      from: log.ayah_from ?? '—',
      to: log.ayah_to ?? '—',
    });
  }

  protected questionPortion(q: BriefQuestion): string {
    this.language.current();
    if (q.hizb_ref !== null) {
      return q.thumn_ref === null
        ? this.i18n.instant('exam.portion_hizb', { hizb: q.hizb_ref })
        : this.i18n.instant('exam.portion_thumn', { hizb: q.hizb_ref, thumn: q.thumn_ref });
    }
    if (q.surah_ref !== null) {
      return this.i18n.instant('exam.portion_surah', {
        surah: this.surahName(q.surah_ref),
        from: q.ayah_from ?? '—',
        to: q.ayah_to ?? '—',
      });
    }
    return q.prompt_text ?? '—';
  }

  protected startTest(): void {
    const b = this.brief.value();
    if (!b || this.studentId() === null || this.saving() || this.live()) return;
    if (this.blockers().length > 0) return;
    const prompt = this.portionValid() ? this.portionLabel() : '';
    this.liveSeq = 0;
    if (this.isPaper()) {
      const seedSurah = this.surah();
      this.paperModel1.set(
        Array.from({ length: 5 }, (_, i) => ({
          key: ++this.liveSeq,
          surah: i === 0 ? seedSurah : null,
          ayah_from: i === 0 ? this.ayahFrom() : null,
          ayah_to: null,
          weight: 4,
          score: null,
          notes: '',
        })),
      );
      this.paperModel2.set({
        key: ++this.liveSeq,
        surah: seedSurah,
        ayah_from: this.ayahFrom(),
        ayah_to: this.ayahTo(),
        weight: 20,
        score: null,
        notes: '',
      });
      this.activeVariant.set('model1');
      this.liveQuestions.set([]);
    } else {
      this.liveQuestions.set([
        {
          key: ++this.liveSeq,
          question_no: 1,
          prompt_text: prompt,
          max_score: 20,
          score: null,
          notes: '',
        },
      ]);
      this.paperModel1.set([]);
      this.paperModel2.set(null);
    }
    this.live.set(true);
    this.errorKey.set(null);
    setTimeout(() => {
      document
        .getElementById('exam-live')
        ?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  protected addLiveQuestion(): void {
    const rows = this.liveQuestions();
    const nextNo = Math.max(0, ...rows.map((q) => q.question_no)) + 1;
    this.liveQuestions.set([
      ...rows,
      {
        key: ++this.liveSeq,
        question_no: nextNo,
        prompt_text: '',
        max_score: 5,
        score: null,
        notes: '',
      },
    ]);
  }

  protected removeLiveQuestion(key: number): void {
    this.liveQuestions.set(this.liveQuestions().filter((q) => q.key !== key));
  }

  protected setLive(key: number, field: keyof LiveQuestion, value: string): void {
    const parsed =
      field === 'prompt_text' || field === 'notes' ? value : (this.num(value) as number | null);
    this.liveQuestions.update((rows) =>
      rows.map((q) => {
        if (q.key !== key) return q;
        const next = { ...q, [field]: parsed };
        if (field === 'max_score' && next.score !== null && next.max_score !== null) {
          next.score = Math.min(next.score, next.max_score);
        }
        return next;
      }),
    );
  }

  protected selectVariant(variant: PaperVariant): void {
    this.activeVariant.set(variant);
  }

  private redistribute(rows: PaperRow[]): PaperRow[] {
    const n = rows.length;
    if (n === 0) return rows;
    const base = Math.floor((20 / n) * 100) / 100;
    let allocated = 0;
    return rows.map((row, i) => {
      const weight = i === n - 1 ? Math.round((20 - allocated) * 100) / 100 : base;
      allocated = Math.round((allocated + weight) * 100) / 100;
      return { ...row, weight };
    });
  }

  protected addPaperRow(): void {
    const rows = [
      ...this.paperModel1(),
      {
        key: ++this.liveSeq,
        surah: null,
        ayah_from: null,
        ayah_to: null,
        weight: 4,
        score: null,
        notes: '',
      },
    ];
    this.paperModel1.set(this.redistribute(rows));
  }

  protected removePaperRow(key: number): void {
    const rows = this.paperModel1();
    if (rows.length <= 1) return;
    this.paperModel1.set(this.redistribute(rows.filter((r) => r.key !== key)));
  }

  protected setPaper(
    variant: PaperVariant,
    key: number,
    field: 'surah' | 'ayah_from' | 'ayah_to' | 'score' | 'notes',
    value: DropdownValue | string,
  ): void {
    const parsed =
      field === 'notes' ? String(value) : (this.num(value as DropdownValue) as number | null);
    const patch = (row: PaperRow): PaperRow => ({
      ...row,
      [field]: parsed,
      ...(field === 'surah' ? { ayah_from: null, ayah_to: null } : {}),
    });
    if (variant === 'model1') {
      this.paperModel1.update((rows) => rows.map((row) => (row.key === key ? patch(row) : row)));
    } else {
      this.paperModel2.update((row) => (row && row.key === key ? patch(row) : row));
    }
  }

  protected printSheet(): void {
    window.print();
  }

  protected closeLive(): void {
    this.live.set(false);
    this.liveQuestions.set([]);
    this.paperModel1.set([]);
    this.paperModel2.set(null);
    this.activeVariant.set('model1');
    this.errorKey.set(null);
  }

  private firstPortionRefs(): Record<string, number> {
    if (!this.portionValid()) return {};
    if (this.isThumn()) {
      return {
        hizb_ref: this.hizb()!,
        ...(this.thumn() !== null ? { thumn_ref: this.thumn()! } : {}),
      };
    }
    return {
      surah_ref: this.surah()!,
      ayah_from: this.ayahFrom()!,
      ayah_to: this.ayahTo()!,
    };
  }

  /** The active paper variant as backend questions (model1/model2_full). */
  private paperQuestions(): NonNullable<StoreExamRequest['questions']> | null {
    if (!this.paperValid()) return null;
    this.language.current();
    if (this.activeVariant() === 'model1') {
      return this.paperModel1().map((row, i) => ({
        question_no: i + 1,
        prompt_text: this.i18n.instant('exam.portion_surah', {
          surah: this.surahName(row.surah),
          from: row.ayah_from ?? '—',
          to: '—',
        }),
        surah_ref: row.surah!,
        ayah_from: row.ayah_from!,
        max_score: row.weight,
        score: row.score!,
        notes: row.notes.trim() || null,
        model_type: 'model1' as const,
      }));
    }
    const row = this.paperModel2()!;
    return [
      {
        question_no: 1,
        prompt_text: this.i18n.instant('exam.portion_surah', {
          surah: this.surahName(row.surah),
          from: row.ayah_from ?? '—',
          to: row.ayah_to ?? '—',
        }),
        surah_ref: row.surah!,
        ayah_from: row.ayah_from!,
        ayah_to: row.ayah_to!,
        max_score: row.weight,
        score: row.score!,
        notes: row.notes.trim() || null,
        model_type: 'model2_full' as const,
      },
    ];
  }

  private saveExam(questions: NonNullable<StoreExamRequest['questions']>): void {
    const b = this.brief.value();
    if (!b || this.studentId() === null) return;
    const seasonScoped = this.selectedType() === 'final_season' || this.selectedType() === 'weekly';
    if (seasonScoped && b.season === null) {
      this.errorKey.set('exam.need_season');
      return;
    }

    this.saving.set(true);
    this.errorKey.set(null);
    this.examsSvc
      .create({
        student_id: this.studentId()!,
        exam_type: this.selectedType(),
        term_id: this.isTermType() ? this.termId()! : undefined,
        season_id: seasonScoped ? b.season!.id : undefined,
        exam_date: this.examDate() || undefined,
        questions,
      })
      .subscribe({
        next: (exam) => {
          this.saving.set(false);
          this.live.set(false);
          this.liveQuestions.set([]);
          this.paperModel1.set([]);
          this.paperModel2.set(null);
          void this.router.navigate(['/exams', exam.id]);
        },
        error: () => {
          this.saving.set(false);
          this.errorKey.set('common.error');
        },
      });
  }

  protected finishLive(): void {
    if (!this.activeValid() || this.saving()) return;
    if (this.isPaper()) {
      const paper = this.paperQuestions();
      if (paper !== null) this.saveExam(paper);
      return;
    }
    const questions = this.liveQuestions().map((q, i) => ({
      question_no: q.question_no,
      prompt_text: q.prompt_text.trim(),
      max_score: q.max_score!,
      score: q.score!,
      notes: q.notes.trim() || null,
      ...(i === 0 ? this.firstPortionRefs() : {}),
    }));
    this.saveExam(questions);
  }
}
