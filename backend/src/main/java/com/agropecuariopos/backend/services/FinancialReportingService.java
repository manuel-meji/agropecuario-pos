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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.agropecuariopos.backend.dto.TaxReportResponse;
import com.agropecuariopos.backend.models.SaleItem;

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

    @Transactional(readOnly = true)
    public TaxReportResponse generateTaxReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<Sale> filteredSales = saleRepository.findByCreatedDateBetween(startDate, endDate);

        BigDecimal totalSalesNet = BigDecimal.ZERO;
        BigDecimal totalSalesGross = BigDecimal.ZERO;
        BigDecimal totalTaxCollected = BigDecimal.ZERO;
        Map<String, TaxReportResponse.TaxSummary> breakdown = new HashMap<>();

        // Inicializar tasas comunes
        String[] rates = {"0", "1", "2", "4", "8", "13"};
        for (String r : rates) {
            breakdown.put(r, new TaxReportResponse.TaxSummary(BigDecimal.ZERO, BigDecimal.ZERO));
        }

        for (Sale sale : filteredSales) {
            if (sale.getStatus() == Sale.SaleStatus.CANCELLED) continue;

            BigDecimal saleFinalTotal = sale.getFinalTotal() != null ? sale.getFinalTotal() : BigDecimal.ZERO;
            BigDecimal saleTotalTax = sale.getTotalTax() != null ? sale.getTotalTax() : BigDecimal.ZERO;

            totalSalesGross = totalSalesGross.add(saleFinalTotal);
            totalTaxCollected = totalTaxCollected.add(saleTotalTax);
            totalSalesNet = totalSalesNet.add(saleFinalTotal.subtract(saleTotalTax));

            if (sale.getItems() != null) {
                for (SaleItem item : sale.getItems()) {
                    BigDecimal rateVal = (item.getProduct() != null && item.getProduct().getTaxRate() != null) 
                                        ? item.getProduct().getTaxRate() : BigDecimal.ZERO;
                    String rateKey = rateVal.stripTrailingZeros().toPlainString();
                    
                    TaxReportResponse.TaxSummary summary = breakdown.getOrDefault(rateKey, 
                        new TaxReportResponse.TaxSummary(BigDecimal.ZERO, BigDecimal.ZERO));
                    
                    BigDecimal lineTotal = item.getLineTotal();
                    if (lineTotal == null) {
                        BigDecimal price = item.getUnitPriceAtSale() != null ? item.getUnitPriceAtSale() : BigDecimal.ZERO;
                        lineTotal = price.multiply(new BigDecimal(item.getQuantity() != null ? item.getQuantity() : 0));
                    }
                    BigDecimal itemTax = item.getItemTax() != null ? item.getItemTax() : BigDecimal.ZERO;
                    
                    BigDecimal net = lineTotal.subtract(itemTax);
                    summary.setNetAmount(summary.getNetAmount().add(net));
                    summary.setTaxAmount(summary.getTaxAmount().add(itemTax));
                    
                    breakdown.put(rateKey, summary);
                }
            }
        }

        return TaxReportResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalSalesNet(totalSalesNet)
                .totalSalesGross(totalSalesGross)
                .totalTaxCollected(totalTaxCollected)
                .taxBreakdown(breakdown)
                .build();
    }
}
