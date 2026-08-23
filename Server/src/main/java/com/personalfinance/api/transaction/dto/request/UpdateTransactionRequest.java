package com.personalfinance.api.transaction.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.PastOrPresent;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateTransactionRequest {

    @DecimalMin(value = "0.01", message = "Amount must be greater than 0!")
    private BigDecimal amount;

    private String note;

    @PastOrPresent(message = "Time must be in the past or the present!")
    private LocalDateTime date;

    private Integer walletId;
    private Integer categoryId;

    public boolean isEmpty() {
        return amount == null
                && date == null
                && walletId == null
                && categoryId == null;
    }
}
