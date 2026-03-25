import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, CheckCircle, Building2, User, Calendar, Hash, CreditCard, Banknote, Smartphone, Wallet, ArrowUpRight, Printer, Mail } from 'lucide-react';

import { Receipt } from './receipt/Receipt';
import { useReactToPrint } from 'react-to-print';
import { generateEscPosReceipt, printToEscPos } from '../utils/escposPrinter';
import { generateTicketBase64 } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';
import { sendReceiptEmail } from '../services/api';

interface CartItem { product: any; qty: number }

interface InvoiceModalProps {
  isOpen: boolean;
  saleData: any;
  cart: CartItem[];
  client?: any;
  change?: number;
  onClose: () => void;
  onDownloadPDF: () => void;
  companySettings?: any;
}


const PM_MAP: Record<string, { label: string; icon: React.ElementType }> = {
  CASH:        { label: 'Efectivo',     icon: Banknote },
  CARD:        { label: 'Tarjeta',      icon: CreditCard },
  SINPE_MOVIL: { label: 'SINPE Móvil',  icon: Smartphone },
  SIMPE_MOVIL: { label: 'SINPE Móvil',  icon: Smartphone },
  CREDIT:      { label: 'Crédito',      icon: Wallet },
  TRANSFER:    { label: 'Transferencia', icon: ArrowUpRight },
};

