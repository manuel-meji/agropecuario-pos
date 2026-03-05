import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Receipt, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSales } from '../../services/api';

export default function SalesView() {
  const [sales, setSales] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadSales = async () => {
      try {
        const data = await getSales();
        // Ordenamos por fecha descendente
        const sorted = data.sort((a: any, b: any) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
        setSales(sorted);
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar el historial de ventas.');
      }
    };
    loadSales();
  }, []);

  const filteredSales = sales.filter(s => 
    s.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Receipt className="text-green-500" /> Historial de Ventas
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Consulta todas las transacciones realizadas en el sistema.</p>
        </div>
      </div>

      <div className="liquid-glass-panel p-4 flex gap-4 items-center shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por N° Factura, cliente, o método de pago..." 
            className="liquid-input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="liquid-glass-panel flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-semibold rounded-tl-xl w-48">N° Factura</th>
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold text-center">Método de Pago</th>
                <th className="p-4 font-semibold">Fecha y Hora</th>
                <th className="p-4 font-semibold text-right rounded-tr-xl">Total (CRC)</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((item, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  key={item.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <td className="p-4 font-bold text-gray-800 dark:text-gray-200">{item.invoiceNumber}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    <div className="font-medium text-gray-800 dark:text-gray-300">{item.clientName || 'Cliente Genérico'}</div>
                    {item.clientIdentification && <div className="text-xs text-gray-400">ID: {item.clientIdentification}</div>}
                  </td>
                  <td className="p-4 text-center">
                    <span className="py-1 px-3 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {item.paymentMethod === 'CASH' ? 'Efectivo' : item.paymentMethod === 'CARD' ? 'Tarjeta' : item.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    {new Date(item.createdDate).toLocaleString('es-CR')}
                  </td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white text-right">
                    ₡{item.finalTotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </motion.tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">No hay ventas registradas o la búsqueda no encontró coincidencias.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
