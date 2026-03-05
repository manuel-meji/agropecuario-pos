import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Barcode, Trash2, Plus, Minus, CreditCard, Banknote, ShoppingCart, User, Smartphone, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProducts, createSale, getClients } from '../../services/api';

export default function POSTerminal() {
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCredit, setIsCredit] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [changeAmount, setChangeAmount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const prodData = await getProducts();
        setProducts(prodData);
        
        try {
            const clientData = await getClients();
            setClients(clientData);
        } catch (e) {
            console.error("Could not load clients", e);
        }
      } catch (error) {
        console.error("Error loading products for POS", error);
      }
    };
    loadData();
  }, []);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stockQuantity) return prev;
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      if (product.stockQuantity <= 0) return prev;
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };
  
  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(1, Math.min(item.qty + delta, item.product.stockQuantity));
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const calculateSubtotal = () => cart.reduce((acc, item) => acc + (item.product.salePrice * item.qty), 0);
  const calculateTax = () => cart.reduce((acc, item) => {
    const rate = item.product.isAgrochemicalInsufficiency ? 0.01 : 0.13;
    return acc + (item.product.salePrice * item.qty * rate);
  }, 0);

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = subtotal + tax;

  const handleCashPayment = async () => {
    const paidAmount = parseFloat(cashAmount);
    
    if (isNaN(paidAmount) || paidAmount <= 0) {
      toast.error('Por favor ingresa un monto válido.');
      return;
    }
    
    if (paidAmount < total) {
      toast.error(`El monto es insuficiente. Faltam ₡${(total - paidAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
      return;
    }

    const change = paidAmount - total;
    setChangeAmount(change);

    // Process the sale
    setIsProcessing(true);
    try {
      const saleData = {
        paymentMethod: "CASH",
        subtotal: subtotal,
        tax: tax,
        total: total,
        clientId: selectedClientId ? parseInt(selectedClientId) : null,
        items: cart.map(item => ({
          productId: item.product.id,
          qty: item.qty
        }))
      };
      
      await createSale(saleData);
      
      // Show change modal
      toast.success(`¡Venta completada! Vuelto: ₡${change.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
      
      // Reset state
      setCart([]);
      setCashAmount('');
      setChangeAmount(0);
      setTimeout(() => setIsCashModalOpen(false), 1500);
      
      // Reload products
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
       console.error("Sale error", error);
       toast.error("Ocurrió un error al procesar la venta.");
    } finally {
       setIsProcessing(false);
    }
  };

  const handleCheckout = async (paymentMethod: string) => {
    if (cart.length === 0) return;

    if (paymentMethod === "CASH") {
      setIsCashModalOpen(true);
      return;
    }

    setIsProcessing(true);
    try {
      const saleData = {
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        tax: tax,
        total: total,
        clientId: selectedClientId ? parseInt(selectedClientId) : null,
        items: cart.map(item => ({
          productId: item.product.id,
          qty: item.qty
        }))
      };
      
      await createSale(saleData);
      setCart([]);
      toast.success("¡Venta completada con éxito!");
      
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
       console.error("Sale error", error);
       toast.error("Ocurrió un error al procesar la venta.");
    } finally {
       setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.cabysCode?.includes(searchTerm) || 
    p.internalCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">
      
      {/* Zona Izquierda: Buscador y Grilla Virtual */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="liquid-glass-panel p-4 flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por Nombre, CABYS o Código Interno..." 
                className="liquid-input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Barcode className="text-gray-600 dark:text-gray-300" />
            </button>
        </div>

        <div className="flex-1 liquid-glass-panel p-4 overflow-y-auto custom-scrollbar">
           <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Catálogo General</h3>
           <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(prod => (
                 <button 
                  key={prod.id} 
                  onClick={() => addToCart(prod)}
                  disabled={prod.stockQuantity <= 0}
                  className={`flex flex-col text-left bg-white/40 dark:bg-gray-800/40 p-4 rounded-xl border border-white/20 dark:border-gray-700/50 hover:border-agro-green/50 hover:shadow-lg transition-all active:scale-95 group ${prod.stockQuantity <= 0 ? 'opacity-50 cursor-not-allowed filter grayscale' : ''}`}
                 >
                    <span className="text-xs text-gray-500 mb-1 font-mono">CABYS: {prod.cabysCode}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-agro-green transition-colors leading-tight line-clamp-2">{prod.name}</span>
                    <div className="mt-auto flex justify-between items-end w-full">
                       <span className="text-lg font-bold text-agro-green">₡{prod.salePrice?.toLocaleString()}</span>
                       <span className={`text-xs px-2 py-1 rounded-full font-medium ${prod.stockQuantity > 0 ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                         Stock: {prod.stockQuantity}
                       </span>
                    </div>
                 </button>
              ))}
              {filteredProducts.length === 0 && (
                 <p className="col-span-full text-center text-gray-400 p-8">No se encontraron productos.</p>
              )}
           </div>
        </div>
      </div>

      {/* Zona Derecha: Ticket de Facturación */}
      <div className="w-full lg:w-[400px] xl:w-[450px] liquid-glass-panel flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-black/5 dark:bg-white/5 rounded-t-xl gap-3 flex flex-col">
           <h2 className="text-xl font-bold flex items-center justify-between">
              Ticket Actual
              <span className="text-sm font-normal text-gray-500 bg-white dark:bg-gray-900 px-3 py-1 rounded-full shadow-sm">POS 4.0</span>
           </h2>
           <div className="flex bg-white dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-800 items-center gap-2">
              <User size={16} className="text-gray-400" />
              <select 
                className="bg-transparent text-sm w-full outline-none text-gray-700 dark:text-gray-300"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
              >
                  <option value="">Cliente Genérico (Contado)</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} - {c.identification}</option>)}
              </select>
           </div>
           <div className="flex items-center gap-2">
             <input 
               type="checkbox" 
               id="credit" 
               checked={isCredit} 
               onChange={(e) => setIsCredit(e.target.checked)} 
               className="rounded" 
             />
             <label htmlFor="credit" className="text-sm text-gray-700 dark:text-gray-300">Venta a Crédito</label>
           </div>
        </div>

        {/* Lista de Items */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
           {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                 <ShoppingCart size={48} className="mb-4" />
                 <p>El carrito está vacío</p>
                 <p className="text-sm mt-2">Haz clic en un producto para agregarlo.</p>
              </div>
           ) : (
             cart.map(item => (
                <div key={item.product.id} className="flex flex-col bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                   <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-800 dark:text-gray-100 text-sm">{item.product.name}</span>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded-md transition-colors">
                        <Trash2 size={16} />
                      </button>
                   </div>
                   <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg p-1 shadow-sm border border-gray-100 dark:border-gray-800">
                         <button onClick={() => updateQty(item.product.id, -1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><Minus size={14} /></button>
                         <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                         <button onClick={() => updateQty(item.product.id, 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-agro-green" disabled={item.qty >= item.product.stockQuantity}><Plus size={14} /></button>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="font-bold text-gray-800 dark:text-gray-100">₡{(item.product.salePrice * item.qty).toLocaleString()}</span>
                         <span className="text-[10px] text-gray-500">IVA {item.product.isAgro ? '1%' : '13%'}</span>
                      </div>
                   </div>
                </div>
             ))
           )}
        </div>

        {/* Totales y Botones de Pago */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 rounded-b-xl border-dashed">
           <div className="space-y-2 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                 <span>Subtotal</span>
                 <span>₡{subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                 <span>Impuestos (IVA Ley 9635)</span>
                 <span>₡{tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-gray-900 dark:text-white mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                 <span>Total Pago</span>
                 <span className="text-agro-green">₡{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3">
              <button 
                 onClick={() => handleCheckout("CASH")}
                 disabled={cart.length === 0 || isProcessing} 
                 className="liquid-btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                 <Banknote size={20} />
                 {isProcessing ? 'Procesando...' : 'Efectivo'}
              </button>
              <button 
                 onClick={() => handleCheckout("CARD")}
                 disabled={cart.length === 0 || isProcessing} 
                 className="bg-gradient-to-tr from-blue-700 to-blue-500 text-white font-medium rounded-lg px-4 py-3 shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-lg transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                 <CreditCard size={20} />
                 {isProcessing ? 'Procesando...' : 'Tarjeta'}
              </button>
              <button 
                 onClick={() => handleCheckout("SIMPE_MOVIL")}
                 disabled={cart.length === 0 || isProcessing} 
                 className="bg-gradient-to-tr from-green-700 to-green-500 text-white font-medium rounded-lg px-4 py-3 shadow-[0_4px_14px_0_rgba(34,197,94,0.39)] hover:shadow-lg transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                 <Smartphone size={20} />
                 {isProcessing ? 'Procesando...' : 'SIMPE Móvil'}
              </button>
              <button 
                 onClick={() => handleCheckout("CREDIT")}
                 disabled={cart.length === 0 || isProcessing || !selectedClientId} 
                 className="bg-gradient-to-tr from-purple-700 to-purple-500 text-white font-medium rounded-lg px-4 py-3 shadow-[0_4px_14px_0_rgba(147,51,234,0.39)] hover:shadow-lg transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                 <CreditCard size={20} />
                 {isProcessing ? 'Procesando...' : 'Crédito'}
              </button>
           </div>
        </div>
      </div>

      {/* Modal de Pago en Efectivo */}
      <AnimatePresence>
        {isCashModalOpen && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{scale: 0.9, opacity: 0}} 
              animate={{scale: 1, opacity: 1}} 
              exit={{scale: 0.9, opacity: 0}}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold dark:text-white">Pago en Efectivo</h3>
                <button
                  onClick={() => {
                    setIsCashModalOpen(false);
                    setCashAmount('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monto a Pagar</p>
                  <p className="text-4xl font-bold text-agro-green">₡{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monto Recibido
                  </label>
                  <input
                    type="number"
                    placeholder="Ingresa el monto..."
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="liquid-input w-full text-lg"
                    autoFocus
                  />
                </div>

                {cashAmount && parseFloat(cashAmount) >= total && (
                  <motion.div 
                    initial={{opacity: 0, y: -10}}
                    animate={{opacity: 1, y: 0}}
                    className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400">Vuelto</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      ₡{((parseFloat(cashAmount) || 0) - total).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </motion.div>
                )}

                {cashAmount && parseFloat(cashAmount) < total && (
                  <motion.div 
                    initial={{opacity: 0, y: -10}}
                    animate={{opacity: 1, y: 0}}
                    className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400">Falta</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                      ₡{(total - (parseFloat(cashAmount) || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsCashModalOpen(false);
                    setCashAmount('');
                  }}
                  className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCashPayment}
                  disabled={isProcessing || !cashAmount || parseFloat(cashAmount) < total}
                  className="flex-1 liquid-btn-primary disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isProcessing ? 'Procesando...' : 'Confirmar Pago'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
