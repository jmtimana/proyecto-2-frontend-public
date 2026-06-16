package com.skillmatch.controller;

import com.skillmatch.dto.response.NotificationResponse;
import com.skillmatch.security.CustomUserDetails;
import com.skillmatch.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Expone las notificaciones del usuario autenticado (campana de la barra superior).
 * La entidad, el servicio y el DTO ya existian; aqui solo se exponen via REST.
 */
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // Lista mis notificaciones (mas recientes primero).
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponse>> getMisNotificaciones(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(notificationService.getNotifications(userDetails.getId()));
    }

    // Cantidad de no leidas (para el contador rojo de la campana).
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        long unread = notificationService.countUnread(userDetails.getId());
        return ResponseEntity.ok(Map.of("unread", unread));
    }

    // Marcar una notificacion como leida (solo si es mia).
    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> marcarLeida(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.markAsRead(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    // Marcar todas mis notificaciones como leidas.
    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> marcarTodasLeidas(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.markAllAsRead(userDetails.getId());
        return ResponseEntity.noContent().build();
    }
}
