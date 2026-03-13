import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../services/api';

export default function SuppliersView() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<number | null>(null);
  const [newSupplier, setNewSupplier] = useState({ name: '', identification: '', email: '', phone: '', address: '', contactPerson: '' });

  const loadSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
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
    } catch (error) {
      console.error(error);
      toast.error(editingSupplierId ? 'Hubo un error al actualizar el proveedor.' : 'Hubo un error al guardar el proveedor.');
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

  const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                             s.identification?.includes(searchTerm));

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Truck className="text-orange-500" /> Directorio de Proveedores
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Gestiona los proveedores de productos y servicios.</p>
        </div>
        <button onClick={() => {
          setEditingSupplierId(null);
          setNewSupplier({ name: '', identification: '', email: '', phone: '', address: '', contactPerson: '' });
          setIsModalOpen(true);
        }} className="liquid-btn-primary py-2 px-4 shadow-sm text-sm flex items-center justify-center gap-2">
          <Plus size={18} /> Nuevo Proveedor
        </button>
      </div>

      <div className="premium-panel p-2 flex items-center gap-2 shrink-0">
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
      </div>

      <div className="liquid-glass-panel flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-semibold rounded-tl-xl">Nombre</th>
                <th className="p-4 font-semibold">Identificación</th>
                <th className="p-4 font-semibold">Contacto (Persona)</th>
                <th className="p-4 font-semibold">Teléfono</th>
                <th className="p-4 font-semibold">Correo</th>
                <th className="p-4 font-semibold">Dirección</th>
                <th className="p-4 font-semibold rounded-tr-xl text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((item, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  key={item.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{item.name}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{item.identification || '-'}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{item.contactPerson || '-'}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{item.phone || '-'}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{item.email || '-'}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{item.address || '-'}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
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
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-500 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(item.id, item.name)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-red-500 hover:border-red-500 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredSuppliers.length === 0 && (
                <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">No hay proveedores registrados o tu búsqueda no arrojó resultados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <h3 className="text-lg font-bold mb-4 dark:text-white">{editingSupplierId ? 'Editar Proveedor' : 'Registrar Proveedor'}</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Comercial <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Ej. Distribuidora S.A." required className="liquid-input w-full" value={newSupplier.name} onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cédula Jurídica / Física</label>
                  <input type="text" placeholder="Identificación..." className="liquid-input w-full" value={newSupplier.identification} onChange={(e) => setNewSupplier({...newSupplier, identification: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                  <input type="text" placeholder="Número..." className="liquid-input w-full" value={newSupplier.phone} onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Persona de Contacto</label>
                  <input type="text" placeholder="Nombre del agente o vendedor..." className="liquid-input w-full" value={newSupplier.contactPerson} onChange={(e) => setNewSupplier({...newSupplier, contactPerson: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                  <input type="email" placeholder="Email..." className="liquid-input w-full" value={newSupplier.email} onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección Exacta</label>
                  <input type="text" placeholder="Dirección..." className="liquid-input w-full" value={newSupplier.address} onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">Cancelar</button>
                <button onClick={handleCreateOrUpdate} className="liquid-btn-primary px-4 py-2 text-sm">
                  {editingSupplierId ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
