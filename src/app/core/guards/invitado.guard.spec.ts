import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { invitadoGuard } from './invitado.guard';
import { AuthService } from '../auth/auth.service';
import { provideHttpClient } from '@angular/common/http';

describe('invitadoGuard', () => {
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

  it('should allow activation when NOT authenticated', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(false);
    const result = TestBed.runInInjectionContext(() =>
      invitadoGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBeTrue();
  });

  it('should redirect to root when authenticated', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(true);
    TestBed.runInInjectionContext(() =>
      invitadoGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(router.createUrlTree).toHaveBeenCalledWith(['/']);
  });
});
