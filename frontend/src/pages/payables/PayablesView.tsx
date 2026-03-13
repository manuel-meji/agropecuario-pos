import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Building2, X, ChevronDown, Phone, Mail, Hash, History, FileText, ShoppingCart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSuppliers, getPurchasesBySupplier, getPayables, getProducts, createPurchase, createProduct, getPayableHistory, makePayablePayment, makeSupplierBulkPayment } from '../../services/api';

export default function PayablesView() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [payables, setPayables] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [supplierPurchases, setSupplierPurchases] = useState<any[]>([]);
  const [supplierPayables, setSupplierPayables] = useState<any[]>([]);
  const [expandedPurchase, setExpandedPurchase] = useState<number | null>(null);

  // Date range filter defaults: this month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const fmt8601 = (d: Date) => d.toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(fmt8601(firstDay));
  const [endDate, setEndDate] = useState(fmt8601(today));

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [bulkPaymentSupplierId, setBulkPaymentSupplierId] = useState<number | null>(null);
  const [maxPaymentAmount, setMaxPaymentAmount] = useState<number>(0);

  const loadData = async () => {
    try {
      const [suppliersData, payablesData, productsData] = await Promise.all([
        getSuppliers(),
        getPayables(),
        getProducts()
      ]);
      setSuppliers(suppliersData);
      setPayables(payablesData);
      setProducts(productsData);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar la información.');
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleViewHistory = async (supplier: any) => {
    try {
      setSelectedSupplier(supplier);
      const [purchases, history] = await Promise.all([
        getPurchasesBySupplier(supplier.id),
        getPayableHistory(supplier.id)   // use ID — survives name changes
      ]);
      setSupplierPurchases(purchases);
      setSupplierPayables(history);
      setIsHistoryOpen(true);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Error al cargar datos del proveedor');
    }
  };

  const handlePaymentClick = (payableId: number) => {
    setPaymentId(payableId);
    setBulkPaymentSupplierId(null);
    setPaymentAmount('');
    setShowPaymentModal(true);
  };

  const handleBulkPaymentClick = (supplierId: number, maxAmount: number) => {
    setBulkPaymentSupplierId(supplierId);
    setMaxPaymentAmount(maxAmount);
    setPaymentId(null);
    setPaymentAmount('');
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Ingrese un monto válido");
      return;
    }

    try {
      if (bulkPaymentSupplierId !== null) {
        if (parseFloat(paymentAmount) > maxPaymentAmount) {
          toast.error(`El monto no puede exceder el saldo pendiente de ₡${maxPaymentAmount.toLocaleString()}`);
          return;
        }
        await makeSupplierBulkPayment(bulkPaymentSupplierId, parseFloat(paymentAmount));
        toast.success("Abono registrado correctamente");
      } else if (paymentId) {
        await makePayablePayment(paymentId, parseFloat(paymentAmount));
        toast.success("Abono registrado correctamente");
      } else {
        return;
      }

      setShowPaymentModal(false);
      setBulkPaymentSupplierId(null);
      // Reload everything to stay hot
      loadData();
      if (selectedSupplier) {
        handleViewHistory(selectedSupplier);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar el abono");
    }
  };

  const getSupplierBalance = (supplier: any) => {
    return payables
      .filter(p => p.supplierId === supplier.id || 
                   (p.supplierName && p.supplierName.toLowerCase() === supplier.name.toLowerCase()))
      .reduce((acc, curr) => acc + (curr.totalDebt - curr.amountPaid), 0);
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.identification?.includes(searchTerm)
  );

  const totalDebt = payables.reduce((acc, curr) => acc + (curr.totalDebt - curr.amountPaid), 0);

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Cuentas por Pagar</h2>
          <p className="text-slate-500 font-medium">Gestión de proveedores, historial de compras y obligaciones financieras.</p>
        </div>
        <button
          onClick={() => setIsTransactionOpen(true)}
          className="btn-premium-emerald flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Registrar Nueva Transacción
        </button>
      </div>

      {/* Stats and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="premium-panel p-6 bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30">
          <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">Deuda Total Pendiente</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">₡{totalDebt.toLocaleString()}</p>
        </div>

        <div className="md:col-span-3 premium-panel p-2 flex flex-col sm:flex-row items-center gap-2">
          {/* Date range filters */}
          <div className="flex items-center gap-2 px-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl h-full border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col py-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold ml-1">Desde</span>
              <input type="date" className="bg-transparent text-sm font-bold outline-none text-slate-700 dark:text-slate-300" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="flex flex-col py-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold ml-1">Hasta</span>
              <input type="date" className="bg-transparent text-sm font-bold outline-none text-slate-700 dark:text-slate-300" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar proveedor..."
              className="w-full bg-transparent border-none rounded-2xl pl-16 pr-6 py-4 focus:ring-0 outline-none text-slate-800 dark:text-white placeholder:text-slate-400 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="flex-1 premium-panel overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="p-6">Proveedor</th>
                <th className="p-6">Identificación</th>
                <th className="p-6">Contacto</th>
                <th className="p-6">Saldo Pendiente</th>
                <th className="p-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((item, index) => {
                const balance = getSupplierBalance(item);
                return (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                    key={item.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors">
                          <Building2 size={20} />
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
                    <td className="p-6 text-sm font-bold">
                      <span className={balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}>
                        ₡{balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {balance > 0 && (
                          <button
                            onClick={() => handleBulkPaymentClick(item.id, balance)}
                            className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-500 hover:text-white transition-colors"
                          >
                            Abonar
                          </button>
                        )}
                        <button
                          onClick={() => handleViewHistory(item)}
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          Ver Historial
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <Building2 size={48} className="mb-4 opacity-20" />
                      <p className="font-bold">No hay proveedores registrados</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isHistoryOpen && selectedSupplier && (
          <HistoryModal
            onClose={() => setIsHistoryOpen(false)}
            supplier={selectedSupplier}
            purchases={supplierPurchases}
            expandedPurchase={expandedPurchase}
            setExpandedPurchase={setExpandedPurchase}
            payables={supplierPayables}
            onPaymentClick={handlePaymentClick}
            startDate={startDate}
            endDate={endDate}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTransactionOpen && (
          <TransactionModal
            onClose={() => setIsTransactionOpen(false)}
            suppliers={suppliers}
            products={products}
            onSuccess={loadData}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPaymentModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
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
                  <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors">Cancelar</button>
                  <button onClick={handlePaymentSubmit} className="flex-1 btn-premium-emerald py-4">Confirmar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HistoryModal({ onClose, supplier, purchases, payables, onPaymentClick, expandedPurchase, setExpandedPurchase, startDate, endDate }: any) {
  // Filter history by dates
  const sDate = new Date(startDate); sDate.setHours(0, 0, 0, 0);
  const eDate = new Date(endDate); eDate.setHours(23, 59, 59, 999);

  const filteredPurchases = purchases.filter((p: any) => {
    const pd = new Date(p.createdDate);
    return pd >= sDate && pd <= eDate;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-left">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
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
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Historial de Compras</h3>
              <p className="text-slate-500 font-medium">{supplier.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 p-10 space-y-6">
          {filteredPurchases.length > 0 ? (
            filteredPurchases.map((purchase: any, index: number) => {
              // Match payable: prefer invoice-number match; fall back to any unpaid payable for this supplier.
              // This handles purchases registered without an invoice number.
              const payable = purchase.paymentMethod === 'CREDIT'
                ? (payables?.find((p: any) =>
                    purchase.invoiceNumber
                      ? p.supplierInvoiceReference === purchase.invoiceNumber
                      : p.status !== 'PAID_IN_FULL'
                  ) ?? null)
                : null;

              return (
                <div key={purchase.id} className="premium-panel border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                  <div className={`w-full p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all ${expandedPurchase === index ? 'bg-slate-50 dark:bg-slate-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
                    <button onClick={() => setExpandedPurchase(expandedPurchase === index ? null : index)} className="flex-1 text-left flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">Factura: {purchase.invoiceNumber || 'Sin número'}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{new Date(purchase.createdDate).toLocaleDateString('es-CR')}</p>
                      </div>
                    </button>
                    <div className="flex items-center gap-4 sm:gap-8 justify-between sm:justify-end w-full sm:w-auto">
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-lg">₡{purchase.totalAmount.toLocaleString()}</p>
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${purchase.paymentMethod === 'CREDIT' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'}`}>
                            {purchase.paymentMethod === 'CREDIT' ? 'Crédito' : 'Contado'}
                          </span>
                        </div>

                        {/* Abonar Button specifically for debts */}
                        {payable && payable.status !== 'PAID_IN_FULL' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onPaymentClick(payable.id); }}
                            className="btn-premium-emerald py-2 px-4 shadow-sm text-xs"
                          >
                            Abonar
                          </button>
                        )}
                        {payable && payable.status === 'PAID_IN_FULL' && (
                          <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-emerald-500/20">Pagado</span>
                        )}
                      </div>
                      <button onClick={() => setExpandedPurchase(expandedPurchase === index ? null : index)}>
                        <ChevronDown size={20} className={`transition-transform duration-500 text-slate-300 ${expandedPurchase === index ? 'rotate-180 text-slate-900' : ''}`} />
                      </button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedPurchase === index && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-100 dark:border-slate-800 p-8 pt-0 bg-slate-50/50 dark:bg-slate-900/30">
                        <div className="h-4"></div>
                        {purchase.description && (
                          <div className="mb-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Descripción / Detalles</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{purchase.description}</p>
                          </div>
                        )}
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Artículos de la Factura</p>
                        <div className="space-y-3">
                          {purchase.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black">{item.quantity}</div>
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-slate-200">{item.product.name}</p>
                                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Costo: ₡{item.costPrice.toLocaleString()} c/u</p>
                                </div>
                              </div>
                              <span className="font-black text-slate-900 dark:text-white">₡{item.lineTotal.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })
          ) : (
            <div className="text-center text-slate-300 py-16 opacity-50 bg-slate-50 dark:bg-slate-950 rounded-[30px] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <p className="font-black uppercase tracking-widest text-sm">No se encontraron compras para este proveedor</p>
            </div>
          )}
        </div>
        <div className="p-8 bg-slate-50 dark:bg-slate-950 flex justify-center">
          <button onClick={onClose} className="btn-premium py-3 px-10 text-sm">Cerrar Historial</button>
        </div>
      </motion.div>
    </div>
  );
}

function TransactionModal({ onClose, suppliers, products, onSuccess }: any) {
  const [step, setStep] = useState(1);
  const [supplierId, setSupplierId] = useState<number | string>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [cart, setCart] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // New Product Creation States
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', internalCode: '', purchaseCost: 0, salePrice: 0, stockQuantity: 0, taxRate: 13
  });
  const [saveToInventory, setSaveToInventory] = useState(true);

  // Show products if search is empty, otherwise filter. Increase limit to show more items inside the dropdown.
  const filteredProducts = productSearch
    ? products.filter((p: any) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.internalCode?.includes(productSearch)
    ).slice(0, 50)
    : products.slice(0, 50);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        costPrice: product.purchaseCost || 0
      }]);
    }
    setProductSearch('');
    setIsDropdownOpen(false);
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name || newProduct.purchaseCost <= 0) {
      toast.error('El nombre y el costo son requeridos.');
      return;
    }

    try {
      let createdProduct;
      if (saveToInventory) {
        createdProduct = await createProduct({
          ...newProduct,
          taxRate: 13,
          isAgrochemicalInsufficiency: false, // Default rules
          stockQuantity: 0 // Will increment via the purchase automatically
        });
      } else {
        // Option 2: Generic/Temporary product for this transaction only
        createdProduct = {
          id: `temp-${Date.now()}`,
          name: newProduct.name,
          purchaseCost: newProduct.purchaseCost
        };
      }
      addToCart(createdProduct);
      setIsCreatingProduct(false);
      setNewProduct({ name: '', internalCode: '', purchaseCost: 0, salePrice: 0, stockQuantity: 0, taxRate: 13 });
      toast.success(saveToInventory ? 'Producto creado exitosamente' : 'Producto temporal agregado a la compra');
    } catch (error) {
      console.error(error);
      toast.error('Error al crear el producto.');
    }
  };

  const removeFromCart = (productId: number | string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateCartItem = (productId: number, field: string, value: any) => {
    setCart(cart.map(item => item.productId === productId ? { ...item, [field]: value } : item));
  };

  const total = cart.reduce((acc, curr) => acc + (curr.quantity * curr.costPrice), 0);

  const handleSubmit = async () => {
    if (!supplierId && supplierId !== 0) { toast.error('Selecciona un proveedor.'); return; }
    if (cart.length === 0) { toast.error('Añade al menos un producto.'); return; }

    try {
      await createPurchase({
        supplierId: supplierId === 'GENERIC' ? null : Number(supplierId),
        invoiceNumber,
        description,
        paymentMethod,
        totalAmount: total,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          costPrice: item.costPrice
        }))
      });
      toast.success('Compra registrada exitosamente.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Error al registrar la compra.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-left">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[40px] p-10 w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-premium-emerald/10 blur-[60px] rounded-full"></div>
        <h3 className="text-2xl font-black mb-1 text-slate-900 dark:text-white relative">Registrar Nueva Compra</h3>
        <p className="text-slate-500 text-sm mb-8 relative font-medium">Ingresa los detalles de la transacción con el proveedor.</p>

        <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
          {step === 1 ? (
            <div className="grid grid-cols-2 gap-6 relative">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Proveedor</label>
                <select
                  className="premium-input w-full appearance-none cursor-pointer"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                >
                  <option value="">Seleccionar Proveedor...</option>
                  <option value="GENERIC">Genérico / Consumidor Final</option>
                  {suppliers.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Número de Factura</label>
                <input type="text" placeholder="FAC-XXXX" className="premium-input w-full" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Condición de Pago</label>
                <select className="premium-input w-full" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="CASH">Contado (Efectivo/Banco)</option>
                  <option value="CREDIT">Crédito (Cuenta por Pagar)</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Descripción / Notas</label>
                <textarea className="premium-input w-full min-h-[80px]" placeholder="Detalles de la compra..." value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="space-y-6 relative">
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Buscar Producto</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Escribe para filtrar o buscar..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-premium-emerald rounded-2xl py-4 pr-5 pl-12 text-sm font-bold text-slate-900 dark:text-white transition-all outline-none"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setIsDropdownOpen(true);
                      setIsCreatingProduct(false);
                    }}
                    onFocus={() => { setIsDropdownOpen(true); setIsCreatingProduct(false); }}
                  />
                </div>

                {/* Inline Product Creation Form */}
                {isCreatingProduct ? (
                  <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Crear y Agregar Producto</h4>
                      <button onClick={() => setIsCreatingProduct(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nombre</label>
                        <input type="text" className="premium-input w-full py-2 px-3 text-sm" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Ej. Fertilizante 20-20-20" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Costo (₡)</label>
                        <input type="number" className="premium-input w-full py-2 px-3 text-sm" value={newProduct.purchaseCost || ''} onChange={e => setNewProduct({ ...newProduct, purchaseCost: Number(e.target.value) })} placeholder="Ej. 5000" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Código Int. (Opcional)</label>
                        <input type="text" className="premium-input w-full py-2 px-3 text-sm" value={newProduct.internalCode} onChange={e => setNewProduct({ ...newProduct, internalCode: e.target.value })} placeholder="Ej. FERT-001" />
                      </div>
                      <div className="col-span-2 mt-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-slate-300 text-premium-emerald focus:ring-premium-emerald"
                            checked={saveToInventory}
                            onChange={(e) => setSaveToInventory(e.target.checked)}
                          />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Guardar en inventario general</span>
                        </label>
                        <p className="text-xs text-slate-400 mt-1 ml-8">
                          {saveToInventory
                            ? "El producto se guardará en la base de datos para futuras compras y ventas."
                            : "El producto será temporal solo para registrar esta compra, sin afectar el catálogo."}
                        </p>
                      </div>
                      <div className="col-span-2 mt-2 flex justify-end gap-3">
                        <button type="button" onClick={handleCreateProduct} className="btn-premium-emerald py-2 px-6 text-sm">Agregar a la Compra</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {!isDropdownOpen && (
                      <button
                        onClick={() => setIsCreatingProduct(true)}
                        className="mt-3 w-full py-3 px-4 border-2 border-dashed border-premium-emerald/30 text-premium-emerald bg-premium-emerald/5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-premium-emerald/10 transition-colors"
                      >
                        <Plus size={16} /> Crear Nuevo Producto
                      </button>
                    )}

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                        <div className="p-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                          <button
                            onClick={() => { setIsCreatingProduct(true); setIsDropdownOpen(false); }}
                            className="w-full py-2 px-3 bg-premium-emerald text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
                          >
                            <Plus size={14} /> Crear Nuevo Producto (No está en la lista)
                          </button>
                        </div>
                        {filteredProducts.map((p: any) => (
                          <button
                            key={p.id}
                            onClick={() => addToCart(p)}
                            className="w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex justify-between items-center text-left border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                          >
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{p.name}</p>
                              <p className="text-xs text-slate-400">{p.internalCode || 'Sin código'}</p>
                            </div>
                            <Plus size={18} className="text-premium-emerald" />
                          </button>
                        ))}
                        {filteredProducts.length === 0 && (
                          <div className="p-4 text-center text-slate-400 text-sm">
                            No se encontraron productos. Crea uno nuevo.
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Productos en el Carrito</label>
                {cart.map((item) => (
                  <div key={item.productId} className="premium-panel p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                      <button onClick={() => removeFromCart(item.productId)} className="text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cantidad</p>
                        <input
                          type="number"
                          className="premium-input w-full py-2 px-3 text-xs"
                          value={item.quantity}
                          onChange={(e) => updateCartItem(item.productId, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Costo Unitario (₡)</p>
                        <input
                          type="number"
                          className="premium-input w-full py-2 px-3 text-xs"
                          value={item.costPrice}
                          onChange={(e) => updateCartItem(item.productId, 'costPrice', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="p-10 text-center text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                    <ShoppingCart size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="font-bold text-sm">El carrito está vacío</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between relative">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto Total</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">₡{total.toLocaleString()}</p>
          </div>
          <div className="flex gap-4">
            {step === 1 ? (
              <button onClick={() => setStep(2)} className="btn-premium-emerald py-3 px-8">Siguiente Step</button>
            ) : (
              <>
                <button onClick={() => setStep(1)} className="py-3 px-6 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl">Atrás</button>
                <button onClick={handleSubmit} className="btn-premium-emerald py-3 px-8">Registrar Compra</button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
