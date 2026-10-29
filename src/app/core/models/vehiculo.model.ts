export interface VehiculoRequest {
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  clienteId: number;
}

export interface VehiculoResponse {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  clienteId: number;
  clienteNombre: string;
}
