import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { VehiculoService } from './vehiculo.service';
import { environment } from '../../../environments/environment';

describe('VehiculoService', () => {
  let service: VehiculoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VehiculoService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(VehiculoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET /vehiculos without filter', () => {
    service.getAll().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/vehiculos`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should call GET /vehiculos with clienteId filter', () => {
    service.getAll(5).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/vehiculos?clienteId=5`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should call POST /vehiculos', () => {
    const payload = { placa: 'ABC-123', marca: 'Toyota', modelo: 'Yaris', anio: 2021, clienteId: 1 };
    service.create(payload).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/vehiculos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ ...payload, id: 10, clienteNombre: 'Juan Perez' });
  });

  it('should call DELETE /vehiculos/:id', () => {
    service.delete(10).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/vehiculos/10`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
