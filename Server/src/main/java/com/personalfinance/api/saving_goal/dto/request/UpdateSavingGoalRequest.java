package com.personalfinance.api.saving_goal.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateSavingGoalRequest {

    private String title;
    private String description;

    @DecimalMin(value = "0.01", message = "Target must be greater than 0!")
    private BigDecimal target;

    @Future(message = "End date must be in the future!")
    private LocalDate endAt;

    private Integer categoryId;

    public boolean isEmpty() {
        return title == null
                && target == null
                && endAt == null
                && categoryId == null;
    }
}
