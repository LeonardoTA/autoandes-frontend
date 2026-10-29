import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, SessionData } from './auth.model';

const SESSION_KEY = 'autoandes_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _session = signal<SessionData | null>(this.loadSession());

  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => {
    const s = this._session();
    if (!s) return false;
    return Date.now() < s.expiresAt;
  });
  readonly currentUser = computed(() => this._session());
  readonly permisos = computed(() => this._session()?.permisos ?? []);
  readonly nombreCompleto = computed(() => this._session()?.nombreCompleto ?? '');

  private expirationTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.scheduleAutoLogout();
  }

  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        const expiresAt = Date.now() + res.expiraEnSegundos * 1000;
        const sessionData: SessionData = {
          token: res.token,
          nombreCompleto: res.nombreCompleto,
          username: res.username,
          roles: res.roles,
          permisos: res.permisos,
          expiresAt
        };
        this._session.set(sessionData);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        this.scheduleAutoLogout();
      })
    );
  }

  logout(returnUrl?: string): void {
    this._session.set(null);
    sessionStorage.removeItem(SESSION_KEY);
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }
    const extras = returnUrl ? { queryParams: { returnUrl } } : {};
    this.router.navigate(['/login'], extras);
  }

  hasPermiso(permiso: string): boolean {
    return this.permisos().includes(permiso);
  }

  getToken(): string | null {
    return this._session()?.token ?? null;
  }

  private loadSession(): SessionData | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const data: SessionData = JSON.parse(raw);
      if (Date.now() >= data.expiresAt) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  private scheduleAutoLogout(): void {
    if (this.expirationTimer) clearTimeout(this.expirationTimer);
    const s = this._session();
    if (!s) return;
    const delay = s.expiresAt - Date.now();
    if (delay <= 0) {
      this.logout();
      return;
    }
    this.expirationTimer = setTimeout(() => {
      this.logout();
    }, delay);
  }
}
