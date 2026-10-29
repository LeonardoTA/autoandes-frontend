import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError(err => {
      const isApiRequest = req.url.startsWith(environment.apiUrl);
      const isLoginEndpoint = req.url.includes('/auth/login');

      if (isApiRequest && err.status === 401 && !isLoginEndpoint) {
        // 401 fuera del login: cerrar sesión y redirigir
        const currentUrl = router.url;
        auth.logout(currentUrl);
      }
      // 403: NO cerrar sesión, solo dejar pasar el error
      return throwError(() => err);
    })
  );
};
