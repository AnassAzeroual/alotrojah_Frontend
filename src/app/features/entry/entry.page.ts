import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, forkJoin, map } from 'rxjs';
import { CalendarService } from '../../core/api/calendar.service';
import { EntryService, SessionStudentScores, AttendanceRow } from '../../core/api/entry.service';
import { GroupsService } from '../../core/api/groups.service';
import { StudentsService } from '../../core/api/students.service';
import { AuthService } from '../../core/auth/auth.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { AttendanceGridComponent } from './components/attendance-grid.component';
import { GoalListComponent } from './components/goal-list.component';
import { ScoreSheetComponent } from './components/score-sheet.component';

@Component({
  selector: 'app-entry-page',
  standalone: true,
  imports: [
    TranslatePipe,
    EmptyStateComponent,
    AttendanceGridComponent,
    ScoreSheetComponent,
    GoalListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entry.page.html',
  styleUrl: './entry.page.scss',
})
export class EntryPage {
  private readonly groupsSvc = inject(GroupsService);
  private readonly studentsSvc = inject(StudentsService);
  private readonly calendarSvc = inject(CalendarService);
  private readonly entry = inject(EntryService);
  private readonly auth = inject(AuthService);

  readonly groups = toSignal(this.groupsSvc.list().pipe(map((p) => p.data)), { initialValue: [] });
  readonly modules = toSignal(this.entry.modules(), { initialValue: [] });
  readonly weeks = toSignal(this.calendarSvc.weeks().pipe(map((p) => p.data)), {
    initialValue: [],
  });

  readonly selectedGroup = signal<number | null>(null);
  readonly selectedWeek = signal<number | null>(null);
  readonly selectedSession = signal<number | null>(null);
  readonly savedTick = signal(0);

  readonly isMurajaa = computed(() => this.auth.currentUser()?.teacher_type === 'murajaa');

  readonly students = resource({
    params: () => ({ g: this.selectedGroup(), t: this.savedTick() }),
    loader: ({ params }) =>
      params.g === null
        ? Promise.resolve([])
        : firstValueFrom(this.studentsSvc.list({ group_id: params.g }).pipe(map((p) => p.data))),
  });

  readonly sessions = resource({
    params: () => ({ w: this.selectedWeek() }),
    loader: ({ params }) =>
      params.w === null
        ? Promise.resolve([])
        : firstValueFrom(this.calendarSvc.sessions({ week_id: params.w }).pipe(map((p) => p.data))),
  });

  readonly existing = resource({
    params: () => ({ s: this.selectedSession(), t: this.savedTick() }),
    loader: ({ params }) => {
      if (params.s === null) return Promise.resolve({ scores: [], attendance: [] });
      return firstValueFrom(
        forkJoin({
          scores: this.entry.sessionScores(params.s),
          attendance: this.entry.attendanceList({ session_id: params.s }).pipe(map((p) => p.data)),
        }),
      );
    },
  });

  readonly scoreRows = computed((): SessionStudentScores[] => this.existing.value()?.scores ?? []);
  readonly attendanceRows = computed(
    (): AttendanceRow[] => this.existing.value()?.attendance ?? [],
  );
  readonly ready = computed(() => this.selectedGroup() !== null && this.selectedSession() !== null);

  onGroup(id: number | null): void {
    this.selectedGroup.set(id);
    this.selectedSession.set(null);
  }

  onWeek(id: number | null): void {
    this.selectedWeek.set(id);
    this.selectedSession.set(null);
  }

  onSaved(): void {
    this.savedTick.update((n) => n + 1);
  }
}
