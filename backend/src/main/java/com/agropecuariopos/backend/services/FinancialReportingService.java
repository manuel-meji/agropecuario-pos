package com.agropecuariopos.backend.services;

import com.agropecuariopos.backend.dto.ProfitReportResponse;
import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.repositories.DailyExpenseRepository;
import com.agropecuariopos.backend.repositories.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FinancialReportingService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private DailyExpenseRepository dailyExpenseRepository;

    @Transactional(readOnly = true)
    public ProfitReportResponse generateProfitReport(LocalDateTime startDate, LocalDateTime endDate) {

        List<Sale> filteredSales = saleRepository.findByCreatedDateBetween(startDate, endDate);

        // Revenue Counters
        BigDecimal totalSalesRevenue = BigDecimal.ZERO;
        BigDecimal grossProfitAcc = BigDecimal.ZERO;

        for (Sale sale : filteredSales) {
            // Ignorar anuladas
            if (sale.getStatus() == Sale.SaleStatus.CANCELLED) {
                continue;
            }
            // Agrupar Sumas O(N)
            totalSalesRevenue = totalSalesRevenue.add(sale.getFinalTotal());
            grossProfitAcc = grossProfitAcc.add(sale.getTotalGrossProfit());
        }

        // Cost of Goods implicitly calculated given Gross = Rev - COG
        BigDecimal totalCOGS = totalSalesRevenue.subtract(grossProfitAcc);

        // Deductible Subtraction via JPQL aggregation native call O(1)
        BigDecimal totalDeductibleExpenses = dailyExpenseRepository.sumDeductibleExpensesBetweenDates(startDate,
                endDate);

        // Core Accounting Net Profit Math
        BigDecimal netProfit = grossProfitAcc.subtract(totalDeductibleExpenses);

        // Guard against division by zero layout
        BigDecimal netProfitMargin = BigDecimal.ZERO;
        if (totalSalesRevenue.compareTo(BigDecimal.ZERO) > 0) {
            netProfitMargin = netProfit.divide(totalSalesRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }

        return ProfitReportResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalSalesRevenue(totalSalesRevenue)
                .totalCostOfGoodsSold(totalCOGS)
                .grossProfit(grossProfitAcc)
                .totalDeductibleExpenses(totalDeductibleExpenses)
                .netProfit(netProfit)
                .netProfitMarginPercentage(netProfitMargin)
                .build();
    }
}
