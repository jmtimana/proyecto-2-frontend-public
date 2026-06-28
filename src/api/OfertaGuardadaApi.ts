import api from './configs/axiosConfig';
import type { OfertaLaboralResponse } from './types/Oferta';

export const OfertaGuardadaApi = {

  list: () => api.get<OfertaLaboralResponse[]>('/ofertas-guardadas').then((r) => r.data),

  guardar: (ofertaId: number) =>
    api.post(`/ofertas-guardadas/${ofertaId}`).then((r) => r.data),

  quitar: (ofertaId: number) =>
    api.delete(`/ofertas-guardadas/${ofertaId}`).then((r) => r.data),
};
