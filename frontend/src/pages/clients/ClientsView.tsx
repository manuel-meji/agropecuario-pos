import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { getClients, createClient } from '../../services/api';

export default function ClientsView() {
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', identification: '', email: '', phone: '', address: '' });

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar los clientes.');
    }
  };

  useEffect(() => { loadClients(); }, []);

  const handleCreate = async () => {
    if (!newClient.name) {
      toast.error('El nombre del cliente es obligatorio.');
      return;
    }
    try {
      await createClient(newClient);
      toast.success('Cliente registrado exitosamente.');
      setIsModalOpen(false);
      setNewClient({ name: '', identification: '', email: '', phone: '', address: '' });
      loadClients();
    } catch (error) {
      console.error(error);
      toast.error('Hubo un error al guardar el cliente.');
    }
  };

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                             c.identification?.includes(searchTerm));

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Users className="text-blue-500" /> Directorio de Clientes
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Gestiona los clientes para asignarles ventas y créditos.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="liquid-btn-primary py-2 px-4 shadow-sm text-sm flex items-center justify-center gap-2">
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      <div className="liquid-glass-panel p-4 flex gap-4 items-center shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o cédula..." 
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
                <th className="p-4 font-semibold rounded-tl-xl">Nombre</th>
                <th className="p-4 font-semibold">Identificación</th>
                <th className="p-4 font-semibold">Teléfono</th>
                <th className="p-4 font-semibold">Correo</th>
                <th className="p-4 font-semibold rounded-tr-xl">Dirección</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((item, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  key={item.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{item.name}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{item.identification || '-'}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{item.phone || '-'}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{item.email || '-'}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{item.address || '-'}</td>
                </motion.tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">No hay clientes registrados o tu búsqueda no arrojó resultados.</td>
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
              <h3 className="text-lg font-bold mb-4 dark:text-white">Registrar Cliente</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Ej. Juan Pérez" required className="liquid-input w-full" value={newClient.name} onChange={(e) => setNewClient({...newClient, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cédula / NIT</label>
                  <input type="text" placeholder="Identificación..." className="liquid-input w-full" value={newClient.identification} onChange={(e) => setNewClient({...newClient, identification: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                  <input type="text" placeholder="Número..." className="liquid-input w-full" value={newClient.phone} onChange={(e) => setNewClient({...newClient, phone: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                  <input type="email" placeholder="Email..." className="liquid-input w-full" value={newClient.email} onChange={(e) => setNewClient({...newClient, email: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección Exacta</label>
                  <input type="text" placeholder="Dirección..." className="liquid-input w-full" value={newClient.address} onChange={(e) => setNewClient({...newClient, address: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">Cancelar</button>
                <button onClick={handleCreate} className="liquid-btn-primary px-4 py-2 text-sm">Registrar</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
