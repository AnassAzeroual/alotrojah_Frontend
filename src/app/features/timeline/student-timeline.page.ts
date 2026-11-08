import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  StudentTimeline,
  TimelineModule,
  TimelineNote,
  TimelineSession,
  TimelineService,
} from '../../core/api/timeline.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-student-timeline-page',
  standalone: true,
  imports: [TranslatePipe, UpperCasePipe, RouterLink, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './student-timeline.page.html',
  styleUrl: './student-timeline.page.scss',
})
export class StudentTimelinePage {
  private readonly timelineSvc = inject(TimelineService);
  readonly id = input.required<string>();

  readonly studentId = computed(() => {
    const n = Number(this.id());
    return Number.isNaN(n) ? null : n;
  });

  readonly loadError = signal(false);
  readonly timeline = resource({
    params: () => ({ id: this.studentId() }),
    loader: ({ params }): Promise<StudentTimeline | null> => {
      if (params.id === null) {
        this.loadError.set(false);
        return Promise.resolve(null);
      }
      this.loadError.set(false);
      const id = params.id;
      return new Promise((resolve) =>
        this.timelineSvc.get(id).subscribe({
          next: (value) => {
            this.loadError.set(false);
            resolve(value);
          },
          error: () => {
            this.loadError.set(true);
            resolve(null);
          },
        }),
      );
    },
  });

  readonly data = computed(() => this.timeline.value());
  readonly openTerm = signal<number | null>(null);
  readonly openWeek = signal<number | null>(null);
  readonly moduleFilter = signal<string>('all');

  readonly moduleOptions = computed(() => {
    const modules = this.data()?.modules ?? [];
    return [
      { value: 'all', label: 'timeline.all_modules' },
      ...modules.map((m) => ({ value: m.code, label: m.name_ar })),
    ];
  });

  readonly visibleModules = computed(() => {
    const modules = this.data()?.modules ?? [];
    const filter = this.moduleFilter();
    return filter === 'all' ? modules : modules.filter((m) => m.code === filter);
  });

  readonly latestGuidance = computed(() => {
    const sessions = [...(this.data()?.sessions ?? [])].reverse();
    for (const session of sessions) {
      for (const note of [...session.notes].reverse()) {
        if (note.note.trim() === '') continue;
        return { ...note, date: session.planned_date, session: session.session_number_global };
      }
    }
    return null;
  });

  readonly noteCount = computed(() =>
    (this.data()?.sessions ?? []).reduce(
      (total, session) => total + session.notes.filter((note) => note.note.trim() !== '').length,
      0,
    ),
  );

  readonly terms = computed(() => this.data()?.terms ?? []);

  private readonly setInitialTerm = effect(() => {
    const terms = this.terms();
    if (this.openTerm() !== null || terms.length === 0) return;

    const firstTerm = terms[0].id;
    this.openTerm.set(firstTerm);
    const firstWeek = this.weeksFor(firstTerm)[0];
    if (firstWeek) this.openWeek.set(firstWeek.id);
  });

  weeksFor(termId: number) {
    return (this.data()?.weeks ?? []).filter((week) => week.term_id === termId);
  }

  sessionsFor(weekId: number) {
    return (this.data()?.sessions ?? []).filter((session) => session.week_id === weekId);
  }

  weekRange(week: { start_date: string | null; end_date: string | null }): string {
    const dates = [week.start_date, week.end_date].filter((date): date is string => !!date).sort();
    return dates.length > 0 ? dates.join(' → ') : '—';
  }

  termSummary(termId: number) {
    return (this.data()?.summaries.terms ?? []).find((term) => term.id === termId) ?? null;
  }

  scoreFor(session: TimelineSession, module: TimelineModule): number | null {
    const row = session.scores.find((score) => score.module_code === module.code);
    return row ? row.score : null;
  }

  noteFor(session: TimelineSession, module: TimelineModule): TimelineNote | null {
    return session.notes.find((note) => note.module_code === module.code) ?? null;
  }

  maxFor(module: TimelineModule): number {
    return Number(module.max_points) || 20;
  }

  sessionTypeKey(type: string): string {
    return `timeline.type_${type}`;
  }

  toggleTerm(termId: number): void {
    if (this.openTerm() === termId) {
      this.openTerm.set(null);
      return;
    }
    this.openTerm.set(termId);
    const firstWeek = this.weeksFor(termId)[0];
    this.openWeek.set(firstWeek?.id ?? null);
  }

  toggleWeek(weekId: number): void {
    this.openWeek.set(this.openWeek() === weekId ? null : weekId);
  }

  protected retry(): void {
    this.timeline.reload();
  }

  protected print(): void {
    window.print();
  }
}
