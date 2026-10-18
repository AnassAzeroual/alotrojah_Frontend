import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AppDialogService } from '../../shared/ui/app-dialog/app-dialog.service';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let tester: HttpTestingController;
  let alert: ReturnType<typeof vi.fn>;
  let closed: Subject<boolean>;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    closed = new Subject<boolean>();
    alert = vi.fn(() => closed.asObservable());
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AppDialogService, useValue: { alert } },
      ],
    });
    http = TestBed.inject(HttpClient);
    tester = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    tester.verify();
    // Closing the dialog resets the single-dialog guard for the next test.
    closed.next(true);
    closed.complete();
  });

  it('opens one translated dialog for a server error and rethrows', () => {
    let thrown: unknown = null;
    http.get('/x').subscribe({ error: (e: unknown) => (thrown = e) });
    tester.expectOne('/x').flush(null, { status: 500, statusText: 'err' });

    expect(alert).toHaveBeenCalledTimes(1);
    expect(alert).toHaveBeenCalledWith('common.error_title', 'apiErrors.server');
    expect(thrown).toBeInstanceOf(HttpErrorResponse);
  });

  it('maps 422 validation and 403 bodies to their translated keys', () => {
    http.get('/x').subscribe({ error: () => undefined });
    tester
      .expectOne('/x')
      .flush({ errors: { code: 'WEIGHTS_TOTAL' } }, { status: 422, statusText: 'err' });
    expect(alert).toHaveBeenCalledWith('common.error_title', 'apiErrors.WEIGHTS_TOTAL');

    // Close the dialog so the guard lets the next error through.
    closed.next(true);

    http.get('/y').subscribe({ error: () => undefined });
    tester.expectOne('/y').flush({ errors: {} }, { status: 403, statusText: 'err' });
    expect(alert).toHaveBeenCalledWith('common.error_title', 'apiErrors.forbidden');
  });

  it('never dialogs 401s away from login (auth interceptor owns them)', () => {
    http.get('/x').subscribe({ error: () => undefined });
    tester.expectOne('/x').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(alert).not.toHaveBeenCalled();
  });

  it('dialogs the login route 401 (invalid credentials / deactivated)', () => {
    http.post('/auth/login', {}).subscribe({ error: () => undefined });
    tester
      .expectOne('/auth/login')
      .flush(
        { errors: { code: 'INVALID_CREDENTIALS' } },
        { status: 401, statusText: 'Unauthorized' },
      );
    expect(alert).toHaveBeenCalledWith('common.error_title', 'apiErrors.INVALID_CREDENTIALS');
  });

  it('never dialogs NEED_REPLACER (the users page opens its own replacer dialog)', () => {
    http.delete('/users/1').subscribe({ error: () => undefined });
    tester
      .expectOne('/users/1')
      .flush(
        { errors: { code: 'NEED_REPLACER', teacher: {}, groups: [] } },
        { status: 422, statusText: 'err' },
      );
    expect(alert).not.toHaveBeenCalled();
  });

  it('shows a single dialog: errors while open pass silently, then resume', () => {
    http.get('/a').subscribe({ error: () => undefined });
    tester.expectOne('/a').flush({}, { status: 500, statusText: 'err' });
    expect(alert).toHaveBeenCalledTimes(1);

    // Guard still closed (dialog visible): skipped without a second alert.
    http.get('/b').subscribe({ error: () => undefined });
    tester.expectOne('/b').flush({}, { status: 404, statusText: 'err' });
    expect(alert).toHaveBeenCalledTimes(1);

    // Dialog closes -> the next error dialogs again.
    closed.next(true);
    closed.complete();
    http.get('/c').subscribe({ error: () => undefined });
    tester.expectOne('/c').flush({}, { status: 500, statusText: 'err' });
    expect(alert).toHaveBeenCalledTimes(2);
  });
});
