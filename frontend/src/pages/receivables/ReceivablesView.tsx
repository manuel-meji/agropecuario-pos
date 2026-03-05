import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, FileText, CheckCircle2, Clock, DollarSign, AlertTriangle, ArrowLeft } from 'lucide-react';
import { getReceivablesByClient, getClientHistory, makePayment } from '../../services/api';
import toast from 'react-hot-toast';

export default function ReceivablesView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientHistory, setClientHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await getReceivablesByClient();
      setClients(data);
    } catch (error) {
      console.error("Error loading clients receivables", error);
      toast.error("Error al cargar cuentas por cobrar");
    } finally {
      setLoading(false);
    }
  };

  const viewClientHistory = async (client: any) => {
    try {
      const history = await getClientHistory(client.clientName);
      setClientHistory(history);
      setSelectedClient(client);
      setShowHistory(true);
    } catch (error) {
      console.error("Error loading client history", error);
      toast.error("Error al cargar historial del cliente");
    }
  };

  const handlePaymentClick = (receivableId: number) => {
    setPaymentId(receivableId);
    setPaymentAmount('');
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Ingrese un monto válido");
      return;
    }
    if (!paymentId) return;
    
    try {
      await makePayment(paymentId, parseFloat(paymentAmount));
      toast.success("Pago registrado correctamente");
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentId(null);
      
      // Recargar datos
      await loadClients();
      if (selectedClient) {
        const history = await getClientHistory(selectedClient.clientName);
        setClientHistory(history);
      }
    } catch (error) {
      console.error("Error making payment", error);
      toast.error("Error al registrar pago");
    }
  };

  const filteredClients = clients.filter(c =>
    c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.clientPhone && c.clientPhone.includes(searchTerm))
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      {!showHistory ? (
        <>
          {/* Encabezado Principal */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Cuentas por Cobrar (CxC)</h2>
              <p className="text-gray-500 dark:text-gray-400">Clientes con deudas pendientes. Haz clic en uno para ver el historial de sus compras a crédito.</p>
            </div>
            <button className="liquid-btn-primary py-2 px-4 shadow-sm text-sm flex items-center justify-center gap-2 w-full md:w-auto">
              <Plus size={18} />
              Nuevo Crédito Manual
            </button>
          </div>

          {/* Controles de Filtrado */}
          <div className="liquid-glass-panel p-4 flex flex-col md:flex-row gap-4 items-center shrink-0">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por nombre de cliente o teléfono..." 
                className="liquid-input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 w-full md:w-auto justify-center text-gray-700 dark:text-gray-300">
              <Filter size={18} />
              <span>Filtros</span>
            </button>
          </div>

          {/* Lista de Clientes con Deuda */}
          <div className="liquid-glass-panel flex-1 overflow-hidden flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Cargando cuentas por cobrar...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No hay cuentas por cobrar registradas</p>
              </div>
            ) : (
              <div className="overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredClients.map((client, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => viewClientHistory(client)}
                      className="bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-agro-green/50 hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="space-y-4">
                        {/* Estado */}
                        <div>
                          {client.generalStatus === 'PAID_IN_FULL' && (
                            <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 size={12} /> Pagado
                            </span>
                          )}
                          {client.generalStatus === 'PARTIAL' && (
                            <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <DollarSign size={12} /> Pago Parcial
                            </span>
                          )}
                          {client.generalStatus === 'PENDING' && (
                            <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <Clock size={12} /> Pendiente de Pago
                            </span>
                          )}
                        </div>

                        {/* Nombre del Cliente */}
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cliente</p>
                          <p className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-agro-green transition-colors">
                            {client.clientName}
                          </p>
                          {client.clientPhone && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              📱 {client.clientPhone}
                            </p>
                          )}
                        </div>

                        {/* Totales */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Deuda Total</span>
                            <span className="font-bold text-gray-900 dark:text-white">
                              ₡{client.totalDebtAmount?.toLocaleString('es-CR', { maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Pagado</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              ₡{client.totalPaidAmount?.toLocaleString('es-CR', { maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-gray-100/50 dark:bg-gray-900/50 p-2 rounded">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Saldo Pendiente</span>
                            <span className={`font-bold text-lg ${
                              client.totalRemainingBalance?.toString() === '0' 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              ₡{client.totalRemainingBalance?.toLocaleString('es-CR', { maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        {/* Botón Ver Historial */}
                        <button className="w-full text-center py-2 bg-gradient-to-r from-agro-green to-emerald-500 text-white font-medium rounded-lg hover:shadow-lg transition-all active:scale-95">
                          Ver {client.receivables?.length || 0} Compra{client.receivables?.length !== 1 ? 's' : ''} a Crédito →
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Vista de Historial del Cliente */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setShowHistory(false);
                setSelectedClient(null);
              }}
              className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {selectedClient?.clientName}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">Historial de compras a crédito</p>
            </div>
          </div>

          {/* Resumen del Cliente */}
          <div className="grid grid-cols-3 gap-4">
            <div className="liquid-glass-panel p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Deuda Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₡{selectedClient?.totalDebtAmount?.toLocaleString('es-CR', { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="liquid-glass-panel p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Pagado</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ₡{selectedClient?.totalPaidAmount?.toLocaleString('es-CR', { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="liquid-glass-panel p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Saldo Pendiente</p>
              <p className={`text-2xl font-bold ${
                selectedClient?.totalRemainingBalance?.toString() === '0'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                ₡{selectedClient?.totalRemainingBalance?.toLocaleString('es-CR', { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Historial de Compras */}
          <div className="liquid-glass-panel flex-1 overflow-hidden flex flex-col p-4">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
              {clientHistory.length} Compra{clientHistory.length !== 1 ? 's' : ''} a Crédito
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {clientHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay compras a crédito registradas</p>
              ) : (
                clientHistory.map((receivable, index) => (
                  <motion.div
                    key={receivable.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/30 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-agro-green/50 transition-colors"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
                      {/* Factura */}
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Factura</p>
                        <p className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                          <FileText size={16} className="text-gray-400" />
                          {receivable.invoiceNumber}
                        </p>
                      </div>

                      {/* Fecha */}
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fecha</p>
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          {receivable.saleDate ? new Date(receivable.saleDate).toLocaleDateString('es-CR') : 'N/A'}
                        </p>
                      </div>

                      {/* Total */}
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</p>
                        <p className="font-bold text-gray-800 dark:text-white">
                          ₡{receivable.totalDebt?.toLocaleString('es-CR', { maximumFractionDigits: 2 })}
                        </p>
                      </div>

                      {/* Pagado */}
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pagado</p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">
                          ₡{receivable.amountPaid?.toLocaleString('es-CR', { maximumFractionDigits: 2 })}
                        </p>
                      </div>

                      {/* Pendiente */}
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pendiente</p>
                        <p className={`font-bold text-lg ${
                          receivable.remainingBalance?.toString() === '0'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          ₡{receivable.remainingBalance?.toLocaleString('es-CR', { maximumFractionDigits: 2 })}
                        </p>
                      </div>

                      {/* Estado + Botón */}
                      <div className="flex flex-col gap-2">
                        <div>
                          {receivable.status === 'PAID_IN_FULL' && (
                            <span className="inline-flex items-center gap-1 py-1 px-2 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                              <CheckCircle2 size={12} /> Pagado
                            </span>
                          )}
                          {receivable.status === 'PARTIAL' && (
                            <span className="inline-flex items-center gap-1 py-1 px-2 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              <DollarSign size={12} /> Parcial
                            </span>
                          )}
                          {receivable.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 py-1 px-2 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                              <Clock size={12} /> Pendiente
                            </span>
                          )}
                        </div>
                        {receivable.remainingBalance > 0 && (
                          <button
                            onClick={() => handlePaymentClick(receivable.id)}
                            className="text-xs bg-agro-green/20 text-agro-green hover:bg-agro-green/30 px-2 py-1 rounded transition-colors font-medium"
                          >
                            Abonar
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal de Pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-sm"
          >
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Registrar Pago</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monto a abonar (CRC)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:border-agro-green"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-1 px-4 py-2 bg-agro-green text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                >
                  Registrar Pago
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}


