package com.personalfinance.api.transaction.repository;

import com.personalfinance.api.transaction.repository.projection.CategoryAmountProjection;
import com.personalfinance.api.category.entity.Category;
import com.personalfinance.api.category.entity.CategoryType;
import com.personalfinance.api.transaction.entity.Transaction;
import com.personalfinance.api.user.entity.User;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {

    @EntityGraph(attributePaths = {"category", "wallet"})
    @Query("""
           SELECT t
           FROM Transaction t
           WHERE t.user = :user
           AND t.date >= :startDate
           AND t.date < :endDate
           AND (:categoryId IS NULL OR t.category.id = :categoryId)
           """)
    Page<Transaction> findTransactions(
            @Param("user") User user,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("categoryId") Integer categoryId,
            Pageable pageable
    );

    Optional<Transaction> findByIdAndUser(Integer id, User user);

    @Query("""
           SELECT COALESCE(SUM(t.amount), 0)
           FROM Transaction t
           WHERE t.user = :user
           AND t.category = :category
           AND t.date >= :startDate
           AND t.date < :endDate
           """)
    BigDecimal sumAmountByUserAndCategoryAndDateRange(
            @Param("user") User user,
            @Param("category") Category category,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("""
           SELECT COALESCe(SUM(t.amount), 0)
           FROM Transaction t
           JOIN t.category c
           WHERE t.user = :user
           AND c.type = :type
           AND t.date >= :startDate
           AND t.date < :endDate
           """)
    BigDecimal sumAmountByUserAndCategoryTypeAndDateRange(
            @Param("user") User user,
            @Param("type") CategoryType type,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("""
            SELECT t.category.id AS categoryId,
            t.category.name AS categoryName,
            t.category.color.name AS colorCode,
            t.category.type AS type,
            COALESCE(SUM(t.amount), 0) AS amount
            FROM Transaction t
            WHERE t.user = :user
            AND t.category.type = :categoryType
            AND t.date >= :startDate
            AND t.date < :endDate
            GROUP BY t.category.id,
            t.category.name,
            t.category.color.name,
            t.category.type
    """)
    List<CategoryAmountProjection> sumAmountGroupByCategory(
            @Param("user") User user,
            @Param("categoryType") CategoryType categoryType,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
