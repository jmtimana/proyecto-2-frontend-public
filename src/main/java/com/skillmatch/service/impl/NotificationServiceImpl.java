package com.skillmatch.service.impl;

import com.skillmatch.dto.response.NotificationResponse;
import com.skillmatch.exception.ForbiddenException;
import com.skillmatch.exception.ResourceNotFoundException;
import com.skillmatch.model.entity.Notification;
import com.skillmatch.repository.NotificationRepository;
import com.skillmatch.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public void createNotification(Long userId, String tipo, String mensaje) {
        Notification notification = Notification.builder()
                .userId(userId)
                .tipo(tipo)
                .mensaje(mensaje)
                .build();

        notification = notificationRepository.save(notification);

        log.info("Notification created for user {}: {}", userId, tipo);
    }

    @Override
    public List<NotificationResponse> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(n -> NotificationResponse.builder()
                        .id(n.getId())
                        .userId(n.getUserId())
                        .type(n.getTipo())
                        .message(n.getMensaje())
                        .read(n.isLeida())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        notification.setLeida(true);
        notificationRepository.save(notification);
        log.info("Notification marked as read: {}", notificationId);
    }

    @Override
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndLeidaFalse(userId);
    }

    @Override
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        // Solo el dueño puede marcar su notificacion como leida.
        if (!notification.getUserId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to modify this notification");
        }
        notification.setLeida(true);
        notificationRepository.save(notification);
        log.info("Notification marked as read: {} by user {}", notificationId, userId);
    }

    @Override
    public void markAllAsRead(Long userId) {
        List<Notification> noLeidas = notificationRepository.findByUserIdAndLeidaFalse(userId);
        noLeidas.forEach(n -> n.setLeida(true));
        notificationRepository.saveAll(noLeidas);
        log.info("All notifications marked as read for user {} ({} updated)", userId, noLeidas.size());
    }
}
