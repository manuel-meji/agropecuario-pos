import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Users, X, ChevronDown, Phone, Mail, MapPin, Hash, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { getClients, createClient, getClientHistoryByClientId } from '../../services/api';

export default function ClientsView() {
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [clientHistory, setClientHistory] = useState<any>(null);
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
    try {
      const history = await getClientHistoryByClientId(client.id);
      setClientHistory(history);
      setIsHistoryOpen(true);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar el historial del cliente.');
    }
  };

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                              c.identification?.includes(searchTerm));

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Directorio de Clientes</h2>
          <p className="text-slate-500 font-medium">Gestiona los clientes para asignarles ventas y créditos.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-premium-emerald flex items-center justify-center gap-2">
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      <div className="premium-panel p-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o cédula..." 
            className="w-full bg-transparent border-none rounded-2xl px-14 py-4 focus:ring-0 outline-none text-slate-800 dark:text-white placeholder:text-slate-400 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 premium-panel overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="p-6">Nombre</th>
                <th className="p-6">Identificación</th>
                <th className="p-6">Contacto</th>
                <th className="p-6">Dirección</th>
                <th className="p-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((item, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  key={item.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-premium-emerald/10 group-hover:text-premium-emerald transition-colors">
                        <Users size={20} />
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-2">
                       <Hash size={14} className="text-slate-300" />
                       {item.identification || 'N/A'}
                    </div>
                  </td>
                  <td className="p-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <div className="space-y-1">
                       {item.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-slate-300" /> {item.phone}</div>}
                       {item.email && <div className="flex items-center gap-2 text-xs opacity-70"><Mail size={14} className="text-slate-300" /> {item.email}</div>}
                       {!item.phone && !item.email && '-'}
                    </div>
                  </td>
                  <td className="p-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <div className="flex items-start gap-2 max-w-[200px] truncate">
                       <MapPin size={14} className="text-slate-300 mt-1 shrink-0" />
                       {item.address || 'No registrada'}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button
                      onClick={() => handleViewHistory(item)}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Ver Historial
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                    <td colSpan={6} className="p-20 text-center text-slate-400">
                       <div className="flex flex-col items-center">
                          <Users size={48} className="mb-4 opacity-20" />
                          <p className="font-bold">No hay clientes registrados</p>
                       </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Modal: Create Client */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-[40px] p-10 w-full max-w-xl shadow-2xl relative z-10 overflow-hidden">
              <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-premium-emerald/10 blur-[60px] rounded-full"></div>
              <h3 className="text-2xl font-black mb-1 text-slate-900 dark:text-white relative">Registrar Cliente</h3>
              <p className="text-slate-500 text-sm mb-8 relative font-medium">Completa la información para el directorio principal.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8 relative">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre Completo</label>
                  <input type="text" placeholder="Ej. Juan Pérez" className="premium-input w-full" value={newClient.name} onChange={(e) => setNewClient({...newClient, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Cédula / Identificación</label>
                  <input type="text" placeholder="0-0000-0000" className="premium-input w-full" value={newClient.identification} onChange={(e) => setNewClient({...newClient, identification: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Teléfono Movil</label>
                  <input type="text" placeholder="+506 ...." className="premium-input w-full" value={newClient.phone} onChange={(e) => setNewClient({...newClient, phone: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Correo Electrónico</label>
                  <input type="email" placeholder="cliente@correo.com" className="premium-input w-full" value={newClient.email} onChange={(e) => setNewClient({...newClient, email: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Dirección Exacta</label>
                  <input type="text" placeholder="Provincia, Cantón..." className="premium-input w-full" value={newClient.address} onChange={(e) => setNewClient({...newClient, address: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4 relative">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">Cancelar</button>
                <button onClick={handleCreate} className="flex-1 btn-premium-emerald py-4">Confirmar Registro</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern Modal: Client History */}
      <AnimatePresence>
        {isHistoryOpen && clientHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsHistoryOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-4xl shadow-2xl flex flex-col max-h-[85vh] relative z-10 overflow-hidden"
            >
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-100 dark:border-blue-800">
                     <History size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Expediente del Cliente</h3>
                    <p className="text-slate-500 font-medium">{clientHistory.clientName} {clientHistory.clientIdentification && `(${clientHistory.clientIdentification})`}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="overflow-y-auto custom-scrollbar flex-1 p-10 space-y-10">
                {/* Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="premium-panel p-6 bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Total Consumido</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">₡{clientHistory.totalPurchases?.toLocaleString()}</p>
                  </div>
                  <div className="premium-panel p-6 bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30">
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Total Pagado</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">₡{clientHistory.totalPaid?.toLocaleString()}</p>
                  </div>
                  <div className="premium-panel p-6 bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30">
                    <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">Saldo Pendiente</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">₡{clientHistory.totalPending?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Purchase Timeline */}
                <div className="space-y-4">
                  <h4 className="text-lg font-black text-slate-900 dark:text-white px-2">Historial de Transacciones</h4>
                  {clientHistory.purchases && clientHistory.purchases.length > 0 ? (
                    clientHistory.purchases.map((purchase: any, index: number) => (
                      <div key={purchase.saleId} className="premium-panel border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                        <button
                          onClick={() => setExpandedPurchase(expandedPurchase === index ? null : index)}
                          className={`w-full p-6 flex justify-between items-center transition-all ${expandedPurchase === index ? 'bg-slate-50 dark:bg-slate-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                        >
                          <div className="flex-1 text-left flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${purchase.status === 'PAID_IN_FULL' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                               {index + 1}
                            </div>
                            <div>
                               <p className="font-black text-slate-900 dark:text-white">Factura #{purchase.invoiceNumber}</p>
                               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{new Date(purchase.saleDate).toLocaleDateString('es-CR')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="font-black text-slate-900 dark:text-white text-lg">₡{purchase.amount?.toLocaleString()}</p>
                              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                                purchase.status === 'PAID_IN_FULL' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                purchase.status === 'PARTIAL' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                                'bg-rose-100 dark:bg-rose-900/30 text-rose-600'
                              }`}>
                                {purchase.status === 'PAID_IN_FULL' ? 'Completado' : purchase.status === 'PARTIAL' ? 'Parcial' : 'Pendiente'}
                              </span>
                            </div>
                            <ChevronDown 
                              size={20} 
                              className={`transition-transform duration-500 text-slate-300 ${expandedPurchase === index ? 'rotate-180 text-slate-900' : ''}`}
                            />
                          </div>
                        </button>

                        <AnimatePresence>
                          {expandedPurchase === index && (
                            <motion.div 
                              initial={{height: 0, opacity: 0}}
                              animate={{height: 'auto', opacity: 1}}
                              exit={{height: 0, opacity: 0}}
                              className="border-t border-slate-100 dark:border-slate-800 p-8 pt-0 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden"
                            >
                               <div className="h-4"></div>
                               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                  <div className="col-span-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Medio Pago</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">
                                      {purchase.paymentMethod === 'CASH' ? 'Efectivo' : 
                                      purchase.paymentMethod === 'CARD' ? 'Tarjeta' :
                                      purchase.paymentMethod === 'CREDIT' ? 'Crédito' :
                                      purchase.paymentMethod === 'SINPE_MOVIL' ? 'SINPE Móvil' : purchase.paymentMethod}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto Pagado</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">₡{purchase.amountPaid?.toLocaleString()}</p>
                                  </div>
                                  {purchase.remainingBalance > 0 && (
                                    <div>
                                      <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Saldo Restante</p>
                                      <p className="font-black text-rose-600 dark:text-rose-400 underline underline-offset-4">₡{purchase.remainingBalance?.toLocaleString()}</p>
                                    </div>
                                  )}
                               </div>

                               <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Desglose de Artículos</p>
                                 <div className="space-y-3">
                                   {purchase.items?.map((item: any, idx: number) => (
                                      <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm">
                                         <div className="flex items-center gap-3 font-bold text-slate-700 dark:text-slate-300">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black">{item.quantity}</div>
                                            {item.productName}
                                         </div>
                                         <span className="font-black text-slate-900 dark:text-white">₡{item.totalPrice?.toLocaleString()}</span>
                                      </div>
                                   ))}
                                 </div>
                               </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-300 py-16 opacity-50 bg-slate-50 dark:bg-slate-950 rounded-[30px] border-2 border-dashed border-slate-200 dark:border-slate-800">
                       <p className="font-black uppercase tracking-widest text-sm">Sin movimientos registrados</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-slate-950 flex justify-center">
                 <button onClick={() => setIsHistoryOpen(false)} className="btn-premium py-3 px-10 text-sm">Cerrar Expediente</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
