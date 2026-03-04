
import { motion } from 'framer-motion';
import { FileSpreadsheet, Download, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const DUMMY_TAXES = [
  { id: 1, period: "Abril 2024", type: "IVA (D-104-2)", status: "PENDING", dueDate: "2024-05-15", amount: 1450000 },
  { id: 2, period: "Marzo 2024", type: "IVA (D-104-2)", status: "SUBMITTED", dueDate: "2024-04-15", amount: 1320500 },
  { id: 3, period: "Febrero 2024", type: "IVA (D-104-2)", status: "SUBMITTED", dueDate: "2024-03-15", amount: 1280000 },
  { id: 4, period: "Periodo 2023", type: "Renta (D-101)", status: "SUBMITTED", dueDate: "2024-03-15", amount: 4500000 },
];

export default function TaxesView() {

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Módulo Tributario CR Version 4.4</h2>
          <p className="text-gray-500 dark:text-gray-400">Gestión de declaraciones, facturación electrónica e IVA.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="p-2 border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2 flex-1 md:flex-none">
            <Download size={18} />
            XML Recibidos
          </button>
          <button className="liquid-btn-primary py-2 px-4 shadow-sm text-sm flex items-center justify-center gap-2 flex-1 md:flex-none">
            <FileSpreadsheet size={18} />
            Nueva Declaración
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <div className="liquid-glass-panel p-5 border-l-4 border-agro-green flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total IVA Cobrado (Mes)</span>
          <span className="text-2xl font-bold dark:text-white">₡450,000</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            +12% vs mes anterior
          </span>
        </div>
        <div className="liquid-glass-panel p-5 border-l-4 border-amber-500 flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total IVA Pagado (Mes)</span>
          <span className="text-2xl font-bold dark:text-white">₡210,000</span>
          <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
            Sujeto a validación CR
          </span>
        </div>
        <div className="liquid-glass-panel p-5 border-l-4 border-blue-500 flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo a Favor (Proyectado)</span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">₡0</span>
        </div>
      </div>

      {/* Tabla Principal Animada */}
      <div className="liquid-glass-panel flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-black/5 dark:bg-white/5">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Historial de Declaraciones Tributarias</h3>
        </div>
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-semibold w-32">Estado</th>
                <th className="p-4 font-semibold">Periodo</th>
                <th className="p-4 font-semibold">Tipo Declaración</th>
                <th className="p-4 font-semibold">Vencimiento</th>
                <th className="p-4 font-semibold text-right">Monto Declarado (CRC)</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_TAXES.map((item, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={item.id} 
                  className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors group cursor-pointer"
                >
                  <td className="p-4">
                    {item.status === 'PENDING' && <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800"><Clock size={12}/> Pendiente</span>}
                    {item.status === 'SUBMITTED' && <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"><CheckCircle size={12}/> Presentado</span>}
                    {item.status === 'OVERDUE' && <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"><AlertTriangle size={12}/> Atrasado</span>}
                  </td>
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{item.period}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    <span className="py-1 px-2.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{item.dueDate}</td>
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
