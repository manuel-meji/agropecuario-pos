package com.agropecuariopos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class ClientHistoryDTO {

    private Long clientId;
    private String clientName;
    private String clientIdentification;
    private BigDecimal totalPurchases;
    private BigDecimal totalPaid;
    private BigDecimal totalPending;
    private List<PurchaseHistoryItemDTO> purchases;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class PurchaseHistoryItemDTO {

        private Long saleId;
        private String invoiceNumber;
        private LocalDateTime saleDate;
        private String paymentMethod;
        private BigDecimal amount;
        private BigDecimal amountPaid;
        private BigDecimal remainingBalance;
        private String status; // COMPLETED, PAID_IN_FULL, PARTIAL, PENDING
        private List<PurchaseItemDetailDTO> items;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class PurchaseItemDetailDTO {

        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}
