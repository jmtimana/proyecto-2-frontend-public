package com.skillmatch.repository;

import com.skillmatch.model.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUserIdAndLeidaFalse(Long userId);
    long countByUserIdAndLeidaFalse(Long userId);
}
