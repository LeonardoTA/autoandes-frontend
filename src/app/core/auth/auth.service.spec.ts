import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideRouter([])
      ]
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => sessionStorage.clear());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start unauthenticated', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should return null token when not authenticated', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should have empty permisos initially', () => {
    expect(service.permisos().length).toBe(0);
  });

  it('should hasPermiso return false when no session', () => {
    expect(service.hasPermiso('SERVICIO_LEER')).toBeFalse();
  });
});
