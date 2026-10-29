import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { OrdenRequest, OrdenResponse, AnularOrdenRequest, OrdenFiltros } from '../models/orden.model';

@Injectable({ providedIn: 'root' })
export class OrdenService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/ordenes`;

  getAll(filtros: OrdenFiltros = {}) {
    let params = new HttpParams();
    if (filtros.placa) params = params.set('placa', filtros.placa);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);
    return this.http.get<OrdenResponse[]>(this.base, { params });
  }

  getById(id: number) {
    return this.http.get<OrdenResponse>(`${this.base}/${id}`);
  }

  create(req: OrdenRequest) {
    return this.http.post<OrdenResponse>(this.base, req);
  }

  anular(id: number, req: AnularOrdenRequest) {
    return this.http.patch<OrdenResponse>(`${this.base}/${id}/anular`, req);
  }
}
