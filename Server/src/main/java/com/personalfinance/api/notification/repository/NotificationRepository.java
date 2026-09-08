package com.personalfinance.api.notification.repository;

import com.personalfinance.api.notification.entity.Notification;
import com.personalfinance.api.user.entity.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    Page<Notification> findByUser(User user, Pageable pageable);

    Optional<Notification> findByIdAndUser(Integer id, User user);

    boolean existsByUserAndReadFalse(User user);
    
    @Modifying
    @Query("""
           UPDATE Notification n
           SET n.read = true
           WHERE n.user = :user
           AND n.read = false
           """)
    void markAllAsRead(@Param("user") User user);
}
