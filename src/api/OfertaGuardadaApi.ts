// Ofertas guardadas como favoritas (solo estudiantes).
import api from './configs/axiosConfig';
import type { OfertaLaboralResponse } from './types/Oferta';

export const OfertaGuardadaApi = {
  // GET /ofertas-guardadas -> mis ofertas guardadas
  list: () => api.get<OfertaLaboralResponse[]>('/ofertas-guardadas').then((r) => r.data),

  // POST /ofertas-guardadas/{ofertaId} -> guardar
  guardar: (ofertaId: number) =>
    api.post(`/ofertas-guardadas/${ofertaId}`).then((r) => r.data),

  // DELETE /ofertas-guardadas/{ofertaId} -> quitar
  quitar: (ofertaId: number) =>
    api.delete(`/ofertas-guardadas/${ofertaId}`).then((r) => r.data),
};
