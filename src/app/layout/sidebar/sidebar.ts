import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { MENU_ITEMS } from '../../core/config/menu';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar" aria-label="Menú de navegación principal">
      <ul class="menu-list">
        @for (item of visibleItems(); track item.route) {
          <li>
            <a [routerLink]="item.route"
               routerLinkActive="active"
               class="menu-link"
               [id]="'nav-' + item.route.replace('/', '')"
               [attr.aria-label]="item.label">
              <span class="icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      background: var(--color-surface);
      height: 100%;
      border-right: 1px solid var(--color-border);
      padding-top: 8px;
    }
    .menu-list { list-style: none; margin: 0; padding: 0; }
    .menu-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      color: var(--color-text);
      text-decoration: none;
      font-size: 14px;
      border-left: 3px solid transparent;
      transition: all 0.2s;
    }
    .menu-link:hover { background: #F5F7FA; color: var(--color-primary); }
    .menu-link.active {
      color: var(--color-primary);
      background: #E3F2FD;
      border-left-color: var(--color-primary);
      font-weight: 600;
    }
    .icon { font-size: 16px; }
  `]
})
export class Sidebar {
  private auth = inject(AuthService);

  visibleItems = computed(() =>
    MENU_ITEMS.filter(item => !item.permiso || this.auth.hasPermiso(item.permiso))
  );
}
