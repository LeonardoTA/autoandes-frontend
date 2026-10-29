import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="main-header">
      <div class="header-brand">🔩 AutoAndes</div>
      <div class="header-user">
        <span class="user-name">{{ auth.nombreCompleto() }}</span>
        <button class="btn btn-outline btn-sm" (click)="auth.logout()">Salir</button>
      </div>
    </header>
  `,
  styles: [`
    .main-header {
      height: var(--header-height);
      background: var(--color-primary-dark);
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .header-brand { font-size: 18px; font-weight: 700; letter-spacing: 0.5px; }
    .header-user { display: flex; align-items: center; gap: 12px; }
    .user-name { font-size: 13px; opacity: 0.9; }
    .btn-outline { border-color: rgba(255,255,255,0.6); color: white; }
    .btn-outline:hover { background: rgba(255,255,255,0.1); }
  `]
})
export class Header {
  auth = inject(AuthService);
}
