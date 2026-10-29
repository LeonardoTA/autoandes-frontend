import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ReporteService } from './reporte.service';
import { environment } from '../../../environments/environment';

describe('ReporteService', () => {
  let service: ReporteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReporteService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ReporteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET /reportes/ingresos-por-servicio with date ranges', () => {
    service.getIngresosPorServicio('2026-10-01', '2026-10-31').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/reportes/ingresos-por-servicio?desde=2026-10-01&hasta=2026-10-31`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
