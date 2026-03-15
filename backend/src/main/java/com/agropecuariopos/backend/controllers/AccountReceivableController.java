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
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

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
                                                        ar.getRelatedSale() != null
                                                                        ? ar.getRelatedSale().getInvoiceNumber()
                                                                        : "N/A",
                                                        ar.getRelatedSale() != null
                                                                        ? ar.getRelatedSale().getCreatedDate()
                                                                        : null,
                                                        ar.getTotalDebt(),
                                                        ar.getAmountPaid(),
                                                        ar.getRemainingBalance(),
                                                        ar.getStatus().toString(),
                                                        ar.getDueDate()))
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
                                        details);

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
                                                ar.getRelatedSale() != null ? ar.getRelatedSale().getInvoiceNumber()
                                                                : "N/A",
                                                ar.getRelatedSale() != null ? ar.getRelatedSale().getCreatedDate()
                                                                : null,
                                                ar.getTotalDebt(),
                                                ar.getAmountPaid(),
                                                ar.getRemainingBalance(),
                                                ar.getStatus().toString(),
                                                ar.getDueDate()))
                                .collect(Collectors.toList());
        }

        @Autowired
        private com.agropecuariopos.backend.repositories.PaymentRecordRepository paymentRecordRepository;

        @GetMapping("/payments")
        public List<com.agropecuariopos.backend.dto.PaymentRecordDTO> getAllPayments() {
                return paymentRecordRepository
                                .findAll(org.springframework.data.domain.Sort
                                                .by(org.springframework.data.domain.Sort.Direction.DESC, "paymentDate"))
                                .stream()
                                .map(p -> new com.agropecuariopos.backend.dto.PaymentRecordDTO(
                                                p.getId(),
                                                p.getAccountReceivable().getId(),
                                                p.getAccountReceivable().getClientName(),
                                                p.getAccountReceivable().getRelatedSale() != null
                                                                ? p.getAccountReceivable().getRelatedSale()
                                                                                .getInvoiceNumber()
                                                                : "N/A",
                                                p.getAmount(),
                                                p.getPaymentDate(),
                                                p.getPreviousBalance(),
                                                p.getNewBalance()))
                                .collect(Collectors.toList());
        }

        @PostMapping("/{id}/pay")
        @Transactional
        public AccountReceivableResponse makePayment(@PathVariable Long id, @RequestBody PaymentRequest request) {
                AccountReceivable receivable = accountReceivableRepository.findById(id).orElseThrow();

                BigDecimal previousBalance = receivable.getRemainingBalance();
                BigDecimal paymentAmount = BigDecimal.valueOf(request.getAmount());

                if (paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
                        throw new IllegalArgumentException("Monto de pago inválido");
                }

                if (paymentAmount.compareTo(previousBalance) > 0) {
                        throw new IllegalArgumentException("El abono no puede ser mayor que el saldo pendiente (₡" + previousBalance + ")");
                }

                receivable.setAmountPaid(receivable.getAmountPaid().add(paymentAmount));

                if (receivable.getRemainingBalance().compareTo(BigDecimal.ZERO) <= 0) {
                        receivable.setStatus(AccountReceivable.DebtStatus.PAID_IN_FULL);
                } else {
                        receivable.setStatus(AccountReceivable.DebtStatus.PARTIAL);
                }
                AccountReceivable saved = accountReceivableRepository.save(receivable);

                com.agropecuariopos.backend.models.PaymentRecord record = new com.agropecuariopos.backend.models.PaymentRecord();
                record.setAccountReceivable(saved);
                record.setAmount(paymentAmount);
                record.setPaymentDate(java.time.LocalDateTime.now());
                record.setPreviousBalance(previousBalance);
                record.setNewBalance(saved.getRemainingBalance());
                paymentRecordRepository.save(record);

                return new AccountReceivableResponse(
                                saved.getId(),
                                saved.getRelatedSale() != null ? saved.getRelatedSale().getInvoiceNumber() : "N/A",
                                saved.getClientName(),
                                saved.getClientPhone(),
                                saved.getTotalDebt(),
                                saved.getAmountPaid(),
                                saved.getRemainingBalance(),
                                saved.getStatus().toString(),
                                saved.getDueDate());
        }

        @PostMapping("/client/{clientName}/pay")
        @Transactional
        public org.springframework.http.ResponseEntity<?> makeClientBulkPayment(@PathVariable String clientName, @RequestBody PaymentRequest request) {
                List<AccountReceivable> clientReceivables = accountReceivableRepository.findAll().stream()
                                .filter(ar -> ar.getClientName() != null && ar.getClientName().equals(clientName) && ar.getRemainingBalance().compareTo(BigDecimal.ZERO) > 0)
                                .sorted(Comparator.comparing(AccountReceivable::getId))
                                .collect(Collectors.toList());

                BigDecimal remainingPayment = BigDecimal.valueOf(request.getAmount());

                if (remainingPayment.compareTo(BigDecimal.ZERO) <= 0) {
                        throw new IllegalArgumentException("Monto de pago inválido");
                }

                BigDecimal totalPending = clientReceivables.stream()
                                .map(AccountReceivable::getRemainingBalance)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                if (remainingPayment.compareTo(totalPending) > 0) {
                        throw new IllegalArgumentException("El abono no puede ser mayor que la deuda total consolidada (₡" + totalPending + ")");
                }

                for (AccountReceivable receivable : clientReceivables) {
                        if (remainingPayment.compareTo(BigDecimal.ZERO) <= 0) break;

                        BigDecimal balance = receivable.getRemainingBalance();
                        if (balance.compareTo(BigDecimal.ZERO) > 0) {
                                BigDecimal amountToApply = remainingPayment.min(balance);
                                BigDecimal previousBalance = balance;

                                receivable.setAmountPaid(receivable.getAmountPaid().add(amountToApply));
                                
                                if (receivable.getRemainingBalance().compareTo(BigDecimal.ZERO) <= 0) {
                                        receivable.setStatus(AccountReceivable.DebtStatus.PAID_IN_FULL);
                                } else {
                                        receivable.setStatus(AccountReceivable.DebtStatus.PARTIAL);
                                }
                                
                                AccountReceivable saved = accountReceivableRepository.save(receivable);

                                com.agropecuariopos.backend.models.PaymentRecord record = new com.agropecuariopos.backend.models.PaymentRecord();
                                record.setAccountReceivable(saved);
                                record.setAmount(amountToApply);
                                record.setPaymentDate(java.time.LocalDateTime.now());
                                record.setPreviousBalance(previousBalance);
                                record.setNewBalance(saved.getRemainingBalance());
                                paymentRecordRepository.save(record);

                                remainingPayment = remainingPayment.subtract(amountToApply);
                        }
                }

                return org.springframework.http.ResponseEntity.ok(Collections.singletonMap("message", "Abono masivo procesado exitosamente"));
        }
}
