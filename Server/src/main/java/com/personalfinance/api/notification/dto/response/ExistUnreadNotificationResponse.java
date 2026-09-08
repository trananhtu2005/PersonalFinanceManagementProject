package com.personalfinance.api.notification.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ExistUnreadNotificationResponse {

    private final boolean existed;
}
