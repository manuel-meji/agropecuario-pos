package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.dto.SaleRequest;
import com.agropecuariopos.backend.dto.SaleResponse;
import com.agropecuariopos.backend.models.AccountReceivable;

import com.agropecuariopos.backend.models.PaymentRecord;
import com.agropecuariopos.backend.models.Product;
import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.models.SaleItem;
import com.agropecuariopos.backend.repositories.AccountReceivableRepository;
import com.agropecuariopos.backend.repositories.PaymentRecordRepository;
import com.agropecuariopos.backend.repositories.ProductRepository;
import com.agropecuariopos.backend.repositories.SaleRepository;
import com.agropecuariopos.backend.dto.DeleteSaleRequest;
import com.agropecuariopos.backend.security.UserDetailsImpl;
import com.agropecuariopos.backend.models.ElectronicInvoice;
import com.agropecuariopos.backend.repositories.ElectronicInvoiceRepository;
import com.agropecuariopos.backend.services.email.InvoiceEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;


    @Autowired
    private AccountReceivableRepository accountReceivableRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private PaymentRecordRepository paymentRecordRepository;

    @Autowired
    private com.agropecuariopos.backend.services.POSSaleService posSaleService;

    @Autowired
    private ElectronicInvoiceRepository electronicInvoiceRepository;

    @Autowired
    private InvoiceEmailService invoiceEmailService;

    @GetMapping
    public List<SaleResponse> getAllSales(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<Sale> sales;
        List<PaymentRecord> payments;

        if (startDate != null && endDate != null) {
            sales = saleRepository.findByCreatedDateBetween(startDate, endDate);
            // We need to find payments between dates too.
            // I'll assume standard JpaRepository findByPaymentDateBetween exists or I'll
            // add it.
            payments = paymentRecordRepository.findAll().stream()
                    .filter(p -> p.getPaymentDate().isAfter(startDate) && p.getPaymentDate().isBefore(endDate))
                    .collect(Collectors.toList());
        } else {
            sales = saleRepository.findAll();
            payments = paymentRecordRepository.findAll();
        }

        List<SaleResponse> response = new ArrayList<>();

        // Map Sales
        for (Sale sale : sales) {
            List<String> saleCategories = sale.getItems().stream()
                    .map(item -> item.getProduct().getCategory().getName())
                    .distinct()
                    .collect(Collectors.toList());

            response.add(new SaleResponse(
                    sale.getId(),
                    sale.getInvoiceNumber(),
                    sale.getPaymentMethod().toString(),
                    sale.getStatus().toString(),
                    sale.getSubtotal(),
                    sale.getTotalTax(),
                    sale.getFinalTotal(),
                    sale.getClientName(),
                    sale.getCreatedDate(),
                    "SALE",
                    saleCategories));
        }

        // Map Payments
        for (PaymentRecord payment : payments) {
            response.add(new SaleResponse(
                    payment.getId(),
                    "ABONO-" + payment.getId() + " ("
                            + (payment.getAccountReceivable().getRelatedSale() != null
                                    ? payment.getAccountReceivable().getRelatedSale().getInvoiceNumber()
                                    : "N/A")
                            + ")",
                    "CASH",
                    "COMPLETED",
                    payment.getAmount(),
                    BigDecimal.ZERO,
                    payment.getAmount(),
                    payment.getAccountReceivable().getClientName(),
                    payment.getPaymentDate(),
                    "PAYMENT",
                    new ArrayList<>()));
        }

        // Sort by date descending
        response.sort(Comparator.comparing(SaleResponse::getCreatedDate).reversed());

        return response;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sale> getSaleById(@PathVariable Long id) {
        return saleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteSale(@PathVariable Long id, @RequestBody DeleteSaleRequest deleteRequest) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));

        // Verificar contraseña del usuario actual
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sesión inválida o no autenticada.");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        if (!encoder.matches(deleteRequest.getPassword(), userDetails.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Contraseña incorrecta. No se puede eliminar la venta.");
        }

        // Restaurar stock de productos
        for (SaleItem item : sale.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        // Eliminar cuenta por cobrar si existía
        Optional<AccountReceivable> receivable = accountReceivableRepository.findByRelatedSale(sale);
        receivable.ifPresent(accountReceivableRepository::delete);

        // Eliminar la venta
        saleRepository.delete(sale);

        return ResponseEntity.ok("Venta eliminada exitosamente");
    }

    @PostMapping
    @Transactional
    public SaleResponse createSale(@RequestBody SaleRequest request) {
        Sale savedSale = posSaleService.processNewSale(request);

        // Si es crédito, crear cuenta por cobrar
        if (savedSale.getPaymentMethod() == Sale.PaymentMethod.CREDIT && savedSale.getClient() != null) {
            AccountReceivable receivable = new AccountReceivable();
            receivable.setRelatedSale(savedSale);
            receivable.setClientName(savedSale.getClient().getName());
            receivable.setClientPhone(savedSale.getClient().getPhone());
            receivable.setTotalDebt(savedSale.getFinalTotal());
            receivable.setAmountPaid(BigDecimal.ZERO);
            receivable.setStatus(AccountReceivable.DebtStatus.PENDING);
            receivable.setDueDate(LocalDateTime.now().plusDays(30));
            accountReceivableRepository.save(receivable);
        }

        List<String> saleCategories = savedSale.getItems().stream()
                .map(item -> item.getProduct().getCategory().getName())
                .distinct()
                .collect(Collectors.toList());

        return new SaleResponse(
                savedSale.getId(),
                savedSale.getInvoiceNumber(),
                savedSale.getPaymentMethod().toString(),
                savedSale.getStatus().toString(),
                savedSale.getSubtotal(),
                savedSale.getTotalTax(),
                savedSale.getFinalTotal(),
                savedSale.getClientName(),
                savedSale.getCreatedDate(),
                "SALE",
                saleCategories);
    }

    @PostMapping("/{id}/email-receipt")
    public ResponseEntity<?> emailReceipt(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        try {
            Sale sale = saleRepository.findById(id).orElseThrow(() -> new RuntimeException("Venta no encontrada"));
            String pdfBase64 = payload.get("pdfBase64");
            
            if (sale.getClient() == null || sale.getClient().getEmail() == null || sale.getClient().getEmail().isEmpty()) {
                return ResponseEntity.badRequest().body("El cliente no tiene un correo registrado.");
            }

            Optional<ElectronicInvoice> invoice = electronicInvoiceRepository.findBySaleId(sale.getId());
            
            invoiceEmailService.sendReceiptPdf(sale, sale.getClient().getEmail(), pdfBase64, invoice.orElse(null));
            return ResponseEntity.ok("Correo enviado exitosamente.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al enviar el correo: " + e.getMessage());
        }
    }
}
