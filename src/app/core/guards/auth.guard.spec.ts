import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../auth/auth.service';
import { provideHttpClient } from '@angular/common/http';

describe('authGuard', () => {
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
            createUrlTree: jasmine.createSpy('createUrlTree').and.callFake((commands, extras) => ({ commands, extras }))
          }
        }
      ]
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should allow activation when authenticated', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(true);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/servicios' } as RouterStateSnapshot)
    );
    expect(result).toBeTrue();
  });

  it('should redirect to login with returnUrl when not authenticated', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(false);
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/servicios' } as RouterStateSnapshot)
    );
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/servicios' } });
  });
});
