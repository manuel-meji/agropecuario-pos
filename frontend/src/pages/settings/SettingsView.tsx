import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Save, X, Server, ShieldCheck, Mail, AlertTriangle, Cloud, HardDrive } from 'lucide-react';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Configuración del Sistema</h2>
          <p className="text-gray-500 dark:text-gray-400">Parámetros corporativos, conexión a Tributación y Hardware local.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
             <X size={18} /> Cancelar
           </button>
           <button className="liquid-btn-primary py-2 px-6 shadow-sm flex items-center justify-center gap-2">
             <Save size={18} /> Guardar
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
         {/* Navegación Lateral Configuraciones */}
         <div className="w-full lg:w-64 liquid-glass-panel p-2 flex flex-col gap-1 shrink-0 h-fit">
            <button 
               onClick={() => setActiveTab('general')}
               className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all text-left ${activeTab === 'general' ? 'bg-agro-green/10 text-agro-green dark:text-emerald-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
               <Building2 size={20} /> Datos Empresa
            </button>
            <button 
               onClick={() => setActiveTab('hacienda')}
               className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all text-left ${activeTab === 'hacienda' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
               <Cloud size={20} /> Nodo Min. Hacienda
            </button>
            <button 
               onClick={() => setActiveTab('hardware')}
               className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all text-left ${activeTab === 'hardware' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
               <HardDrive size={20} /> Hardware & Tiqueteras
            </button>
            <button 
               onClick={() => setActiveTab('advanced')}
               className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all text-left ${activeTab === 'advanced' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
               <Server size={20} /> Backup & EOD
            </button>
         </div>

         {/* Panel de Entradas (Tab Content) */}
         <div className="flex-1 liquid-glass-panel p-6 overflow-y-auto custom-scrollbar relative">
             
             {activeTab === 'hacienda' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-3xl">
                   
                   <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400 h-fit">
                         <ShieldCheck size={24} />
                      </div>
                      <div>
                         <h4 className="font-bold text-blue-900 dark:text-blue-300">Conexión Segura OIDC Activa</h4>
                         <p className="text-sm text-blue-700 dark:text-blue-400/80 mt-1">El servidor está tramitando y firmando tokens Bearer correctamente con el Entorno Staging (Pruebas) de ATV v4.4.</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Usuario API (ATV)</label>
                         <input type="text" className="liquid-input w-full" defaultValue="cpf-02-0453-xxxx-x" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Entorno de Emisión</label>
                         <select className="liquid-input w-full cursor-pointer appearance-none">
                            <option value="test">Sandbox (Pruebas)</option>
                            <option value="prod">Producción (ATV)</option>
                         </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                         <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contraseña API</label>
                         <input type="password" className="liquid-input w-full" defaultValue="**********" />
                      </div>
                   </div>

                   <hr className="border-gray-200 dark:border-gray-800" />

                   <div>
                      <h4 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                         <ShieldCheck size={18} className="text-agro-green" /> Llave Criptográfica (.p12)
                      </h4>
                      <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-gray-900/20">
                         <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm mb-3">
                            <Server className="text-gray-400" />
                         </div>
                         <p className="font-medium text-gray-800 dark:text-gray-200">El certificado está cargado en el motor Backend</p>
                         <p className="text-xs text-gray-500 mt-1">Validez restante: 342 Días (Firma XAdES-EPES actica)</p>
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === 'general' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 max-w-3xl flex flex-col items-center justify-center h-full opacity-50">
                    <Building2 size={64} className="text-gray-300 dark:text-gray-700 mb-4" />
                    <p className="text-xl font-bold dark:text-gray-400">Datos Corporativos</p>
                    <p className="text-sm text-gray-500">Formulario en desarrollo</p>
                </motion.div>
             )}

        </div>
      </div>
    </div>
  );
}
