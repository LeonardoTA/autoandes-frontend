import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: { url: '/servicios' }
        }
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => httpMock.verify());

  it('should logout on 401 for non-login API requests', () => {
    spyOn(authService, 'logout');
    http.get(`${environment.apiUrl}/servicios`).subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/servicios`);
    req.flush({ mensaje: 'No autorizado' }, { status: 401, statusText: 'Unauthorized' });

    expect(authService.logout).toHaveBeenCalledWith('/servicios');
  });

  it('should NOT logout on 401 for login requests', () => {
    spyOn(authService, 'logout');
    http.post(`${environment.apiUrl}/auth/login`, {}).subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({ mensaje: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });

    expect(authService.logout).not.toHaveBeenCalled();
  });

  it('should NOT logout on 403', () => {
    spyOn(authService, 'logout');
    http.get(`${environment.apiUrl}/reportes/ingresos-por-servicio`).subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reportes/ingresos-por-servicio`);
    req.flush({ mensaje: 'Acceso denegado' }, { status: 403, statusText: 'Forbidden' });

    expect(authService.logout).not.toHaveBeenCalled();
  });
});
