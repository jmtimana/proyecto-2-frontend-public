import api from './configs/axiosConfig';
import type { Page } from './types/Page';
import type { ResultadoResponse } from './types/Resultado';

export const ResultadoApi = {

  list: (page = 0, size = 50) =>
    api
      .get<Page<ResultadoResponse>>('/resultados', { params: { page, size } })
      .then((r) => r.data),

  mine: () =>
    api
      .get<Page<ResultadoResponse>>('/resultados', { params: { page: 0, size: 50 } })
      .then((r) => r.data),
};
