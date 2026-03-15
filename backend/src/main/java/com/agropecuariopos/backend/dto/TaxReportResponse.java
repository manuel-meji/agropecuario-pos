package com.agropecuariopos.backend.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxReportResponse {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private BigDecimal totalSalesNet; // Total ventas sin IVA
    private BigDecimal totalSalesGross; // Total ventas con IVA
    private BigDecimal totalTaxCollected; // Total IVA Recaudado
    
    private Map<String, TaxSummary> taxBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaxSummary {
        private BigDecimal netAmount;
        private BigDecimal taxAmount;
    }
}