const fmt = (n: number) =>
  `₡${(n || 0).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function InvoiceModal({ isOpen, saleData, cart, client, change, onClose, onDownloadPDF, companySettings }: InvoiceModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Usar companySettings de las props o defaults vacíos si no viene
  const company = companySettings || {};

  // ── Cerrar con Escape o confirmar con Enter ──────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter')  onDownloadPDF();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose, onDownloadPDF]);

  const pm = saleData?.paymentMethod ? PM_MAP[saleData.paymentMethod] : null;
  const PMIcon = pm?.icon ?? Banknote;

  // Calcular totales por línea
  const isTaxExempt = company.taxExempt === true || (company.taxExempt as any) === 'true';
  const lineItems = cart.map(item => {
    const rate = isTaxExempt ? 0 : (item.product.taxRate ?? 13) / 100;
    const lineSubtotal = item.product.salePrice * item.qty;
    const lineTax = isTaxExempt ? 0 : lineSubtotal * rate;
    return { ...item, lineSubtotal, lineTax, lineTotal: lineSubtotal + lineTax, rate };
  });

  const subtotal = lineItems.reduce((a, i) => a + i.lineSubtotal, 0);
  const totalTax = isTaxExempt ? 0 : lineItems.reduce((a, i) => a + i.lineTax, 0);
  const discountAmt = saleData?.totalDiscount ?? saleData?.discountAmount ?? 0;
  const grandTotal = saleData?.finalTotal ?? saleData?.total ?? (subtotal + totalTax - discountAmt);

  const receiptRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  // Print using react-to-print (browser fallback)
  const handleBrowserPrint = useReactToPrint({
    contentRef: receiptRef,
  });

  const handlePrint = async () => {
    try {
      const mode = company.printMode || 'browser';
      if (mode === 'escpos' && company.printerName) {
        toast.loading('Enviando a impresora...', { id: 'print' });
        const text = generateEscPosReceipt(saleData, cart, client, isTaxExempt);
        await printToEscPos(text, company.printerName);
        toast.success('¡Impreso!', { id: 'print' });
      } else {
        handleBrowserPrint();
      }
    } catch (err) {
      toast.error('Error al imprimir. Revisa la consola o configuración.', { id: 'print' });
      console.error(err);
    }
  };

  const handleSendEmail = async () => {
    if (!client?.email) {
      toast.error('El cliente no tiene un correo configurado.');
      return;
    }
    
    setIsSending(true);
    const toastId = toast.loading('Generando PDF y enviando correo...');
    try {
      const pdfBase64 = await generateTicketBase64(saleData, cart, client, { ...company, taxExempt: isTaxExempt });
      await sendReceiptEmail(saleData.id, pdfBase64);
      toast.success('¡Correo enviado exitosamente!', { id: toastId });
    } catch (e: any) {
      toast.error('Error al enviar el correo: ' + (e?.response?.data || e.message), { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  const receiptData = {
      businessName: company.businessName || 'Mi Empresa',
      sellerName: company.cashierName || 'Vendedor no asignado',
      businessId: company.legalId || '',
      businessEmail: company.email,
      businessPhone: company.phone,
      businessAddress: company.address,
      docType: saleData?.invoiceNumber ? 'Factura Electronica' : 'Tiquete de Venta',
      date: new Date().toLocaleString('es-CR'),
      clientName: client?.name || 'Consumidor Final',
      clientId: client?.identification || '',
      clientAddress: client?.address,
      clientPhone: client?.phone,
      clientEmail: client?.email,
      invoiceNumber: saleData?.invoiceNumber || saleData?.id?.toString() || '',
      consecutive: saleData?.consecutive || saleData?.invoiceNumber || '',
      key: '',
      sellerId: '',
      invoiceCondition: 'Contado',
      items: cart.map(i => ({
         quantity: i.qty,
         description: i.product.name,
         unitPrice: i.product.salePrice,
         total: i.product.salePrice * i.qty,
         taxCode: isTaxExempt || (i.product.taxRate ?? 13) === 0 ? 'E' : `G${i.product.taxRate ?? 13}`
      })),
      subTotal: subtotal,
      discount: discountAmt,
      iva: totalTax,
      total: grandTotal,
      change: change || 0,
      resolutionText: ''
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="relative z-10 bg-white dark:bg-slate-950 rounded-[28px] w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: 'min(92vh, 800px)' }}
          >
            {/* ── Header verde ── */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-8 pt-8 pb-10 text-white relative overflow-hidden shrink-0">
              {/* Deco circles */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -bottom-12 -left-6 w-40 h-40 bg-white/5 rounded-full" />

              <div className="flex items-start justify-between relative">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={18} className="text-emerald-200" />
                    <span className="text-emerald-200 text-xs font-bold uppercase tracking-widest">Venta Completada</span>
                  </div>
                  <h2 className="text-2xl font-black leading-tight">{company.businessName || 'Mi Empresa'}</h2>
                  <p className="text-emerald-200 text-xs font-medium mt-0.5">{company.province}{company.address ? ` · ${company.address}` : ''}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Invoice meta */}
              <div className="flex flex-wrap gap-4 mt-6 relative">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold">
                  <Hash size={12} className="text-emerald-200" />
                  {saleData?.invoiceNumber || '—'}
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold">
                  <Calendar size={12} className="text-emerald-200" />
                  {new Date().toLocaleString('es-CR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                {pm && (
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold">
                    <PMIcon size={12} className="text-emerald-200" />
                    {pm.label}
                  </div>
                )}
              </div>
            </div>

            {/* ── Body scrollable ── */}
            <div ref={contentRef} className="flex-1 overflow-y-auto custom-scrollbar">

              {/* Cambio / vuelto */}
              {change !== undefined && change > 0 && (
                <div className="mx-8 mt-6 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-5 py-4">
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Vuelto al cliente</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{fmt(change)}</span>
                </div>
              )}

              {/* Empresa + Cliente */}
              <div className="grid grid-cols-2 gap-4 px-8 mt-6">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 size={14} className="text-emerald-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Emisor</span>
                  </div>
                  <p className="font-black text-sm text-slate-900 dark:text-white">{company.businessName || 'Mi Empresa'}</p>
                  {company.legalId && <p className="text-xs text-slate-500 mt-0.5">Cédula: {company.legalId}</p>}
                  {company.phone && <p className="text-xs text-slate-500">{company.phone}</p>}
                  {company.email && <p className="text-xs text-slate-500">{company.email}</p>}
                  {company.address && <p className="text-xs text-slate-500 truncate">{company.address}</p>}
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Receptor</span>
                  </div>
                  {client ? (
                    <>
                      <p className="font-black text-sm text-slate-900 dark:text-white">{client.name}</p>
                      {client.identification && <p className="text-xs text-slate-500 mt-0.5">Cédula: {client.identification}</p>}
                      {client.email && <p className="text-xs text-slate-500">{client.email}</p>}
                      {client.phone && <p className="text-xs text-slate-500">{client.phone}</p>}
                    </>
                  ) : (
                    <>
                      <p className="font-black text-sm text-slate-900 dark:text-white">Cliente Genérico</p>
                      <p className="text-xs text-slate-500 mt-0.5">Venta de Contado</p>
                    </>
                  )}
                </div>
              </div>

              {/* Líneas de productos */}
              <div className="px-8 mt-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Detalle de Productos</p>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {/* Encabezado tabla */}
                  <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                    <span>Descripción</span>
                    <span className="text-right">Cant.</span>
                    <span className="text-right">P.Unit</span>
                    <span className="text-right">IVA</span>
                    <span className="text-right">Total</span>
                  </div>
                  {/* Filas */}
                  {lineItems.map((item, idx) => (
                    <div
                      key={item.product.id}
                      className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 px-4 py-3 text-sm items-center ${
                        idx < lineItems.length - 1 ? 'border-b border-slate-100 dark:border-slate-800/60' : ''
                      }`}
                    >
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs leading-tight line-clamp-2">{item.product.name}</p>
                        {item.product.internalCode && (
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.product.internalCode}</p>
                        )}
                      </div>
                      <span className="text-right font-bold text-slate-700 dark:text-slate-300 text-xs">{item.qty}</span>
                      <span className="text-right font-bold text-slate-700 dark:text-slate-300 text-xs">{fmt(item.product.salePrice)}</span>
                      <span className={`text-right font-black text-xs px-1.5 py-0.5 rounded-lg ${
                        item.rate === 0 ? 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                        : item.rate <= 0.01 ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                      }`}>
                        {(item.rate * 100).toFixed(0)}%
                      </span>
                      <span className="text-right font-black text-slate-900 dark:text-white text-xs">{fmt(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="px-8 mt-4 mb-2">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-bold">Subtotal (sin IVA)</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{fmt(subtotal)}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-600 font-bold">Descuento aplicado</span>
                      <span className="font-bold text-amber-600">− {fmt(discountAmt)}</span>
                    </div>
                  )}
                  {!isTaxExempt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-bold">IVA (según tarifa)</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{fmt(totalTax)}</span>
                  </div>
                  )}
                  {isTaxExempt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-bold italic">Exento de IVA (Régimen Simplificado)</span>
                    <span className="font-bold text-emerald-600">₡0,00</span>
                  </div>
                  )}
                  <div className="h-px bg-slate-200 dark:bg-slate-800" />
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-900 dark:text-white text-base">Total</span>
                    <span className="font-black text-emerald-600 text-2xl">{fmt(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Nota */}
              <p className="px-8 pb-6 mt-3 text-center text-[10px] text-slate-400 font-bold">
                Este documento es un comprobante electrónico alterno. • {company.businessName || 'Mi Empresa'}{company.phone ? ` • ${company.phone}` : ''}
              </p>
            </div>

            {/* ── Footer de acciones ── */}
            <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0 flex gap-3 flex-wrap">
              <button
                onClick={handlePrint}
                className="flex-[2] btn-premium-emerald py-3.5 flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Imprimir Tiquete
              </button>
              
              <button
                onClick={handleSendEmail}
                disabled={isSending || !client?.email}
                className="flex-1 py-3.5 text-sm font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Mail size={16} /> {isSending ? 'Enviando...' : 'Enviar'}
              </button>

              <button
                onClick={onDownloadPDF}
                className="flex-[1.5] py-3.5 text-sm font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <Download size={16} /> Descargar PDF
              </button>

              <button
                onClick={onClose}
                className="flex-1 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
              >
                Cerrar
              </button>
            </div>
            
            {/* Hidden Receipt for PDF/Print */}
            <div style={{ display: 'none' }}>
                <div ref={receiptRef}>
                    <Receipt data={receiptData} />
                </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
