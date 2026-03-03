package com.agropecuariopos.backend.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class ProfitReportResponse {

    // Rango evaluado
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    // Métricas Brutas
    private BigDecimal totalSalesRevenue;
    private BigDecimal totalCostOfGoodsSold; // Costos base de inventario vendido

    /**
     * GROSS PROFIT (Ganancia Bruta):
     * Ingresos por Ventas - Costos de Bienes Vendidos
     */
    private BigDecimal grossProfit;

    // Métricas Netas Operativas
    private BigDecimal totalDeductibleExpenses;

    /**
     * NET PROFIT (Ganancia Neta / Utilidad Libre):
     * Ganancia Bruta (Gross Profit) - Gastos Operacionales (Deductibles)
     */
    private BigDecimal netProfit;

    // Ratio de margen
    private BigDecimal netProfitMarginPercentage;
}
