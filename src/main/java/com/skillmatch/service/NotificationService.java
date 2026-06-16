package com.skillmatch.service;

import com.skillmatch.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {
    void createNotification(Long userId, String tipo, String mensaje);
    List<NotificationResponse> getNotifications(Long userId);
    void markAsRead(Long notificationId);

    // Nuevos: con verificacion de dueño y utilidades para la campana de notificaciones.
    long countUnread(Long userId);
    void markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
}
