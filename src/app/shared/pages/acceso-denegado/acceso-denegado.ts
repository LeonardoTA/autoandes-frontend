import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="empty-state" style="min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <div style="font-size:64px">🚫</div>
      <h2>Acceso denegado</h2>
      <p>No tienes permiso para acceder a esta sección.</p>
      <p class="text-muted" style="font-size:12px">Tu sesión está activa. Contacta al administrador si crees que esto es un error.</p>
      <a routerLink="/" class="btn btn-primary" style="margin-top:16px">Ir al inicio</a>
    </div>
  `
})
export class AccesoDenegado {}
