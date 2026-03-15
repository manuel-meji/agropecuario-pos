import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Building2, X, ChevronDown, Phone, Mail, MapPin, Hash, History, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, getSupplierHistory, getPayables, makeSupplierBulkPayment } from '../../services/api';

export default function SuppliersView() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<number | null>(null);
  const [supplierHistory, setSupplierHistory] = useState<any>(null);
  const [expandedPurchase, setExpandedPurchase] = useState<number | null>(null);
  const [newSupplier, setNewSupplier] = useState({ name: '', identification: '', email: '', phone: '', address: '', contactPerson: '' });
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [payablesMap, setPayablesMap] = useState<Record<number, any>>({});
  const [isBulkPaymentModalOpen, setIsBulkPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  const loadSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);

      const payablesData = await getPayables();
      const map: Record<number, any> = {};
      payablesData.forEach((p: any) => {
         // Accumulate remaining balance per supplier
         const bal = p.totalDebt - p.amountPaid;
         if (!map[p.supplierId]) map[p.supplierId] = { totalRemainingBalance: 0 };
         map[p.supplierId].totalRemainingBalance += bal;
      });
      setPayablesMap(map);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar los proveedores.');
    }
  };

  useEffect(() => { loadSuppliers(); }, []);

  const handleCreateOrUpdate = async () => {
    if (!newSupplier.name) {
      toast.error('El nombre del proveedor es obligatorio.');
      return;
    }
    try {
      if (editingSupplierId) {
        await updateSupplier(editingSupplierId, newSupplier);
        toast.success('Proveedor actualizado exitosamente.');
      } else {
        await createSupplier(newSupplier);
        toast.success('Proveedor registrado exitosamente.');
      }
      setIsModalOpen(false);
      setEditingSupplierId(null);
      setNewSupplier({ name: '', identification: '', email: '', phone: '', address: '', contactPerson: '' });
      loadSuppliers();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data || (editingSupplierId ? 'Hubo un error al actualizar el proveedor.' : 'Hubo un error al guardar el proveedor.');
      toast.error(typeof msg === 'string' ? msg : 'Error al guardar proveedor');
    }
  };

  const handleDeleteSupplier = async (id: number, name: string) => {
    if (!window.confirm(`¿Está seguro de eliminar al proveedor "${name}"?`)) return;
    try {
      await deleteSupplier(id);
      toast.success('Proveedor eliminado correctamente.');
      loadSuppliers();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo eliminar el proveedor. Verifique si tiene dependencias.');
    }
  };

  const handleViewHistory = async (supplier: any) => {
    try {
      const history = await getSupplierHistory(supplier.id);
      setSupplierHistory(history);
      setIsHistoryOpen(true);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar el historial del proveedor.');
    }
  };

  const handleBulkPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Ingrese un monto válido");
      return;
    }
    if (!supplierHistory) return;
    
    try {
      await makeSupplierBulkPayment(supplierHistory.supplierId, parseFloat(paymentAmount));
      toast.success("Abono registrado correctamente");
      setIsBulkPaymentModalOpen(false);
      setPaymentAmount('');
      
      const updatedHistory = await getSupplierHistory(supplierHistory.supplierId);
      setSupplierHistory(updatedHistory);
      loadSuppliers();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || error.response?.data || "Error al registrar abono");
    }
  };

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.identification?.includes(searchTerm);
    if (!matchesSearch) return false;
    
    if (showOnlyPending) {
       const supplierPayable = payablesMap[s.id];
       return supplierPayable && supplierPayable.totalRemainingBalance > 0;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Directorio de Proveedores
          </h2>
          <p className="text-slate-500 font-medium">Gestiona tus proveedores comerciales y visualiza su historial.</p>
        </div>
        <button onClick={() => {
          setEditingSupplierId(null);
          setNewSupplier({ name: '', identification: '', email: '', phone: '', address: '', contactPerson: '' });
          setIsModalOpen(true);
        }} className="btn-premium-emerald flex items-center justify-center gap-2">
          <Plus size={18} /> Nuevo Proveedor
        </button>
      </div>

      <div className="premium-panel p-2 flex items-center justify-between gap-4">
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
        <div className="pr-4 border-l border-slate-100 dark:border-slate-800 pl-4 hidden md:block">
          <button 
             onClick={() => setShowOnlyPending(!showOnlyPending)}
             className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${showOnlyPending ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 border border-amber-200 dark:border-amber-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
             Solo con saldos pendientes
          </button>
        </div>
      </div>

      <div className="flex-1 premium-panel overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="p-6">Proveedor</th>
                <th className="p-6">Identificación</th>
                <th className="p-6">Contacto (Persona)</th>
                <th className="p-6">Tel. / Correo</th>
                <th className="p-6">Dirección</th>
                <th className="p-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((item, index) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  key={item.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-premium-emerald/10 group-hover:text-premium-emerald transition-colors">
                        <Truck size={20} />
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
                    {item.contactPerson || '-'}
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
                    <div className="flex items-center justify-end gap-2">
                       <button
                        onClick={() => handleViewHistory(item)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        Ver Historial
                      </button>
                      <button
                        onClick={() => {
                          setEditingSupplierId(item.id);
                          setNewSupplier({
                            name: item.name || '',
                            identification: item.identification || '',
                            email: item.email || '',
                            phone: item.phone || '',
                            address: item.address || '',
                            contactPerson: item.contactPerson || ''
                          });
                          setIsModalOpen(true);
                        }}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-500 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(item.id, item.name)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-red-500 hover:border-red-500 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <Truck size={48} className="mb-4 opacity-20" />
                      <p className="font-bold">No hay proveedores registrados</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Modal: Create/Edit Supplier */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-[40px] p-10 w-full max-w-xl shadow-2xl relative z-10 overflow-hidden">
              <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-premium-emerald/10 blur-[60px] rounded-full"></div>
              <h3 className="text-2xl font-black mb-1 text-slate-900 dark:text-white relative">{editingSupplierId ? 'Editar Proveedor' : 'Registrar Proveedor'}</h3>
              <p className="text-slate-500 text-sm mb-8 relative font-medium">Completa la información para el directorio principal.</p>

              <form onSubmit={e => { e.preventDefault(); handleCreateOrUpdate(); }}>
              <div className="grid grid-cols-2 gap-4 mb-8 relative">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre Comercial <span className="text-rose-500">*</span></label>
                  <input type="text" placeholder="Ej. Distribuidora S.A." required className="premium-input w-full" value={newSupplier.name} onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Cédula Jurídica / Física</label>
                  <input type="text" placeholder="Identificación..." className="premium-input w-full" value={newSupplier.identification} onChange={(e) => setNewSupplier({...newSupplier, identification: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Teléfono</label>
                  <input type="text" placeholder="Número..." className="premium-input w-full" value={newSupplier.phone} onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Persona de Contacto</label>
                  <input type="text" placeholder="Nombre del agente o vendedor..." className="premium-input w-full" value={newSupplier.contactPerson} onChange={(e) => setNewSupplier({...newSupplier, contactPerson: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Correo Electrónico</label>
                  <input type="email" placeholder="Email..." className="premium-input w-full" value={newSupplier.email} onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Dirección Exacta</label>
                  <input type="text" placeholder="Dirección..." className="premium-input w-full" value={newSupplier.address} onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4 relative">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 btn-premium-emerald py-4">
                  {editingSupplierId ? 'Actualizar' : 'Confirmar Registro'}
                </button>
              </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern Modal: Supplier History */}
      <AnimatePresence>
        {isHistoryOpen && supplierHistory && (
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
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100 dark:border-amber-800">
                    <History size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Expediente del Proveedor</h3>
                    <p className="text-slate-500 font-medium">{supplierHistory.supplierName} {supplierHistory.supplierIdentification && `(${supplierHistory.supplierIdentification})`}</p>
                  </div>
                </div>
                <button onClick={() => setIsHistoryOpen(false)} className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500">
                  <X size={24} />
                </button>
              </div>

              <div className="overflow-y-auto custom-scrollbar flex-1 p-10 space-y-10">
                {/* Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="premium-panel p-6 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Comprado</p>
                     <p className="text-3xl font-black text-slate-900 dark:text-white">₡{supplierHistory.totalPurchases?.toLocaleString()}</p>
                   </div>
                   <div className="premium-panel p-6 bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30">
                     <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Total Pagado</p>
                     <p className="text-3xl font-black text-slate-900 dark:text-white">₡{supplierHistory.totalPaid?.toLocaleString()}</p>
                   </div>
                   <div className="premium-panel p-6 bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30 flex justify-between items-center relative overflow-hidden">
                     <div>
                        <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">Saldo Pendiente</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">₡{supplierHistory.totalPending?.toLocaleString()}</p>
                     </div>
                     {supplierHistory.totalPending > 0 && (
                        <button 
                           onClick={() => {
                              setPaymentAmount(supplierHistory.totalPending.toString());
                              setIsBulkPaymentModalOpen(true);
                           }}
                           className="btn-premium-emerald py-2 px-4 shadow-sm text-xs relative z-10"
                        >
                           Abonar
                        </button>
                     )}
                   </div>
                </div>

                {/* Transaction Timeline */}
                <div className="space-y-4">
                  <h4 className="text-lg font-black text-slate-900 dark:text-white px-2">Historial de Transacciones</h4>
                  {supplierHistory.transactions && supplierHistory.transactions.length > 0 ? (
                    supplierHistory.transactions.map((item: any, index: number) => (
                      <div key={`${item.type}-${item.id}`} className="premium-panel border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                        <button
                          onClick={() => item.type === 'PURCHASE' ? setExpandedPurchase(expandedPurchase === index ? null : index) : null}
                          className={`w-full p-6 flex justify-between items-center transition-all ${item.type === 'PURCHASE' ? (expandedPurchase === index ? 'bg-slate-50 dark:bg-slate-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30') : 'cursor-default'}`}
                        >
                          <div className="flex-1 text-left flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${item.type === 'PURCHASE' ? (item.status === 'PAID_IN_FULL' || item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500') : 'bg-purple-500/10 text-purple-500'
                              }`}>
                              {item.type === 'PURCHASE' ? <Truck size={20} /> : <Building2 size={20} />}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 dark:text-white">
                                {item.type === 'PURCHASE' ? `Compra (Fac: ${item.referenceNumber || 'S/N'})` : `Abono de Cuenta`}
                              </p>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{new Date(item.date).toLocaleString('es-CR')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="font-black text-slate-900 dark:text-white text-lg">₡{item.totalAmount?.toLocaleString()}</p>
                              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${item.type === 'PAYMENT' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                                  (item.status === 'PAID_IN_FULL' || item.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                    item.status === 'PARTIAL' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                                    'bg-rose-100 dark:bg-rose-900/30 text-rose-600')
                                }`}>
                                {item.type === 'PAYMENT' ? 'Abono / Pago' :
                                  (item.status === 'PAID_IN_FULL' || item.status === 'COMPLETED' ? 'Liquidada' :
                                    item.status === 'PARTIAL' ? 'Parcial' : 'Deuda Pendiente')}
                              </span>
                            </div>
                            {item.type === 'PURCHASE' && (
                              <ChevronDown size={20} className={`transition-transform duration-500 text-slate-300 ${expandedPurchase === index ? 'rotate-180 text-slate-900' : ''}`} />
                            )}
                          </div>
                        </button>

                        <AnimatePresence>
                          {item.type === 'PURCHASE' && expandedPurchase === index && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-100 dark:border-slate-800 p-8 pt-0 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden">
                              <div className="h-4"></div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="col-span-1">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Medio Reportado</p>
                                  <p className="font-bold text-slate-800 dark:text-slate-200">
                                    {item.method === 'CASH' ? 'Contado' : item.method === 'CREDIT' ? 'Crédito' : item.method}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto Abonado</p>
                                  <p className="font-bold text-slate-800 dark:text-slate-200">₡{item.amountPaid?.toLocaleString()}</p>
                                </div>
                                {item.remainingBalance > 0 && (
                                  <div>
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Saldo Restante</p>
                                    <p className="font-black text-rose-600 dark:text-rose-400 underline underline-offset-4">₡{item.remainingBalance?.toLocaleString()}</p>
                                  </div>
                                )}
                              </div>

                              <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Artículos de Compra</p>
                                <div className="space-y-3">
                                  {item.items?.map((detail: any, idx: number) => {
                                    const unitPrice = detail.unitPrice ?? 0;
                                    const lineTotal = detail.totalPrice ?? (unitPrice * detail.quantity);
                                    return (
                                      <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm">
                                        <div className="flex items-center gap-3 font-bold text-slate-700 dark:text-slate-300">
                                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black">{detail.quantity}</div>
                                          <div>
                                            <p className="font-bold text-slate-800 dark:text-slate-200">{detail.productName}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">₡{unitPrice.toLocaleString()} c/u</p>
                                          </div>
                                        </div>
                                        <span className="font-black text-slate-900 dark:text-white">₡{lineTotal.toLocaleString()}</span>
                                      </div>
                                    );
                                  })}
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

      {/* Modern MODAL: Bulk Payment */}
      <AnimatePresence>
        {isBulkPaymentModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBulkPaymentModalOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-[40px] p-10 w-full max-w-md shadow-2xl relative z-10 overflow-hidden">
               <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full"></div>
               <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white relative">Registrar Abono</h3>
               <p className="text-slate-500 text-sm mb-8 relative font-medium">Ingrese el monto en CRC que entrega al proveedor.</p>
               
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
                   <button onClick={() => setIsBulkPaymentModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors">Cancelar</button>
                   <button onClick={handleBulkPayment} className="flex-1 btn-premium-emerald py-4">Confirmar</button>
                 </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
