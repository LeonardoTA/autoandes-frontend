export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEnSegundos: number;
  nombreCompleto: string;
  username: string;
  roles: string[];
  permisos: string[];
}

export interface MeResponse {
  id: number;
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: string[];
}

export interface SessionData {
  token: string;
  nombreCompleto: string;
  username: string;
  roles: string[];
  permisos: string[];
  expiresAt: number; // timestamp ms
}
