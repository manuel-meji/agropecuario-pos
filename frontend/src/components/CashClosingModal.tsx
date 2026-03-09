import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Printer, CheckCircle, Banknote, CreditCard, Smartphone,
  Wallet, TrendingDown, TrendingUp, ArrowUpRight,
  ReceiptText, ShieldCheck, AlertTriangle, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getCashClosingPreview, createCashClosing } from '../services/api';

interface CashClosingData {
  id: number | null;
  closingDate: string;
  closedBy: string;
  totalCash: number;
  totalCard: number;
  totalSinpe: number;
  totalCredit: number;
  totalPaymentsReceived: number;
  totalRevenue: number;
  totalDiscount: number;
  totalTax: number;
  totalGrossProfit: number;
  totalExpenses: number;
  netCash: number;
  numberOfSales: number;
  numberOfPayments: number;
  notes: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const fmt = (n: number | null | undefined) =>
  `₡${(Number(n) || 0).toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function CashClosingModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<'idle' | 'preview' | 'confirm' | 'done'>('idle');
  const [data, setData] = useState<CashClosingData | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCashClosingPreview();
      setData(result);
      setStep('preview');
    } catch {
      toast.error('Error al cargar el resumen del día.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleConfirmClose = async () => {
    setLoading(true);
    try {
      const result = await createCashClosing(notes || undefined);
      setData(result);
      setStep('done');
      toast.success('Cierre de caja registrado exitosamente.');
    } catch {
      toast.error('Error al registrar el cierre de caja.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setStep('idle');
    setData(null);
    onClose();
  };

  // Trigger load when modal opens
  if (isOpen && step === 'idle' && !loading) {
    loadPreview();
  }

  const today = new Date().toLocaleDateString('es-CR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative z-10 bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:max-h-none print:max-w-none print:fixed print:inset-0"
          >
            {/* ── Header ── */}
            <div className={`px-8 pt-7 pb-5 flex justify-between items-center shrink-0 border-b border-slate-100 dark:border-slate-800 ${step === 'done' ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${step === 'done' ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}>
                  {step === 'done' ? <CheckCircle size={24} /> : <ReceiptText size={24} />}
                </div>
                <div>
                  <h2 className={`text-xl font-black ${step === 'done' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    {step === 'done' ? '¡Cierre Registrado!' : 'Cierre de Caja'}
                  </h2>
                  <p className={`text-xs font-bold capitalize ${step === 'done' ? 'text-emerald-600' : 'text-slate-400'}`}>{today}</p>
                </div>
              </div>
              <button onClick={handleClose} className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-slate-800 transition-colors print:hidden">
                <X size={18} />
              </button>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar print:overflow-visible">
              {loading && (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Loader2 size={36} className="animate-spin text-premium-emerald" />
                  <p className="text-slate-500 font-bold text-sm">Calculando resumen del día...</p>
                </div>
              )}

              {!loading && data && (step === 'preview' || step === 'done' || step === 'confirm') && (
                <div className="p-8 space-y-6">

                  {/* ── KPI Row ────────────────────────────────────────── */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Ventas del Día', value: fmt(data.totalRevenue), sub: `${data.numberOfSales} transacciones`, icon: TrendingUp, color: 'emerald' },
                      { label: 'Efectivo Neto', value: fmt(data.netCash), sub: 'Líquido en caja', icon: Banknote, color: 'blue' },
                      { label: 'Gastos', value: fmt(data.totalExpenses), sub: 'Deducibles del día', icon: TrendingDown, color: 'rose' },
                    ].map(({ label, value, sub, icon: Icon, color }) => (
                      <div key={label} className={`bg-${color}-50 dark:bg-${color}-900/10 border border-${color}-100 dark:border-${color}-900/30 rounded-2xl p-5`}>
                        <div className="flex items-start justify-between mb-3">
                          <p className={`text-[10px] font-black text-${color}-600 dark:text-${color}-400 uppercase tracking-widest`}>{label}</p>
                          <Icon size={16} className={`text-${color}-500`} />
                        </div>
                        <p className={`text-2xl font-black text-slate-900 dark:text-white`}>{value}</p>
                        <p className={`text-[10px] text-${color}-500 font-bold mt-1`}>{sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* ── Payment Method Breakdown ────────────────────────── */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Ingresos por Método de Pago</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Efectivo', value: data.totalCash, icon: Banknote, bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', iconBg: 'bg-green-500' },
                        { label: 'Tarjeta', value: data.totalCard, icon: CreditCard, bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', iconBg: 'bg-blue-500' },
                        { label: 'SINPE Móvil', value: data.totalSinpe, icon: Smartphone, bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', iconBg: 'bg-purple-500' },
                        { label: 'Crédito', value: data.totalCredit, icon: Wallet, bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', iconBg: 'bg-amber-500' },
                      ].map(({ label, value, icon: Icon, bg, text, iconBg }) => (
                        <div key={label} className={`flex items-center gap-4 p-4 rounded-xl ${bg}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${iconBg} shrink-0`}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className={`text-[10px] font-black uppercase tracking-wider ${text}`}>{label}</p>
                            <p className={`text-lg font-black ${text}`}>{fmt(value)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Abonos ────────────────────────────────────────────── */}
                  {(Number(data.totalPaymentsReceived) > 0 || Number(data.numberOfPayments) > 0) && (
                    <div className="flex items-center gap-4 bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30 rounded-2xl p-5">
                      <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shrink-0">
                        <ArrowUpRight size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Abonos Recibidos</p>
                        <p className="font-black text-xl text-slate-900 dark:text-white">{fmt(data.totalPaymentsReceived)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-teal-500 uppercase">{data.numberOfPayments} abonos</p>
                      </div>
                    </div>
                  )}

                  {/* ── Financial Summary ─────────────────────────────────── */}
                  <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Resumen Financiero</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      {[
                        { label: 'Subtotal (sin IVA ni descuento)', value: fmt(Number(data.totalRevenue) - Number(data.totalTax) + Number(data.totalDiscount)), dimmed: true },
                        ...(Number(data.totalDiscount) > 0 ? [{ label: 'Descuentos Otorgados', value: `−${fmt(data.totalDiscount)}`, amber: true }] : []),
                        { label: 'IVA Cobrado', value: fmt(data.totalTax), dimmed: true },
                        { label: 'Total Ingresos Brutos', value: fmt(data.totalRevenue), bold: true },
                        { label: 'Abonos Recibidos', value: `+${fmt(data.totalPaymentsReceived)}`, emerald: true },
                        { label: 'Gastos Registrados', value: `−${fmt(data.totalExpenses)}`, rose: true },
                      ].map(({ label, value, dimmed, bold, amber, emerald, rose }) => (
                        <div key={label} className={`flex justify-between items-center ${bold ? 'pt-2 border-t border-slate-100 dark:border-slate-800' : ''}`}>
                          <span className={`text-sm ${dimmed ? 'text-slate-400' : bold ? 'font-black text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300 font-bold'}`}>{label}</span>
                          <span className={`font-black text-sm ${amber ? 'text-amber-600' : emerald ? 'text-emerald-600' : rose ? 'text-rose-600' : bold ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{value}</span>
                        </div>
                      ))}

