import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { OrdenService } from '../../../../core/services/orden.service';
import { VehiculoService } from '../../../../core/services/vehiculo.service';
import { ServicioService } from '../../../../core/services/servicio.service';
import { VehiculoResponse } from '../../../../core/models/vehiculo.model';
import { ServicioResponse } from '../../../../core/models/servicio.model';

@Component({
  selector: 'app-orden-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe],
  template: `
    <div class="card" style="max-width:860px;">
      <div class="card-header">
        <h2 class="card-title">Nueva orden de servicio</h2>
        <a routerLink="/ordenes" class="btn btn-outline btn-sm" id="btn-volver-ordenes">← Volver</a>
      </div>

      <!-- Errores generales y avisos -->
      @if (generalError()) {
        <div class="alert alert-danger" role="alert">{{ generalError() }}</div>
      }
      @if (dropdownError()) {
        <div class="alert alert-warning" role="alert">{{ dropdownError() }}</div>
      }
      @if (successMsg()) {
        <div class="alert alert-success" role="alert">{{ successMsg() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Cabecera -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="select-vehiculo">Vehículo *</label>
            <select id="select-vehiculo"
                    class="form-control"
                    formControlName="vehiculoId"
                    aria-label="Seleccionar vehículo para la orden"
                    [class.is-invalid]="fieldInvalid('vehiculoId')">
              <option value="">-- Seleccione vehículo --</option>
              @for (v of vehiculos(); track v.id) {
                <option [value]="v.id">
                  {{ v.placa }} — {{ v.marca }} {{ v.modelo }} ({{ v.clienteNombre }})
                </option>
              }
            </select>
            @if (fieldError('vehiculoId')) {
              <div class="invalid-feedback">{{ fieldError('vehiculoId') }}</div>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="input-kilometraje">Kilometraje actual *</label>
            <input id="input-kilometraje"
                   type="number"
                   class="form-control"
                   formControlName="kilometraje"
                   placeholder="Ej: 45000"
                   min="0"
                   aria-label="Kilometraje del vehículo"
                   [class.is-invalid]="fieldInvalid('kilometraje')">
            @if (fieldError('kilometraje')) {
              <div class="invalid-feedback">{{ fieldError('kilometraje') }}</div>
            }
          </div>
        </div>

        <!-- Detalle de servicios -->
        <div style="margin-top:16px;">
          <div class="d-flex align-center justify-between mb-1">
            <strong>Detalle de servicios (entre 1 y 10 líneas)</strong>
            <button type="button"
                    class="btn btn-secondary btn-sm"
                    id="btn-agregar-detalle"
                    (click)="addDetalle()"
                    [disabled]="detalles.length >= 10">
              + Agregar línea
            </button>
          </div>

          @if (fieldErrors()['detalles']) {
            <div class="alert alert-danger" role="alert">{{ fieldErrors()['detalles'] }}</div>
          }

          <div formArrayName="detalles">
            @for (det of detalles.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="detalle-line" [attr.aria-label]="'Línea de servicio ' + (i + 1)">
                <!-- Selector de servicio -->
                <div class="form-group" style="margin:0;">
                  <label [for]="'select-servicio-' + i" class="sr-only" style="display:none;">Servicio {{ i + 1 }}</label>
                  <select [id]="'select-servicio-' + i"
                          class="form-control"
                          formControlName="servicioId"
                          [attr.aria-label]="'Seleccionar servicio para la línea ' + (i + 1)"
                          [class.is-invalid]="detalleFieldInvalid(i, 'servicioId')">
                    <option value="">-- Seleccione servicio --</option>
                    @for (s of getServiciosDisponibles(i); track s.id) {
                      <option [value]="s.id">
                        {{ s.codigo }} - {{ s.nombre }} (S/ {{ s.precio | number:'1.2-2' }})
                        @if (!s.activo) { [Inactivo] }
                      </option>
                    }
                  </select>
                  @if (detalleFieldError(i, 'servicioId')) {
                    <div class="invalid-feedback">{{ detalleFieldError(i, 'servicioId') }}</div>
                  }
                </div>

                <!-- Cantidad -->
                <div class="form-group" style="margin:0;">
                  <label [for]="'input-cantidad-' + i" class="sr-only" style="display:none;">Cantidad {{ i + 1 }}</label>
                  <input [id]="'input-cantidad-' + i"
                         type="number"
                         class="form-control"
                         formControlName="cantidad"
                         placeholder="Cant."
                         min="1"
                         max="5"
                         [attr.aria-label]="'Cantidad para la línea ' + (i + 1) + ' (entre 1 y 5)'"
                         [class.is-invalid]="detalleFieldInvalid(i, 'cantidad')">
                  @if (detalleFieldError(i, 'cantidad')) {
                    <div class="invalid-feedback">{{ detalleFieldError(i, 'cantidad') }}</div>
                  }
                </div>

                <!-- Subtotal reactivo -->
                <div class="subtotal-display" [attr.aria-label]="'Subtotal de línea ' + (i + 1)">
                  S/ {{ (subtotales()[i] || 0) | number:'1.2-2' }}
                </div>

                <!-- Quitar línea -->
                <button type="button"
                        class="btn btn-danger btn-sm btn-icon"
                        [id]="'btn-quitar-detalle-' + i"
                        [attr.aria-label]="'Quitar línea ' + (i + 1)"
                        (click)="removeDetalle(i)"
                        [disabled]="detalles.length <= 1">
                  ✕
                </button>
              </div>
            }
          </div>

          <!-- Total de la orden reactivo -->
          <div class="detalle-total" id="display-total-orden">
            Total estimado: S/ {{ totalOrden() | number:'1.2-2' }}
          </div>
        </div>

        <div style="display:flex;gap:8px;margin-top:20px;">
          <button type="submit"
                  class="btn btn-primary"
                  id="btn-guardar-orden"
                  [disabled]="form.invalid || saving()">
            {{ saving() ? 'Registrando...' : 'Registrar orden' }}
          </button>
          <a routerLink="/ordenes" class="btn btn-secondary" id="btn-cancelar-orden">Cancelar</a>
        </div>
      </form>
    </div>
  `
})
export class OrdenForm implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private ordenSvc = inject(OrdenService);
  private vehSvc = inject(VehiculoService);
  private servicioSvc = inject(ServicioService);
  private router = inject(Router);

  vehiculos = signal<VehiculoResponse[]>([]);
  servicios = signal<ServicioResponse[]>([]);
  saving = signal(false);
  generalError = signal('');
  dropdownError = signal('');
  successMsg = signal('');
  fieldErrors = signal<Record<string, string>>({});

  // Totales reactivos calculados
  subtotales = signal<number[]>([]);
  totalOrden = signal<number>(0);

  private formSub?: Subscription;

  form: FormGroup = this.fb.group({
    vehiculoId: ['', Validators.required],
    kilometraje: [null, [Validators.required, Validators.min(0)]],
    detalles: this.fb.array([])
  });

  get detalles(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  ngOnInit() {
    this.cargarDropdowns();
    this.addDetalle();

    // Suscripción reactiva real para recalcular totales en tiempo real
    this.formSub = this.form.valueChanges.subscribe(() => {
      this.actualizarTotales();
    });
  }

  ngOnDestroy() {
    this.formSub?.unsubscribe();
  }

  cargarDropdowns() {
    this.vehSvc.getAll().subscribe({
      next: v => this.vehiculos.set(v),
      error: err => {
        this.dropdownError.set('No se pudo cargar la lista de vehículos: ' + (err.error?.mensaje || 'Error de conexión.'));
      }
    });

    this.servicioSvc.getAll().subscribe({
      next: s => {
        this.servicios.set(s);
        this.actualizarTotales();
      },
      error: err => {
        this.dropdownError.set('No se pudo cargar la lista de servicios: ' + (err.error?.mensaje || 'Error de conexión.'));
      }
    });
  }

  addDetalle() {
    if (this.detalles.length >= 10) return;
    const g = this.fb.group({
      servicioId: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
    this.detalles.push(g);
    this.actualizarTotales();
  }

  removeDetalle(i: number) {
    if (this.detalles.length > 1) {
      this.detalles.removeAt(i);
      this.actualizarTotales();
    }
  }

  actualizarTotales() {
    const srvMap = new Map<number, number>();
    for (const s of this.servicios()) {
      srvMap.set(s.id, s.precio);
    }

    const subs: number[] = [];
    let tot = 0;

    for (let i = 0; i < this.detalles.length; i++) {
      const c = this.detalles.at(i);
      const sId = +c.get('servicioId')?.value;
      const qty = +c.get('cantidad')?.value;
      const precio = (sId && srvMap.has(sId)) ? srvMap.get(sId)! : 0;
      const sub = (sId && qty > 0) ? precio * qty : 0;
      subs.push(sub);
      tot += sub;
    }

    this.subtotales.set(subs);
    this.totalOrden.set(tot);
  }

  getServiciosDisponibles(idx: number): ServicioResponse[] {
    const seleccionados = this.detalles.controls
      .map((c, i) => i !== idx ? +c.get('servicioId')?.value : null)
      .filter(id => id !== null && !isNaN(id as number));
    return this.servicios().filter(s => !seleccionados.includes(s.id));
  }

  fieldInvalid(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!(ctrl?.invalid && (ctrl.dirty || ctrl.touched)) || !!this.fieldErrors()[name];
  }

  fieldError(name: string): string {
    if (this.fieldErrors()[name]) return this.fieldErrors()[name];
    const ctrl = this.form.get(name);
    if (!ctrl || !ctrl.errors || !(ctrl.dirty || ctrl.touched)) return '';
    if (ctrl.errors['required']) return 'Este campo es obligatorio.';
    if (ctrl.errors['min']) return `El valor mínimo es ${ctrl.errors['min'].min}.`;
    return 'Valor inválido.';
  }

  detalleFieldInvalid(i: number, name: string): boolean {
    const key = `detalles[${i}].${name}`;
    if (this.fieldErrors()[key]) return true;
    const ctrl = this.detalles.at(i).get(name);
    return !!(ctrl?.invalid && (ctrl.dirty || ctrl.touched));
  }

  detalleFieldError(i: number, name: string): string {
    const key = `detalles[${i}].${name}`;
    if (this.fieldErrors()[key]) return this.fieldErrors()[key];
    const ctrl = this.detalles.at(i).get(name);
    if (!ctrl || !ctrl.errors || !(ctrl.dirty || ctrl.touched)) return '';
    if (ctrl.errors['required']) return 'Requerido.';
    if (ctrl.errors['min']) return `Mínimo ${ctrl.errors['min'].min}.`;
    if (ctrl.errors['max']) return `Máximo ${ctrl.errors['max'].max}.`;
    return 'Inválido.';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Validar servicios únicos
    const sIds = this.detalles.controls.map(c => +c.get('servicioId')?.value);
    const unique = new Set(sIds);
    if (unique.size !== sIds.length) {
      this.generalError.set('No se puede repetir el mismo servicio en más de una línea.');
      return;
    }

    this.saving.set(true);
    this.generalError.set('');
    this.fieldErrors.set({});

    // Enviar SOLO vehiculoId, kilometraje y detalles: [{servicioId, cantidad}]
    const req = {
      vehiculoId: +this.form.value.vehiculoId,
      kilometraje: +this.form.value.kilometraje,
      detalles: this.detalles.controls.map(c => ({
        servicioId: +c.get('servicioId')?.value,
        cantidad: +c.get('cantidad')?.value
      }))
    };

    this.ordenSvc.create(req).subscribe({
      next: orden => {
        this.saving.set(false);
        this.successMsg.set(`Orden registrada exitosamente con número: ${orden.numero}`);
        setTimeout(() => this.router.navigate(['/ordenes']), 2000);
      },
      error: err => {
        this.saving.set(false);
        // Regla: 409 o 400 conserva las líneas ingresadas
        if (err.error?.campos) {
          this.fieldErrors.set(err.error.campos);
        }
        this.generalError.set(err.error?.mensaje || 'Error al registrar la orden de servicio.');
      }
    });
  }
}
