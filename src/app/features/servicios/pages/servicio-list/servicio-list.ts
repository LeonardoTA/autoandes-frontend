import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicioService } from '../../../../core/services/servicio.service';
import { ServicioResponse } from '../../../../core/models/servicio.model';
import { SiPermiso } from '../../../../shared/directives/si-permiso.directive';

@Component({
  selector: 'app-servicio-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe, FormsModule, SiPermiso],
  template: `
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Servicios</h2>
        <a *siPermiso="'SERVICIO_ESCRIBIR'" routerLink="nuevo" class="btn btn-primary btn-sm" id="btn-nuevo-servicio">
          + Nuevo servicio
        </a>
      </div>

      <!-- Buscador reactivo con signal -->
      <div class="search-bar mb-2">
        <input type="text"
               id="busqueda-servicios"
               name="busqueda"
               aria-label="Buscar servicios por código o nombre"
               class="form-control"
               placeholder="Buscar por código o nombre..."
               [ngModel]="busqueda()"
               (ngModelChange)="busqueda.set($event)"
               style="max-width:320px;">
      </div>

      <!-- Notificaciones -->
      @if (error()) {
        <div class="alert alert-danger" role="alert">{{ error() }}</div>
      }
      @if (successMsg()) {
        <div class="alert alert-success" role="alert">{{ successMsg() }}</div>
      }
      @if (actionError()) {
        <div class="alert alert-danger" role="alert">
          {{ actionError() }}
          @if (servicioSugeridoBaja()) {
            <div style="margin-top:8px;">
              <button class="btn btn-warning btn-sm" (click)="iniciarBaja(servicioSugeridoBaja()!)">
                Dar de baja ahora
              </button>
            </div>
          }
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-overlay" aria-label="Cargando servicios">
          <div class="spinner"></div>
        </div>
      }

      <!-- Empty -->
      @if (!loading() && !error() && filtered().length === 0) {
        <div class="empty-state">
          <div style="font-size:40px">🔧</div>
          <p>No se encontraron servicios.</p>
        </div>
      }

      <!-- Tabla -->
      @if (!loading() && filtered().length > 0) {
        <div class="table-wrapper">
          <table aria-label="Listado de servicios">
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Nombre</th>
                <th scope="col">Precio</th>
                <th scope="col">Duración</th>
                <th scope="col">Estado</th>
                <th scope="col" *siPermiso="'SERVICIO_ESCRIBIR'">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (s of filtered(); track s.id) {
                <tr>
                  <td><strong>{{ s.codigo }}</strong></td>
                  <td>{{ s.nombre }}</td>
                  <td>S/ {{ s.precio | number:'1.2-2' }}</td>
                  <td>{{ s.duracionMin }} min</td>
                  <td>
                    <span class="badge" [class.badge-success]="s.activo" [class.badge-secondary]="!s.activo">
                      {{ s.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td *siPermiso="'SERVICIO_ESCRIBIR'">
                    <div class="actions-cell">
                      <a [routerLink]="[s.id, 'editar']"
                         class="btn btn-sm btn-secondary"
                         [attr.aria-label]="'Editar servicio ' + s.codigo">
                        Editar
                      </a>
                      @if (s.activo) {
                        <button class="btn btn-sm btn-warning"
                                [attr.aria-label]="'Dar de baja servicio ' + s.codigo"
                                (click)="iniciarBaja(s)">
                          Dar de baja
                        </button>
                      } @else {
                        <button class="btn btn-sm btn-secondary"
                                [attr.aria-label]="'Reactivar servicio ' + s.codigo"
                                (click)="cambiarEstadoDirecto(s, true)">
                          Reactivar
                        </button>
                      }
                      <button class="btn btn-sm btn-danger"
                              [attr.aria-label]="'Eliminar servicio ' + s.codigo"
                              (click)="iniciarEliminar(s)">
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

      <!-- Modal de confirmación eliminar físico -->
      @if (showConfirmEliminar()) {
        <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-eliminar-title">
          <div class="modal">
            <h3 class="modal-title" id="modal-eliminar-title">Confirmar eliminación</h3>
            <div class="modal-body">
              ¿Está seguro de eliminar el servicio <strong>{{ servicioSeleccionado()?.codigo }} - {{ servicioSeleccionado()?.nombre }}</strong>?
              Esta acción intentará eliminarlo permanentemente. Si el servicio ya fue usado en alguna orden, el sistema le ofrecerá darlo de baja.
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="cancelarModal()">Cancelar</button>
              <button class="btn btn-danger" (click)="confirmarEliminar()" [disabled]="procesando()">
                {{ procesando() ? 'Eliminando...' : 'Confirmar eliminación' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal de confirmación dar de baja -->
      @if (showConfirmBaja()) {
        <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-baja-title">
          <div class="modal">
            <h3 class="modal-title" id="modal-baja-title">Confirmar dar de baja</h3>
            <div class="modal-body">
              ¿Está seguro de dar de baja el servicio <strong>{{ servicioSeleccionado()?.codigo }} - {{ servicioSeleccionado()?.nombre }}</strong>?
              El servicio pasará a estado <strong>Inactivo</strong> y no podrá ser incluido en nuevas órdenes de servicio.
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="cancelarModal()">Cancelar</button>
              <button class="btn btn-warning" (click)="confirmarBaja()" [disabled]="procesando()">
                {{ procesando() ? 'Guardando...' : 'Confirmar baja' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .btn-warning { background: var(--color-warning); color: white; }
    .btn-warning:hover:not(:disabled) { background: #e65100; }
  `]
})
export class ServicioList implements OnInit {
  private svc = inject(ServicioService);

