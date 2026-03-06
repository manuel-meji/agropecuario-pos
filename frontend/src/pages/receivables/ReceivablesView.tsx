import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, FileText, CheckCircle2, Clock, DollarSign, ArrowLeft, History, User } from 'lucide-react';
import { getReceivablesByClient, getClientHistory, makePayment, getPaymentRecords } from '../../services/api';
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
  
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await getReceivablesByClient();
      setClients(data);
      return data;
    } catch (error) {
      console.error("Error loading clients receivables", error);
      toast.error("Error al cargar cuentas por cobrar");
      return [];
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

  const viewPaymentHistory = async () => {
    if (!selectedClient) return;
    setLoadingHistory(true);
    setShowPaymentHistoryModal(true);
    try {
        const allPayments = await getPaymentRecords();
        const clientPayments = allPayments.filter((p: any) => p.clientName === selectedClient.clientName);
        setPaymentHistory(clientPayments);
    } catch (error) {
        toast.error("Error al cargar historial de abonos");
    } finally {
        setLoadingHistory(false);
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
      
      const updatedClients = await loadClients();
      if (selectedClient) {
        if (updatedClients && updatedClients.length > 0) {
          const updatedClient = updatedClients.find((c: any) => c.clientName === selectedClient.clientName);
          if (updatedClient) {
            setSelectedClient(updatedClient);
          }
        }
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
    <div className="flex flex-col gap-8 h-full">
      {!showHistory ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Cartera de Cobros</h2>
              <p className="text-slate-500 font-medium">Gestión de créditos y saldos pendientes de clientes.</p>
            </div>
            <div className="flex gap-3">
               <button className="premium-panel flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border-none font-bold text-slate-700 dark:text-slate-200 hover:scale-105 transition-transform">
                 <Filter size={18} />
                 <span>Filtros</span>
               </button>
               <button className="btn-premium-emerald flex items-center justify-center gap-2">
                 <DollarSign size={18} />
                 Abono Masivo
               </button>
            </div>
          </div>

          <div className="premium-panel p-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por cliente o teléfono..." 
                className="w-full bg-transparent border-none rounded-2xl px-14 py-4 focus:ring-0 outline-none text-slate-800 dark:text-white placeholder:text-slate-400 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
            {loading ? (
              <div className="flex items-center justify-center py-20 opacity-40 animate-pulse">
                <p className="font-bold">Sincronizando cuentas...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="flex items-center justify-center py-20 opacity-40">
                <p className="font-bold">No se encontraron deudas activas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => viewClientHistory(client)}
                    className="premium-panel p-6 cursor-pointer group hover:border-premium-emerald"
                  >
                    <div className="flex flex-col gap-6">
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-premium-emerald/10 group-hover:text-premium-emerald transition-colors">
                          <User size={24} />
                        </div>
                        {client.totalRemainingBalance > 0 ? (
                          <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 text-[10px] font-black uppercase tracking-wider border border-amber-100 dark:border-amber-800">Pendiente</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100 dark:border-emerald-800">Al día</span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-premium-emerald transition-colors">{client.clientName}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{client.clientPhone || 'Sin teléfono'}</p>
                      </div>

                      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">Saldo Total</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">₡{client.totalRemainingBalance?.toLocaleString()}</span>
                         </div>
                         <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Compras</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">{client.details?.length || 0}</span>
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-8 pb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => {
                  setShowHistory(false);
                  setSelectedClient(null);
                }}
                className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:scale-110 transition-transform"
              >
                <ArrowLeft size={24} className="text-slate-600" />
              </button>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{selectedClient?.clientName}</h2>
                <p className="text-slate-500 font-medium">Expediente de crédito y pagos realizados.</p>
              </div>
            </div>
            
            <button
               onClick={viewPaymentHistory} 
               className="premium-panel bg-white dark:bg-slate-900 flex items-center gap-2 px-6 py-3 border-none font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
               <History size={18} />
               Ver Abonos Realizados
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Deuda Consolidada', value: selectedClient?.totalDebtAmount, color: 'text-slate-900 dark:text-white', icon: FileText },
              { label: 'Monto Recaudado', value: selectedClient?.totalPaidAmount, color: 'text-emerald-500', icon: CheckCircle2 },
              { label: 'Saldo Neto', value: selectedClient?.totalRemainingBalance, color: 'text-rose-500', icon: Clock }
            ].map((stat, i) => (
              <div key={i} className="premium-panel p-8 flex justify-between items-center relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                    <stat.icon size={100} />
                 </div>
                 <div className="relative">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                    <p className={`text-3xl font-black ${stat.color}`}>₡{stat.value?.toLocaleString()}</p>
                 </div>
              </div>
            ))}
          </div>

          <div className="premium-panel p-8">
            <h3 className="text-xl font-bold mb-8 text-slate-900 dark:text-white">Historial de Compras</h3>
            <div className="space-y-4">
              {clientHistory.map((receivable, index) => (
                <motion.div
                  key={receivable.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-50 dark:bg-slate-800/40 border border-black/5 dark:border-white/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6"
                >
                  <div className="flex items-center gap-4 flex-1">
                     <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                        <FileText size={20} />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{receivable.invoiceNumber}</p>
                        <p className="font-bold text-slate-900 dark:text-white">Realizada el {receivable.saleDate ? new Date(receivable.saleDate).toLocaleDateString('es-CR') : 'N/A'}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1">
                     <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Monto Total</span>
                        <span className="font-black text-slate-900 dark:text-white">₡{receivable.totalDebt?.toLocaleString()}</span>
                     </div>
                     <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Saldo</span>
                        <span className={`font-black ${receivable.remainingBalance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>₡{receivable.remainingBalance?.toLocaleString()}</span>
                     </div>
                     <div className="hidden md:block">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Vencimiento</span>
                        <span className="font-bold text-slate-600 dark:text-slate-400">30 Mar 2026</span>
                     </div>
                  </div>

                  <div className="flex items-center gap-4">
                     {receivable.status === 'PAID_IN_FULL' ? (
                       <span className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500/20">Liquidada</span>
                     ) : (
                       <button
                         onClick={() => handlePaymentClick(receivable.id)}
                         className="btn-premium-emerald py-2.5 px-6 shadow-sm text-sm"
                       >
                         Abonar
                       </button>
                     )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modern MODAL: Payment */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPaymentModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-[40px] p-10 w-full max-w-md shadow-2xl relative z-10 overflow-hidden">
               <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full"></div>
               <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white relative">Registrar Abono</h3>
               <p className="text-slate-500 text-sm mb-8 relative font-medium">Ingrese el monto en CRC que entrega el cliente.</p>
               
               <div className="space-y-6 relative">
                 <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-400">₡</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-premium-emerald rounded-2xl pl-12 pr-6 py-5 text-2xl font-black text-slate-900 dark:text-white transition-all outline-none"
                      autoFocus
                    />
                 </div>
                 <div className="flex gap-4">
                   <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors">Cancelar</button>
                   <button onClick={handlePayment} className="flex-1 btn-premium-emerald py-4">Confirmar</button>
                 </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern MODAL: Payment History */}
      <AnimatePresence>
        {showPaymentHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPaymentHistoryModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-[40px] flex flex-col w-full max-w-2xl max-h-[85vh] shadow-2xl relative z-10 overflow-hidden">
                <div className="p-10 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                       <History size={24} className="text-premium-emerald" /> 
                       Historial de Abonos
                    </h3>
                    <p className="text-slate-500 font-medium">{selectedClient?.clientName}</p>
                </div>
                <div className="p-10 pt-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                    {loadingHistory ? (
                        <div className="text-center text-slate-400 py-10 animate-pulse font-bold">Cargando registros...</div>
                    ) : paymentHistory.length === 0 ? (
                        <div className="text-center text-slate-400 py-20 font-bold">No se registran movimientos para este cliente.</div>
                    ) : (
                        paymentHistory.map((payment, idx) => (
                          <div key={idx} className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-black/5 dark:border-white/5 flex justify-between items-center group hover:bg-white dark:hover:bg-slate-800 transition-all">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-500 transition-transform group-hover:scale-110">
                                      <DollarSign size={20} />
                                  </div>
                                  <div>
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{payment.invoiceNumber}</p>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{new Date(payment.paymentDate).toLocaleString('es-CR')}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className="text-emerald-500 font-black text-xl">+ ₡{payment.amount?.toLocaleString()}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Saldo final: ₡{payment.newBalance?.toLocaleString()}</p>
                              </div>
                          </div>
                      ))
                    )}
                </div>
                <div className="p-8 bg-slate-50 dark:bg-slate-950 flex justify-center">
                    <button onClick={() => setShowPaymentHistoryModal(false)} className="btn-premium py-3 px-10 text-sm">Cerrar Historial</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
