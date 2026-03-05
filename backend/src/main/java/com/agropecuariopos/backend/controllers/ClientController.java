package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.dto.ClientHistoryDTO;
import com.agropecuariopos.backend.models.AccountReceivable;
import com.agropecuariopos.backend.models.Client;
import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.repositories.AccountReceivableRepository;
import com.agropecuariopos.backend.repositories.ClientRepository;
import com.agropecuariopos.backend.repositories.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
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
        List<ClientHistoryDTO.PurchaseHistoryItemDTO> purchaseHistory = new ArrayList<>();

        for (Sale sale : sales) {
            totalPurchases = totalPurchases.add(sale.getFinalTotal());

            // Get associated account receivable if exists
            Optional<AccountReceivable> receivableOpt = accountReceivableRepository.findByRelatedSale(sale);
            BigDecimal amountPaid = BigDecimal.ZERO;
            String status = "COMPLETED";

            if (receivableOpt.isPresent()) {
                AccountReceivable receivable = receivableOpt.get();
                amountPaid = receivable.getAmountPaid();
                status = receivable.getStatus().toString();
                totalPaid = totalPaid.add(amountPaid);
            } else {
                // Si no hay receivable, significa que fue pagado en su totalidad al momento
                if (sale.getPaymentMethod() != Sale.PaymentMethod.CREDIT) {
                    amountPaid = sale.getFinalTotal();
                    totalPaid = totalPaid.add(amountPaid);
                }
            }

            BigDecimal remainingBalance = sale.getFinalTotal().subtract(amountPaid);

            // Build items list
            List<ClientHistoryDTO.PurchaseItemDetailDTO> items = sale.getItems().stream()
                    .map(item -> new ClientHistoryDTO.PurchaseItemDetailDTO(
                    item.getProduct().getName(),
                    item.getQuantity(),
                    item.getUnitPriceAtSale(),
                    item.getLineTotal()
            ))
                    .collect(Collectors.toList());

            ClientHistoryDTO.PurchaseHistoryItemDTO historyItem = new ClientHistoryDTO.PurchaseHistoryItemDTO(
                    sale.getId(),
                    sale.getInvoiceNumber(),
                    sale.getCreatedDate(),
                    sale.getPaymentMethod().toString(),
                    sale.getFinalTotal(),
                    amountPaid,
                    remainingBalance,
                    status,
                    items
            );

            purchaseHistory.add(historyItem);
        }

        BigDecimal totalPending = totalPurchases.subtract(totalPaid);

        return new ClientHistoryDTO(
                client.getId(),
                client.getName(),
                client.getIdentification(),
                totalPurchases,
                totalPaid,
                totalPending,
                purchaseHistory
        );
    }
}
