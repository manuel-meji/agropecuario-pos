import {useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Barcode, Plus, Minus, ShoppingCart, User, X, Percent,
  DollarSign, ChevronDown, Tag, Trash2, FileText, Banknote
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getCompanySettings } from '../../utils/companySettings';
import { getPaymentMethodMeta } from '../../components/PaymentMethodSelector';
import { getProducts, createSale, getClients, createClient } from '../../services/api';
import InvoiceModal from '../../components/InvoiceModal';

/* ─── Types ─────────────────────────────────────────────────────────────────── */
type DiscountType = 'percentage' | 'fixed';
interface Discount { type: DiscountType; value: number }
interface CartItem {
  product: any;
  qty: number;
  exoneration?: {
    tipoDocumento: string;
    numeroDocumento: string;
    nombreInstitucion: string;
    fechaEmision: string;
    porcentaje: number;
    monto: number;
  }
}

/* ─── Inline Discount Panel (compact, no separate component needed) ──────────── */
function InlineDiscount({
  subtotal, discount, onChange,
}: { subtotal: number; discount: Discount | null; onChange: (d: Discount | null) => void }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<DiscountType>(discount?.type ?? 'percentage');
  const [val, setVal] = useState(discount?.value ?? 0);
  const ref = useRef<HTMLDivElement>(null);

  const amount = type === 'percentage' ? (subtotal * val) / 100 : Math.min(val, subtotal);
  const maxVal = type === 'percentage' ? 100 : subtotal;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const apply = (t: DiscountType, v: number) => {
    const clamped = Math.max(0, Math.min(v, t === 'percentage' ? 100 : subtotal));
    setType(t); setVal(clamped);
    onChange({ type: t, value: clamped });
  };

  const clear = () => { setVal(0); onChange(null); setOpen(false); };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
          discount
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400'
            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
      >
        <span className="flex items-center gap-2">
          <Tag size={14} />
          {discount
            ? `Desc. ${discount.type === 'percentage' ? `${discount.value}%` : `₡${discount.value.toLocaleString()}`} (−₡${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })})`
            : 'Agregar Descuento'}
        </span>
        <span className="flex items-center gap-1">
          {discount && (
            <X
              size={12}
              onClick={(e) => { e.stopPropagation(); clear(); }}
              className="hover:text-red-500 mr-1"
            />
          )}
          <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            className="absolute bottom-full left-0 right-0 mb-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 space-y-3"
          >
            {/* Type tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
              {(['percentage', 'fixed'] as DiscountType[]).map(t => (
                <button
                  key={t}
                  onClick={() => apply(t, 0)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition-all ${
                    type === t ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t === 'percentage' ? <><Percent size={12} /> Porcentaje</> : <><DollarSign size={12} /> Monto Fijo</>}
                </button>
              ))}
            </div>

            {/* Quick presets */}
            {type === 'percentage' && (
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 15, 20].map(pct => (
                  <button
                    key={pct}
                    onClick={() => apply('percentage', pct)}
                    className={`py-1.5 rounded-lg text-xs font-black transition-all ${
                      val === pct ? 'bg-premium-emerald text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            )}

            {/* Input row */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => apply(type, val - (type === 'percentage' ? 5 : 1000))}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
              ><Minus size={14} /></button>
              <input
                type="number" min={0} max={maxVal} value={val || ''}
                placeholder="0"
                onChange={e => apply(type, parseFloat(e.target.value) || 0)}
                className="flex-1 text-center font-black text-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 outline-none focus:ring-2 focus:ring-premium-emerald/30 text-slate-900 dark:text-white"
              />
              <button
                onClick={() => apply(type, val + (type === 'percentage' ? 5 : 1000))}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
              ><Plus size={14} /></button>
            </div>

            {/* Preview & Apply */}
            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-xl">
              <span className="text-xs font-bold text-emerald-600">Descuento: −₡{amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <button
                onClick={() => setOpen(false)}
                className="text-xs font-black bg-premium-emerald text-white px-3 py-1 rounded-lg"
              >Aplicar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */
export default function POSTerminal() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [isClientPickerOpen, setIsClientPickerOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [enabledMethods, setEnabledMethods] = useState<string[]>([]);
  const [isCredit, setIsCredit] = useState(false);
  const [generateElectronicInvoice, setGenerateElectronicInvoice] = useState(true);
  // Client creation inline
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', identification: '', email: '', phone: '', address: '', isCreditEligible: false, maxCreditLevel: 0 });
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  // Invoice modal state
  const [invoiceData, setInvoiceData] = useState<{ sale: any; cart: any[]; client?: any; change?: number } | null>(null);
  const [settings, setSettings] = useState<any>({});

  // Exoneration modal state
  const [isExonerationModalOpen, setIsExonerationModalOpen] = useState(false);
  const [itemForExoneration, setItemForExoneration] = useState<number | null>(null);
  const [tempExoneration, setTempExoneration] = useState<any>({
    tipoDocumento: '01',
    numeroDocumento: '',
    nombreInstitucion: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    porcentaje: 13,
    monto: 0
  });

  useEffect(() => {
    async function init() {
      try {
        const [prodData, clientData, companySettings] = await Promise.all([
          getProducts(),
          getClients(),
          getCompanySettings()
        ]);
        setProducts(prodData);
        setClients(clientData);
        setSettings(companySettings);
        if (companySettings.enabledPaymentMethods) {
          setEnabledMethods(companySettings.enabledPaymentMethods);
        }
      } catch (e) {
        console.error('Error initializing POS', e);
      }
    }
    init();
  }, []);

  /* Client Creation */
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.identification) {
      toast.error('Nombre y Cédula son obligatorios');
      return;
    }
    setIsCreatingClient(true);
    try {
      const created = await createClient(newClient);
      const updatedClients = await getClients();
      setClients(updatedClients);
      setSelectedClientId(created.id.toString());
      setIsClientModalOpen(false);
      setNewClient({ name: '', identification: '', email: '', phone: '', address: '', isCreditEligible: false, maxCreditLevel: 0 });
      toast.success('Cliente creado y seleccionado exitosamente');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al crear el cliente.';
      toast.error(msg);
    } finally {
      setIsCreatingClient(false);
    }
  };

  /* Cart ops */
  const addToCart = (product: any) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) {
        if (ex.qty >= product.stockQuantity) { toast.error('Sin stock suficiente'); return prev; }
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      if (product.stockQuantity <= 0) { toast.error('Sin stock disponible'); return prev; }
      return [...prev, { product, qty: 1 }];
    });
  };
  const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.product.id !== id));
  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id !== id) return item;
      const newQty = Math.max(1, Math.min(item.qty + delta, item.product.stockQuantity));
      return { ...item, qty: newQty };
    }));
  };

  const handleOpenExoneration = (index: number) => {
    const item = cart[index];
    setItemForExoneration(index);
    if (item.exoneration) {
      setTempExoneration(item.exoneration);
    } else {
      // Calcular monto sugerido (13% o lo que sea el taxRate)
      const taxRate = item.product.taxRate || 13;
      const subtotalItem = item.product.salePrice * item.qty;
      const suggestedMonto = (subtotalItem * taxRate) / 100;

      setTempExoneration({
        tipoDocumento: '01',
        numeroDocumento: '',
        nombreInstitucion: '',
        fechaEmision: new Date().toISOString().split('T')[0],
        porcentaje: taxRate,
        monto: suggestedMonto
      });
    }
    setIsExonerationModalOpen(true);
  };

  const saveExoneration = () => {
    if (!tempExoneration.numeroDocumento || !tempExoneration.nombreInstitucion) {
      toast.error('Número de documento e Institución son obligatorios');
      return;
    }
    setCart(prev => prev.map((item, idx) =>
      idx === itemForExoneration ? { ...item, exoneration: { ...tempExoneration } } : item
    ));
    setIsExonerationModalOpen(false);
  };

  const removeExoneration = (index: number) => {
    setCart(prev => prev.map((item, idx) =>
      idx === index ? { ...item, exoneration: undefined } : item
    ));
  };

  const clearCart = () => { setCart([]); setDiscount(null); setSelectedClientId(''); setIsCredit(false); setShowPaymentMethods(false); };

  /* Totals */
  const subtotal = cart.reduce((acc, i) => acc + i.product.salePrice * i.qty, 0);
  const discountAmount = !discount ? 0 : discount.type === 'percentage'
    ? (subtotal * discount.value) / 100
    : Math.min(discount.value, subtotal);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const tax = settings.taxExempt ? 0 : cart.reduce((acc, i) => {
    const rate = (i.product.taxRate ?? 13) / 100;
    const baseImpuesto = i.product.salePrice * i.qty;
    const impuestoBruto = baseImpuesto * rate;
    const exoneracion = i.exoneration?.monto || 0;
    return acc + Math.max(0, impuestoBruto - exoneracion);
  }, 0);
  const total = subtotalAfterDiscount + tax;

  /* Helpers */
  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cabysCode?.includes(searchTerm) ||
    p.internalCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    c.identification?.includes(clientSearchTerm)
  );
  const selectedClient = clients.find(c => c.id.toString() === selectedClientId);

  /* Sale submission */
  const submitSale = async (paymentMethod: string) => {
    if (generateElectronicInvoice && (!selectedClientId || !selectedClient?.identification)) {
      toast.error('Se requiere un cliente con cédula para Factura Electrónica');
      return;
    }
    setIsProcessing(true);
    try {
      const saleData = {
        paymentMethod: isCredit ? 'CREDIT' : paymentMethod, // CREDIT overrides if selected
        subtotal,
        totalDiscount: discountAmount,
        discountType: discount?.type || null,
        discountValue: discount?.value || null,
        tax,
        total,
        clientId: selectedClientId ? parseInt(selectedClientId) : null,
        clientName: selectedClient?.name || 'Consumidor Final',
        clientIdentification: selectedClient?.identification || '',
        items: cart.map(i => ({
          productId: i.product.id,
          qty: i.qty,
          exonerationTipoDocumento: i.exoneration?.tipoDocumento,
          exonerationNumeroDocumento: i.exoneration?.numeroDocumento,
          exonerationNombreInstitucion: i.exoneration?.nombreInstitucion,
          exonerationFechaEmision: i.exoneration?.fechaEmision ? `${i.exoneration.fechaEmision}T00:00:00` : null,
          exonerationPorcentaje: i.exoneration?.porcentaje,
          exonerationMonto: i.exoneration?.monto
        })),
        generateElectronicInvoice,
        taxExempt: settings.taxExempt === true || settings.taxExempt === 'true'
      };
      const response = await createSale(saleData);
      toast.success('¡Venta completada con éxito!');
      // Mostrar modal moderno en vez de window.confirm
      setInvoiceData({ sale: response, cart: [...cart], client: selectedClient });
      clearCart();
      const data = await getProducts();
      setProducts(data);
    } catch {
      toast.error('Error al procesar la venta.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = (paymentMethod: string) => {
    if (cart.length === 0) return;
    if (paymentMethod === 'CASH') { setIsCashModalOpen(true); return; }
    submitSale(paymentMethod);
  };

  const handleCashPayment = async () => {
    const paid = parseFloat(cashAmount);
    if (isNaN(paid) || paid <= 0) { toast.error('Monto inválido'); return; }
    if (paid < total) { toast.error(`Faltan ₡${(total - paid).toLocaleString(undefined, { maximumFractionDigits: 0 })}`); return; }

    if (generateElectronicInvoice && (!selectedClientId || !selectedClient?.identification)) {
      toast.error('Se requiere un cliente con cédula para Factura Electrónica');
      return;
    }

    const change = paid - total;
    setIsProcessing(true);
    try {
      const saleData = {
        paymentMethod: 'CASH', subtotal, totalDiscount: discountAmount,
        discountType: discount?.type || null, discountValue: discount?.value || null,
        tax, total, clientId: selectedClientId ? parseInt(selectedClientId) : null,
        clientName: selectedClient?.name || 'Consumidor Final',
        clientIdentification: selectedClient?.identification || '',
        items: cart.map(i => ({ productId: i.product.id, qty: i.qty })),
        generateElectronicInvoice,
        taxExempt: settings.taxExempt === true || settings.taxExempt === 'true'
      };
      const response = await createSale(saleData);
      toast.success(`¡Venta completada! Vuelto: ₡${change.toLocaleString(undefined, { maximumFractionDigits: 0 })}`);
      setInvoiceData({ sale: response, cart: [...cart], client: selectedClient, change });
      clearCart(); setCashAmount(''); setIsCashModalOpen(false);
      const data = await getProducts(); setProducts(data);
    } catch {
      toast.error('Error al procesar la venta.');
    } finally {
      setIsProcessing(false);
    }
  };

  /* ─── Render ──────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Root: two fixed columns filling the page ── */}
      <div className="flex gap-6 h-full" style={{ minHeight: 0 }}>

        {/* ════════════════════════════════════════════════
            LEFT COLUMN — Product Search & Catalog
            ════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">

          {/* Search Bar */}
          <div className="premium-panel px-4 py-3 flex gap-3 items-center shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre, CABYS o código interno..."
                className="w-full bg-transparent border-none rounded-xl px-12 py-3 focus:ring-0 outline-none text-slate-800 dark:text-white placeholder:text-slate-400 font-medium text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
            </div>
            <button className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <Barcode className="text-slate-600 dark:text-slate-300" size={20} />
            </button>
          </div>

          {/* Product Grid — scrollable */}
          <div className="flex-1 premium-panel flex flex-col overflow-hidden min-h-0">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
              <h3 className="font-black text-slate-900 dark:text-white text-base">Catálogo</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {filteredProducts.length} productos
              </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 min-h-0">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {filteredProducts.map(prod => (
                  <motion.button
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={prod.id}
                    onClick={() => addToCart(prod)}
                    disabled={prod.stockQuantity <= 0}
                    className={`flex flex-col text-left bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-4 group transition-all hover:border-premium-emerald/40 hover:shadow-md hover:shadow-premium-emerald/10 hover:-translate-y-0.5 ${
                      prod.stockQuantity <= 0 ? 'opacity-40 cursor-not-allowed grayscale' : ''
                    }`}
                  >
                    {prod.internalCode && (
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-1.5 truncate w-full">
                        {prod.internalCode}
                      </span>
                    )}
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight line-clamp-2 mb-3 group-hover:text-premium-emerald transition-colors">
                      {prod.name}
                    </span>
                    <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/60 flex justify-between items-center w-full">
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        ₡{prod.salePrice?.toLocaleString()}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                        prod.stockQuantity > 5
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                          : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                      }`}>
                        {prod.stockQuantity}
                      </span>
                    </div>
                  </motion.button>
                ))}

                {filteredProducts.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-24 opacity-30">
                    <Search size={40} className="mb-3" />
                    <p className="font-bold text-sm">Sin resultados</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            RIGHT COLUMN — Cart & Checkout
            ════════════════════════════════════════════════ */}
        <div className="w-[400px] xl:w-[440px] flex flex-col premium-panel overflow-hidden shrink-0" style={{ minHeight: 0 }}>

          {/* ── Header ── */}
          <div className="px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 emerald-gradient rounded-xl flex items-center justify-center text-white shadow-md shadow-premium-emerald/30">
                  <ShoppingCart size={16} />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 dark:text-white text-base leading-tight">Carrito</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {cart.length} ítems {settings.cashierName && `• Atiende: ${settings.cashierName}`}
                  </p>
                </div>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  title="Vaciar carrito"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Client Selector */}
            <div className="relative">
              <button
                onClick={() => setIsClientPickerOpen(!isClientPickerOpen)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all text-left text-sm ${
                  selectedClient
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedClient ? 'bg-premium-emerald text-white' : 'bg-white dark:bg-slate-700 text-slate-400'
                }`}>
                  <User size={14} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Cliente</p>
                  <p className={`font-bold truncate text-sm ${selectedClient ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {selectedClient ? selectedClient.name : 'Consumidor Final'}
                  </p>
                </div>
                {selectedClientId ? (
                  <X
                    size={13}
                    className="text-slate-400 hover:text-red-500 shrink-0"
                    onClick={e => { e.stopPropagation(); setSelectedClientId(''); setIsCredit(false); }}
                  />
                ) : (
                  <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${isClientPickerOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              <AnimatePresence>
                {isClientPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                  >
                    <div className="p-2 border-b border-slate-50 dark:border-slate-800">
                      <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Buscar cliente..."
                          className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl pl-8 pr-3 py-2 text-sm font-bold outline-none text-slate-900 dark:text-white"
                          value={clientSearchTerm}
                          onChange={e => setClientSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-48 custom-scrollbar p-1.5">
                      {/* Plus button to add new client directly from search if no results or as option */}
                      <div className="pb-1 mb-1 border-b border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            setNewClient(prev => ({ ...prev, name: clientSearchTerm }));
                            setIsClientModalOpen(true);
                            setIsClientPickerOpen(false);
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-premium-emerald hover:bg-premium-emerald/10 bg-emerald-50/50 dark:bg-emerald-900/20 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                        >
                          <Plus size={16} /> Crear Nuevo Cliente
                        </button>
                      </div>
                      <button
                        onClick={() => { setSelectedClientId(''); setIsClientPickerOpen(false); setIsCredit(false); }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <p className="text-sm font-bold text-slate-800 dark:text-white">Consumidor Final</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Contado</p>
                      </button>
                      {filteredClients.map(c => (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedClientId(c.id.toString()); setIsClientPickerOpen(false); setClientSearchTerm(''); }}
                          className={`w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mt-0.5 ${
                            selectedClientId === c.id.toString() ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                          }`}
                        >
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">ID: {c.identification || 'N/A'}</p>
                        </button>
                      ))}
                      {filteredClients.length === 0 && clientSearchTerm && (
                        <div className="py-6 text-center text-slate-400 text-xs font-bold">Sin resultados</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Cart Items — scrollable flex-1 ── */}
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 px-3 py-2">
            <AnimatePresence>
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full py-16 text-slate-300 dark:text-slate-600"
                >
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-[20px] flex items-center justify-center mb-3">
                    <ShoppingCart size={28} />
                  </div>
                  <p className="font-bold text-sm">Carrito vacío</p>
                  <p className="text-xs mt-1">Toca un producto para agregarlo</p>
                </motion.div>
              ) : (
                <div className="space-y-2 py-1">
                  {cart.map((item, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      key={item.product.id}
                      className="flex items-center gap-3 bg-white dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/50"
                    >
                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight truncate">
                          {item.product.name}
                        </p>
                         <div className="flex items-center gap-2 mt-0.5">
                           <p className="text-xs text-slate-400 font-bold">
                             ₡{item.product.salePrice.toLocaleString()} c/u
                           </p>
                           {item.exoneration ? (
                             <button 
                               onClick={() => removeExoneration(index)}
                               className="text-[10px] font-black bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-tighter"
                             >
                               Exon: {item.exoneration.porcentaje}% (X)
                             </button>
                           ) : (
                             <button 
                               onClick={() => handleOpenExoneration(index)}
                               className="text-[10px] font-black text-slate-400 hover:text-blue-500 uppercase tracking-tighter"
                             >
                               + Exonerar
                             </button>
                           )}
                         </div>
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center bg-slate-100 dark:bg-slate-700/50 rounded-xl p-0.5 gap-0.5 shrink-0">
                        <button
                          onClick={() => updateQty(item.product.id, -1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-300"
                        ><Minus size={13} /></button>
                        <span className="w-7 text-center text-sm font-black text-slate-900 dark:text-white">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.product.id, 1)}
                          disabled={item.qty >= item.product.stockQuantity}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-600 transition-colors text-premium-emerald disabled:opacity-30"
                        ><Plus size={13} /></button>
                      </div>

                      {/* Line total + remove */}
                      <div className="text-right shrink-0 min-w-[72px]">
                        <p className="font-black text-slate-900 dark:text-white text-sm">
                          ₡{(item.product.salePrice * item.qty).toLocaleString()}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors mt-0.5"
                        ><X size={13} /></button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Totals + Discount + Payment — fixed bottom ── */}
          <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 px-5 pt-4 pb-5 space-y-3">

            {/* Totals */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Subtotal</span>
                <span className="text-slate-700 dark:text-slate-300">₡{subtotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              {discount && discountAmount > 0 && (
                <div className="flex justify-between text-xs font-bold text-amber-500 uppercase tracking-wider">
                  <span>Descuento</span>
                  <span>−₡{discountAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>IVA</span>
                <span className="text-slate-700 dark:text-slate-300">₡{tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">TOTAL</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">₡{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            {/* Discount toggle */}
            <InlineDiscount subtotal={subtotal} discount={discount} onChange={setDiscount} />


            {/* Electronic Invoice toggle — only if client selected */}
            {selectedClientId && (
              <div className="space-y-2">
                <button
                  onClick={() => setGenerateElectronicInvoice(v => !v)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    generateElectronicInvoice
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  <span className="flex items-center gap-2"><FileText size={14} /> Factura Electrónica (Hacienda)</span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${generateElectronicInvoice ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                    <motion.div animate={{ x: generateElectronicInvoice ? 20 : 2 }} className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                </button>
              </div>
            )}

            {/* Payment */}
            <AnimatePresence mode="wait">
              {!showPaymentMethods ? (
                <motion.button
                  key="pay-btn"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  onClick={() => { if (cart.length === 0) return; setShowPaymentMethods(true); }}
                  disabled={cart.length === 0}
                  className="w-full btn-premium-emerald py-4 flex flex-col items-center gap-0.5 disabled:opacity-30"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-75">Confirmar y Pagar</span>
                  <span className="text-xl font-black">₡{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </motion.button>
              ) : (
                <motion.div
                  key="payment-opts"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Método de Pago</span>
                    <button
                      onClick={() => setShowPaymentMethods(false)}
                      className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                    >← Volver</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(enabledMethods.length > 0 ? enabledMethods : ['CASH', 'CARD', 'SINPE_MOVIL', 'TRANSFER', 'CREDIT']).map(m => {
                        const meta = getPaymentMethodMeta(m);
                        if (!meta) return null;
                        
                        const isDisabled = m === 'CREDIT' && !selectedClientId;
                        
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => handleCheckout(m as any)}
                            disabled={isDisabled}
                            className={`flex items-center justify-center gap-2 font-black rounded-2xl py-4 transition-all text-sm group ${
                              isDisabled ? 'opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400' :
                              (m === 'CASH' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:scale-[1.02] active:scale-[0.98]' : 
                               'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:scale-[1.02] active:scale-[0.98]')
                            }`}
                          >
                            <meta.Icon size={16} /> {meta.label}
                          </button>
                        );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          CASH MODAL
          ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isCashModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCashModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 16 }}
              className="relative z-10 bg-white dark:bg-slate-900 rounded-[32px] p-8 w-full max-w-md shadow-2xl overflow-hidden"
            >
              {/* Decorative glow */}
              <div className="absolute -top-20 -left-20 w-52 h-52 bg-premium-emerald/15 blur-[60px] rounded-full pointer-events-none" />

              <div className="flex justify-between items-start mb-6 relative">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Pago en Efectivo</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Ingresa el monto recibido del cliente</p>
                </div>
                <button
                  onClick={() => setIsCashModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
                ><X size={20} /></button>
              </div>

              {/* Amount to collect */}
              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl px-5 py-4 flex justify-between items-center mb-5 border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Monto a Cobrar</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">₡{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="w-12 h-12 bg-premium-emerald/10 rounded-xl flex items-center justify-center text-premium-emerald">
                  <Banknote size={24} />
                </div>
              </div>

              {/* Cash input */}
              <div className="mb-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                  Monto Recibido
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₡</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={cashAmount}
                    onChange={e => setCashAmount(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-6 py-5 text-3xl font-black text-slate-900 dark:text-white focus:ring-4 focus:ring-premium-emerald/15 outline-none transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick amounts */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[1000, 2000, 5000, 10000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setCashAmount((parseFloat(cashAmount || '0') + amt).toString())}
                    className="py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-black text-xs text-slate-700 dark:text-slate-300 transition-colors"
                  >+{(amt / 1000).toFixed(0)}K</button>
                ))}
              </div>

              {/* Change preview */}
              <AnimatePresence>
                {cashAmount && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    {parseFloat(cashAmount) >= total ? (
                      <div className="flex justify-between items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                        <div>
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Vuelto a entregar</p>
                          <p className="text-2xl font-black text-emerald-600">
                            ₡{(parseFloat(cashAmount) - total).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                          <Plus size={24} className="rotate-45" />
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Faltante</p>
                        <p className="text-2xl font-black text-amber-600">
                          ₡{(total - parseFloat(cashAmount)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCashModalOpen(false)}
                  className="flex-1 py-4 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >Cancelar</button>
                <button
                  onClick={handleCashPayment}
                  disabled={isProcessing || !cashAmount || parseFloat(cashAmount) < total}
                  className="flex-1 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black py-4 rounded-2xl shadow-lg disabled:opacity-30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isProcessing ? 'Procesando...' : 'Confirmar Venta'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Invoice Modal (reemplaza window.confirm) ── */}
      {invoiceData && (
        <InvoiceModal
          isOpen={true}
          saleData={invoiceData.sale}
          cart={invoiceData.cart}
          client={invoiceData.client}
          change={invoiceData.change}
          companySettings={settings}
          onClose={() => setInvoiceData(null)}
          onDownloadPDF={() => {
            import('../../utils/pdfGenerator').then(({ generateAndDownloadTicket }) => {
              generateAndDownloadTicket(invoiceData.sale, invoiceData.cart, invoiceData.client, settings)
                .catch(() => toast.error('Error al generar PDF'));
            }).catch(() => toast.error('Error al generar PDF'));
            setInvoiceData(null);
          }}
        />
      )}

      {/* ── Client Creation Modal ── */}
      <AnimatePresence>
        {isClientModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsClientModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 16 }}
              className="relative z-10 bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-8 pt-8 pb-4 shrink-0 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Nuevo Cliente Rápido</h3>
                  <button onClick={() => setIsClientModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm text-slate-500">Añade los datos necesarios sin perder tu venta activa.</p>
              </div>

              <form onSubmit={handleCreateClient} className="flex flex-col">
                <div className="p-8 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1 tracking-widest">Nombre Completo *</label>
                      <input type="text" autoFocus required className="premium-input w-full" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} placeholder="Ej. Juan Pérez" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1 tracking-widest">Cédula *</label>
                      <input type="text" required className="premium-input w-full" value={newClient.identification} onChange={e => setNewClient({ ...newClient, identification: e.target.value })} placeholder="Física o Jurídica" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1 tracking-widest">Teléfono</label>
                      <input type="tel" className="premium-input w-full" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} placeholder="Ej. 8888-8888" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1 tracking-widest">Email</label>
                      <input type="email" className="premium-input w-full" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} placeholder="correo@ejemplo.com" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1 tracking-widest">Dirección (Opcional)</label>
                      <input type="text" className="premium-input w-full" value={newClient.address} onChange={e => setNewClient({ ...newClient, address: e.target.value })} placeholder="Ej. San José, Costa Rica..." />
                    </div>
                  </div>
                </div>
                <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex gap-4 bg-slate-50 dark:bg-slate-800/50">
                  <button type="button" onClick={() => setIsClientModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold bg-white dark:bg-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600">Cancelar</button>
                  <button type="submit" disabled={isCreatingClient} className="flex-1 btn-premium-emerald py-3 shadow-md">{isCreatingClient ? 'Guardando...' : 'Guardar y Seleccionar'}</button>
                </div>
              </form>
            </motion.div>
          </div>
         )}
       </AnimatePresence>
       <ExonerationModal 
         isOpen={isExonerationModalOpen}
         onClose={() => setIsExonerationModalOpen(false)}
         tempExoneration={tempExoneration}
         setTempExoneration={setTempExoneration}
         onSave={saveExoneration}
         cart={cart}
         itemForExoneration={itemForExoneration}
       />
     </>
   );
}

function ExonerationModal({ 
  isOpen, 
  onClose, 
  tempExoneration, 
  setTempExoneration, 
  onSave, 
  cart, 
  itemForExoneration 
}: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="liquid-glass-panel w-full max-w-md p-6 shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Detalles de Exoneración</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Documento</label>
                <select 
                  className="liquid-input w-full"
                  value={tempExoneration.tipoDocumento}
                  onChange={e => setTempExoneration({ ...tempExoneration, tipoDocumento: e.target.value })}
                >
                  <option value="01">Compras Autorizadas</option>
                  <option value="02">Ventas Exentas a Diplomáticos</option>
                  <option value="03">Orden de Compra (Instituciones)</option>
                  <option value="04">Exenciones MAG</option>
                  <option value="05">Exenciones MINAE</option>
                  <option value="99">Otros</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número de Documento</label>
                <input 
                  type="text" className="liquid-input w-full" placeholder="Ej: AL-00123"
                  value={tempExoneration.numeroDocumento}
                  onChange={e => setTempExoneration({ ...tempExoneration, numeroDocumento: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institución</label>
                <input 
                  type="text" className="liquid-input w-full" placeholder="Ej: MAG, Cruz Roja..."
                  value={tempExoneration.nombreInstitucion}
                  onChange={e => setTempExoneration({ ...tempExoneration, nombreInstitucion: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Emisión</label>
                  <input 
                    type="date" className="liquid-input w-full"
                    value={tempExoneration.fechaEmision}
                    onChange={e => setTempExoneration({ ...tempExoneration, fechaEmision: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">% Exonerado</label>
                  <input 
                    type="number" className="liquid-input w-full"
                    value={tempExoneration.porcentaje}
                    onChange={e => {
                      const pct = parseFloat(e.target.value) || 0;
                      const item = cart[itemForExoneration!];
                      const sub = item.product.salePrice * item.qty;
                      const suggestedMonto = (sub * pct) / 100;
                      setTempExoneration({ ...tempExoneration, porcentaje: pct, monto: suggestedMonto });
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 pt-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto a Exonerar (CRC)</label>
                  <span className="text-[10px] font-bold text-emerald-600">Sugerido: ₡{tempExoneration.monto.toLocaleString()}</span>
                </div>
                <input 
                  type="number" className="liquid-input w-full text-lg font-black"
                  value={tempExoneration.monto}
                  onChange={e => setTempExoneration({ ...tempExoneration, monto: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={onClose}
                className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
              >Cancelar</button>
              <button 
                onClick={onSave}
                className="flex-1 py-3 text-sm font-black bg-premium-emerald text-white rounded-2xl shadow-lg shadow-premium-emerald/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >Guardar Exoneración</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
