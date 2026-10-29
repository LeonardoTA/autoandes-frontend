import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ServicioService } from '../../../../core/services/servicio.service';

@Component({
  selector: 'app-servicio-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="card" style="max-width:580px;">
      <div class="card-header">
        <h2 class="card-title">{{ isEdit ? 'Editar servicio' : 'Nuevo servicio' }}</h2>
        <a routerLink="/servicios" class="btn btn-outline btn-sm" id="btn-volver-servicios">← Volver</a>
      </div>

      @if (generalError()) {
        <div class="alert alert-danger" role="alert">{{ generalError() }}</div>
      }
      @if (successMsg()) {
        <div class="alert alert-success" role="alert">{{ successMsg() }}</div>
      }

      @if (loadingForm()) {
        <div class="loading-overlay" aria-label="Cargando servicio">
          <div class="spinner"></div>
        </div>
      }

      @if (!loadingForm()) {
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="input-codigo">Código (SRV-000) *</label>
              <input id="input-codigo"
                     type="text"
                     class="form-control"
                     formControlName="codigo"
                     placeholder="SRV-001"
                     aria-label="Código del servicio formato SRV-000"
                     [class.is-invalid]="fieldInvalid('codigo')">
              @if (fieldError('codigo')) {
                <div class="invalid-feedback">{{ fieldError('codigo') }}</div>
              }
            </div>
            <div class="form-group">
              <label class="form-label" for="input-precio">Precio (S/) *</label>
              <input id="input-precio"
                     type="number"
                     class="form-control"
                     formControlName="precio"
                     placeholder="0.00"
                     step="0.01"
                     min="0.01"
                     aria-label="Precio del servicio en soles"
                     [class.is-invalid]="fieldInvalid('precio')">
              @if (fieldError('precio')) {
                <div class="invalid-feedback">{{ fieldError('precio') }}</div>
              }
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="input-nombre">Nombre *</label>
            <input id="input-nombre"
                   type="text"
                   class="form-control"
                   formControlName="nombre"
                   placeholder="Ej: Cambio de aceite sintético"
                   aria-label="Nombre del servicio"
                   [class.is-invalid]="fieldInvalid('nombre')">
            @if (fieldError('nombre')) {
              <div class="invalid-feedback">{{ fieldError('nombre') }}</div>
            }
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="input-duracion">Duración (15 - 480 min) *</label>
              <input id="input-duracion"
                     type="number"
                     class="form-control"
                     formControlName="duracionMin"
                     placeholder="30"
                     min="15"
                     max="480"
                     aria-label="Duración del servicio en minutos"
                     [class.is-invalid]="fieldInvalid('duracionMin')">
              @if (fieldError('duracionMin')) {
                <div class="invalid-feedback">{{ fieldError('duracionMin') }}</div>
              }
            </div>
            <div class="form-group">
              <label class="form-label" for="select-activo">Estado *</label>
              <select id="select-activo"
                      class="form-control"
                      formControlName="activo"
                      aria-label="Estado activo o inactivo">
                <option [value]="true">Activo</option>
                <option [value]="false">Inactivo</option>
              </select>
            </div>
          </div>

          <div style="display:flex;gap:8px;margin-top:16px;">
            <button type="submit"
                    class="btn btn-primary"
                    id="btn-guardar-servicio"
                    [disabled]="form.invalid || saving()">
              {{ saving() ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Registrar') }}
            </button>
            <a routerLink="/servicios" class="btn btn-secondary" id="btn-cancelar-servicio">Cancelar</a>
          </div>
        </form>
      }
    </div>
  `
})
export class ServicioForm implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ServicioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  editId: number | null = null;
  saving = signal(false);
  loadingForm = signal(false);
  generalError = signal('');
  successMsg = signal('');
  fieldErrors = signal<Record<string, string>>({});

  form: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(/^SRV-\d{3}$/)]],
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    precio: [null, [Validators.required, Validators.min(0.01)]],
    duracionMin: [null, [Validators.required, Validators.min(15), Validators.max(480)]],
    activo: [true, Validators.required]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = +id;
      this.loadingForm.set(true);
      this.svc.getById(this.editId).subscribe({
        next: s => {
          this.form.patchValue({
            codigo: s.codigo,
            nombre: s.nombre,
            precio: s.precio,
            duracionMin: s.duracionMin,
            activo: s.activo
          });
          this.loadingForm.set(false);
        },
        error: err => {
          this.loadingForm.set(false);
          this.generalError.set(err.error?.mensaje || 'No se pudo cargar el servicio.');
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
    if (ctrl.errors['pattern']) return 'Formato inválido (debe ser SRV-000).';
    if (ctrl.errors['minlength']) return `Mínimo ${ctrl.errors['minlength'].requiredLength} caracteres.`;
    if (ctrl.errors['maxlength']) return `Máximo ${ctrl.errors['maxlength'].requiredLength} caracteres.`;
    if (ctrl.errors['min']) return `Valor mínimo: ${ctrl.errors['min'].min}.`;
    if (ctrl.errors['max']) return `Valor máximo: ${ctrl.errors['max'].max}.`;
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

    const req = {
      codigo: (this.form.value.codigo as string).trim(),
      nombre: (this.form.value.nombre as string).trim(),
      precio: +this.form.value.precio,
      duracionMin: +this.form.value.duracionMin,
      activo: this.form.value.activo === 'true' || this.form.value.activo === true
    };

    const obs = this.isEdit
      ? this.svc.update(this.editId!, req)
      : this.svc.create(req);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/servicios']);
      },
      error: err => {
        this.saving.set(false);
        if (err.error?.campos) {
          this.fieldErrors.set(err.error.campos);
        }
        this.generalError.set(err.error?.mensaje || 'Error al guardar el servicio.');
      }
    });
  }
}
