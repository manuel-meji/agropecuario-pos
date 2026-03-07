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
    private List<TransactionHistoryItemDTO> transactions;

    public enum TransactionType {
        SALE, PAYMENT
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class TransactionHistoryItemDTO {
        private Long id; // saleId or paymentId
        private String referenceNumber; // invoiceNumber or "ABONO-..."
        private LocalDateTime date;
        private String method; // paymentMethod
        private BigDecimal totalAmount;
        private BigDecimal amountPaid;
        private BigDecimal remainingBalance;
        private String status;
        private TransactionType type;
        private List<PurchaseItemDetailDTO> items; // null for payments
        private String relatedInvoice; // For payments, the invoice it was applied to
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