                      {/* Net Cash highlight */}
                      <div className="mt-4 pt-4 border-t-2 border-slate-900 dark:border-white flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Caja Neta del Día</p>
                          <p className="text-xs text-slate-400 font-bold">Efectivo + Tarjeta + SINPE + Abonos − Gastos</p>
                        </div>
                        <p className={`text-3xl font-black ${Number(data.netCash) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmt(data.netCash)}</p>
                      </div>
                    </div>
                  </div>

                  {/* ── Notes (only in preview/confirm) ──────────────────── */}
                  {step === 'preview' && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                        Notas del Cierre (opcional)
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Observaciones, irregularidades, comentarios del cajero..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-premium-emerald/20 resize-none"
                      />
                    </div>
                  )}

                  {/* Notes display in done state */}
                  {step === 'done' && data.notes && (
                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notas</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{data.notes}</p>
                    </div>
                  )}

                  {/* Done meta */}
                  {step === 'done' && (
                    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 px-5 py-4 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                      <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Registrado en base de datos</p>
                        <p className="text-[10px] text-emerald-600 font-bold">Realizado por: {data.closedBy} · {new Date(data.closingDate).toLocaleString('es-CR')}</p>
                      </div>
                    </div>
                  )}

                  {/* Warning in preview */}
                  {step === 'preview' && (
                    <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/10 px-5 py-4 rounded-2xl border border-amber-100 dark:border-amber-800">
                      <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">
                        Al confirmar el cierre, este informe quedará guardado en la base de datos.
                        No altera las ventas registradas — es solo un corte contable del día.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Footer Actions ── */}
            <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0 print:hidden">
              {step === 'preview' && (
                <>
                  <button onClick={handleClose} className="flex-1 py-3.5 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black rounded-2xl hover:bg-slate-200 transition-colors"
                  >
                    <Printer size={16} /> Imprimir / PDF
                  </button>
                  <button
                    onClick={handleConfirmClose}
                    disabled={loading}
                    className="flex-1 btn-premium-emerald py-3.5 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Confirmar Cierre
                  </button>
                </>
              )}

              {step === 'done' && (
                <>
                  <button
                    onClick={handlePrint}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black rounded-2xl hover:bg-slate-200 transition-colors"
                  >
                    <Printer size={16} /> Imprimir / Guardar PDF
                  </button>
                  <button onClick={handleClose} className="flex-1 btn-premium-emerald py-3.5">
                    Cerrar
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
