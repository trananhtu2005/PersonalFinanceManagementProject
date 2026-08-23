package com.personalfinance.api.payment_reminder.service.impl;

import com.personalfinance.api.category.entity.Category;
import com.personalfinance.api.category.repository.CategoryRepository;
import com.personalfinance.api.payment_reminder.dto.request.CreatePaymentReminderRequest;
import com.personalfinance.api.payment_reminder.dto.request.MarkAsExpenseRequest;
import com.personalfinance.api.payment_reminder.dto.request.UpdatePaymentReminderRequest;
import com.personalfinance.api.payment_reminder.dto.response.PaymentReminderResponse;
import com.personalfinance.api.payment_reminder.entity.PaymentReminder;
import com.personalfinance.api.payment_reminder.repository.PaymentReminderRepository;
import com.personalfinance.api.payment_reminder.service.PaymentReminderService;
import com.personalfinance.api.transaction.entity.Transaction;
import com.personalfinance.api.transaction.repository.TransactionRepository;
import com.personalfinance.api.user.entity.User;
import com.personalfinance.api.user.service.CurrentUserService;
import com.personalfinance.api.wallet.entity.Wallet;
import com.personalfinance.api.wallet.repository.WalletRepository;
import com.personalfinance.api.wallet.service.WalletService;
import com.personalfinance.exception.AppException;
import com.personalfinance.exception.ErrorCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentReminderServiceImpl implements PaymentReminderService {

    private final PaymentReminderRepository paymentReminderRepository;
    private final CategoryRepository categoryRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;
    private final WalletService walletService;

    @Override
    public List<PaymentReminderResponse> getAllPaymentReminders() {
        User user = currentUserService.getCurrentUser();
        List<PaymentReminder> paymentReminders = paymentReminderRepository.findByUser(user);

        return paymentReminders.stream().map(pr
                -> PaymentReminderResponse.builder()
                        .id(pr.getId())
                        .title(pr.getTitle())
                        .amount(pr.getAmount())
                        .dueAt(pr.getDueAt())
                        .note(pr.getNote())
                        .categoryName(pr.getCategory().getName())
                        .build()
        ).toList();
    }

    @Override
    public void createPaymentReminder(CreatePaymentReminderRequest request) {
        User user = currentUserService.getCurrentUser();
        Category category = categoryRepository.findByIdAndUserAndDeletedFalse(request.getCategoryId(), user)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        PaymentReminder paymentReminder = PaymentReminder.builder()
                .title(request.getTitle())
                .amount(request.getAmount())
                .dueAt(request.getDueAt())
                .note(request.getNote())
                .user(user)
                .category(category)
                .build();

        paymentReminderRepository.save(paymentReminder);
    }

    @Override
    public void updatePaymentReminder(Integer id, UpdatePaymentReminderRequest request) {
        User user = currentUserService.getCurrentUser();
        PaymentReminder paymentReminder = paymentReminderRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_REMINDER_NOT_FOUND));

        if (request.isEmpty() && Objects.equals(request.getNote(), paymentReminder.getNote())) {
            throw new AppException(ErrorCode.NO_DATA_TO_UPDATE);
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndUserAndDeletedFalse(request.getCategoryId(), user)
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            paymentReminder.setCategory(category);
        }
        if (request.getTitle() != null) {
            paymentReminder.setTitle(request.getTitle());
        }
        if (request.getAmount() != null) {
            paymentReminder.setAmount(request.getAmount());
        }
        if (request.getDueAt() != null) {
            paymentReminder.setDueAt(request.getDueAt());
        }
        if (!Objects.equals(request.getNote(), paymentReminder.getNote())) {
            paymentReminder.setNote(request.getNote());
        }

        paymentReminderRepository.save(paymentReminder);
    }

    @Override
    @Transactional
    public void markAsExpense(Integer id, MarkAsExpenseRequest request) {
        User user = currentUserService.getCurrentUser();
        PaymentReminder paymentReminder = paymentReminderRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_REMINDER_NOT_FOUND));
        Wallet wallet = walletRepository.findByIdAndUserAndDeletedFalse(request.getWalletId(), user)
                .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_FOUND));
        Transaction transaction = Transaction.builder()
                .amount(paymentReminder.getAmount())
                .note(paymentReminder.getNote())
                .date(LocalDateTime.now())
                .user(user)
                .wallet(wallet)
                .category(paymentReminder.getCategory())
                .build();

        transactionRepository.save(transaction);
        walletService.subtractBalance(wallet, transaction.getAmount());
        paymentReminderRepository.delete(paymentReminder);
    }

    @Override
    public void deletePaymentReminder(Integer id) {
        User user = currentUserService.getCurrentUser();
        PaymentReminder paymentReminder = paymentReminderRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_REMINDER_NOT_FOUND));
        paymentReminderRepository.delete(paymentReminder);
    }
}
