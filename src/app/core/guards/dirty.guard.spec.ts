import { firstValueFrom, Observable } from 'rxjs';
import { dirtyGuard } from './dirty.guard';
import { leaveController, DirtyPage } from './leave-controller';

describe('dirtyGuard', () => {
  const run = (component: DirtyPage): unknown =>
    dirtyGuard(component, null as never, null as never, null as never);

  it('passes pristine pages through without prompting', () => {
    const page: DirtyPage = { isDirty: () => false, leave: leaveController() };
    expect(run(page)).toBe(true);
    expect(page.leave.leaving()).toBe(false);
  });

  it('defers to the page confirm flow when dirty', async () => {
    const page: DirtyPage = { isDirty: () => true, leave: leaveController() };
    const pending = firstValueFrom(run(page) as Observable<boolean>);
    expect(page.leave.leaving()).toBe(true);
    page.leave.allowLeave();
    await expect(pending).resolves.toBe(true);
    expect(page.leave.leaving()).toBe(false);
  });

  it('stays on cancel', async () => {
    const page: DirtyPage = { isDirty: () => true, leave: leaveController() };
    const pending = firstValueFrom(run(page) as Observable<boolean>);
    page.leave.stay();
    await expect(pending).resolves.toBe(false);
  });
});
