package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.dto.ClientHistoryDTO;
import com.agropecuariopos.backend.models.AccountReceivable;
import com.agropecuariopos.backend.models.Client;
import com.agropecuariopos.backend.models.PaymentRecord;
import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.repositories.AccountReceivableRepository;
import com.agropecuariopos.backend.repositories.ClientRepository;
import com.agropecuariopos.backend.repositories.PaymentRecordRepository;
import com.agropecuariopos.backend.repositories.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private AccountReceivableRepository accountReceivableRepository;

    @Autowired
    private PaymentRecordRepository paymentRecordRepository;

    @GetMapping
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    @PostMapping
    public Client createClient(@RequestBody Client client) {
        return clientRepository.save(client);
    }

    @GetMapping("/{clientId}/history")
    @Nullable
    public ClientHistoryDTO getClientHistory(@PathVariable Long clientId) {
        Optional<Client> clientOpt = clientRepository.findById(clientId);
        if (clientOpt.isEmpty()) {
            return null;
        }

        Client client = clientOpt.get();
        List<Sale> sales = saleRepository.findByClientOrderByCreatedDateDesc(client);

        BigDecimal totalPurchases = BigDecimal.ZERO;
        BigDecimal totalPaid = BigDecimal.ZERO;
        List<ClientHistoryDTO.TransactionHistoryItemDTO> transactionHistory = new ArrayList<>();

        for (Sale sale : sales) {
            totalPurchases = totalPurchases.add(sale.getFinalTotal());

            // Get associated account receivable if exists
            Optional<AccountReceivable> receivableOpt = accountReceivableRepository.findByRelatedSale(sale);
            BigDecimal amountPaid = BigDecimal.ZERO;
            String status = "PAID_IN_FULL";

            if (sale.getStatus() == Sale.SaleStatus.CANCELLED) {
                status = "CANCELLED";
                // If cancelled, we might still have a receivable but we mark it as cancelled
            } else if (receivableOpt.isPresent()) {
                AccountReceivable receivable = receivableOpt.get();
                amountPaid = receivable.getAmountPaid();
                status = receivable.getStatus().toString();
                totalPaid = totalPaid.add(amountPaid);

                // Add payments for this specific receivable
                List<PaymentRecord> payments = paymentRecordRepository
                        .findByAccountReceivableIdOrderByPaymentDateDesc(receivable.getId());
                for (PaymentRecord payment : payments) {
                    transactionHistory.add(new ClientHistoryDTO.TransactionHistoryItemDTO(
                            payment.getId(),
                            "ABONO-" + payment.getId(),
                            payment.getPaymentDate(),
                            "CASH", // Assuming cash for simple abonos
                            payment.getAmount(),
                            payment.getAmount(),
                            payment.getNewBalance(),
                            "COMPLETED",
                            ClientHistoryDTO.TransactionType.PAYMENT,
                            null,
                            sale.getInvoiceNumber()));
                }
            } else {
                // Si no hay receivable y no está cancelada, significa que fue pagada en su
                // totalidad al momento
                amountPaid = sale.getFinalTotal();
                totalPaid = totalPaid.add(amountPaid);
            }

            BigDecimal remainingBalance = sale.getFinalTotal().subtract(amountPaid);

            // Build items list
            List<ClientHistoryDTO.PurchaseItemDetailDTO> items = sale.getItems().stream()
                    .map(item -> new ClientHistoryDTO.PurchaseItemDetailDTO(
                            item.getProduct().getName(),
                            item.getQuantity(),
                            item.getUnitPriceAtSale(),
                            item.getLineTotal()))
                    .collect(Collectors.toList());

            ClientHistoryDTO.TransactionHistoryItemDTO historyItem = new ClientHistoryDTO.TransactionHistoryItemDTO(
                    sale.getId(),
                    sale.getInvoiceNumber(),
                    sale.getCreatedDate(),
                    sale.getPaymentMethod().toString(),
                    sale.getFinalTotal(),
                    amountPaid,
                    remainingBalance,
                    status,
                    ClientHistoryDTO.TransactionType.SALE,
                    items,
                    null);

            transactionHistory.add(historyItem);
        }

        // Sort all by date descending
        transactionHistory.sort(Comparator.comparing(ClientHistoryDTO.TransactionHistoryItemDTO::getDate).reversed());

        BigDecimal totalPending = totalPurchases.subtract(totalPaid);

        return new ClientHistoryDTO(
                client.getId(),
                client.getName(),
                client.getIdentification(),
                totalPurchases,
                totalPaid,
                totalPending,
                transactionHistory);
    }
}
