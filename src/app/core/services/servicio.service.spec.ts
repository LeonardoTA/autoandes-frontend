import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ServicioService } from './servicio.service';
import { environment } from '../../../environments/environment';

describe('ServicioService', () => {
  let service: ServicioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ServicioService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ServicioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET /servicios', () => {
    service.getAll().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/servicios`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should call POST /servicios', () => {
    const body = { codigo: 'SRV-001', nombre: 'Cambio aceite', precio: 80, duracionMin: 30, activo: true };
    service.create(body).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/servicios`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ ...body, id: 1 });
  });

  it('should call DELETE /servicios/:id', () => {
    service.delete(1).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/servicios/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
