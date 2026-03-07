package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.dto.SaleRequest;
import com.agropecuariopos.backend.dto.SaleResponse;
import com.agropecuariopos.backend.models.AccountReceivable;
import com.agropecuariopos.backend.models.Client;
import com.agropecuariopos.backend.models.Product;
import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.models.SaleItem;
import com.agropecuariopos.backend.repositories.AccountReceivableRepository;
import com.agropecuariopos.backend.repositories.ClientRepository;
import com.agropecuariopos.backend.repositories.ProductRepository;
import com.agropecuariopos.backend.repositories.SaleRepository;
import com.agropecuariopos.backend.dto.DeleteSaleRequest;
import com.agropecuariopos.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    @GetMapping
    public List<Sale> getAllSales() {
        return saleRepository.findAll();
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

        return new SaleResponse(
                savedSale.getId(),
                savedSale.getInvoiceNumber(),
                savedSale.getPaymentMethod().toString(),
                savedSale.getStatus().toString(),
                savedSale.getSubtotal(),
                savedSale.getTotalTax(),
                savedSale.getFinalTotal(),
                savedSale.getClientName(),
                savedSale.getCreatedDate());
    }
}
