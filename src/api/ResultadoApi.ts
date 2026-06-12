// Consultar los resultados (intentos) del usuario logueado.
import api from './configs/axiosConfig';
import type { Page } from './types/Page';
import type { ResultadoResponse } from './types/Resultado';

export const ResultadoApi = {
  // GET /resultados?page&size -> mis intentos (paginado)
  list: (page = 0, size = 50) =>
    api
      .get<Page<ResultadoResponse>>('/resultados', { params: { page, size } })
      .then((r) => r.data),

  // Alias usado por el dashboard: primeros 50 intentos.
  mine: () =>
    api
      .get<Page<ResultadoResponse>>('/resultados', { params: { page: 0, size: 50 } })
      .then((r) => r.data),
};
