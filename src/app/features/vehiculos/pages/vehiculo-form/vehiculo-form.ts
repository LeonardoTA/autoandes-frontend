import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { VehiculoService } from '../../../../core/services/vehiculo.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { ClienteResponse } from '../../../../core/models/cliente.model';

@Component({
  selector: 'app-vehiculo-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="card" style="max-width:580px;">
      <div class="card-header">
        <h2 class="card-title">{{ isEdit ? 'Editar vehículo' : 'Nuevo vehículo' }}</h2>
        <a routerLink="/vehiculos" class="btn btn-outline btn-sm" id="btn-volver-vehiculos">← Volver</a>
      </div>

      @if (generalError()) {
        <div class="alert alert-danger" role="alert">{{ generalError() }}</div>
      }
      @if (successMsg()) {
        <div class="alert alert-success" role="alert">{{ successMsg() }}</div>
      }
      @if (loadingForm()) {
        <div class="loading-overlay" aria-label="Cargando vehículo">
          <div class="spinner"></div>
        </div>
      }

      @if (!loadingForm()) {
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="input-placa">Placa *</label>
              <input id="input-placa"
                     type="text"
                     class="form-control"
                     formControlName="placa"
                     placeholder="ABC-123"
                     aria-label="Placa del vehículo en formato ABC-123"
                     style="text-transform:uppercase;"
                     [class.is-invalid]="fieldInvalid('placa')">
              @if (fieldError('placa')) {
                <div class="invalid-feedback">{{ fieldError('placa') }}</div>
              }
            </div>
            <div class="form-group">
              <label class="form-label" for="input-anio">Año (1990 - 2027) *</label>
              <input id="input-anio"
                     type="number"
                     class="form-control"
                     formControlName="anio"
                     placeholder="2020"
                     min="1990"
                     max="2027"
                     aria-label="Año del vehículo"
                     [class.is-invalid]="fieldInvalid('anio')">
              @if (fieldError('anio')) {
                <div class="invalid-feedback">{{ fieldError('anio') }}</div>
              }
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="input-marca">Marca *</label>
              <input id="input-marca"
                     type="text"
                     class="form-control"
                     formControlName="marca"
                     placeholder="Toyota"
                     aria-label="Marca del vehículo"
                     [class.is-invalid]="fieldInvalid('marca')">
              @if (fieldError('marca')) {
                <div class="invalid-feedback">{{ fieldError('marca') }}</div>
              }
            </div>
            <div class="form-group">
              <label class="form-label" for="input-modelo">Modelo *</label>
              <input id="input-modelo"
                     type="text"
                     class="form-control"
                     formControlName="modelo"
                     placeholder="Corolla"
                     aria-label="Modelo del vehículo"
                     [class.is-invalid]="fieldInvalid('modelo')">
              @if (fieldError('modelo')) {
                <div class="invalid-feedback">{{ fieldError('modelo') }}</div>
              }
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="select-cliente">Cliente *</label>
            <select id="select-cliente"
                    class="form-control"
                    formControlName="clienteId"
                    aria-label="Cliente propietario del vehículo"
                    [class.is-invalid]="fieldInvalid('clienteId')">
              <option value="">-- Seleccione un cliente --</option>
              @for (c of clientes(); track c.id) {
                <option [value]="c.id">
                  {{ c.nombres }} ({{ c.documento }})
                </option>
              }
            </select>
            @if (fieldError('clienteId')) {
              <div class="invalid-feedback">{{ fieldError('clienteId') }}</div>
            }
          </div>

          <div style="display:flex;gap:8px;margin-top:16px;">
            <button type="submit"
                    class="btn btn-primary"
                    id="btn-guardar-vehiculo"
                    [disabled]="form.invalid || saving()">
              {{ saving() ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Registrar') }}
            </button>
            <a routerLink="/vehiculos" class="btn btn-secondary" id="btn-cancelar-vehiculo">Cancelar</a>
          </div>
        </form>
      }
    </div>
  `
})
export class VehiculoForm implements OnInit {
  private fb = inject(FormBuilder);
  private vehSvc = inject(VehiculoService);
  private clienteSvc = inject(ClienteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  editId: number | null = null;
  clientes = signal<ClienteResponse[]>([]);
  saving = signal(false);
  loadingForm = signal(false);
  generalError = signal('');
  successMsg = signal('');
  fieldErrors = signal<Record<string, string>>({});

  form: FormGroup = this.fb.group({
    placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-\d{3}$/)]],
    marca: ['', [Validators.required, Validators.maxLength(40)]],
    modelo: ['', [Validators.required, Validators.maxLength(40)]],
    anio: [null, [Validators.required, Validators.min(1990), Validators.max(2027)]],
    clienteId: ['', Validators.required]
  });

  ngOnInit() {
    this.clienteSvc.getAll().subscribe({ next: c => this.clientes.set(c) });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = +id;
      this.loadingForm.set(true);
      this.vehSvc.getById(this.editId).subscribe({
        next: v => {
          this.form.patchValue({
            placa: v.placa,
            marca: v.marca,
            modelo: v.modelo,
            anio: v.anio,
            clienteId: v.clienteId
          });
          this.loadingForm.set(false);
        },
        error: err => {
          this.loadingForm.set(false);
          this.generalError.set(err.error?.mensaje || 'No se pudo cargar el vehículo.');
        }
      });
    }
  }

  fieldInvalid(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched)) || !!this.fieldErrors()[name];
  }

  fieldError(name: string): string {
    if (this.fieldErrors()[name]) return this.fieldErrors()[name];
    const ctrl = this.form.get(name);
    if (!ctrl || !ctrl.errors || !(ctrl.dirty || ctrl.touched)) return '';
    if (ctrl.errors['required']) return 'Campo requerido.';
    if (ctrl.errors['pattern']) return 'Formato inválido (ej: ABC-123).';
    if (ctrl.errors['min']) return `Valor mínimo: ${ctrl.errors['min'].min}.`;
    if (ctrl.errors['max']) return `Valor máximo: ${ctrl.errors['max'].max}.`;
    if (ctrl.errors['maxlength']) return `Máximo ${ctrl.errors['maxlength'].requiredLength} caracteres.`;
    return 'Valor inválido.';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.generalError.set('');
    this.fieldErrors.set({});

    const val = this.form.value;
    const req = {
      placa: (val.placa as string).trim().toUpperCase(),
      marca: (val.marca as string).trim(),
      modelo: (val.modelo as string).trim(),
      anio: +val.anio,
      clienteId: +val.clienteId
    };

    const obs = this.isEdit
      ? this.vehSvc.update(this.editId!, req)
      : this.vehSvc.create(req);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/vehiculos']);
      },
      error: err => {
        this.saving.set(false);
        if (err.error?.campos) this.fieldErrors.set(err.error.campos);
        this.generalError.set(err.error?.mensaje || 'Error al guardar el vehículo.');
      }
    });
  }
}
