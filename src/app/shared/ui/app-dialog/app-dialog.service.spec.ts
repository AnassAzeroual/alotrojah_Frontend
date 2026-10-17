import { TestBed } from '@angular/core/testing';
import { Dialog } from '@angular/cdk/dialog';
import { Subject, firstValueFrom } from 'rxjs';
import { AppDialogService } from './app-dialog.service';

describe('AppDialogService', () => {
  let closed: Subject<boolean | undefined>;
  let openSpy: ReturnType<typeof vi.fn>;
  let service: AppDialogService;

  beforeEach(() => {
    closed = new Subject<boolean | undefined>();
    openSpy = vi.fn().mockReturnValue({ closed: closed.asObservable() });
    TestBed.configureTestingModule({
      providers: [{ provide: Dialog, useValue: { open: openSpy } }],
    });
    service = TestBed.inject(AppDialogService);
  });

  it('resolves true on confirm', async () => {
    const pending = firstValueFrom(
      service.confirm({
        titleKey: 'common.unsaved',
        messageKey: 'common.unsaved_warn',
        confirmKey: 'common.unsaved_leave',
        cancelKey: 'common.cancel',
        danger: true,
      }),
    );
    expect(openSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: expect.objectContaining({ titleKey: 'common.unsaved', danger: true }),
        backdropClass: 'app-dialog-backdrop',
        panelClass: 'app-dialog-panel',
      }),
    );
    closed.next(true);
    await expect(pending).resolves.toBe(true);
  });

  it('coerces cancel and ESC/backdrop closes (undefined) to false', async () => {
    const cancelPending = firstValueFrom(service.alert('common.error', 'common.error'));
    closed.next(undefined);
    await expect(cancelPending).resolves.toBe(false);

    const escPending = firstValueFrom(service.alert('common.error', 'common.error'));
    closed.next(false);
    await expect(escPending).resolves.toBe(false);
  });

  it('alert renders a single OK action', () => {
    service.alert('common.error', 'common.error');
    expect(openSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: expect.objectContaining({ confirmKey: 'common.ok' }),
      }),
    );
  });
});
