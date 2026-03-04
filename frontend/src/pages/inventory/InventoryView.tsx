import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Package, AlertCircle } from 'lucide-react';

const DUMMY_INVENTORY = [
  { id: 1, name: "Fertilizante NPK 15-15-15", sku: "FERT-001", category: "Fertilizantes", stock: 150, unit: "Saco 50kg", price: 25000, status: "IN_STOCK" },
  { id: 2, name: "Semilla de Maíz Híbrido", sku: "SEM-042", category: "Semillas", stock: 12, unit: "Bolsa 20kg", price: 45000, status: "LOW_STOCK" },
  { id: 3, name: "Tractor John Deere (Alquiler)", sku: "EQ-005", category: "Maquinaria", stock: 2, unit: "Día", price: 150000, status: "IN_STOCK" },
  { id: 4, name: "Herbicida Glifosato", sku: "AGQ-018", category: "Agroquímicos", stock: 0, unit: "Galón", price: 18500, status: "OUT_OF_STOCK" },
];

export default function InventoryView() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Inventario de Agronomía</h2>
          <p className="text-gray-500 dark:text-gray-400">Control de productos, insumos y maquinaria agrícola.</p>
        </div>
        <button className="liquid-btn-primary py-2 px-4 shadow-sm text-sm flex items-center justify-center gap-2 w-full md:w-auto">
          <Plus size={18} />
          Nuevo Producto
        </button>
      </div>

      {/* Controles de Filtrado */}
      <div className="liquid-glass-panel p-4 flex flex-col md:flex-row gap-4 items-center shrink-0">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, SKU o categoría..." 
            className="liquid-input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 w-full md:w-auto justify-center text-gray-700 dark:text-gray-300">
          <Filter size={18} />
          <span>Categorías</span>
        </button>
      </div>

      {/* Tabla Principal */}
      <div className="liquid-glass-panel flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-semibold rounded-tl-xl w-32">Estado</th>
                <th className="p-4 font-semibold">Producto</th>
                <th className="p-4 font-semibold">Categoría</th>
                <th className="p-4 font-semibold text-right">Existencias</th>
                <th className="p-4 font-semibold text-right rounded-tr-xl">Precio (CRC)</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_INVENTORY.map((item, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={item.id} 
                  className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors group cursor-pointer"
                >
                  <td className="p-4">
                    {item.status === 'IN_STOCK' && <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"><Package size={12}/> En Stock</span>}
                    {item.status === 'LOW_STOCK' && <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800"><AlertCircle size={12}/> Bajo</span>}
                    {item.status === 'OUT_OF_STOCK' && <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"><AlertCircle size={12}/> Agotado</span>}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-800 dark:text-gray-200">{item.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{item.sku}</div>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    <span className="py-1 px-2.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-medium text-gray-800 dark:text-gray-200">{item.stock}</div>
                    <div className="text-xs text-gray-500">{item.unit}</div>
                  </td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white text-right">
                    ₡{item.price.toLocaleString()}
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
