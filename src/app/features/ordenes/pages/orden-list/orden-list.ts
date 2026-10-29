import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdenService } from '../../../../core/services/orden.service';
import { OrdenResponse, OrdenFiltros } from '../../../../core/models/orden.model';
import { SiPermiso } from '../../../../shared/directives/si-permiso.directive';

@Component({
  selector: 'app-orden-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe, FormsModule, SiPermiso],
  template: `
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Órdenes de servicio</h2>
        <a *siPermiso="'ORDEN_REGISTRAR'" routerLink="nueva" class="btn btn-primary btn-sm" id="btn-nueva-orden">
          + Nueva orden
        </a>
      </div>

      <!-- Filtros -->
      <div class="search-bar mb-2">
        <label for="filtro-placa" class="sr-only" style="display:none;">Filtrar por placa</label>
        <input id="filtro-placa"
               type="text"
               class="form-control"
               placeholder="Placa..."
               aria-label="Filtrar por placa"
               [(ngModel)]="filtros.placa"
               style="max-width:140px;">

        <label for="filtro-estado" class="sr-only" style="display:none;">Filtrar por estado</label>
        <select id="filtro-estado"
                class="form-control"
                aria-label="Filtrar por estado"
                [(ngModel)]="filtros.estado"
                style="max-width:160px;">
          <option value="">Todos los estados</option>
          <option value="REGISTRADA">Registrada</option>
          <option value="ANULADA">Anulada</option>
        </select>

        <label for="filtro-desde" class="sr-only" style="display:none;">Fecha desde</label>
        <input id="filtro-desde"
               type="date"
               class="form-control"
               aria-label="Fecha desde"
               [(ngModel)]="filtros.desde"
               style="max-width:160px;">

        <label for="filtro-hasta" class="sr-only" style="display:none;">Fecha hasta</label>
        <input id="filtro-hasta"
               type="date"
               class="form-control"
               aria-label="Fecha hasta"
               [(ngModel)]="filtros.hasta"
               style="max-width:160px;">

        <button class="btn btn-primary btn-sm" id="btn-buscar-ordenes" (click)="buscar()">Buscar</button>
        <button class="btn btn-secondary btn-sm" id="btn-limpiar-ordenes" (click)="limpiar()">Limpiar</button>
      </div>

      @if (error()) {
        <div class="alert alert-danger" role="alert">{{ error() }}</div>
      }
      @if (loading()) {
        <div class="loading-overlay" aria-label="Cargando órdenes de servicio"><div class="spinner"></div></div>
      }

      @if (!loading() && !error() && ordenes().length === 0) {
        <div class="empty-state">
          <div style="font-size:40px">📋</div>
          <p>No se encontraron órdenes de servicio.</p>
        </div>
      }

      @if (!loading() && ordenes().length > 0) {
        <div class="table-wrapper">
          <table aria-label="Listado de órdenes de servicio">
            <thead>
              <tr>
                <th scope="col">N° Orden</th>
                <th scope="col">Fecha</th>
                <th scope="col">Placa</th>
                <th scope="col">Cliente</th>
                <th scope="col">Km</th>
                <th scope="col">Estado</th>
                <th scope="col">Total</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (o of ordenes(); track o.id) {
                <tr>
                  <td><span class="orden-numero">{{ o.numero }}</span></td>
                  <td>{{ o.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td><strong>{{ o.placa }}</strong></td>
                  <td>{{ o.clienteNombre }}</td>
                  <td>{{ o.kilometraje | number }}</td>
                  <td>
                    <span class="badge" [class.badge-success]="o.estado === 'REGISTRADA'"
                          [class.badge-danger]="o.estado === 'ANULADA'">
                      {{ o.estado }}
                    </span>
                  </td>
                  <td>S/ {{ o.total | number:'1.2-2' }}</td>
                  <td>
                    <div class="actions-cell">
                      <a [routerLink]="[o.id]"
                         class="btn btn-sm btn-secondary"
                         [attr.aria-label]="'Ver detalle de orden ' + o.numero">
                        Ver
                      </a>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class OrdenList implements OnInit {
  private ordenSvc = inject(OrdenService);

  ordenes = signal<OrdenResponse[]>([]);
  loading = signal(true);
  error = signal('');
  filtros: OrdenFiltros = {};

  ngOnInit() {
    this.buscar();
  }

  buscar() {
    this.loading.set(true);
    this.error.set('');
    this.ordenSvc.getAll({ ...this.filtros }).subscribe({
      next: data => {
        this.ordenes.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje || 'Error al cargar órdenes.');
      }
    });
  }

  limpiar() {
    this.filtros = {};
    this.buscar();
  }
}