  servicios = signal<ServicioResponse[]>([]);
  loading = signal(true);
  error = signal('');
  busqueda = signal('');
  showConfirmEliminar = signal(false);
  showConfirmBaja = signal(false);
  servicioSeleccionado = signal<ServicioResponse | null>(null);
  servicioSugeridoBaja = signal<ServicioResponse | null>(null);
  procesando = signal(false);
  successMsg = signal('');
  actionError = signal('');

  filtered = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (!q) return this.servicios();
    return this.servicios().filter(s =>
      s.codigo.toLowerCase().includes(q) || s.nombre.toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.svc.getAll().subscribe({
      next: data => {
        this.servicios.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje || 'Error al cargar servicios.');
      }
    });
  }

  iniciarEliminar(s: ServicioResponse) {
    this.servicioSeleccionado.set(s);
    this.servicioSugeridoBaja.set(null);
    this.actionError.set('');
    this.successMsg.set('');
    this.showConfirmEliminar.set(true);
  }

  iniciarBaja(s: ServicioResponse) {
    this.servicioSeleccionado.set(s);
    this.actionError.set('');
    this.successMsg.set('');
    this.showConfirmBaja.set(true);
  }

  cancelarModal() {
    this.showConfirmEliminar.set(false);
    this.showConfirmBaja.set(false);
    this.servicioSeleccionado.set(null);
  }

  confirmarEliminar() {
    const s = this.servicioSeleccionado();
    if (!s) return;
    this.procesando.set(true);
    this.svc.delete(s.id).subscribe({
      next: () => {
        this.procesando.set(false);
        this.cancelarModal();
        this.successMsg.set(`Servicio ${s.codigo} eliminado correctamente.`);
        this.load();
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: err => {
        this.procesando.set(false);
        this.cancelarModal();
        if (err.status === 409) {
          this.servicioSugeridoBaja.set(s);
          this.actionError.set(err.error?.mensaje || 'El servicio ya fue usado en órdenes y no se puede eliminar físicamente. Puede darlo de baja.');
        } else {
          this.actionError.set(err.error?.mensaje || 'No se puede eliminar este servicio.');
        }
        setTimeout(() => this.actionError.set(''), 7000);
      }
    });
  }

  confirmarBaja() {
    const s = this.servicioSeleccionado();
    if (!s) return;
    this.procesando.set(true);
    this.svc.patchEstado(s.id, { activo: false }).subscribe({
      next: updated => {
        this.procesando.set(false);
        this.cancelarModal();
        this.servicioSugeridoBaja.set(null);
        this.servicios.update(list => list.map(x => x.id === updated.id ? updated : x));
        this.successMsg.set(`Servicio ${updated.codigo} dado de baja exitosamente.`);
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: err => {
        this.procesando.set(false);
        this.cancelarModal();
        this.actionError.set(err.error?.mensaje || 'Error al dar de baja el servicio.');
        setTimeout(() => this.actionError.set(''), 5000);
      }
    });
  }

  cambiarEstadoDirecto(s: ServicioResponse, nuevoEstado: boolean) {
    this.actionError.set('');
    this.successMsg.set('');
    this.svc.patchEstado(s.id, { activo: nuevoEstado }).subscribe({
      next: updated => {
        this.servicios.update(list => list.map(x => x.id === updated.id ? updated : x));
        this.successMsg.set(`Servicio ${updated.codigo} reactivado correctamente.`);
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: err => {
        this.actionError.set(err.error?.mensaje || 'Error al reactivar el servicio.');
        setTimeout(() => this.actionError.set(''), 5000);
      }
    });
  }
}
