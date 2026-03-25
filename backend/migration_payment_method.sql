-- ============================================================
-- Migración: Agregar campo payment_method a tablas de pagos
-- Fecha: 2026-03-24
-- Aplicar en producción (ddl-auto=none) antes de reiniciar el backend
-- ============================================================

-- Abonos a Cuentas por Cobrar (clientes)
ALTER TABLE payment_records
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) NULL;

-- Abonos a Cuentas por Pagar (proveedores)
ALTER TABLE payable_payment_records
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) NULL;

-- Gastos diarios
ALTER TABLE daily_expenses
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) NULL;

-- ============================================================
-- Tablas de auditoría Envers (si aplica)
-- ============================================================
ALTER TABLE payment_records_aud
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) NULL;

ALTER TABLE payable_payment_records_aud
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) NULL;

ALTER TABLE daily_expenses_aud
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) NULL;
