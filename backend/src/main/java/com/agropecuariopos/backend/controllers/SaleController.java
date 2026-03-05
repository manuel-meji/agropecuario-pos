package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.models.Product;
import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.models.SaleItem;
import com.agropecuariopos.backend.models.Client;
import com.agropecuariopos.backend.repositories.ProductRepository;
import com.agropecuariopos.backend.repositories.SaleRepository;
import com.agropecuariopos.backend.repositories.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ClientRepository clientRepository;

    @GetMapping
    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    @PostMapping
    @Transactional
    public Sale createSale(@RequestBody SaleRequest request) {
        Sale sale = new Sale();
        sale.setInvoiceNumber("FAC-POS-" + System.currentTimeMillis());
        sale.setPaymentMethod(Sale.PaymentMethod.valueOf(request.getPaymentMethod()));
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

        for (SaleItemRequest itemReq : request.getItems()) {
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

        return saleRepository.save(sale);
    }
}

class SaleRequest {
    private List<SaleItemRequest> items;
    private String paymentMethod;
    private double subtotal;
    private double tax;
    private double total;
    private Long clientId;
    private String clientName;
    private String clientIdentification;

    // getters and setters
    public List<SaleItemRequest> getItems() {
        return items;
    }

    public void setItems(List<SaleItemRequest> items) {
        this.items = items;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(double subtotal) {
        this.subtotal = subtotal;
    }

    public double getTax() {
        return tax;
    }

    public void setTax(double tax) {
        this.tax = tax;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getClientIdentification() {
        return clientIdentification;
    }

    public void setClientIdentification(String clientIdentification) {
        this.clientIdentification = clientIdentification;
    }
}

class SaleItemRequest {
    private Long productId;
    private int qty;

    // getters and setters
    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public int getQty() {
        return qty;
    }

    public void setQty(int qty) {
        this.qty = qty;
    }
}
