// Postulaciones.
import api from './configs/axiosConfig';
import type { Page } from './types/Page';
import type {
  PostulacionResponse,
  PostulacionCreateRequest,
} from './types/Postulacion';

export const PostulacionApi = {
  // GET /postulaciones/mis-postulaciones (estudiante)
  mine: (page = 0, size = 100) =>
    api
      .get<Page<PostulacionResponse>>('/postulaciones/mis-postulaciones', {
        params: { page, size },
      })
      .then((r) => r.data),

  // POST /postulaciones (estudiante)
  create: (payload: PostulacionCreateRequest) =>
    api.post<PostulacionResponse>('/postulaciones', payload).then((r) => r.data),

  // GET /postulaciones/oferta/{ofertaId} (empresa: postulantes de una oferta)
  byOferta: (ofertaId: number, page = 0, size = 100) =>
    api
      .get<Page<PostulacionResponse>>(`/postulaciones/oferta/${ofertaId}`, {
        params: { page, size },
      })
      .then((r) => r.data),

  // PATCH /postulaciones/{id}/estado (empresa: aceptar/rechazar)
  updateEstado: (postulacionId: number, estado: string) =>
    api
      .patch<PostulacionResponse>(`/postulaciones/${postulacionId}/estado`, { estado })
      .then((r) => r.data),
};
