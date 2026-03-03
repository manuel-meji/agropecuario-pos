import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Building2, CalendarX2, ArrowUpRight } from 'lucide-react';

const DUMMY_PAYABLES = [
  { id: 1, supplier: "Agroquímicos del Norte S.A", amount: 1540000, dueDate: "2024-05-10", category: "Insumos", urgency: "HIGH" },
  { id: 2, supplier: "Ferretería Industrial EPA", amount: 350000, dueDate: "2024-05-20", category: "Herramientas", urgency: "MEDIUM" },
  { id: 3, supplier: "Innova Semillas CR", amount: 890000, dueDate: "2024-06-05", category: "Materia Prima", urgency: "LOW" },
  { id: 4, supplier: "Servicios Contables LF", amount: 150000, dueDate: "2024-04-30", category: "Servicios", urgency: "HIGH", isOverdue: true },
];

export default function PayablesView() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Cuentas por Pagar (CxP)</h2>
          <p className="text-gray-500 dark:text-gray-400">Control de deudas, créditos de proveedores y gastos fijos corporativos.</p>
        </div>
        <button className="liquid-btn-primary py-2 px-4 shadow-sm text-sm flex items-center justify-center gap-2 w-full md:w-auto bg-gradient-to-tr from-rose-600 to-rose-400 hover:shadow-[0_4px_14px_0_rgba(225,29,72,0.39)]">
          <Plus size={18} />
          Registrar Nueva Obligación
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <div className="liquid-glass-panel p-4 flex flex-col justify-center border-l-4 border-l-rose-500">
             <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Deuda Adquirida</span>
             <span className="text-2xl font-bold text-gray-900 dark:text-white">₡2,930,000</span>
          </div>
          <div className="liquid-glass-panel p-4 flex flex-col justify-center border-l-4 border-l-amber-500">
             <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Vencimientos Próximos (7d)</span>
             <span className="text-2xl font-bold text-gray-900 dark:text-white">₡1,690,000</span>
          </div>
          <div className="liquid-glass-panel p-4 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar proveedor..." 
                className="liquid-input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
      </div>

      {/* Grid de Tarjetas Animada */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DUMMY_PAYABLES.map((payable, index) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  key={payable.id}
                  className={`liquid-glass-panel p-5 flex flex-col hover:-translate-y-1 transition-transform relative overflow-hidden group border ${payable.isOverdue ? 'border-rose-500/50 dark:border-rose-500/50' : 'border-white/20 dark:border-gray-700/50'}`}
                >
                    {/* Borde superior de acento */}
                    <div className={`absolute top-0 left-0 w-full h-1 ${payable.isOverdue ? 'bg-rose-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                    
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
                             <Building2 size={20} />
                          </div>
                          <div>
                             <h4 className="font-semibold text-gray-800 dark:text-white leading-tight">{payable.supplier}</h4>
                             <span className="text-xs text-gray-500">{payable.category}</span>
                          </div>
                       </div>
                       <button className="p-1.5 text-gray-400 hover:text-agro-green hover:bg-agro-green/10 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                           <ArrowUpRight size={18} />
                       </button>
                    </div>

                    <div className="mt-auto">
                        <div className="flex justify-between items-end mb-3">
                           <span className="text-2xl font-bold text-gray-900 dark:text-white">₡{payable.amount.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm font-medium">
                           <CalendarX2 size={16} className={payable.isOverdue ? 'text-rose-500' : 'text-gray-400'}/>
                           <span className={payable.isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-gray-600 dark:text-gray-400'}>
                             {payable.isOverdue ? `Venció el ${payable.dueDate}` : `Vence: ${payable.dueDate}`}
                           </span>
                        </div>
                    </div>
                </motion.div>
            ))}
         </div>
      </div>

    </div>
  );
}
