import api from './configs/axiosConfig';
import type { NotificationResponse } from './types/Notification';

export const NotificationApi = {

  list: () => api.get<NotificationResponse[]>('/notifications').then((r) => r.data),

  unreadCount: () =>
    api.get<{ unread: number }>('/notifications/unread-count').then((r) => r.data.unread),

  markRead: (id: number) => api.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () => api.patch('/notifications/read-all').then((r) => r.data),
};
