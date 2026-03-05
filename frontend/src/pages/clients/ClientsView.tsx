import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Users, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { getClients, createClient, getClientHistoryByClientId } from '../../services/api';

export default function ClientsView() {
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<any>(null);
  const [clientHistory, setClientHistory] = useState<any>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [expandedPurchase, setExpandedPurchase] = useState<number | null>(null);
  const [newClient, setNewClient] = useState({ name: '', identification: '', email: '', phone: '', address: '' });

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar los clientes.');
    }
  };

  useEffect(() => { loadClients(); }, []);

  const handleCreate = async () => {
    if (!newClient.name) {
      toast.error('El nombre del cliente es obligatorio.');
      return;
    }
    try {
      await createClient(newClient);
      toast.success('Cliente registrado exitosamente.');
      setIsModalOpen(false);
      setNewClient({ name: '', identification: '', email: '', phone: '', address: '' });
      loadClients();
    } catch (error) {
      console.error(error);
      toast.error('Hubo un error al guardar el cliente.');
    }
  };

  const handleViewHistory = async (client: any) => {
    setSelectedClientForHistory(client);
    setIsLoadingHistory(true);
    try {
      const history = await getClientHistoryByClientId(client.id);
      setClientHistory(history);
      setIsHistoryOpen(true);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar el historial del cliente.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                             c.identification?.includes(searchTerm));

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Users className="text-blue-500" /> Directorio de Clientes
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Gestiona los clientes para asignarles ventas y créditos.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="liquid-btn-primary py-2 px-4 shadow-sm text-sm flex items-center justify-center gap-2">
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      <div className="liquid-glass-panel p-4 flex gap-4 items-center shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o cédula..." 
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
                <th className="p-4 font-semibold rounded-tl-xl">Nombre</th>
                <th className="p-4 font-semibold">Identificación</th>
                <th className="p-4 font-semibold">Teléfono</th>
                <th className="p-4 font-semibold">Correo</th>
                <th className="p-4 font-semibold">Dirección</th>
                <th className="p-4 font-semibold rounded-tr-xl">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((item, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  key={item.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{item.name}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{item.identification || '-'}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{item.phone || '-'}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{item.email || '-'}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{item.address || '-'}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleViewHistory(item)}
                      className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-medium text-sm"
                    >
                      Ver Historial
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">No hay clientes registrados o tu búsqueda no arrojó resultados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Nuevo Cliente */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <h3 className="text-lg font-bold mb-4 dark:text-white">Registrar Cliente</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Ej. Juan Pérez" required className="liquid-input w-full" value={newClient.name} onChange={(e) => setNewClient({...newClient, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cédula / NIT</label>
                  <input type="text" placeholder="Identificación..." className="liquid-input w-full" value={newClient.identification} onChange={(e) => setNewClient({...newClient, identification: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                  <input type="text" placeholder="Número..." className="liquid-input w-full" value={newClient.phone} onChange={(e) => setNewClient({...newClient, phone: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                  <input type="email" placeholder="Email..." className="liquid-input w-full" value={newClient.email} onChange={(e) => setNewClient({...newClient, email: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección Exacta</label>
                  <input type="text" placeholder="Dirección..." className="liquid-input w-full" value={newClient.address} onChange={(e) => setNewClient({...newClient, address: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">Cancelar</button>
                <button onClick={handleCreate} className="liquid-btn-primary px-4 py-2 text-sm">Registrar</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Historial de Compras */}
      <AnimatePresence>
        {isHistoryOpen && clientHistory && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{scale: 0.9, opacity: 0}} 
              animate={{scale: 1, opacity: 1}} 
              exit={{scale: 0.9, opacity: 0}}
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold dark:text-white mb-2">Historial de Compras</h3>
                  <p className="text-gray-600 dark:text-gray-400">{clientHistory.clientName} {clientHistory.clientIdentification && `(${clientHistory.clientIdentification})`}</p>
                </div>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="overflow-y-auto custom-scrollbar flex-1 p-6">
                {/* Resumen */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total en Compras</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₡{clientHistory.totalPurchases?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Pagado</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">₡{clientHistory.totalPaid?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pendiente</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">₡{clientHistory.totalPending?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                </div>

                {/* Lista de Compras */}
                <div className="space-y-3">
                  {clientHistory.purchases && clientHistory.purchases.length > 0 ? (
                    clientHistory.purchases.map((purchase: any, index: number) => (
                      <div key={purchase.saleId} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedPurchase(expandedPurchase === index ? null : index)}
                          className="w-full p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-800 dark:text-white">Factura #{purchase.invoiceNumber}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(purchase.saleDate).toLocaleDateString('es-CR')}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right mr-4">
                              <p className="font-bold text-gray-800 dark:text-white">₡{purchase.amount?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                purchase.status === 'PAID_IN_FULL' ? 'bg-green-100 text-green-700' :
                                purchase.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              } dark:bg-opacity-30`}>
                                {purchase.status === 'PAID_IN_FULL' ? 'Pagado' : purchase.status === 'PARTIAL' ? 'Parcial' : 'Pendiente'}
                              </span>
                            </div>
                            <ChevronDown 
                              size={20} 
                              className={`transition-transform ${expandedPurchase === index ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </button>

                        {/* Detalles expandidos */}
                        {expandedPurchase === index && (
                          <motion.div 
                            initial={{height: 0, opacity: 0}}
                            animate={{height: 'auto', opacity: 1}}
                            exit={{height: 0, opacity: 0}}
                            className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900"
                          >
                            <div className="mb-4 grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-gray-500">Forma de Pago</p>
                                <p className="font-semibold text-gray-800 dark:text-white capitalize">
                                  {purchase.paymentMethod === 'CASH' ? 'Efectivo' : 
                                   purchase.paymentMethod === 'CARD' ? 'Tarjeta' :
                                   purchase.paymentMethod === 'TRANSFER' ? 'Transferencia' :
                                   purchase.paymentMethod === 'CREDIT' ? 'Crédito' :
                                   purchase.paymentMethod === 'SIMPE_MOVIL' ? 'Simple Móvil' : purchase.paymentMethod}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Pagado</p>
                                <p className="font-semibold text-gray-800 dark:text-white">₡{purchase.amountPaid?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                              </div>
                              {purchase.remainingBalance > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500">Saldo Pendiente</p>
                                  <p className="font-semibold text-red-600 dark:text-red-400">₡{purchase.remainingBalance?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                </div>
                              )}
                            </div>

                            {/* Items de la compra */}
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <p className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Artículos:</p>
                              <div className="space-y-1">
                                {purchase.items?.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>{item.quantity}x {item.productName}</span>
                                    <span>₡{item.totalPrice?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 py-8">No hay compras registradas para este cliente.</p>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

