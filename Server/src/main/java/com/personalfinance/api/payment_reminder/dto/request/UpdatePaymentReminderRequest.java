package com.personalfinance.api.payment_reminder.dto.request;

import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdatePaymentReminderRequest {

    private String title;

    @DecimalMin(value = "0.01", message = "Amount must be greater than 0!")
    private BigDecimal amount;

    private LocalDateTime dueAt;
    private String note;
    private Integer categoryId;

    public boolean isEmpty() {
        return title == null
                && amount == null
                && dueAt == null
                && categoryId == null;
    }
}
