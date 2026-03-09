import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Eye,
  Trash2,
  Receipt,
  X,
  AlertCircle,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getSales, getSaleById, deleteSale, getCategories } from '../../services/api';

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
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<any | null>(null);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadSales();
    loadCategories();
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

  const filteredSales = sales.filter(s => {
    const matchesSearch =
      s.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || s.type === typeFilter;

    let matchesCategory = true;
    if (selectedCategory !== 'ALL') {
      if (s.type === 'SALE') {
        matchesCategory = s.categories?.includes(selectedCategory);
      } else {
        // Payments don't have categories, so if we're filtering by category,
        // we probably only want to see sales of that category.
        matchesCategory = false;
      }
    }

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)]">
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
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent outline-none px-3 py-1 text-sm font-bold text-gray-700 dark:text-gray-300"
          >
            <option value="ALL">Todas las Categorías</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
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

      <div className="liquid-glass-panel flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-semibold rounded-tl-xl w-48">N° Factura</th>
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold text-center">Método de Pago</th>
                <th className="p-4 font-semibold">Fecha y Hora</th>
                <th className="p-4 font-semibold text-right">Total (CRC)</th>
                <th className="p-4 font-semibold text-center rounded-tr-xl">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((item, index) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  key={`${item.type} -${item.id} `} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                >
                  <td className="p-6">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.invoiceNumber || 'N/A'}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.clientName || 'Cliente General'}</span>
                      <span className={`text - [10px] font - black mt - 1 px - 2 py - 0.5 rounded - md w - max uppercase tracking - tighter ${item.type === 'SALE' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                        } `}>
                        {item.type === 'SALE' ? 'Venta' : 'Abono'}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-600 dark:text-slate-400 text-sm">
                        {new Date(item.createdDate).toLocaleDateString('es-CR')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {new Date(item.createdDate).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-black px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 uppercase tracking-tighter">
                      {item.paymentMethod === 'CREDIT' ? 'Crédito' :
                        item.paymentMethod === 'CASH' ? 'Efectivo' :
                          item.paymentMethod === 'CARD' ? 'Tarjeta' :
                            item.paymentMethod === 'SINPE_MOVIL' ? 'SINPE Móvil' : item.paymentMethod}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 dark:text-white">₡{item.finalTotal.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`text - [10px] font - black px - 3 py - 1 rounded - full uppercase tracking - tighter ${item.status === 'CANCELLED' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' :
                      item.status === 'PENDING' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' :
                        item.status === 'PARTIAL' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                          'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                      } `}>
                      {item.status === 'CANCELLED' ? 'Cancelado' :
                        item.status === 'PENDING' ? 'Pendiente' :
                          item.status === 'PARTIAL' ? 'Parcial' : 'Completado'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.type === 'SALE' && (
                        <>
                          <button onClick={() => handleOpenDetails(item)} className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 rounded-lg transition-colors" title="Ver detalle">
                            <Eye size={18} />
                          </button>
                          <button onClick={(e) => handleDeleteClick(e, item)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors" title="Eliminar">
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                      {item.type === 'PAYMENT' && (
                        <span className="text-[10px] font-black text-slate-400 uppercase mr-2">Abono Registrado</span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">No hay ventas registradas o la búsqueda no encontró coincidencias.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles */}
      <AnimatePresence>
        {isDetailModalOpen && selectedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="liquid-glass-panel-solid w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">Detalle de Venta</h3>
                    <p className="text-xs text-gray-500">{selectedSale.invoiceNumber}</p>
                  </div>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar mb-3 pr-1">
                <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                  <div className="p-2 bg-black/5 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 block">Cliente:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{selectedSale.clientName || 'Genérico'}</span>
                  </div>
                  <div className="p-2 bg-black/5 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 block">Fecha:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{new Date(selectedSale.createdDate).toLocaleString('es-CR')}</span>
                  </div>
                </div>

                <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden mb-4">
                  <table className="w-full text-left">
                    <thead className="bg-black/5 dark:bg-white/5 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-2">Producto</th>
                        <th className="p-2 text-center">Cant.</th>
                        <th className="p-2 text-right">Unitario</th>
                        <th className="p-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-gray-100 dark:divide-gray-800">
                      {selectedSale.items?.map((item: any) => (
                        <tr key={item.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                          <td className="p-2 text-gray-800 dark:text-gray-300 font-medium">{item.product?.name}</td>
                          <td className="p-2 text-center text-gray-600 dark:text-gray-400 font-bold">{item.quantity}</td>
                          <td className="p-2 text-right text-gray-600 dark:text-gray-400">₡{item.unitPriceAtSale?.toLocaleString()}</td>
                          <td className="p-2 text-right font-bold text-gray-800 dark:text-gray-200">
                            ₡{(item.quantity * item.unitPriceAtSale)?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-black/5 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal:</span>
                  <span>₡{selectedSale.subtotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {selectedSale.totalDiscount != null && Number(selectedSale.totalDiscount) > 0 && (
                  <div className="flex justify-between text-xs text-amber-600 dark:text-amber-400 font-bold">
                    <span>Descuento:</span>
                    <span>−₡{Number(selectedSale.totalDiscount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>IVA:</span>
                  <span>₡{selectedSale.totalTax?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-1 border-t border-gray-100 dark:border-gray-800">
                  <span>Total Final:</span>
                  <span className="text-green-600 dark:text-green-400">₡{selectedSale.finalTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Eliminación con Contraseña */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="liquid-glass-panel w-full max-w-md p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-red-600 mb-4 font-bold text-lg">
                <AlertCircle /> ¿Eliminar esta venta?
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Esta acción restaurará el stock de los productos y eliminará el registro de venta permanentemente.
                Se requiere tu contraseña para confirmar.
              </p>

              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    placeholder="Escribe tu contraseña..."
                    className="liquid-input pl-10 w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2 px-4 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? 'Eliminando...' : <>
                    <Trash2 size={18} /> Confirmar
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
