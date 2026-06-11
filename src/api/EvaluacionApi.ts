// Llamadas al backend para evaluaciones (requieren sesión).
import api from './configs/axiosConfig';
import type { Page } from './types/Page';
import type {
  EvaluacionResponse,
  EvaluacionDetailResponse,
} from './types/Evaluacion';

export const EvaluacionApi = {
  // GET /evaluaciones?page&size
  list: (page = 0, size = 10) =>
    api
      .get<Page<EvaluacionResponse>>('/evaluaciones', { params: { page, size } })
      .then((r) => r.data),

  // GET /evaluaciones/{id}
  getById: (id: number) =>
    api
      .get<EvaluacionDetailResponse>(`/evaluaciones/${id}`)
      .then((r) => r.data),
};
