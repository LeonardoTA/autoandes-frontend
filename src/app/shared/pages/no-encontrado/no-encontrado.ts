import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrado',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="empty-state" style="min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <div style="font-size:64px">404</div>
      <h2>Página no encontrada</h2>
      <p>La ruta solicitada no existe en AutoAndes.</p>
      <a routerLink="/" class="btn btn-primary" style="margin-top:16px">Ir al inicio</a>
    </div>
  `
})
export class NoEncontrado {}
