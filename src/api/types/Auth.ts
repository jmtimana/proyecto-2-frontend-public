export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  tipo: 'ESTUDIANTE' | 'EMPRESA';
  ruc?: string;
  razonSocial?: string;
  sector?: string;
  tamano?: string;
  descripcion?: string;
  web?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  type: string;
  roles: string[];
  tokenType: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
