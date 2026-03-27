package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.repositories.DailyExpenseRepository;
import com.agropecuariopos.backend.repositories.PaymentRecordRepository;
import com.agropecuariopos.backend.repositories.ProductRepository;
import com.agropecuariopos.backend.repositories.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired private SaleRepository saleRepository;
    @Autowired private DailyExpenseRepository expenseRepository;
    @Autowired private PaymentRecordRepository paymentRecordRepository;
    @Autowired private ProductRepository productRepository;

    /**
     * Resumen general del dashboard:
     * - KPIs de hoy (ventas, utilidad estimada, transacciones, cuentas por cobrar)
     * - Ventas de los últimos N días para la gráfica
     * - Productos con bajo stock
     * - Ventas por método de pago del día
     */
    @GetMapping("/summary")
    public Map<String, Object> getSummary(@RequestParam(defaultValue = "7") int days) {
        Map<String, Object> result = new HashMap<>();

        // ── HOY ──────────────────────────────────────────────────────────────────
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime todayEnd   = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        List<Sale> todaySales = saleRepository.findByCreatedDateBetween(todayStart, todayEnd)
                .stream().filter(s -> s.getStatus() == Sale.SaleStatus.COMPLETED).toList();

        BigDecimal todayRevenue = todaySales.stream()
                .map(s -> s.getFinalTotal() != null ? s.getFinalTotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal todayExpenses = expenseRepository.sumDeductibleExpensesBetweenDates(todayStart, todayEnd);
        if (todayExpenses == null) todayExpenses = BigDecimal.ZERO;

        BigDecimal todayDiscount = todaySales.stream()
                .map(s -> s.getTotalDiscount() != null ? s.getTotalDiscount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Utilidad estimada = ingresos - gastos deducibles (simple heuristic)
        BigDecimal estimatedProfit = todayRevenue.subtract(todayExpenses);

        // Abonos del día
        LocalDate today = LocalDate.now();
        var todayPayments = paymentRecordRepository.findByPaymentDateBetween(
                today.atStartOfDay(), today.atTime(LocalTime.MAX));
        BigDecimal todayAbonos = todayPayments.stream()
                .map(p -> p.getAmount() != null ? p.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Ventas por método de pago (hoy)
        Map<String, BigDecimal> byMethod = new LinkedHashMap<>();
        byMethod.put("CASH", BigDecimal.ZERO);
        byMethod.put("CARD", BigDecimal.ZERO);
        byMethod.put("SINPE_MOVIL", BigDecimal.ZERO);
        byMethod.put("CREDIT", BigDecimal.ZERO);
        for (Sale s : todaySales) {
            if (s.getPaymentMethod() == null) continue;
            String key = s.getPaymentMethod().name();
            // handle legacy SIMPE_MOVIL
            if (key.equals("SIMPE_MOVIL")) key = "SINPE_MOVIL";
            byMethod.merge(key, s.getFinalTotal() != null ? s.getFinalTotal() : BigDecimal.ZERO, BigDecimal::add);
        }

        // ── GRÁFICA: últimos N días ─────────────────────────────────────────────
        List<Map<String, Object>> dailyChart = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            LocalDateTime start = day.atStartOfDay();
            LocalDateTime end   = day.atTime(LocalTime.MAX);

            List<Sale> daySales = saleRepository.findByCreatedDateBetween(start, end)
                    .stream().filter(s -> s.getStatus() == Sale.SaleStatus.COMPLETED).toList();

            BigDecimal dayRevenue = daySales.stream()
                    .map(s -> s.getFinalTotal() != null ? s.getFinalTotal() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal dayExp = expenseRepository.sumDeductibleExpensesBetweenDates(start, end);
            if (dayExp == null) dayExp = BigDecimal.ZERO;

            String label = days <= 7
                    ? day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.forLanguageTag("es-CR"))
                    : String.valueOf(day.getDayOfMonth()) + "/" + day.getMonthValue();

            Map<String, Object> point = new LinkedHashMap<>();
            point.put("name", capitalize(label));
            point.put("sales", dayRevenue);
            point.put("expenses", dayExp);
            point.put("profit", dayRevenue.subtract(dayExp));
            point.put("transactions", daySales.size());
            dailyChart.add(point);
        }

        // ── PRODUCTOS BAJO STOCK ────────────────────────────────────────────────
        List<Map<String, Object>> lowStock = productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() <= 10)
                .sorted(Comparator.comparingInt(p -> p.getStockQuantity()))
                .limit(5)
                .map(p -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", p.getId());
                    m.put("name", p.getName());
                    m.put("stock", p.getStockQuantity());
                    m.put("category", p.getCategory() != null ? p.getCategory().getName() : "—");
                    return m;
                })
                .toList();

        // ── ÚLTIMAS VENTAS ──────────────────────────────────────────────────────
        List<Map<String, Object>> recentSales = saleRepository.findAll().stream()
                .filter(s -> s.getStatus() == Sale.SaleStatus.COMPLETED)
                .sorted((a, b) -> b.getCreatedDate().compareTo(a.getCreatedDate()))
                .limit(5)
                .map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", s.getId());
                    m.put("invoiceNumber", s.getInvoiceNumber());
                    m.put("client", s.getClient() != null ? s.getClient().getName() : "Contado");
                    m.put("total", s.getFinalTotal());
                    m.put("paymentMethod", s.getPaymentMethod() != null ? s.getPaymentMethod().name() : "—");
                    m.put("date", s.getCreatedDate());
                    return m;
                })
                .toList();

        // ── BUILD RESPONSE ──────────────────────────────────────────────────────
        result.put("todayRevenue", todayRevenue);
        result.put("todayExpenses", todayExpenses);
        result.put("todayDiscount", todayDiscount);
        result.put("todayTransactions", todaySales.size());
        result.put("estimatedProfit", estimatedProfit);
        result.put("todayAbonos", todayAbonos);
        result.put("paymentByMethod", byMethod);
        result.put("dailyChart", dailyChart);
        result.put("lowStockProducts", lowStock);
        result.put("recentSales", recentSales);
        result.put("totalProducts", productRepository.count());

        return result;
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
