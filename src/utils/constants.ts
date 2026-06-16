// =========================================================
// Valores fijos reutilizables en toda la app.
// Los "enums" reflejan los estados que maneja tu backend.
// =========================================================

export const ROLES = {
  USER: 'ROLE_USER',
  EMPRESA: 'ROLE_EMPRESA',
  ADMIN: 'ROLE_ADMIN',
} as const;

export const TIPO_USUARIO = {
  ESTUDIANTE: 'ESTUDIANTE',
  EMPRESA: 'EMPRESA',
} as const;

export const MODALIDAD = ['REMOTO', 'PRESENCIAL', 'HIBRIDO'] as const;
export const ESTADO_OFERTA = ['ACTIVA', 'CERRADA', 'PAUSADA'] as const;
export const DIFICULTAD = ['FACIL', 'MEDIO', 'DIFICIL'] as const;

// Tipos de pregunta que maneja el backend.
export const TIPO_PREGUNTA = ['CODIGO', 'SQL', 'LOGICA'] as const;
// Lenguajes soportados por el editor / Piston.
export const LENGUAJES = ['python', 'java', 'javascript', 'sql'] as const;
