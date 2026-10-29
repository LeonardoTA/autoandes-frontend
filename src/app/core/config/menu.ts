export interface MenuItem {
  label: string;
  route: string;
  permiso?: string;
  icon: string;
}

export const MENU_ITEMS: MenuItem[] = [
  { label: 'Servicios', route: '/servicios', permiso: 'SERVICIO_LEER', icon: '🔧' },
  { label: 'Vehículos', route: '/vehiculos', permiso: 'VEHICULO_LEER', icon: '🚗' },
  { label: 'Órdenes', route: '/ordenes', permiso: 'ORDEN_LEER', icon: '📋' },
  { label: 'Reportes', route: '/reportes', permiso: 'REPORTE_VER', icon: '📊' },
];
