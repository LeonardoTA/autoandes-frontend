import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../core/services/reporte.service';
import { ReporteFilaResponse } from '../../core/models/reporte.model';

@Component({
  selector: 'app-reporte-ingresos',
  standalone: true,
  imports: [DecimalPipe, FormsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">📊 Reporte de ingresos por servicio</h2>
      </div>

      <!-- Filtros de fecha opcionales -->
      <div class="search-bar mb-2">
        <div>
          <label class="form-label" for="reporte-desde" style="font-size:12px;">Desde</label>
          <input id="reporte-desde"
                 type="date"
                 class="form-control"
                 [(ngModel)]="desde"
                 aria-label="Fecha inicial del reporte"
                 style="max-width:160px;">
        </div>
        <div>
          <label class="form-label" for="reporte-hasta" style="font-size:12px;">Hasta</label>
          <input id="reporte-hasta"
                 type="date"
                 class="form-control"
                 [(ngModel)]="hasta"
                 aria-label="Fecha final del reporte"
                 style="max-width:160px;">
        </div>
        <button class="btn btn-primary btn-sm"
                id="btn-generar-reporte"
                style="align-self:flex-end;"
                (click)="buscar()"
                [disabled]="loading()">
          Generar reporte
        </button>
        <button class="btn btn-secondary btn-sm"
                id="btn-limpiar-reporte"
                style="align-self:flex-end;"
                (click)="limpiar()">
          Limpiar
        </button>
      </div>

      @if (error()) {
        <div class="alert alert-danger" role="alert">{{ error() }}</div>
      }
      @if (loading()) {
        <div class="loading-overlay" aria-label="Generando reporte"><div class="spinner"></div></div>
      }

      @if (!loading() && !error() && datos().length === 0 && cargado()) {
        <div class="empty-state">
          <div style="font-size:40px">📊</div>
          <p>No hay ingresos registrados para el rango de fechas seleccionado (las órdenes anuladas están excluidas).</p>
        </div>
      }

      @if (!loading() && !cargado()) {
        <div class="empty-state">
          <p class="text-muted">Presiona "Generar reporte" para consultar los ingresos acumulados por servicio calculados por el servidor.</p>
        </div>
      }

      @if (!loading() && datos().length > 0) {
        <div class="table-wrapper">
          <table aria-label="Reporte de ingresos por servicio">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Código</th>
                <th scope="col">Servicio</th>
                <th scope="col" style="text-align:center;">Cant. Total</th>
                <th scope="col" style="text-align:right;">Importe Total</th>
              </tr>
            </thead>
            <tbody>
              @for (r of datos(); track r.codigo; let i = $index) {
                <tr>
                  <td>{{ i + 1 }}</td>
                  <td><strong>{{ r.codigo }}</strong></td>
                  <td>{{ r.servicio }}</td>
                  <td style="text-align:center;">{{ r.cantidadTotal }}</td>
                  <td style="text-align:right;">S/ {{ r.importeTotal | number:'1.2-2' }}</td>
                </tr>
              }
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align:right;font-weight:600;padding:10px;">TOTAL GENERAL</td>
                <td style="text-align:center;font-weight:600;padding:10px;">{{ totalCantidad() }}</td>
                <td style="text-align:right;font-weight:600;padding:10px;color:var(--color-primary-dark);">
                  S/ {{ totalImporte() | number:'1.2-2' }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      }
    </div>
  `
})
export class ReporteIngresos implements OnInit {
  private svc = inject(ReporteService);

  datos = signal<ReporteFilaResponse[]>([]);
  loading = signal(false);
  error = signal('');
  cargado = signal(false);
  desde = '';
  hasta = '';

  ngOnInit() {
    // Al entrar a reportes, se puede cargar automáticamente el reporte consolidado global
    this.buscar();
  }

  buscar() {
    this.loading.set(true);
    this.error.set('');
    this.svc.getIngresosPorServicio(this.desde || undefined, this.hasta || undefined).subscribe({
      next: data => {
        this.datos.set(data);
        this.loading.set(false);
        this.cargado.set(true);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje || 'Error al generar el reporte.');
      }
    });
  }

  limpiar() {
    this.desde = '';
    this.hasta = '';
    this.datos.set([]);
    this.cargado.set(false);
    this.error.set('');
  }

  totalCantidad(): number {
    return this.datos().reduce((sum, r) => sum + r.cantidadTotal, 0);
  }

  totalImporte(): number {
    return this.datos().reduce((sum, r) => sum + r.importeTotal, 0);
  }
}
