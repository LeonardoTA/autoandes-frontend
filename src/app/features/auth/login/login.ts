import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-logo">
          <h1>🔩 AutoAndes</h1>
          <p>Sistema de órdenes de servicio</p>
        </div>

        @if (errorMsg()) {
          <div class="alert alert-danger" role="alert" id="login-error-msg">{{ errorMsg() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label" for="username">Usuario</label>
            <input id="username"
                   type="text"
                   class="form-control"
                   formControlName="username"
                   autocomplete="username"
                   placeholder="Ingresa tu usuario (admin/asesor/jefe)"
                   aria-label="Nombre de usuario"
                   [class.is-invalid]="form.get('username')?.invalid && (form.get('username')?.touched || form.get('username')?.dirty)">
            @if (form.get('username')?.invalid && (form.get('username')?.touched || form.get('username')?.dirty)) {
              <div class="invalid-feedback">El usuario es requerido.</div>
            }
          </div>
          <div class="form-group">
            <label class="form-label" for="password">Contraseña</label>
            <input id="password"
                   type="password"
                   class="form-control"
                   formControlName="password"
                   autocomplete="current-password"
                   placeholder="Ingresa tu contraseña"
                   aria-label="Contraseña"
                   [class.is-invalid]="form.get('password')?.invalid && (form.get('password')?.touched || form.get('password')?.dirty)">
            @if (form.get('password')?.invalid && (form.get('password')?.touched || form.get('password')?.dirty)) {
              <div class="invalid-feedback">La contraseña es requerida.</div>
            }
          </div>
          <button type="submit"
                  class="btn btn-primary w-100"
                  id="btn-login-submit"
                  [disabled]="form.invalid || loading()">
            {{ loading() ? 'Ingresando...' : 'Iniciar sesión' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  errorMsg = signal('');

  form: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.form.value).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: err => {
        this.loading.set(false);
        const msg = err.error?.mensaje || 'Error al iniciar sesión. Verifique sus credenciales.';
        this.errorMsg.set(msg);
      }
    });
  }
}
