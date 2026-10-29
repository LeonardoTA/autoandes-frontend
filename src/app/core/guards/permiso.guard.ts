import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const permisoGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const permiso: string = route.data?.['permiso'];
  if (!permiso) return true;
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  if (auth.hasPermiso(permiso)) return true;
  return router.createUrlTree(['/acceso-denegado']);
};
