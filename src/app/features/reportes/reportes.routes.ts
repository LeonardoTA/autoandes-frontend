import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso.guard';

export const REPORTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./reporte-ingresos').then(m => m.ReporteIngresos),
    canActivate: [permisoGuard],
    data: { permiso: 'REPORTE_VER' }
  }
];
