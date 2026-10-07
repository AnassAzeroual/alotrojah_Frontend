import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, finalize, map, shareReplay, tap } from 'rxjs';
import { ApiClient } from '../api/api-client';
import { CurrentUser, LoginData, RegisterPayload } from '../api/api-models';

const TOKEN_KEY = 'alotrojah_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClient);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly currentUser = signal<CurrentUser | null>(null);
  readonly isLoggedIn = computed(() => this.token() !== null && this.currentUser() !== null);
  readonly role = computed(() => this.currentUser()?.role ?? null);

  /** True once the boot-time session probe has settled (live token, dead token, or none). */
  readonly sessionProbed = signal(false);

  private readyResolve!: () => void;
  /** Resolves when sessionProbed flips true — route guards await this before deciding. */
  readonly ready: Promise<void>;

  private inflightRefresh: Observable<string> | null = null;

  constructor() {
    this.ready = new Promise<void>((resolve) => (this.readyResolve = resolve));
  }

  /**
   * Boot probe, deliberately fire-and-forget: APP_INITIALIZER no longer awaits
   * it, so first paint no longer blocks on a /auth/me round trip. Role guards
   * gate on `ready` instead. The captured token is checked in each handler so
   * a login/logout that wins the race against the probe is never clobbered.
   */
  init(): void {
    const t = this.token();
    if (!t) {
      this.settleProbe();
      return;
    }
    this.api.get<CurrentUser>('/auth/me').subscribe({
      next: (u) => {
        if (this.token() === t) this.currentUser.set(u);
        this.settleProbe();
      },
      error: () => {
        if (this.token() === t) this.clearLocal();
        this.settleProbe();
      },
    });
  }

  private settleProbe(): void {
    this.sessionProbed.set(true);
    this.readyResolve();
  }

  login(email: string, password: string): Observable<LoginData> {
    return this.api.post<LoginData>('/auth/login', { email, password }).pipe(
      tap((d) => {
        localStorage.setItem(TOKEN_KEY, d.access_token);
        this.token.set(d.access_token);
        this.currentUser.set(d.user);
      }),
    );
  }

  /**
   * Waiting-room registration. Deliberately stores nothing: the account only
   * exists (and can log in) after an admin accepts the request.
   */
  register(payload: RegisterPayload): Observable<null> {
    return this.api.post<null>('/auth/register', payload);
  }

  /** Single-flight refresh: concurrent 401s share one call. */
  refreshOnce(): Observable<string> {
    if (!this.inflightRefresh) {
      this.inflightRefresh = this.api.post<LoginData>('/auth/refresh', {}).pipe(
        map((d) => {
          localStorage.setItem(TOKEN_KEY, d.access_token);
          this.token.set(d.access_token);
          this.currentUser.set(d.user);
          return d.access_token;
        }),
        finalize(() => {
          this.inflightRefresh = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.inflightRefresh;
  }

  logout(): void {
    this.api.post<unknown>('/auth/logout', {}).subscribe({ error: () => undefined });
    this.clearLocal();
    void this.router.navigate(['/login']);
  }

  clearLocal(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
    this.currentUser.set(null);
  }
}
