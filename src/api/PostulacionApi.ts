import api from './configs/axiosConfig';
import type { Page } from './types/Page';
import type {
  PostulacionResponse,
  PostulacionCreateRequest,
} from './types/Postulacion';

export const PostulacionApi = {

  mine: (page = 0, size = 100) =>
    api
      .get<Page<PostulacionResponse>>('/postulaciones/mis-postulaciones', {
        params: { page, size },
      })
      .then((r) => r.data),

  create: (payload: PostulacionCreateRequest) =>
    api.post<PostulacionResponse>('/postulaciones', payload).then((r) => r.data),

  byOferta: (ofertaId: number, page = 0, size = 100) =>
    api
      .get<Page<PostulacionResponse>>(`/postulaciones/oferta/${ofertaId}`, {
        params: { page, size },
      })
      .then((r) => r.data),

  updateEstado: (postulacionId: number, estado: string) =>
    api
      .patch<PostulacionResponse>(`/postulaciones/${postulacionId}/estado`, { estado })
      .then((r) => r.data),
};
