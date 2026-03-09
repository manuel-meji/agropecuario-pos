package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.dto.SaleRequest;
import com.agropecuariopos.backend.dto.SaleResponse;
import com.agropecuariopos.backend.models.AccountReceivable;
import com.agropecuariopos.backend.models.Client;
import com.agropecuariopos.backend.models.PaymentRecord;
import com.agropecuariopos.backend.models.Product;
import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.models.SaleItem;
import com.agropecuariopos.backend.repositories.AccountReceivableRepository;
import com.agropecuariopos.backend.repositories.ClientRepository;
import com.agropecuariopos.backend.repositories.PaymentRecordRepository;
import com.agropecuariopos.backend.repositories.ProductRepository;
import com.agropecuariopos.backend.repositories.SaleRepository;
import com.agropecuariopos.backend.dto.DeleteSaleRequest;
import com.agropecuariopos.backend.security.UserDetailsImpl;
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
    private ClientRepository clientRepository;

    @Autowired
    private AccountReceivableRepository accountReceivableRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private PaymentRecordRepository paymentRecordRepository;

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
        Sale sale = new Sale();
        sale.setInvoiceNumber("FAC-POS-" + System.currentTimeMillis());
        sale.setPaymentMethod(Sale.PaymentMethod.valueOf(request.getPaymentMethod().toString()));
        sale.setStatus(Sale.SaleStatus.COMPLETED);
        sale.setSubtotal(BigDecimal.valueOf(request.getSubtotal()));
        
        // Process discount
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getTotalDiscount() != null) {
            discountAmount = request.getTotalDiscount();
        }
        sale.setTotalDiscount(discountAmount);
        
        sale.setTotalTax(BigDecimal.valueOf(request.getTax()));
        sale.setFinalTotal(BigDecimal.valueOf(request.getTotal()));
        sale.setCreatedDate(LocalDateTime.now());

        if (request.getClientId() != null) {
            Client client = clientRepository.findById(request.getClientId()).orElse(null);
            if (client != null) {
                sale.setClient(client);
                sale.setClientName(client.getName());
                sale.setClientIdentification(client.getIdentification());
            } else {
                sale.setClientName(request.getClientName());
                sale.setClientIdentification(request.getClientIdentification());
            }
        } else if (request.getClientName() != null) {
            sale.setClientName(request.getClientName());
            sale.setClientIdentification(request.getClientIdentification());
        }

        for (SaleRequest.SaleItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId()).orElseThrow();

            // Restar stock
            if (product.getStockQuantity() < itemReq.getQty()) {
                throw new RuntimeException("Stock insuficiente para: " + product.getName());
            }
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQty());
            productRepository.save(product);

            SaleItem item = new SaleItem();
            item.setProduct(product);
            item.setQuantity(itemReq.getQty());
            item.setUnitPriceAtSale(product.getSalePrice());
            item.setUnitCostAtSale(product.getPurchaseCost());
            item.setLineTotal(product.getSalePrice().multiply(BigDecimal.valueOf(itemReq.getQty())));

            item.setSale(sale);
            sale.getItems().add(item);
        }

        Sale savedSale = saleRepository.save(sale);

        // Si es crédito, crear cuenta por cobrar
        if (sale.getPaymentMethod() == Sale.PaymentMethod.CREDIT && sale.getClient() != null) {
            AccountReceivable receivable = new AccountReceivable();
            receivable.setRelatedSale(savedSale);
            receivable.setClientName(sale.getClient().getName());
            receivable.setClientPhone(sale.getClient().getPhone());
            receivable.setTotalDebt(sale.getFinalTotal());
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
}
