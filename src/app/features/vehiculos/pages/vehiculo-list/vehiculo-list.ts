import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehiculoService } from '../../../../core/services/vehiculo.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { VehiculoResponse } from '../../../../core/models/vehiculo.model';
import { ClienteResponse } from '../../../../core/models/cliente.model';
import { SiPermiso } from '../../../../shared/directives/si-permiso.directive';

@Component({
  selector: 'app-vehiculo-list',
  standalone: true,
  imports: [RouterLink, FormsModule, SiPermiso],
  template: `
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Vehículos</h2>
        <a *siPermiso="'VEHICULO_ESCRIBIR'" routerLink="nuevo" class="btn btn-primary btn-sm" id="btn-nuevo-vehiculo">
          + Nuevo vehículo
        </a>
      </div>

      <!-- Filtro por cliente -->
      <div class="search-bar mb-2">
        <label for="filtro-cliente" class="sr-only" style="display:none;">Filtrar por cliente</label>
        <select id="filtro-cliente"
                class="form-control"
                aria-label="Filtrar por cliente"
                [ngModel]="clienteIdFiltro"
                (ngModelChange)="onClienteFilterChange($event)"
                style="max-width:320px;">
          <option value="">Todos los clientes</option>
          @for (c of clientes(); track c.id) {
            <option [value]="c.id">{{ c.nombres }} ({{ c.documento }})</option>
          }
        </select>
      </div>

      @if (error()) {
        <div class="alert alert-danger" role="alert">{{ error() }}</div>
      }
      @if (successMsg()) {
        <div class="alert alert-success" role="alert">{{ successMsg() }}</div>
      }
      @if (actionError()) {
        <div class="alert alert-danger" role="alert">{{ actionError() }}</div>
      }
      @if (loading()) {
        <div class="loading-overlay" aria-label="Cargando vehículos"><div class="spinner"></div></div>
      }

      @if (!loading() && !error() && vehiculos().length === 0) {
        <div class="empty-state">
          <div style="font-size:40px">🚗</div>
          <p>No se encontraron vehículos.</p>
        </div>
      }

      @if (!loading() && vehiculos().length > 0) {
        <div class="table-wrapper">
          <table aria-label="Listado de vehículos">
            <thead>
              <tr>
                <th scope="col">Placa</th>
                <th scope="col">Marca</th>
                <th scope="col">Modelo</th>
                <th scope="col">Año</th>
                <th scope="col">Cliente</th>
                <th scope="col" *siPermiso="'VEHICULO_ESCRIBIR'">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (v of vehiculos(); track v.id) {
                <tr>
                  <td><strong>{{ v.placa }}</strong></td>
                  <td>{{ v.marca }}</td>
                  <td>{{ v.modelo }}</td>
                  <td>{{ v.anio }}</td>
                  <td>{{ v.clienteNombre }}</td>
                  <td *siPermiso="'VEHICULO_ESCRIBIR'">
                    <div class="actions-cell">
                      <a [routerLink]="[v.id, 'editar']"
                         class="btn btn-sm btn-secondary"
                         [attr.aria-label]="'Editar vehículo ' + v.placa">
                        Editar
                      </a>
                      <button class="btn btn-sm btn-danger"
                              [attr.aria-label]="'Eliminar vehículo ' + v.placa"
                              (click)="eliminar(v)">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Modal confirmación eliminación de vehículo -->
      @if (showConfirm()) {
        <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-eliminar-vehiculo-title">
          <div class="modal">
            <h3 class="modal-title" id="modal-eliminar-vehiculo-title">Confirmar eliminación</h3>
            <div class="modal-body">
              ¿Está seguro de eliminar el vehículo con placa <strong>{{ vehiculoAEliminar()?.placa }}</strong>?
              Si el vehículo cuenta con órdenes registradas o anuladas, no se podrá eliminar para preservar el historial.
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="cancelar()">Cancelar</button>
              <button class="btn btn-danger" (click)="confirmarEliminar()" [disabled]="eliminando()">
                {{ eliminando() ? 'Eliminando...' : 'Eliminar vehículo' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class VehiculoList implements OnInit {
  private vehSvc = inject(VehiculoService);
  private clienteSvc = inject(ClienteService);

  vehiculos = signal<VehiculoResponse[]>([]);
  clientes = signal<ClienteResponse[]>([]);
  loading = signal(true);
  error = signal('');
  clienteIdFiltro = '';
  showConfirm = signal(false);
  vehiculoAEliminar = signal<VehiculoResponse | null>(null);
  eliminando = signal(false);
  successMsg = signal('');
  actionError = signal('');

  ngOnInit() {
    this.clienteSvc.getAll().subscribe({
      next: c => this.clientes.set(c),
      error: err => console.error('Error cargando clientes', err)
    });
    this.load();
  }

  load(clienteId?: number) {
    this.loading.set(true);
    this.error.set('');
    this.vehSvc.getAll(clienteId).subscribe({
      next: data => {
        this.vehiculos.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje || 'Error al cargar vehículos.');
      }
    });
  }

  onClienteFilterChange(val: string) {
    this.clienteIdFiltro = val;
    this.load(this.clienteIdFiltro ? +this.clienteIdFiltro : undefined);
  }

  eliminar(v: VehiculoResponse) {
    this.vehiculoAEliminar.set(v);
    this.showConfirm.set(true);
    this.actionError.set('');
    this.successMsg.set('');
  }

  cancelar() {
    this.showConfirm.set(false);
    this.vehiculoAEliminar.set(null);
  }

  confirmarEliminar() {
    const v = this.vehiculoAEliminar();
    if (!v) return;
    this.eliminando.set(true);
    this.vehSvc.delete(v.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.showConfirm.set(false);
        this.vehiculoAEliminar.set(null);
        this.successMsg.set(`Vehículo con placa ${v.placa} eliminado.`);
        this.load(this.clienteIdFiltro ? +this.clienteIdFiltro : undefined);
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: err => {
        this.eliminando.set(false);
        this.showConfirm.set(false);
        this.actionError.set(err.error?.mensaje || 'No se puede eliminar este vehículo.');
        setTimeout(() => this.actionError.set(''), 6000);
      }
    });
  }
}
