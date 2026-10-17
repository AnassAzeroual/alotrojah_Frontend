import { TestBed } from '@angular/core/testing';
import { firstValueFrom, map, Observable, Subject } from 'rxjs';
import { dirtyGuard } from './dirty.guard';
import { leaveController, DirtyPage } from './leave-controller';
import { AppDialogService } from '../../shared/ui/app-dialog/app-dialog.service';

describe('dirtyGuard', () => {
  let closed: Subject<boolean | undefined>;
  let confirmSpy: ReturnType<typeof vi.fn>;

  const makePage = (dirty: boolean): DirtyPage =>
    TestBed.runInInjectionContext(
      () => ({ isDirty: () => dirty, leave: leaveController() }) as DirtyPage,
    );

  beforeEach(() => {
    closed = new Subject<boolean | undefined>();
    // Mirror the real service contract: coerce non-true closes to false.
    confirmSpy = vi
      .fn()
      .mockImplementation(() => closed.asObservable().pipe(map((v) => v === true)));
    TestBed.configureTestingModule({
      providers: [{ provide: AppDialogService, useValue: { confirm: confirmSpy } }],
    });
  });

  const run = (component: DirtyPage): unknown =>
    dirtyGuard(component, null as never, null as never, null as never);

  it('passes pristine pages through without prompting', () => {
    const page = makePage(false);
    expect(run(page)).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('opens the shared dialog when dirty and leaves on confirm', async () => {
    const page = makePage(true);
    const pending = firstValueFrom(run(page) as Observable<boolean>);
    expect(confirmSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        titleKey: 'common.unsaved_title',
        messageKey: 'common.unsaved_warn',
        danger: true,
      }),
    );
    closed.next(true);
    await expect(pending).resolves.toBe(true);
  });

  it('stays on cancel', async () => {
    const page = makePage(true);
    const pending = firstValueFrom(run(page) as Observable<boolean>);
    closed.next(false);
    await expect(pending).resolves.toBe(false);
  });

  it('treats an ESC/backdrop close (undefined) as stay', async () => {
    const page = makePage(true);
    const pending = firstValueFrom(run(page) as Observable<boolean>);
    closed.next(undefined);
    await expect(pending).resolves.toBe(false);
  });
});
