import { useState } from 'react';
import { Search, Barcode, Trash2, Plus, Minus, CreditCard, Banknote } from 'lucide-react';

// Placeholder temporal hasta conectar backend CABYS
const DUMMY_PRODUCTS = [
  { id: 1, cabys: "3461501000000", name: "Fertilizante Urea 46%", price: 15500, stock: 120, isAgro: true },
  { id: 2, cabys: "3461400000000", name: "Herbicida Glifosato 35.6", price: 6200, stock: 45, isAgro: true },
  { id: 3, cabys: "4211101000000", name: "Alambre Púa Moto 350m", price: 28900, stock: 12, isAgro: false },
  { id: 4, cabys: "4422100000000", name: "Bomba Fumigar Fija 18L", price: 18500, stock: 8, isAgro: false },
];

export default function POSTerminal() {
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };
  
  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const calculateSubtotal = () => cart.reduce((acc, item) => acc + (item.product.price * item.qty), 0);
  const calculateTax = () => cart.reduce((acc, item) => {
    const rate = item.product.isAgro ? 0.01 : 0.13;
    return acc + (item.product.price * item.qty * rate);
  }, 0);

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = subtotal + tax;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">
      
      {/* Zona Izquierda: Buscador y Grilla Virtual */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Barra de Búsqueda Liquid */}
        <div className="liquid-glass-panel p-4 flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por Nombre, CABYS o Código de Barras..." 
                className="liquid-input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Barcode className="text-gray-600 dark:text-gray-300" />
            </button>
        </div>

        {/* Grilla de Productos */}
        <div className="flex-1 liquid-glass-panel p-4 overflow-y-auto custom-scrollbar">
           <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Catálogo General</h3>
           <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {DUMMY_PRODUCTS.map(prod => (
                 <button 
                  key={prod.id} 
                  onClick={() => addToCart(prod)}
                  className="flex flex-col text-left bg-white/40 dark:bg-gray-800/40 p-4 rounded-xl border border-white/20 dark:border-gray-700/50 hover:border-agro-green/50 hover:shadow-lg transition-all active:scale-95 group"
                 >
                    <span className="text-xs text-gray-500 mb-1 font-mono">CABYS: {prod.cabys}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-agro-green transition-colors leading-tight line-clamp-2">{prod.name}</span>
                    <div className="mt-auto flex justify-between items-end w-full">
                       <span className="text-lg font-bold text-agro-green">₡{prod.price.toLocaleString()}</span>
                       <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300 font-medium">Stock: {prod.stock}</span>
                    </div>
                 </button>
              ))}
           </div>
        </div>
      </div>

      {/* Zona Derecha: Ticket de Facturación */}
      <div className="w-full lg:w-[400px] xl:w-[450px] liquid-glass-panel flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-black/5 dark:bg-white/5 rounded-t-xl">
           <h2 className="text-xl font-bold flex items-center justify-between">
              Ticket Actual
              <span className="text-sm font-normal text-gray-500 bg-white dark:bg-gray-900 px-3 py-1 rounded-full shadow-sm">Fact. Estricta 4.4</span>
           </h2>
        </div>

        {/* Lista de Items */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
           {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                 <ShoppingCart size={48} className="mb-4" />
                 <p>El carrito está vacío</p>
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
                         <button onClick={() => updateQty(item.product.id, 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-agro-green"><Plus size={14} /></button>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="font-bold text-gray-800 dark:text-gray-100">₡{(item.product.price * item.qty).toLocaleString()}</span>
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
                 <span>₡{subtotal.toLocaleString()}</span>
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
              <button disabled={cart.length === 0} className="liquid-btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                 <Banknote size={20} />
                 Efectivo
              </button>
              <button disabled={cart.length === 0} className="bg-gradient-to-tr from-blue-700 to-blue-500 text-white font-medium rounded-lg px-4 py-3 shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-lg transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                 <CreditCard size={20} />
                 Tarjeta
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
