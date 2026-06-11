// Resultados de evaluaciones del usuario.
import api from './configs/axiosConfig';
import type { Page } from './types/Page';
import type { ResultadoResponse } from './types/Resultado';

export const ResultadoApi = {
  // GET /resultados?page&size -> mis resultados (paginado)
  mine: (page = 0, size = 100) =>
    api
      .get<Page<ResultadoResponse>>('/resultados', { params: { page, size } })
      .then((r) => r.data),
};
