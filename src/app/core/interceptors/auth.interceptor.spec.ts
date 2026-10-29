import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => httpMock.verify());

  it('should add Authorization header when token exists and URL is API', () => {
    spyOn(authService, 'getToken').and.returnValue('mock-token-xyz');
    http.get(`${environment.apiUrl}/servicios`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/servicios`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token-xyz');
    req.flush([]);
  });

  it('should not add Authorization header for non-API URLs', () => {
    spyOn(authService, 'getToken').and.returnValue('mock-token-xyz');
    http.get('https://other-domain.com/data').subscribe();

    const req = httpMock.expectOne('https://other-domain.com/data');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should not add Authorization header if token is null', () => {
    spyOn(authService, 'getToken').and.returnValue(null);
    http.get(`${environment.apiUrl}/servicios`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/servicios`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush([]);
  });
});
