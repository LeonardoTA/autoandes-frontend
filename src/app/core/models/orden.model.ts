export interface DetalleOrdenRequest {
  servicioId: number;
  cantidad: number;
}

export interface OrdenRequest {
  vehiculoId: number;
  kilometraje: number;
  detalles: DetalleOrdenRequest[];
}

export interface AnularOrdenRequest {
  motivo: string;
}

export interface DetalleOrdenResponse {
  id: number;
  servicioId: number;
  codigoServicio: string;
  nombreServicio: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface OrdenResponse {
  id: number;
  numero: string;
  fecha: string;
  vehiculoId: number;
  placa: string;
  clienteNombre: string;
  kilometraje: number;
  estado: 'REGISTRADA' | 'ANULADA';
  total: number;
  usuarioRegistro: string;
  motivoAnulacion: string | null;
  detalles: DetalleOrdenResponse[];
}

export interface OrdenFiltros {
  placa?: string;
  estado?: string;
  desde?: string;
  hasta?: string;
}
