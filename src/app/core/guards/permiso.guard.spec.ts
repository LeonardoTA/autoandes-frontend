import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { permisoGuard } from './permiso.guard';
import { AuthService } from '../auth/auth.service';
import { provideHttpClient } from '@angular/common/http';

describe('permisoGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        {
          provide: Router,
          useValue: {
            createUrlTree: jasmine.createSpy('createUrlTree').and.callFake(commands => ({ commands }))
          }
        }
      ]
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should allow if route has no permiso configured', () => {
    const route = { data: {} } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() =>
      permisoGuard(route, {} as RouterStateSnapshot)
    );
    expect(result).toBeTrue();
  });

  it('should redirect to login if not authenticated', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(false);
    const route = { data: { permiso: 'SERVICIO_LEER' } } as unknown as ActivatedRouteSnapshot;
    TestBed.runInInjectionContext(() =>
      permisoGuard(route, {} as RouterStateSnapshot)
    );
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('should allow if authenticated and has permiso', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(true);
    spyOn(authService, 'hasPermiso').and.returnValue(true);
    const route = { data: { permiso: 'SERVICIO_LEER' } } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() =>
      permisoGuard(route, {} as RouterStateSnapshot)
    );
    expect(result).toBeTrue();
  });

  it('should redirect to /acceso-denegado if authenticated but lacks permiso', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(true);
    spyOn(authService, 'hasPermiso').and.returnValue(false);
    const route = { data: { permiso: 'REPORTE_VER' } } as unknown as ActivatedRouteSnapshot;
    TestBed.runInInjectionContext(() =>
      permisoGuard(route, {} as RouterStateSnapshot)
    );
    expect(router.createUrlTree).toHaveBeenCalledWith(['/acceso-denegado']);
  });
});
