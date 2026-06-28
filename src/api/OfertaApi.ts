import api from './configs/axiosConfig';
import type { Page } from './types/Page';
import type {
  OfertaLaboralResponse,
  OfertaLaboralDetailResponse,
  OfertaLaboralCreateRequest,
  OfertaLaboralUpdateRequest,
} from './types/Oferta';

interface ListParams {
  page?: number;
  size?: number;
  estado?: string;
}

export const OfertaApi = {

  list: (params: ListParams, signal?: AbortSignal) =>
    api
      .get<Page<OfertaLaboralResponse>>('/ofertas-laborales', { params, signal })
      .then((r) => r.data),

  getById: (id: number) =>
    api
      .get<OfertaLaboralDetailResponse>(`/ofertas-laborales/${id}`)
      .then((r) => r.data),

  create: (payload: OfertaLaboralCreateRequest) =>
    api
      .post<OfertaLaboralDetailResponse>('/ofertas-laborales', payload)
      .then((r) => r.data),

  update: (id: number, payload: OfertaLaboralUpdateRequest) =>
    api
      .put<OfertaLaboralDetailResponse>(`/ofertas-laborales/${id}`, payload)
      .then((r) => r.data),

  remove: (id: number) =>
    api.delete(`/ofertas-laborales/${id}`).then((r) => r.data),
};
