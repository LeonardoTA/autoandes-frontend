import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso.guard';

export const SERVICIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/servicio-list/servicio-list').then(m => m.ServicioList),
    canActivate: [permisoGuard],
    data: { permiso: 'SERVICIO_LEER' }
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./pages/servicio-form/servicio-form').then(m => m.ServicioForm),
    canActivate: [permisoGuard],
    data: { permiso: 'SERVICIO_ESCRIBIR' }
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./pages/servicio-form/servicio-form').then(m => m.ServicioForm),
    canActivate: [permisoGuard],
    data: { permiso: 'SERVICIO_ESCRIBIR' }
  }
];
