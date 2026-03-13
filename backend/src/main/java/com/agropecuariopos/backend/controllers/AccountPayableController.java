package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.models.AccountPayable;
import com.agropecuariopos.backend.repositories.AccountPayableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.agropecuariopos.backend.dto.PaymentRequest;
import com.agropecuariopos.backend.models.DailyExpense;
import com.agropecuariopos.backend.models.PayablePaymentRecord;
import com.agropecuariopos.backend.repositories.DailyExpenseRepository;
import com.agropecuariopos.backend.repositories.PayablePaymentRecordRepository;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/accounts-payable")
public class AccountPayableController {

    @Autowired
    private AccountPayableRepository accountPayableRepository;

    @Autowired
    private PayablePaymentRecordRepository paymentRecordRepository;

    @Autowired
    private DailyExpenseRepository dailyExpenseRepository;

    @GetMapping
    public List<AccountPayable> getAllPayables() {
        return accountPayableRepository.findAll();
    }

    @GetMapping("/supplier/{supplierName}")
    public List<AccountPayable> getPayablesBySupplier(@PathVariable String supplierName) {
        return accountPayableRepository.findBySupplierName(supplierName);
    }

    @GetMapping("/{supplierName}/history")
    public List<AccountPayable> getSupplierHistory(@PathVariable String supplierName) {
        return accountPayableRepository.findBySupplierName(supplierName);
    }

    /**
     * New: get payables by supplier ID (immutable — survives name changes).
     */
    @GetMapping("/by-supplier/{supplierId}")
    public List<AccountPayable> getPayablesBySupplierId(@PathVariable Long supplierId) {
        return accountPayableRepository.findBySupplierId(supplierId);
    }

    @GetMapping("/payments")
    public List<PayablePaymentRecord> getAllPayments() {
        return paymentRecordRepository.findAll(
                org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.DESC, "paymentDate"));
    }

    @PostMapping("/{id}/pay")
    public AccountPayable makePayment(@PathVariable Long id, @RequestBody PaymentRequest request) {
        AccountPayable payable = accountPayableRepository.findById(id).orElseThrow();

        BigDecimal previousBalance = payable.getRemainingBalance();
        BigDecimal paymentAmount = BigDecimal.valueOf(request.getAmount());

        payable.setAmountPaid(payable.getAmountPaid().add(paymentAmount));

        if (payable.getRemainingBalance().compareTo(BigDecimal.ZERO) <= 0) {
            payable.setStatus(AccountPayable.PayableStatus.PAID_IN_FULL);
        } else {
            payable.setStatus(AccountPayable.PayableStatus.PARTIAL);
        }
        AccountPayable saved = accountPayableRepository.save(payable);

        // Record the payment history
        PayablePaymentRecord record = new PayablePaymentRecord();
        record.setAccountPayable(saved);
        record.setAmount(paymentAmount);
        record.setPaymentDate(LocalDateTime.now());
        record.setPreviousBalance(previousBalance);
        record.setNewBalance(saved.getRemainingBalance());
        paymentRecordRepository.save(record);

        // Automatically create a daily expense
        DailyExpense expense = new DailyExpense();
        expense.setAmount(paymentAmount);
        expense.setCategory(DailyExpense.ExpenseCategory.OTROS);
        expense.setDescription("Pago a Proveedor: " + saved.getSupplierName());
        expense.setIsDeductibleFromProfit(true);
        expense.setRegisteredDate(LocalDateTime.now());
        dailyExpenseRepository.save(expense);

        return saved;
    }

    /** Legacy: bulk payment by supplier name (kept for backwards compatibility). */
    @PostMapping("/supplier/{supplierName}/pay")
    @Transactional
    public List<AccountPayable> makeBulkPayment(@PathVariable String supplierName,
            @RequestBody PaymentRequest request) {
        List<AccountPayable> payables = accountPayableRepository.findBySupplierName(supplierName);
        return processBulkPayment(payables, request.getAmount(), supplierName);
    }

    /**
     * New: bulk payment by supplier ID (immutable — survives name changes).
     */
    @PostMapping("/by-supplier/{supplierId}/pay")
    @Transactional
    public List<AccountPayable> makeBulkPaymentBySupplierId(@PathVariable Long supplierId,
            @RequestBody PaymentRequest request) {
        List<AccountPayable> payables = accountPayableRepository.findBySupplierId(supplierId);
        String supplierLabel = payables.isEmpty()
                ? "Proveedor #" + supplierId
                : payables.get(0).getSupplierName();
        return processBulkPayment(payables, request.getAmount(), supplierLabel);
    }

    /** Shared logic: apply a bulk payment across a list of payables (oldest-first). */
    private List<AccountPayable> processBulkPayment(List<AccountPayable> payables,
            double amountDouble, String supplierLabel) {

        payables.sort((p1, p2) -> p1.getId().compareTo(p2.getId()));

        BigDecimal remainingPayment = BigDecimal.valueOf(amountDouble);
        BigDecimal totalPaid = BigDecimal.ZERO;

        for (AccountPayable payable : payables) {
            if (remainingPayment.compareTo(BigDecimal.ZERO) <= 0)
                break;

            BigDecimal balance = payable.getRemainingBalance();
            if (balance.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal amountToApply = remainingPayment.min(balance);
                BigDecimal previousBalance = balance;

                payable.setAmountPaid(payable.getAmountPaid().add(amountToApply));
                if (payable.getRemainingBalance().compareTo(BigDecimal.ZERO) <= 0) {
                    payable.setStatus(AccountPayable.PayableStatus.PAID_IN_FULL);
                } else {
                    payable.setStatus(AccountPayable.PayableStatus.PARTIAL);
                }
                AccountPayable saved = accountPayableRepository.save(payable);

                PayablePaymentRecord record = new PayablePaymentRecord();
                record.setAccountPayable(saved);
                record.setAmount(amountToApply);
                record.setPaymentDate(LocalDateTime.now());
                record.setPreviousBalance(previousBalance);
                record.setNewBalance(saved.getRemainingBalance());
                paymentRecordRepository.save(record);

                remainingPayment = remainingPayment.subtract(amountToApply);
                totalPaid = totalPaid.add(amountToApply);
            }
        }

        // Create one daily expense for the entire bulk payment
        if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            DailyExpense expense = new DailyExpense();
            expense.setAmount(totalPaid);
            expense.setCategory(DailyExpense.ExpenseCategory.OTROS);
            expense.setDescription("Pago a Proveedor: " + supplierLabel);
            expense.setIsDeductibleFromProfit(true);
            expense.setRegisteredDate(LocalDateTime.now());
            dailyExpenseRepository.save(expense);
        }

        return payables;
    }
}
