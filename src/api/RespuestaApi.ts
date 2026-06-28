import api from './configs/axiosConfig';
import type { RespuestaSubmitRequest, RespuestaResponse } from './types/Respuesta';

export const RespuestaApi = {

  submit: (req: RespuestaSubmitRequest) =>
    api.post<RespuestaResponse>('/respuestas', req).then((r) => r.data),

  getById: (id: number) =>
    api.get<RespuestaResponse>(`/respuestas/${id}`).then((r) => r.data),

  byEvaluacion: (evaluacionId: number) =>
    api.get<RespuestaResponse[]>(`/respuestas/evaluacion/${evaluacionId}`).then((r) => r.data),
};
