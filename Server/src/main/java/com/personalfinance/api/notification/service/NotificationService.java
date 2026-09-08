package com.personalfinance.api.notification.service;

import com.personalfinance.api.notification.dto.response.DetailNotificationResponse;
import com.personalfinance.api.notification.dto.response.ExistUnreadNotificationResponse;
import com.personalfinance.api.notification.dto.response.NotificationResponse;
import com.personalfinance.api.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    Page<NotificationResponse> getAllNotifications(Pageable pageable);

    DetailNotificationResponse getNotification(Integer id);

    void createNotification(String title, String content, User user);

    void markAllAsRead();
    
    ExistUnreadNotificationResponse existsUnreadNotification();
}
