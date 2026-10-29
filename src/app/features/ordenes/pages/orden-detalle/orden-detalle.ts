import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdenService } from '../../../../core/services/orden.service';
import { OrdenResponse } from '../../../../core/models/orden.model';
import { SiPermiso } from '../../../../shared/directives/si-permiso.directive';

@Component({
  selector: 'app-orden-detalle',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe, FormsModule, SiPermiso],
  template: `
    <div class="card" style="max-width:820px;">
      <div class="card-header">
        <h2 class="card-title">Detalle de orden de servicio</h2>
        <a routerLink="/ordenes" class="btn btn-outline btn-sm" id="btn-volver-orden-detalle">← Volver</a>
      </div>

      @if (loading()) {
        <div class="loading-overlay" aria-label="Cargando detalle de orden"><div class="spinner"></div></div>
      }
      @if (error()) {
        <div class="alert alert-danger" role="alert">{{ error() }}</div>
      }

      @if (!loading() && orden()) {
        <!-- Cabecera -->
        <div class="form-row" style="margin-bottom:16px;">
          <div>
            <div class="text-muted" style="font-size:12px;">N° Orden</div>
            <div class="orden-numero" style="font-size:20px;">{{ orden()!.numero }}</div>
          </div>
          <div>
            <div class="text-muted" style="font-size:12px;">Fecha</div>
            <div>{{ orden()!.fecha | date:'dd/MM/yyyy HH:mm' }}</div>
          </div>
          <div>
            <div class="text-muted" style="font-size:12px;">Estado</div>
            <span class="badge"
                  [class.badge-success]="orden()!.estado === 'REGISTRADA'"
                  [class.badge-danger]="orden()!.estado === 'ANULADA'">
              {{ orden()!.estado }}
            </span>
          </div>
        </div>

        <div class="form-row" style="margin-bottom:16px;">
          <div>
            <div class="text-muted" style="font-size:12px;">Vehículo</div>
            <div><strong>{{ orden()!.placa }}</strong></div>
          </div>
          <div>
            <div class="text-muted" style="font-size:12px;">Cliente</div>
            <div>{{ orden()!.clienteNombre }}</div>
          </div>
          <div>
            <div class="text-muted" style="font-size:12px;">Kilometraje</div>
            <div>{{ orden()!.kilometraje | number }} km</div>
          </div>
          <div>
            <div class="text-muted" style="font-size:12px;">Registrada por</div>
            <div>{{ orden()!.usuarioRegistro }}</div>
          </div>
        </div>

        @if (orden()!.motivoAnulacion) {
          <div class="alert alert-danger" role="alert">
            <strong>Motivo de anulación:</strong> {{ orden()!.motivoAnulacion }}
          </div>
        }

        <!-- Detalles -->
        <table class="detalle-tabla" aria-label="Líneas de la orden de servicio">
          <thead>
            <tr>
              <th scope="col">Código</th>
              <th scope="col">Servicio</th>
              <th scope="col" style="text-align:center;">Cant.</th>
              <th scope="col" style="text-align:right;">P. Unitario</th>
              <th scope="col" style="text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            @for (d of orden()!.detalles; track d.id) {
              <tr>
                <td>{{ d.codigoServicio }}</td>
                <td>{{ d.nombreServicio }}</td>
                <td style="text-align:center;">{{ d.cantidad }}</td>
                <td style="text-align:right;">S/ {{ d.precioUnitario | number:'1.2-2' }}</td>
                <td style="text-align:right;">S/ {{ d.subtotal | number:'1.2-2' }}</td>
              </tr>
            }
          </tbody>
        </table>
        <div class="detalle-total" id="display-total-detalle">Total: S/ {{ orden()!.total | number:'1.2-2' }}</div>

        <!-- Anular -->
        <div *siPermiso="'ORDEN_ANULAR'" style="margin-top:20px;">
          @if (orden()!.estado === 'REGISTRADA') {
            @if (!showAnular()) {
              <button class="btn btn-danger" id="btn-iniciar-anular" (click)="showAnular.set(true)">
                Anular orden
              </button>
            }
            @if (showAnular()) {
              <div style="background:#FFF3E0;padding:16px;border-radius:6px;border:1px solid #FFE0B2;" role="region" aria-label="Panel de anulación de orden">
                <h4 style="margin:0 0 12px;color:var(--color-danger);">Anular orden {{ orden()!.numero }}</h4>
                <div class="form-group">
                  <label class="form-label" for="textarea-motivo">Motivo de anulación (entre 10 y 200 caracteres) *</label>
                  <textarea id="textarea-motivo"
                            class="form-control"
                            [(ngModel)]="motivoAnulacion"
                            rows="3"
                            placeholder="Describa detalladamente el motivo de anulación..."
                            aria-label="Motivo de anulación"
                            [class.is-invalid]="motivoError()"></textarea>
                  @if (motivoError()) {
                    <div class="invalid-feedback">{{ motivoError() }}</div>
                  }
                </div>
                @if (anularError()) {
                  <div class="alert alert-danger" role="alert">{{ anularError() }}</div>
                }
                <div style="display:flex;gap:8px;">
                  <button class="btn btn-danger"
                          id="btn-confirmar-anular"
                          (click)="confirmarAnular()"
                          [disabled]="anulando()">
                    {{ anulando() ? 'Anulando...' : 'Confirmar anulación' }}
                  </button>
                  <button class="btn btn-secondary" id="btn-cancelar-anular" (click)="showAnular.set(false)">Cancelar</button>
                </div>
              </div>
            }
          }
        </div>
      }
    </div>
  `
})
export class OrdenDetalle implements OnInit {
  private ordenSvc = inject(OrdenService);
  private route = inject(ActivatedRoute);

  orden = signal<OrdenResponse | null>(null);
  loading = signal(true);
  error = signal('');
  showAnular = signal(false);
  motivoAnulacion = '';
  motivoError = signal('');
  anulando = signal(false);
  anularError = signal('');

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.ordenSvc.getById(id).subscribe({
      next: o => {
        this.orden.set(o);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje || 'No se pudo cargar la orden.');
      }
    });
  }

  confirmarAnular() {
    this.motivoError.set('');
    this.anularError.set('');
    const m = this.motivoAnulacion.trim();
    if (!m || m.length < 10) {
      this.motivoError.set('El motivo debe tener al menos 10 caracteres.');
      return;
    }
    if (m.length > 200) {
      this.motivoError.set('El motivo no puede superar los 200 caracteres.');
      return;
    }
    this.anulando.set(true);
    const id = this.orden()!.id;
    this.ordenSvc.anular(id, { motivo: m }).subscribe({
      next: updated => {
        this.orden.set(updated);
        this.anulando.set(false);
        this.showAnular.set(false);
        this.motivoAnulacion = '';
      },
      error: err => {
        this.anulando.set(false);
        this.anularError.set(err.error?.mensaje || 'Error al anular la orden.');
      }
    });
  }
}
