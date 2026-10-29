import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ServicioRequest, ServicioResponse, ServicioEstadoRequest } from '../models/servicio.model';

@Injectable({ providedIn: 'root' })
export class ServicioService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/servicios`;

  getAll() {
    return this.http.get<ServicioResponse[]>(this.base);
  }

  getById(id: number) {
    return this.http.get<ServicioResponse>(`${this.base}/${id}`);
  }

  create(req: ServicioRequest) {
    return this.http.post<ServicioResponse>(this.base, req);
  }

  update(id: number, req: ServicioRequest) {
    return this.http.put<ServicioResponse>(`${this.base}/${id}`, req);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  patchEstado(id: number, req: ServicioEstadoRequest) {
    return this.http.patch<ServicioResponse>(`${this.base}/${id}/estado`, req);
  }
}
