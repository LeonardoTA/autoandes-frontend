import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth.guard';
import { invitadoGuard } from './core/guards/invitado.guard';

export const routes: Routes = [
  // Login - fuera del layout
  {
    path: 'login',
    title: 'Iniciar sesión — AutoAndes',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  // Acceso denegado - fuera del layout principal pero sin requerir permiso específico
  {
    path: 'acceso-denegado',
    title: 'Acceso denegado — AutoAndes',
    loadComponent: () =>
      import('./shared/pages/acceso-denegado/acceso-denegado').then(m => m.AccesoDenegado)
  },
  // Layout principal (requiere autenticación)
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'servicios' },
      {
        path: 'servicios',
        title: 'Servicios — AutoAndes',
        loadChildren: () =>
          import('./features/servicios/servicios.routes').then(m => m.SERVICIOS_ROUTES)
      },
      {
        path: 'vehiculos',
        title: 'Vehículos — AutoAndes',
        loadChildren: () =>
          import('./features/vehiculos/vehiculos.routes').then(m => m.VEHICULOS_ROUTES)
      },
      {
        path: 'ordenes',
        title: 'Órdenes — AutoAndes',
        loadChildren: () =>
          import('./features/ordenes/ordenes.routes').then(m => m.ORDENES_ROUTES)
      },
      {
        path: 'reportes',
        title: 'Reportes — AutoAndes',
        loadChildren: () =>
          import('./features/reportes/reportes.routes').then(m => m.REPORTES_ROUTES)
      }
    ]
  },
  // 404
  {
    path: '**',
    title: 'Página no encontrada — AutoAndes',
    loadComponent: () =>
      import('./shared/pages/no-encontrado/no-encontrado').then(m => m.NoEncontrado)
  }
];
