// Llamadas a las notificaciones del usuario logueado.
import api from './configs/axiosConfig';
import type { NotificationResponse } from './types/Notification';

export const NotificationApi = {
  // GET /notifications -> mis notificaciones (más recientes primero)
  list: () => api.get<NotificationResponse[]>('/notifications').then((r) => r.data),

  // GET /notifications/unread-count -> { unread: N }
  unreadCount: () =>
    api.get<{ unread: number }>('/notifications/unread-count').then((r) => r.data.unread),

  // PATCH /notifications/{id}/read -> marcar una como leída
  markRead: (id: number) => api.patch(`/notifications/${id}/read`).then((r) => r.data),

  // PATCH /notifications/read-all -> marcar todas como leídas
  markAllRead: () => api.patch('/notifications/read-all').then((r) => r.data),
};
