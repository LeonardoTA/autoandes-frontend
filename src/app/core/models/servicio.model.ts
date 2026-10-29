export interface ServicioRequest {
  codigo: string;
  nombre: string;
  precio: number;
  duracionMin: number;
  activo: boolean;
}

export interface ServicioResponse {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  duracionMin: number;
  activo: boolean;
}

export interface ServicioEstadoRequest {
  activo: boolean;
}
