import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OrdenService } from './orden.service';
import { environment } from '../../../environments/environment';

describe('OrdenService', () => {
  let service: OrdenService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrdenService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(OrdenService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET /ordenes with query params', () => {
    service.getAll({ placa: 'AAA', estado: 'REGISTRADA' }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/ordenes?placa=AAA&estado=REGISTRADA`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should call POST /ordenes with only IDs and quantities', () => {
    const payload = {
      vehiculoId: 1,
      kilometraje: 50000,
      detalles: [{ servicioId: 2, cantidad: 1 }]
    };
    service.create(payload).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/ordenes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1, numero: 'OS-000001', ...payload });
  });

  it('should call PATCH /ordenes/:id/anular with motivo', () => {
    service.anular(1, { motivo: 'Cliente desistió del servicio programado' }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/ordenes/1/anular`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ motivo: 'Cliente desistió del servicio programado' });
    req.flush({ id: 1, estado: 'ANULADA' });
  });
});
