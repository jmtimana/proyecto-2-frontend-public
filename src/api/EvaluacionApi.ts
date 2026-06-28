import api from './configs/axiosConfig';
import type { Page } from './types/Page';
import type {
  EvaluacionResponse,
  EvaluacionDetailResponse,
  EvaluacionCreateRequest,
  EvaluacionUpdateRequest,
  PreguntaCreateRequest,
  PreguntaResponse,
} from './types/Evaluacion';

export const EvaluacionApi = {

  list: (page = 0, size = 10) =>
    api
      .get<Page<EvaluacionResponse>>('/evaluaciones', { params: { page, size } })
      .then((r) => r.data),

  getById: (id: number) =>
    api
      .get<EvaluacionDetailResponse>(`/evaluaciones/${id}`)
      .then((r) => r.data),

  iniciar: (id: number) =>
    api.post(`/evaluaciones/${id}/iniciar`).then((r) => r.data),

  create: (payload: EvaluacionCreateRequest) =>
    api.post<EvaluacionDetailResponse>('/evaluaciones', payload).then((r) => r.data),

  update: (id: number, payload: EvaluacionUpdateRequest) =>
    api.put<EvaluacionDetailResponse>(`/evaluaciones/${id}`, payload).then((r) => r.data),

  remove: (id: number) =>
    api.delete(`/evaluaciones/${id}`).then((r) => r.data),

  createPregunta: (evaluacionId: number, payload: PreguntaCreateRequest) =>
    api
      .post<PreguntaResponse>(`/evaluaciones/${evaluacionId}/preguntas`, payload)
      .then((r) => r.data),
};
