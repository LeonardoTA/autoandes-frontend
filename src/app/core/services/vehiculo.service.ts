import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { VehiculoRequest, VehiculoResponse } from '../models/vehiculo.model';

@Injectable({ providedIn: 'root' })
export class VehiculoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/vehiculos`;

  getAll(clienteId?: number) {
    let params = new HttpParams();
    if (clienteId) params = params.set('clienteId', clienteId.toString());
    return this.http.get<VehiculoResponse[]>(this.base, { params });
  }

  getById(id: number) {
    return this.http.get<VehiculoResponse>(`${this.base}/${id}`);
  }

  create(req: VehiculoRequest) {
    return this.http.post<VehiculoResponse>(this.base, req);
  }

  update(id: number, req: VehiculoRequest) {
    return this.http.put<VehiculoResponse>(`${this.base}/${id}`, req);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
