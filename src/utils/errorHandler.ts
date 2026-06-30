const mensajesPorErrorCode: Record<string, string> = {
  RESOURCE_NOT_FOUND: 'El recurso solicitado no existe.',
  DUPLICATE_RESOURCE: 'Ya existe un registro con esos datos.',
  EMAIL_ALREADY_REGISTERED: 'El correo ya está registrado.',
  RUC_ALREADY_REGISTERED: 'El RUC ya está registrado.',
  DATA_INTEGRITY_VIOLATION: 'Ya existe un registro con esos datos.',
  CONFLICT: 'La operación no se puede completar por un conflicto con los datos actuales.',
  INVALID_OPERATION: 'La operación solicitada no es válida en este momento.',
  VALIDATION_ERROR: 'Los datos enviados no cumplen con los requisitos.',
  BAD_REQUEST: 'Solicitud inválida. Revisa los datos e intenta de nuevo.',
  BAD_CREDENTIALS: 'Correo electrónico o contraseña incorrectos.',
  EVALUACION_ALREADY_STARTED: 'Ya tienes una evaluación en progreso.',
  UNAUTHORIZED: 'Debes iniciar sesión para continuar.',
  FORBIDDEN: 'No tienes permiso para realizar esta acción.',
  TOKEN_EXPIRED: 'Tu sesión expiró. Inicia sesión de nuevo.',
  INVALID_TOKEN: 'Tu sesión no es válida. Inicia sesión de nuevo.',
  RATE_LIMIT_EXCEEDED: 'Has hecho demasiadas solicitudes. Espera unos segundos.',
  EXTERNAL_SERVICE_ERROR: 'El servicio externo no está disponible. Intenta de nuevo.',
  CODE_EXECUTION_ERROR: 'Error al ejecutar el código. Intenta de nuevo.',
  EMAIL_SENDING_ERROR: 'Error al enviar el correo. Intenta de nuevo.',
  PAYMENT_ERROR: 'Error al procesar el pago. Intenta de nuevo.',
  INTERNAL_ERROR: 'Error interno del servidor. Intenta de nuevo más tarde.',
};

const mensajesPorStatus: Record<number, string> = {
  400: 'Los datos enviados no son válidos. Revisa los campos marcados.',
  401: 'Debes iniciar sesión para continuar.',
  402: 'Error al procesar el pago.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'El recurso solicitado no existe.',
  409: 'Hay un conflicto con los datos actuales.',
  429: 'Demasiadas solicitudes. Espera unos segundos.',
  500: 'Error interno del servidor. Intenta de nuevo más tarde.',
  502: 'El servicio externo no está disponible.',
};

export interface ParsedApiError {
  userMessage: string;
  detail: string | null;
  status: number | null;
  errorCode: string | null;
  validationErrors: Record<string, string> | null;
}

export function parseError(err: unknown): ParsedApiError {
  const axiosErr = err as any;

  if (axiosErr?.code === 'ERR_NETWORK') {
    return {
      userMessage: 'No se pudo conectar con el servidor. Revisa tu conexión a Internet.',
      detail: null,
      status: null,
      errorCode: 'NETWORK_ERROR',
      validationErrors: null,
    };
  }

  if (axiosErr?.code === 'ECONNABORTED') {
    return {
      userMessage: 'El servidor tardó demasiado en responder. Intenta de nuevo.',
      detail: null,
      status: null,
      errorCode: 'TIMEOUT',
      validationErrors: null,
    };
  }

  const data = axiosErr?.response?.data;
  const status = data?.status ?? axiosErr?.response?.status ?? null;
  const errorCode: string | null = data?.errorCode ?? null;
  const backendMessage: string | null = data?.message ?? data?.error ?? null;
  const validationErrors: Record<string, string> | null = data?.validationErrors ?? null;

  let userMessage: string;

  if (errorCode && mensajesPorErrorCode[errorCode]) {
    userMessage = mensajesPorErrorCode[errorCode];
  } else if (backendMessage) {
    userMessage = backendMessage;
  } else if (status && mensajesPorStatus[status]) {
    userMessage = mensajesPorStatus[status];
  } else if (axiosErr?.message?.includes('timeout')) {
    userMessage = 'El servidor tardó demasiado en responder. Intenta de nuevo.';
  } else {
    userMessage = 'Ocurrió un error inesperado. Intenta de nuevo.';
  }

  return {
    userMessage,
    detail: backendMessage,
    status,
    errorCode,
    validationErrors,
  };
}

export function getErrorMessage(err: unknown): string {
  return parseError(err).userMessage;
}
