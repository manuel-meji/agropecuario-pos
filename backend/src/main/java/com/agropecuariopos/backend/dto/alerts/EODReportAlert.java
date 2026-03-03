package com.agropecuariopos.backend.dto.alerts;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class EODReportAlert {

    private String title;
    private LocalDateTime timestamp;
    private BigDecimal totalSalesValue;
    private Integer totalTransactions;
    private Long documentsInContingency;
    private BigDecimal netProfitEstimation;
}
