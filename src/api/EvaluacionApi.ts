// Llamadas al backend para evaluaciones.
// - Lectura (list/getById/iniciar): cualquier usuario logueado.
// - Escritura (create/update/remove/addPregunta): solo ADMIN (@PreAuthorize en el backend).
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
  // GET /evaluaciones?page&size
  list: (page = 0, size = 10) =>
    api
      .get<Page<EvaluacionResponse>>('/evaluaciones', { params: { page, size } })
      .then((r) => r.data),

  // GET /evaluaciones/{id} (incluye las preguntas)
  getById: (id: number) =>
    api
      .get<EvaluacionDetailResponse>(`/evaluaciones/${id}`)
      .then((r) => r.data),

  // POST /evaluaciones/{id}/iniciar -> crea un intento EN_PROGRESO
  iniciar: (id: number) =>
    api.post(`/evaluaciones/${id}/iniciar`).then((r) => r.data),

  // ===== Solo ADMIN =====

  // POST /evaluaciones -> crea una evaluación
  create: (payload: EvaluacionCreateRequest) =>
    api.post<EvaluacionDetailResponse>('/evaluaciones', payload).then((r) => r.data),

  // PUT /evaluaciones/{id} -> actualización parcial
  update: (id: number, payload: EvaluacionUpdateRequest) =>
    api.put<EvaluacionDetailResponse>(`/evaluaciones/${id}`, payload).then((r) => r.data),

  // DELETE /evaluaciones/{id}
  remove: (id: number) =>
    api.delete(`/evaluaciones/${id}`).then((r) => r.data),

  // POST /evaluaciones/{id}/preguntas -> agrega una pregunta a la evaluación
  createPregunta: (evaluacionId: number, payload: PreguntaCreateRequest) =>
    api
      .post<PreguntaResponse>(`/evaluaciones/${evaluacionId}/preguntas`, payload)
      .then((r) => r.data),
};
