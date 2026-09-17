package com.personalfinance.api.budget.repository;

import com.personalfinance.api.budget.entity.Budget;
import com.personalfinance.api.category.entity.Category;
import com.personalfinance.api.category.entity.CategoryType;
import com.personalfinance.api.user.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BudgetRepository extends JpaRepository<Budget, Integer> {

    boolean existsByUserAndCategoryAndMonthAndYear(User user, Category category, Integer month, Integer year);

    @EntityGraph(attributePaths = "category")
    List<Budget> findByUserAndMonthAndYear(User user, Integer month, Integer year);

    @EntityGraph(attributePaths = "category")
    List<Budget> findByUserAndCategoryAndYearOrderByMonthAsc(User user, Category category, Integer year);

    Optional<Budget> findByIdAndUser(Integer id, User user);

    Optional<Budget> findByUserAndCategoryAndMonthAndYear(User user, Category category, Integer month, Integer year);

    @Query("""
           SELECT c
           FROM Category c
           WHERE c.user = :user
           AND c.deleted = false
           AND c.type = :type
           AND NOT EXISTS (
               SELECT b.id
               FROM Budget b
               WHERE b.user = :user
               AND b.category = c
               AND b.month = :month
               AND b.year = :year
           )
           """)
    List<Category> findCategoriesForSuggestion(
            @Param("user") User user,
            @Param("month") Integer month,
            @Param("year") Integer year,
            @Param("type") CategoryType type
    );
}
