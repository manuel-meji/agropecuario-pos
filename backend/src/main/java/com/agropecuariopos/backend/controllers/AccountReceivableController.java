package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.dto.ClientReceivableDTO;
import com.agropecuariopos.backend.dto.AccountReceivableDetailDTO;
import com.agropecuariopos.backend.dto.AccountReceivableResponse;
import com.agropecuariopos.backend.dto.PaymentRequest;
import com.agropecuariopos.backend.models.AccountReceivable;
import com.agropecuariopos.backend.repositories.AccountReceivableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/accounts-receivable")
public class AccountReceivableController {

    @Autowired
    private AccountReceivableRepository accountReceivableRepository;

    @GetMapping
    public List<AccountReceivable> getAllReceivables() {
        return accountReceivableRepository.findAll();
    }

    @GetMapping("/by-client")
    public List<ClientReceivableDTO> getReceivablesByClient() {
        List<AccountReceivable> allReceivables = accountReceivableRepository.findAll();

        // Filtrar entradas sin nombre de cliente para evitar NullPointer en agrupación
        List<AccountReceivable> filtered = allReceivables.stream()
                .filter(ar -> ar.getClientName() != null && !ar.getClientName().trim().isEmpty())
                .collect(Collectors.toList());

        // Agrupar por clientName
        Map<String, List<AccountReceivable>> groupedByClient = filtered.stream()
                .collect(Collectors.groupingBy(AccountReceivable::getClientName));

        List<ClientReceivableDTO> result = new ArrayList<>();

        for (Map.Entry<String, List<AccountReceivable>> entry : groupedByClient.entrySet()) {
            String clientName = entry.getKey();
            List<AccountReceivable> clientReceivables = entry.getValue();

            // Calcular totales
            BigDecimal totalDebt = clientReceivables.stream()
                    .map(AccountReceivable::getTotalDebt)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalPaid = clientReceivables.stream()
                    .map(AccountReceivable::getAmountPaid)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalRemaining = totalDebt.subtract(totalPaid);

            // Determinar estado general
            String generalStatus = "PAID_IN_FULL";
            if (totalRemaining.compareTo(BigDecimal.ZERO) > 0) {
                generalStatus = "PENDING";
                // Verificar si hay pagos parciales
                if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
                    generalStatus = "PARTIAL";
                }
            }

            // Construir detalles de cada deuda
            List<AccountReceivableDetailDTO> details = clientReceivables.stream()
                    .map(ar -> new AccountReceivableDetailDTO(
                    ar.getId(),
                    ar.getRelatedSale() != null ? ar.getRelatedSale().getInvoiceNumber() : "N/A",
                    ar.getRelatedSale() != null ? ar.getRelatedSale().getCreatedDate() : null,
                    ar.getTotalDebt(),
                    ar.getAmountPaid(),
                    ar.getRemainingBalance(),
                    ar.getStatus().toString(),
                    ar.getDueDate()
            ))
                    .collect(Collectors.toList());

            // Obtener teléfono del primer registro del cliente
            String clientPhone = clientReceivables.get(0).getClientPhone();

            ClientReceivableDTO clientDTO = new ClientReceivableDTO(
                    null, // clientId - no está disponible en AccountReceivable
                    clientName,
                    clientPhone,
                    totalDebt,
                    totalPaid,
                    totalRemaining,
                    generalStatus,
                    details
            );

            result.add(clientDTO);
        }

        return result;
    }

    @GetMapping("/{clientName}/history")
    public List<AccountReceivableDetailDTO> getClientHistory(@PathVariable String clientName) {
        List<AccountReceivable> clientReceivables = accountReceivableRepository.findAll().stream()
                .filter(ar -> ar.getClientName() != null && ar.getClientName().equals(clientName))
                .collect(Collectors.toList());

        return clientReceivables.stream()
                .map(ar -> new AccountReceivableDetailDTO(
                ar.getId(),
                ar.getRelatedSale() != null ? ar.getRelatedSale().getInvoiceNumber() : "N/A",
                ar.getRelatedSale() != null ? ar.getRelatedSale().getCreatedDate() : null,
                ar.getTotalDebt(),
                ar.getAmountPaid(),
                ar.getRemainingBalance(),
                ar.getStatus().toString(),
                ar.getDueDate()
        ))
                .collect(Collectors.toList());
    }

    @PostMapping("/{id}/pay")
    public AccountReceivableResponse makePayment(@PathVariable Long id, @RequestBody PaymentRequest request) {
        AccountReceivable receivable = accountReceivableRepository.findById(id).orElseThrow();
        receivable.setAmountPaid(receivable.getAmountPaid().add(BigDecimal.valueOf(request.getAmount())));
        if (receivable.getRemainingBalance().compareTo(BigDecimal.ZERO) <= 0) {
            receivable.setStatus(AccountReceivable.DebtStatus.PAID_IN_FULL);
        } else {
            receivable.setStatus(AccountReceivable.DebtStatus.PARTIAL);
        }
        AccountReceivable saved = accountReceivableRepository.save(receivable);

        return new AccountReceivableResponse(
                saved.getId(),
                saved.getRelatedSale() != null ? saved.getRelatedSale().getInvoiceNumber() : "N/A",
                saved.getClientName(),
                saved.getClientPhone(),
                saved.getTotalDebt(),
                saved.getAmountPaid(),
                saved.getRemainingBalance(),
                saved.getStatus().toString(),
                saved.getDueDate()
        );
    }
}
