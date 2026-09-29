import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiClient } from '../api/api-client';
import { CurrentUser, LoginData } from '../api/api-models';

const TOKEN_KEY = 'alotrojah_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClient);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly currentUser = signal<CurrentUser | null>(null);
  readonly isLoggedIn = computed(() => this.token() !== null && this.currentUser() !== null);
  readonly role = computed(() => this.currentUser()?.role ?? null);

  private inflightRefresh: Observable<string> | null = null;

  /** Called once at boot (APP_INITIALIZER): restores the session or clears a dead token. */
  init(): Promise<void> {
    if (!this.token()) return Promise.resolve();
    return new Promise((resolve) => {
      this.api.get<CurrentUser>('/auth/me').subscribe({
        next: (u) => {
          this.currentUser.set(u);
          resolve();
        },
        error: () => {
          this.clearLocal();
          resolve();
        },
      });
    });
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

  /** Single-flight refresh: concurrent 401s share one call. */
  refreshOnce(): Observable<string> {
    if (!this.inflightRefresh) {
      this.inflightRefresh = new Observable<string>((sub) => {
        this.api.post<LoginData>('/auth/refresh', {}).subscribe({
          next: (d) => {
            localStorage.setItem(TOKEN_KEY, d.access_token);
            this.token.set(d.access_token);
            this.currentUser.set(d.user);
            this.inflightRefresh = null;
            sub.next(d.access_token);
            sub.complete();
          },
          error: (e) => {
            this.inflightRefresh = null;
            sub.error(e);
          },
        });
      });
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
