package com.personalfinance.api.notification.service.impl;

import com.personalfinance.api.notification.dto.response.DetailNotificationResponse;
import com.personalfinance.api.notification.dto.response.ExistUnreadNotificationResponse;
import com.personalfinance.api.notification.dto.response.NotificationResponse;
import com.personalfinance.api.notification.entity.Notification;
import com.personalfinance.api.notification.repository.NotificationRepository;
import com.personalfinance.api.notification.service.NotificationService;
import com.personalfinance.api.user.entity.User;
import com.personalfinance.api.user.service.CurrentUserService;
import com.personalfinance.exception.AppException;
import com.personalfinance.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;

    @Override
    public Page<NotificationResponse> getAllNotifications(Pageable pageable) {
        User user = currentUserService.getCurrentUser();

        return notificationRepository.findByUser(user, pageable)
                .map(n -> NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build()
                );
    }

    @Override
    public DetailNotificationResponse getNotification(Integer id) {
        User user = currentUserService.getCurrentUser();
        Notification notification = notificationRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));
        notification.setRead(true);
        notificationRepository.save(notification);
        DetailNotificationResponse response = DetailNotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .content(notification.getContent())
                .createdAt(notification.getCreatedAt())
                .build();

        return response;
    }

    @Override
    public void createNotification(String title, String content, User user) {
        Notification notification = Notification.builder()
                .title(title)
                .content(content)
                .user(user)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        User user = currentUserService.getCurrentUser();
        notificationRepository.markAllAsRead(user);
    }

    @Override
    public ExistUnreadNotificationResponse existsUnreadNotification() {
        User user = currentUserService.getCurrentUser();
        boolean existed = notificationRepository.existsByUserAndReadFalse(user);
        ExistUnreadNotificationResponse response = ExistUnreadNotificationResponse.builder()
                .existed(existed)
                .build();
        
        return response;
    }
}
