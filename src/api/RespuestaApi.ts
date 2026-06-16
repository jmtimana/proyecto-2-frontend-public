// Enviar una respuesta y consultar su estado (para el polling).
import api from './configs/axiosConfig';
import type { RespuestaSubmitRequest, RespuestaResponse } from './types/Respuesta';

export const RespuestaApi = {
  // POST /respuestas -> crea la respuesta (queda PENDIENTE)
  submit: (req: RespuestaSubmitRequest) =>
    api.post<RespuestaResponse>('/respuestas', req).then((r) => r.data),

  // GET /respuestas/{id} -> consulta el estado (PENDIENTE/CORRECTA/INCORRECTA/ERROR)
  getById: (id: number) =>
    api.get<RespuestaResponse>(`/respuestas/${id}`).then((r) => r.data),

  // GET /respuestas/evaluacion/{evaluacionId} -> todas mis respuestas de esa evaluación
  byEvaluacion: (evaluacionId: number) =>
    api.get<RespuestaResponse[]>(`/respuestas/evaluacion/${evaluacionId}`).then((r) => r.data),
};
