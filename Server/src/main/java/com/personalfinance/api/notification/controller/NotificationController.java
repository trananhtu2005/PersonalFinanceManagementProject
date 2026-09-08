package com.personalfinance.api.notification.controller;

import com.personalfinance.api.notification.dto.response.DetailNotificationResponse;
import com.personalfinance.api.notification.dto.response.ExistUnreadNotificationResponse;
import com.personalfinance.api.notification.dto.response.NotificationResponse;
import com.personalfinance.api.notification.service.NotificationService;
import com.personalfinance.common.MessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getAllNotifications(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        return ResponseEntity.ok(notificationService.getAllNotifications(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetailNotificationResponse> getNotification(@PathVariable("id") Integer id) {
        DetailNotificationResponse response = notificationService.getNotification(id);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/read-all")
    public ResponseEntity<MessageResponse> markAllAsRead() {
        notificationService.markAllAsRead();
        MessageResponse response = MessageResponse.builder()
                .message("All notifications have been marked as read!")
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/exist-unread-notification")
    public ResponseEntity<ExistUnreadNotificationResponse> existsUnreadNotification() {
        return ResponseEntity.ok(notificationService.existsUnreadNotification());
    }
}
