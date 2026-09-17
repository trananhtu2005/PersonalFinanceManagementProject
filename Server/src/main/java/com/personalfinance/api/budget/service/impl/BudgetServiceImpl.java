package com.personalfinance.api.budget.service.impl;

import com.personalfinance.api.budget.dto.request.CreateBudgetRequest;
import com.personalfinance.api.budget.dto.request.UpdateBudgetRequest;
import com.personalfinance.api.budget.dto.response.BudgetResponse;
import com.personalfinance.api.budget.entity.Budget;
import com.personalfinance.api.budget.repository.BudgetRepository;
import com.personalfinance.api.budget.service.BudgetService;
import com.personalfinance.api.category.dto.response.CategoryResponse;
import com.personalfinance.api.category.entity.Category;
import com.personalfinance.api.category.entity.CategoryType;
import com.personalfinance.api.category.repository.CategoryRepository;
import com.personalfinance.api.notification.service.NotificationService;
import com.personalfinance.api.transaction.repository.TransactionRepository;
import com.personalfinance.api.user.entity.User;
import com.personalfinance.api.user.service.CurrentUserService;
import com.personalfinance.exception.AppException;
import com.personalfinance.exception.ErrorCode;
import com.personalfinance.validator.DateInputValidator;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;
    private final DateInputValidator dateInputValidator;

    @Override
    public List<BudgetResponse> getCurrentMonthBudgets() {
        User user = currentUserService.getCurrentUser();
        YearMonth current = YearMonth.now();
        List<Budget> budgets = budgetRepository.findByUserAndMonthAndYear(user, current.getMonthValue(), current.getYear());

        return budgets.stream()
                .map(b -> BudgetResponse.builder()
                .id(b.getId())
                .amount(b.getAmount())
                .spent(b.getSpent())
                .exceeded(b.isExceeded())
                .month(b.getMonth())
                .year(b.getYear())
                .categoryName(b.getCategory().getName())
                .build()
                ).toList();
    }

    @Override
    public List<BudgetResponse> getBudgetsByCategoryInYear(Integer categoryId, Integer year) {
        dateInputValidator.isYearValid(year);
        User user = currentUserService.getCurrentUser();
        Category category = categoryRepository.findByIdAndUserAndDeletedFalse(categoryId, user)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        List<Budget> budgets = budgetRepository.findByUserAndCategoryAndYearOrderByMonthAsc(user, category, year);

        return budgets.stream()
                .map(b -> BudgetResponse.builder()
                .id(b.getId())
                .amount(b.getAmount())
                .spent(b.getSpent())
                .exceeded(b.isExceeded())
                .month(b.getMonth())
                .year(b.getYear())
                .categoryName(b.getCategory().getName())
                .build()
                ).toList();
    }

    @Override
    public List<BudgetResponse> getBudgetsByMonthAndYear(Integer month, Integer year) {
        dateInputValidator.isMonthAndYearValid(month, year);
        User user = currentUserService.getCurrentUser();
        List<Budget> budgets = budgetRepository.findByUserAndMonthAndYear(user, month, year);

        return budgets.stream()
                .map(b -> BudgetResponse.builder()
                .id(b.getId())
                .amount(b.getAmount())
                .spent(b.getSpent())
                .exceeded(b.isExceeded())
                .month(b.getMonth())
                .year(b.getYear())
                .categoryName(b.getCategory().getName())
                .build()
                ).toList();
    }

    @Override
    public List<CategoryResponse> getCategoriesForSuggestion() {
        User user = currentUserService.getCurrentUser();
        YearMonth current = YearMonth.now();
        List<Category> categories = budgetRepository.findCategoriesForSuggestion(user,
                current.getMonthValue(),
                current.getYear(),
                CategoryType.EXPENSE);

        return categories.stream()
                .map(c -> CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .colorCode(c.getColor().getName())
                .type(c.getType())
                .build()
                ).toList();
    }

    @Override
    @Transactional
    public void createBudget(CreateBudgetRequest request) {
        User user = currentUserService.getCurrentUser();
        YearMonth current = YearMonth.now();
        Integer month = current.getMonthValue();
        Integer year = current.getYear();
        Category category = categoryRepository.findByIdAndUserAndDeletedFalse(request.getCategoryId(), user)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (category.getType() != CategoryType.EXPENSE) {
            throw new AppException(ErrorCode.INCOME_TYPE_REJECT);
        }
        if (budgetRepository.existsByUserAndCategoryAndMonthAndYear(user, category, month, year)) {
            throw new AppException(ErrorCode.BUDGET_ALREADY_EXISTS);
        }

        LocalDateTime startDate = current.atDay(1)
                .atStartOfDay();
        LocalDateTime endDate = current.plusMonths(1)
                .atDay(1)
                .atStartOfDay();
        BigDecimal spent = transactionRepository.sumAmountByUserAndCategoryAndDateRange(user, category, startDate, endDate);
        boolean exceeded = spent.compareTo(request.getAmount()) > 0;
        Budget budget = Budget.builder()
                .amount(request.getAmount())
                .spent(spent)
                .exceeded(exceeded)
                .month(month)
                .year(year)
                .user(user)
                .category(category)
                .build();
        budgetRepository.save(budget);

        if (exceeded) {
            notificationService.createNotification("Warning!",
                    "You have a budget that has been exceeded!",
                    user);
        }
    }

    @Override
    @Transactional
    public void updateBudget(Integer id, UpdateBudgetRequest request) {
        if (request.isEmpty()) {
            throw new AppException(ErrorCode.NO_DATA_TO_UPDATE);
        }

        User user = currentUserService.getCurrentUser();
        Budget budget = budgetRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new AppException(ErrorCode.BUDGET_NOT_FOUND));

        if (request.getAmount() != null) {
            boolean wasExceeded = budget.isExceeded();
            budget.setAmount(request.getAmount());
            boolean exceeded = budget.getSpent().compareTo(budget.getAmount()) > 0;
            budget.setExceeded(exceeded);
            YearMonth current = YearMonth.now();

            if (budget.getMonth().equals(current.getMonthValue())
                    && budget.getYear().equals(current.getYear())
                    && (!wasExceeded && exceeded)) {
                notificationService.createNotification("Warning!",
                        "You have a budget that has been exceeded!",
                        user);
            }
        }

        budgetRepository.save(budget);
    }

    @Override
    public void deleteBudget(Integer id) {
        User user = currentUserService.getCurrentUser();
        Budget budget = budgetRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() -> new AppException(ErrorCode.BUDGET_NOT_FOUND));
        budgetRepository.delete(budget);
    }

    @Override
    public void updateSpent(User user, Category category, YearMonth yearMonth) {
        Budget budget = budgetRepository.findByUserAndCategoryAndMonthAndYear(user,
                category,
                yearMonth.getMonthValue(),
                yearMonth.getYear()).orElse(null);

        if (budget == null) {
            return;
        }

        LocalDateTime startDate = yearMonth.atDay(1)
                .atStartOfDay();
        LocalDateTime endDate = yearMonth.plusMonths(1)
                .atDay(1)
                .atStartOfDay();
        BigDecimal spent = transactionRepository.sumAmountByUserAndCategoryAndDateRange(user, category, startDate, endDate);
        boolean wasExceeded = budget.isExceeded();
        budget.setSpent(spent);
        boolean exceeded = spent.compareTo(budget.getAmount()) >= 0;
        budget.setExceeded(exceeded);
        YearMonth current = YearMonth.now();

        if (!wasExceeded && exceeded && yearMonth.equals(current)) {
            notificationService.createNotification("Warning!",
                    "You have a budget that has been exceeded!",
                    user);
        }

        budgetRepository.save(budget);
    }
}
