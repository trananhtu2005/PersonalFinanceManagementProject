package com.personalfinance.api.dashboard.service.impl;

import com.personalfinance.api.budget.dto.response.BudgetResponse;
import com.personalfinance.api.budget.service.BudgetService;
import com.personalfinance.api.category.dto.response.DashboardCategoryResponse;
import com.personalfinance.api.category.entity.CategoryType;
import com.personalfinance.api.dashboard.dto.response.DashboardResponse;
import com.personalfinance.api.dashboard.dto.response.DashboardSummaryResponse;
import com.personalfinance.api.dashboard.service.DashboardService;
import com.personalfinance.api.payment_reminder.dto.response.PaymentReminderResponse;
import com.personalfinance.api.payment_reminder.service.PaymentReminderService;
import com.personalfinance.api.saving_goal.dto.response.SavingGoalResponse;
import com.personalfinance.api.saving_goal.service.SavingGoalService;
import com.personalfinance.api.transaction.repository.projection.CategoryAmountProjection;
import com.personalfinance.api.transaction.repository.TransactionRepository;
import com.personalfinance.api.user.entity.User;
import com.personalfinance.api.user.service.CurrentUserService;
import com.personalfinance.api.wallet.dto.response.WalletResponse;
import com.personalfinance.api.wallet.repository.WalletRepository;
import com.personalfinance.api.wallet.service.WalletService;
import com.personalfinance.validator.DateInputValidator;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final BudgetService budgetService;
    private final WalletService walletService;
    private final PaymentReminderService paymentReminderService;
    private final SavingGoalService savingGoalService;
    private final CurrentUserService currentUserService;
    private final DateInputValidator dateInputValidator;

    @Override
    public DashboardResponse getDashBoard(Integer month, Integer year) {
        User user = currentUserService.getCurrentUser();
        YearMonth current = YearMonth.now();

        if (month == null) {
            month = current.getMonthValue();
        }
        if (year == null) {
            year = current.getYear();
        }

        dateInputValidator.isMonthAndYearValid(month, year);
        YearMonth selected = YearMonth.of(year, month);
        YearMonth previous = selected.minusMonths(1);
        LocalDateTime startDate = selected.atDay(1)
                .atStartOfDay();
        LocalDateTime endDate = selected.plusMonths(1)
                .atDay(1)
                .atStartOfDay();
        LocalDateTime previousStartDate = previous.atDay(1)
                .atStartOfDay();
        LocalDateTime previousEndDate = selected.atDay(1)
                .atStartOfDay();
        BigDecimal sumBalance = walletRepository.sumBalanceByUserAndDeletedFalse(user);
        BigDecimal currentExpense = transactionRepository.sumAmountByUserAndCategoryTypeAndDateRange(user,
                CategoryType.EXPENSE,
                startDate,
                endDate);
        BigDecimal previousExpense = transactionRepository.sumAmountByUserAndCategoryTypeAndDateRange(user,
                CategoryType.EXPENSE,
                previousStartDate,
                previousEndDate);
        BigDecimal expenseDifference = previousExpense.subtract(currentExpense);
        BigDecimal currentIncome = transactionRepository.sumAmountByUserAndCategoryTypeAndDateRange(user,
                CategoryType.INCOME,
                startDate,
                endDate);
        BigDecimal previousIncome = transactionRepository.sumAmountByUserAndCategoryTypeAndDateRange(user,
                CategoryType.INCOME,
                previousStartDate,
                previousEndDate);
        BigDecimal incomeDifference = previousIncome.subtract(currentIncome);
        BigDecimal currentSaving = transactionRepository.sumAmountByUserAndCategoryTypeAndDateRange(user,
                CategoryType.SAVING,
                startDate,
                endDate);
        BigDecimal previousSaving = transactionRepository.sumAmountByUserAndCategoryTypeAndDateRange(user,
                CategoryType.SAVING,
                previousStartDate,
                previousEndDate);
        BigDecimal savingDifference = previousSaving.subtract(currentSaving);
        DashboardSummaryResponse expense = DashboardSummaryResponse.builder()
                .amount(currentExpense)
                .difference(expenseDifference)
                .build();
        DashboardSummaryResponse income = DashboardSummaryResponse.builder()
                .amount(currentIncome)
                .difference(incomeDifference)
                .build();
        DashboardSummaryResponse saving = DashboardSummaryResponse.builder()
                .amount(currentSaving)
                .difference(savingDifference)
                .build();
        List<CategoryAmountProjection> categoryAmounts = transactionRepository.sumAmountGroupByCategory(user,
                CategoryType.EXPENSE,
                startDate,
                endDate);
        List<DashboardCategoryResponse> categories = categoryAmounts.stream()
                .map(c -> DashboardCategoryResponse.builder()
                .id(c.getCategoryId())
                .name(c.getCategoryName())
                .colorCode(c.getColorCode())
                .type(c.getType())
                .amount(c.getAmount())
                .build()
                ).toList();
        List<BudgetResponse> budgets = budgetService.getBudgetsByMonthAndYear(month, year);
        List<WalletResponse> wallets = walletService.getAllWallets();
        List<PaymentReminderResponse> paymentReminders = paymentReminderService.getAllPaymentReminders();
        List<SavingGoalResponse> savingGoals = savingGoalService.getInProgressSavingGoals();
        DashboardResponse response = DashboardResponse.builder()
                .month(month)
                .year(year)
                .sumBalance(sumBalance)
                .expense(expense)
                .income(income)
                .saving(saving)
                .categories(categories)
                .budgets(budgets)
                .wallets(wallets)
                .paymentReminders(paymentReminders)
                .savingGoals(savingGoals)
                .build();

        return response;
    }
}
