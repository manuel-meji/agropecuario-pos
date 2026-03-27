import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Eye,
  Trash2,
  Receipt,
  X,
  AlertCircle,
  FileX
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getSales, getSaleById, deleteSale, issueCreditNote, getSettings } from '../../services/api';
import { generateAndDownloadTicket } from '../../utils/pdfGenerator';

export default function SalesView() {
  const [sales, setSales] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Set default date range (01 of current month to today)
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(formatDateForInput(firstDayOfMonth));
  const [endDate, setEndDate] = useState(formatDateForInput(today));

  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, SALE, PAYMENT
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('ALL');

  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<any | null>(null);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Credit Note state
  const [isCreditNoteModalOpen, setIsCreditNoteModalOpen] = useState(false);
  const [creditNoteReason, setCreditNoteReason] = useState('Anulación de comprobante');
  const [saleForCreditNote, setSaleForCreditNote] = useState<any | null>(null);
  const [isIssuingNC, setIsIssuingNC] = useState(false);

  const loadSales = async () => {
    try {
      // Convert dates to ISO string for the backend (LocalDateTime)
      const startISO = `${startDate}T00:00:00`;
      const endISO = `${endDate}T23:59:59`;

      const data = await getSales(startISO, endISO);
      const sorted = data.sort((a: any, b: any) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
      setSales(sorted);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar el historial de transacciones.');
    }
  };



  useEffect(() => {
    loadSales();
  }, [startDate, endDate]);

  const handleOpenDetails = async (sale: any) => {
    try {
      const fullSale = await getSaleById(sale.id);
      setSelectedSale(fullSale);
      setIsDetailModalOpen(true);
    } catch (error) {
      toast.error('No se pudo cargar el detalle de la venta.');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, sale: any) => {
    e.stopPropagation();
    setSaleToDelete(sale);
    setIsDeleteModalOpen(true);
    setPassword('');
  };

  const confirmDelete = async () => {
    if (!password) {
      toast.error('Por favor ingresa tu contraseña.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSale(saleToDelete.id, { password });
      toast.success('Venta eliminada correctamente.');
      setIsDeleteModalOpen(false);
      setSaleToDelete(null);
      loadSales(); // Recargar lista
    } catch (error: any) {
      const msg = error.response?.data || 'Error al eliminar la venta.';
      toast.error(typeof msg === 'string' ? msg : 'Error al eliminar la venta.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreditNoteClick = (e: React.MouseEvent, sale: any) => {
    e.stopPropagation();
    setSaleForCreditNote(sale);
    setIsCreditNoteModalOpen(true);
    setCreditNoteReason('Anulación de comprobante');
  };

  const confirmCreditNote = async () => {
    if (!creditNoteReason.trim()) {
      toast.error('Por favor ingresa una razón para la anulación.');
      return;
    }

    setIsIssuingNC(true);
    try {
      const result = await issueCreditNote(saleForCreditNote.id, creditNoteReason);
      
      if (result && result.estado === 'RECHAZADO') {
         toast.error(`Rechazado por Hacienda: ${result.mensaje || 'Error desconocido'}`);
      } else if (result && result.estado === 'ERROR_ENVIO') {
         toast.error(`Error 403 Forbidden desde Hacienda API: Sus credenciales/ambiente de Hacienda están mal configurados o la API del Ministerio le bloqueó el acceso.`);
      } else {
         toast.success('✅ ¡Nota de Crédito enviada a Hacienda correctamente!');
      }

      setIsCreditNoteModalOpen(false);
      setSaleForCreditNote(null);
      await loadSales(); // Esperamos a que recargue
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data || 'Error al emitir la Nota de Crédito. Se agotó el tiempo de espera.';
      toast.error(typeof msg === 'string' ? msg : 'Error al emitir la Nota de Crédito.');
    } finally {
      setIsIssuingNC(false);
    }
  };

  const filteredSales = sales.filter(s => {
    const matchesSearch =
      s.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || s.type === typeFilter;
    const matchesPayment = selectedPaymentMethod === 'ALL' || s.paymentMethod === selectedPaymentMethod;

    return matchesSearch && matchesType && matchesPayment;
  });

  const handleDownloadPDF = async () => {
    if (!selectedSale) return;
    try {
      const company = await getSettings();
      // Adaptar items para el generador (espera qty, product: {name, salePrice})
      const itemsForPdf = selectedSale.items.map((item: any) => ({
        qty: item.quantity,
        product: {
          name: item.product.name,
          salePrice: item.unitPriceAtSale
        }
      }));

      await generateAndDownloadTicket(selectedSale, itemsForPdf, selectedSale.client, company);
      toast.success('Factura generada correctamente.');
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el PDF.');
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full mx-auto px-4 lg:px-8 h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Receipt className="text-green-500" /> Historial de Transacciones
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Consulta todas las ventas y abonos registrados.</p>
        </div>
      </div>

      <div className="liquid-glass-panel p-3 flex flex-wrap gap-4 items-center shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por factura, cliente..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-transparent outline-none px-3 py-1 text-sm font-bold text-gray-700 dark:text-gray-300"
          >
            <option value="ALL">Todas las Transacciones</option>
            <option value="SALE">Solo Ventas</option>
            <option value="PAYMENT">Solo Abonos</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="bg-transparent outline-none px-3 py-1 text-sm font-bold text-gray-700 dark:text-gray-300"
          >
            <option value="ALL">Todo Tipo de Pago</option>
            <option value="CASH">Efectivo</option>
            <option value="CARD">Tarjeta</option>
            <option value="SINPE_MOVIL">SINPE Móvil</option>
            <option value="TRANSFER">Transferencia</option>
            <option value="CREDIT">Crédito</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex flex-col flex-1 md:flex-none">
            <span className="text-[10px] text-gray-400 uppercase font-bold ml-1 mb-1 font-sans">Desde</span>
            <input
              type="date"
              className="liquid-input text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col flex-1 md:flex-none">
            <span className="text-[10px] text-gray-400 uppercase font-bold ml-1 mb-1 font-sans">Hasta</span>
            <input
              type="date"
              className="liquid-input text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="premium-panel flex-1 overflow-hidden flex flex-col shadow-2xl shadow-black/5 dark:shadow-black/20">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 pl-6 font-semibold rounded-tl-xl w-48">N° Factura</th>
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold text-center">Método de Pago</th>
                <th className="p-4 font-semibold text-center">Fecha y Hora</th>
                <th className="p-4 font-semibold text-right">Total (CRC)</th>
                <th className="p-4 font-semibold text-center">Estado</th>
                <th className="p-4 pr-6 font-semibold text-right rounded-tr-xl">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((item, index) => (
                <motion.tr
                  initial={index < 20 ? { opacity: 0, y: 10 } : false} 
                  animate={index < 20 ? { opacity: 1, y: 0 } : false} 
                  transition={{ delay: index * 0.03 }}
                  key={`${item.type}-${item.id}`} 
                  className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors group"
                >
                  <td className="p-4 pl-6">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.invoiceNumber || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.clientName || 'Cliente General'}</span>
                      <span className={`text-[10px] font-black mt-1 px-2 py-0.5 rounded-md w-max uppercase tracking-tighter ${item.type === 'SALE' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                        }`}>
                        {item.type === 'SALE' ? 'Venta' : 'Abono'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-xs font-black px-3 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-full text-slate-600 dark:text-slate-400 uppercase tracking-tighter">
                      {item.paymentMethod === 'CREDIT' ? 'Crédito' :
                        item.paymentMethod === 'CASH' ? 'Efectivo' :
                        item.paymentMethod === 'CARD' ? 'Tarjeta' :
                        item.paymentMethod === 'SINPE_MOVIL' || item.paymentMethod === 'SIMPE_MOVIL' ? 'SINPE Móvil' : item.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-600 dark:text-slate-400 text-sm">
                        {new Date(item.createdDate).toLocaleDateString('es-CR')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {new Date(item.createdDate).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 dark:text-white">₡{item.finalTotal.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${item.status === 'CANCELLED' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' :
                      item.status === 'PENDING' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' :
                        item.status === 'PARTIAL' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                          'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                      }`}>
                      {item.status === 'CANCELLED' ? 'Cancelado' :
                        item.status === 'PENDING' ? 'Pendiente' :
                          item.status === 'PARTIAL' ? 'Parcial' : 'Completado'}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.type === 'SALE' && (
                        <>
                          <button onClick={() => handleOpenDetails(item)} className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 rounded-lg transition-colors" title="Ver detalle">
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={(e) => handleCreditNoteClick(e, item)}
                            className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 rounded-lg transition-colors"
                            title="Anular (Nota Cr)"
                          >
                            <FileX size={18} />
                          </button>
                          <button onClick={(e) => handleDeleteClick(e, item)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors" title="Eliminar">
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No hay ventas registradas o la búsqueda no encontró coincidencias.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles */}
      <AnimatePresence>
        {isDetailModalOpen && selectedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="liquid-glass-panel-solid w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-6 shadow-2xl border border-white/20"
            >
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-2xl">
                    <Receipt size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white leading-tight font-sans">Detalle de Venta</h3>
                    <p className="text-xs text-gray-500 font-bold">{selectedSale.invoiceNumber}</p>
                  </div>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 pr-1">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] text-gray-500 uppercase font-black block mb-1">Cliente</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{selectedSale.clientName || 'Cliente General'}</span>
                  </div>
                  <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] text-gray-500 uppercase font-black block mb-1">Fecha de Emisión</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{new Date(selectedSale.createdDate).toLocaleString('es-CR')}</span>
                  </div>
                </div>

                <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden mb-6">
                  <table className="w-full text-left">
                    <thead className="bg-black/5 dark:bg-white/5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3 pl-4">Producto</th>
                        <th className="p-3 text-center">Cant.</th>
                        <th className="p-3 text-right">Unitario</th>
                        <th className="p-3 pr-4 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-800">
                      {selectedSale.items?.map((item: any) => (
                        <tr key={item.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 pl-4 text-gray-800 dark:text-gray-300 font-medium">{item.product?.name}</td>
                          <td className="p-3 text-center text-gray-600 dark:text-gray-400 font-black">{item.quantity}</td>
                          <td className="p-3 text-right text-gray-600 dark:text-gray-400 font-medium">₡{item.unitPriceAtSale?.toLocaleString()}</td>
                          <td className="p-3 pr-4 text-right font-black text-gray-800 dark:text-gray-200">
                            ₡{(item.quantity * item.unitPriceAtSale)?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-black/5 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 space-y-2">
                <div className="flex justify-between text-sm text-gray-500 font-medium">
                  <span>Subtotal Gravado/Exento:</span>
                  <span>₡{selectedSale.subtotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {selectedSale.totalDiscount != null && Number(selectedSale.totalDiscount) > 0 && (
                  <div className="flex justify-between text-sm text-amber-600 dark:text-amber-400 font-black">
                    <span>Descuento Aplicado:</span>
                    <span>−₡{Number(selectedSale.totalDiscount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500 font-medium">
                  <span>Impuesto (IVA):</span>
                  <span>₡{selectedSale.totalTax?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800 items-center">
                  <span>Total Neto:</span>
                  <span className="text-green-600 dark:text-green-400 text-2xl font-black">₡{selectedSale.finalTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-600/20"
                >
                  <Receipt size={20} /> Descargar Factura (PDF)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Nota de Crédito (Anulación Electrónica) */}
      <AnimatePresence>
        {isCreditNoteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="liquid-glass-panel-solid w-full max-w-md p-8 shadow-2xl border border-amber-500/20"
            >
              <div className="flex items-center gap-4 text-amber-600 mb-6 font-bold text-2xl">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
                  <FileX size={28} />
                </div>
                Emitir Nota de Crédito
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                Esta acción emitirá una <span className="font-bold text-amber-600">Nota de Crédito</span> ante Hacienda para anular el comprobante original. 
                <br /><br />
                La venta permanecerá en el sistema pero será marcada técnicamente como anulada.
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Razón de la anulación</label>
                  <textarea
                    className="liquid-input w-full h-24 resize-none"
                    placeholder="Ej: Error en el monto, Devolución de mercadería..."
                    value={creditNoteReason}
                    onChange={(e) => setCreditNoteReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsCreditNoteModalOpen(false)}
                  className="flex-1 py-2 px-4 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmCreditNote}
                  disabled={isIssuingNC}
                  className="flex-1 py-2 px-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isIssuingNC ? 'Procesando...' : <>
                    <Receipt size={18} /> Emitir NC
                  </>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Eliminación con Contraseña */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="liquid-glass-panel-solid w-full max-w-md p-8 shadow-2xl border-2 border-red-500/20"
            >
              <div className="flex items-center gap-3 text-red-600 mb-4 font-bold text-xl">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl">
                  <AlertCircle size={28} />
                </div>
                ¿Eliminar esta venta?
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                Esta acción restaurará el stock de los productos y <span className="text-red-600 font-bold">eliminará el registro de venta permanentemente</span> de la base de datos y de Hacienda.
                <br /><br />
                Por seguridad, se requiere confirmar con tu contraseña:
              </p>

              <div className="space-y-4 mb-8">
                <div className="relative group">
                  <input
                    type="password"
                    placeholder="Escribe tu contraseña..."
                    className="liquid-input pl-6 py-5 w-full text-lg focus:ring-4 focus:ring-red-500/10 transition-all shadow-sm border-gray-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && confirmDelete()}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-2 py-3 px-6 bg-red-600 text-white rounded-2xl hover:bg-red-700 active:scale-95 shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-bold"
                >
                  {isDeleting ? 'Eliminando...' : <>
                    <Trash2 size={20} /> Confirmar Eliminación
                  </>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
