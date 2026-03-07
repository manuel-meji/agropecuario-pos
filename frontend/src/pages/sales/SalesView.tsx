import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Receipt, Calendar, Eye, Trash2, X, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSales, getSaleById, deleteSale } from '../../services/api';

export default function SalesView() {
  const [sales, setSales] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<any | null>(null);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSales = async () => {
    try {
      const data = await getSales();
      const sorted = data.sort((a: any, b: any) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
      setSales(sorted);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar el historial de ventas.');
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

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

  const filteredSales = sales.filter(s =>
    s.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Receipt className="text-green-500" /> Historial de Ventas
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Consulta todas las transacciones realizadas en el sistema.</p>
        </div>
      </div>

      <div className="liquid-glass-panel p-4 flex gap-4 items-center shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por N° Factura, cliente, o método de pago..."
            className="liquid-input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                  key={item.id}
                  className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                  onClick={() => handleOpenDetails(item)}
                >
                  <td className="p-4 font-bold text-gray-800 dark:text-gray-200">{item.invoiceNumber}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    <div className="font-medium text-gray-800 dark:text-gray-300">{item.clientName || 'Cliente Genérico'}</div>
                    {item.clientIdentification && <div className="text-xs text-gray-400">ID: {item.clientIdentification}</div>}
                  </td>
                  <td className="p-4 text-center">
                    <span className="py-1 px-3 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {item.paymentMethod === 'CASH' ? 'Efectivo' : item.paymentMethod === 'CARD' ? 'Tarjeta' : item.paymentMethod === 'CREDIT' ? 'Crédito' : item.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    {new Date(item.createdDate).toLocaleString('es-CR')}
                  </td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white text-right">
                    ₡{item.finalTotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenDetails(item); }}
                        className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, item)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors"
                        title="Eliminar venta"
                      >
                        <Trash2 size={18} />
                      </button>
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
              className="liquid-glass-panel w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                    <Receipt size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Detalle de Venta</h3>
                    <p className="text-sm text-gray-500">{selectedSale.invoiceNumber}</p>
                  </div>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar mb-6 pr-2">
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 block">Cliente:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{selectedSale.clientName || 'Genérico'}</span>
                  </div>
                  <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 block">Fecha:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{new Date(selectedSale.createdDate).toLocaleString('es-CR')}</span>
                  </div>
                </div>

                <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden mb-6">
                  <table className="w-full text-left">
                    <thead className="bg-black/5 dark:bg-white/5 text-xs text-gray-500 font-semibold">
                      <tr>
                        <th className="p-3">Producto</th>
                        <th className="p-3 text-center">Cant.</th>
                        <th className="p-3 text-right">Unitario</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-800">
                      {selectedSale.items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="p-3 text-gray-800 dark:text-gray-300 font-medium">{item.product?.name}</td>
                          <td className="p-3 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                          <td className="p-3 text-right text-gray-600 dark:text-gray-400">₡{item.unitPriceAtSale?.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold text-gray-800 dark:text-gray-200">
                            ₡{(item.quantity * item.unitPriceAtSale)?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-black/5 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal:</span>
                  <span>₡{selectedSale.subtotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>IVA (13%):</span>
                  <span>₡{selectedSale.totalTax?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
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
