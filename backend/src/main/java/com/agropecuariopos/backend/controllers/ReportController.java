package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.dto.TaxReportResponse;
import com.agropecuariopos.backend.services.FinancialReportingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private FinancialReportingService financialReportingService;

    @GetMapping("/tax")
    public TaxReportResponse getTaxReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return financialReportingService.generateTaxReport(startDate, endDate);
    }
}
