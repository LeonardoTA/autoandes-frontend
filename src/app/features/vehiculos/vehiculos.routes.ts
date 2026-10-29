import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso.guard';

export const VEHICULOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/vehiculo-list/vehiculo-list').then(m => m.VehiculoList),
    canActivate: [permisoGuard],
    data: { permiso: 'VEHICULO_LEER' }
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./pages/vehiculo-form/vehiculo-form').then(m => m.VehiculoForm),
    canActivate: [permisoGuard],
    data: { permiso: 'VEHICULO_ESCRIBIR' }
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./pages/vehiculo-form/vehiculo-form').then(m => m.VehiculoForm),
    canActivate: [permisoGuard],
    data: { permiso: 'VEHICULO_ESCRIBIR' }
  }
];
