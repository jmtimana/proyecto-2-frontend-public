// =========================================================
// Llamadas al backend para ofertas laborales.
// =========================================================
import api from './configs/axiosConfig';
import type { Page } from './types/Page';
import type {
  OfertaLaboralResponse,
  OfertaLaboralDetailResponse,
  OfertaLaboralCreateRequest,
} from './types/Oferta';

interface ListParams {
  page?: number;
  size?: number;
  estado?: string;
}

export const OfertaApi = {
  // GET /ofertas-laborales (público)
  list: (params: ListParams) =>
    api
      .get<Page<OfertaLaboralResponse>>('/ofertas-laborales', { params })
      .then((r) => r.data),

  // GET /ofertas-laborales/{id}
  getById: (id: number) =>
    api
      .get<OfertaLaboralDetailResponse>(`/ofertas-laborales/${id}`)
      .then((r) => r.data),

  // POST /ofertas-laborales (solo empresa)
  create: (payload: OfertaLaboralCreateRequest) =>
    api
      .post<OfertaLaboralDetailResponse>('/ofertas-laborales', payload)
      .then((r) => r.data),
};
