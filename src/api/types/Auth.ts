// =========================================================
// Tipos relacionados a autenticación.
// Estos campos coinciden EXACTAMENTE con los DTO de tu backend
// (RegisterRequest, LoginRequest, AuthResponse). Si el backend
// cambia un nombre de campo, hay que cambiarlo también aquí.
// =========================================================

// Lo que enviamos al hacer login -> POST /auth/login
export interface LoginRequest {
  email: string;
  password: string;
}

// Lo que enviamos al registrarnos -> POST /auth/register
// Los campos de empresa (ruc, razonSocial...) solo se mandan si tipo === 'EMPRESA'.
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

// Lo que nos devuelve el backend al login/registro correcto.
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  type: string; // ESTUDIANTE | EMPRESA
  roles: string[]; // ROLE_USER | ROLE_EMPRESA | ROLE_ADMIN
  tokenType: string; // normalmente "Bearer"
}

// Lo que enviamos para renovar el token -> POST /auth/refresh
export interface RefreshTokenRequest {
  refreshToken: string;
}
