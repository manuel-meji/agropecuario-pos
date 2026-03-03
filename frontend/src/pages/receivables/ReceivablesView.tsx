import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, FileText, CheckCircle2, Clock } from 'lucide-react';

const DUMMY_RECEIVABLES = [
  { id: 1, client: "Finca El Rosal S.A.", amount: 850000, dueDate: "2024-05-15", status: "PENDING", invoice: "FE-001042" },
  { id: 2, client: "Juan Pérez (Cooperativa)", amount: 125000, dueDate: "2024-05-02", status: "OVERDUE", invoice: "FE-000985" },
  { id: 3, client: "Hacienda La Gloria", amount: 2400000, dueDate: "2024-06-01", status: "PENDING", invoice: "FE-001150" },
  { id: 4, client: "Inversiones del Norte", amount: 450000, dueDate: "2024-04-28", status: "PAID", invoice: "FE-000921" },
];

export default function ReceivablesView() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Cuentas por Cobrar (CxC)</h2>
          <p className="text-gray-500 dark:text-gray-400">Gestión de créditos emitidos a clientes de confianza.</p>
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
            placeholder="Buscar por cliente o número de factura..." 
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

      {/* Tabla Principal Animada */}
      <div className="liquid-glass-panel flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-semibold rounded-tl-xl w-24">Estado</th>
                <th className="p-4 font-semibold">Cliente / Entidad</th>
                <th className="p-4 font-semibold">Factura Ref.</th>
                <th className="p-4 font-semibold">Vencimiento</th>
                <th className="p-4 font-semibold text-right rounded-tr-xl">Monto (CRC)</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_RECEIVABLES.map((item, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={item.id} 
                  className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors group cursor-pointer"
                >
                  <td className="p-4">
                    {item.status === 'PENDING' && <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800"><Clock size={12}/> Pendiente</span>}
                    {item.status === 'PAID' && <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"><CheckCircle2 size={12}/> Pagado</span>}
                    {item.status === 'OVERDUE' && <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"><AlertTriangle size={12}/> Vencido</span>}
                  </td>
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{item.client}</td>
                  <td className="p-4 text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <FileText size={16} className="text-gray-400 group-hover:text-agro-green transition-colors"/>
                    {item.invoice}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{item.dueDate}</td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white text-right">
                    ₡{item.amount.toLocaleString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Necesario importar internamente el Alert icon faltante superior:
import { AlertTriangle } from 'lucide-react';
