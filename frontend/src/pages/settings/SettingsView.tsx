import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Save, X, Server, ShieldCheck, Cloud, HardDrive } from 'lucide-react';
import toast from 'react-hot-toast';

const SETTINGS_KEY = 'agropecuario_company_settings';

const DEFAULT_SETTINGS = {
  businessName: '',
  legalId: '',
  phone: '',
  email: '',
  address: '',
  province: 'San José',
  currency: 'CRC',
  printMode: 'browser',
  printerName: '',
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [dirty, setDirty] = useState(false);

  // Cargar al montar
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const handleChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setDirty(false);
      toast.success('¡Configuración guardada correctamente!');
    } catch {
      toast.error('Error al guardar la configuración.');
    }
  };

  const handleCancel = () => {
    setSettings(loadSettings());
    setDirty(false);
    toast('Cambios descartados.', { icon: '↩️' });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Configuración del Sistema</h2>
          <p className="text-gray-500 dark:text-gray-400">Parámetros corporativos, conexión a Tributación y Hardware local.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <button
             onClick={handleCancel}
             className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
           >
             <X size={18} /> Cancelar
           </button>
           <button
             onClick={handleSave}
             disabled={!dirty}
             className={`liquid-btn-primary py-2 px-6 shadow-sm flex items-center justify-center gap-2 text-sm font-semibold transition-all ${!dirty ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
           >
             <Save size={18} /> Guardar
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
         {/* Navegación Lateral */}
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

         {/* Panel de Contenido */}
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
                         <p className="text-xs text-gray-500 mt-1">Validez restante: 342 Días (Firma XAdES-EPES activa)</p>
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === 'general' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl">
                    <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="relative group">
                           <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[32px] flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 group-hover:border-premium-emerald transition-all cursor-pointer overflow-hidden">
                              <Building2 size={32} className="text-slate-400 group-hover:text-premium-emerald transition-colors" />
                           </div>
                           <button className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 p-2 rounded-xl text-premium-emerald hover:scale-110 transition-transform">
                              <Save size={16} />
                           </button>
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-slate-900 dark:text-white">Identidad Corporativa</h3>
                           <p className="text-sm text-slate-500 font-medium mt-1">Sube el logo de tu empresa para las facturas y reportes.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                           <input
                             type="text"
                             className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-premium-emerald/20 outline-none transition-all"
                             placeholder="Agropecuario San José"
                             value={settings.businessName}
                             onChange={e => handleChange('businessName', e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cédula Jurídica / Física</label>
                           <input
                             type="text"
                             className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-premium-emerald/20 outline-none transition-all"
                             placeholder="3-101-XXXXXX"
                             value={settings.legalId}
                             onChange={e => handleChange('legalId', e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono de Contacto</label>
                           <input
                             type="tel"
                             className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-premium-emerald/20 outline-none transition-all"
                             placeholder="+506 8888-8888"
                             value={settings.phone}
                             onChange={e => handleChange('phone', e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                           <input
                             type="email"
                             className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-premium-emerald/20 outline-none transition-all"
                             placeholder="facturacion@empresa.com"
                             value={settings.email}
                             onChange={e => handleChange('email', e.target.value)}
                           />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección Exacta</label>
                           <textarea
                             className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-premium-emerald/20 outline-none transition-all min-h-[100px] resize-none"
                             placeholder="100 metros norte de la plaza central..."
                             value={settings.address}
                             onChange={e => handleChange('address', e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Provincia</label>
                           <select
                             className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-premium-emerald/20 outline-none transition-all appearance-none"
                             value={settings.province}
                             onChange={e => handleChange('province', e.target.value)}
                           >
                              <option>San José</option>
                              <option>Alajuela</option>
                              <option>Cartago</option>
                              <option>Heredia</option>
                              <option>Guanacaste</option>
                              <option>Puntarenas</option>
                              <option>Limón</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Moneda Principal</label>
                           <select
                             className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-premium-emerald/20 outline-none transition-all appearance-none"
                             value={settings.currency}
                             onChange={e => handleChange('currency', e.target.value)}
                           >
                              <option value="CRC">Colón Costarricense (₡)</option>
                              <option value="USD">Dólar Estadounidense ($)</option>
                           </select>
                        </div>
                    </div>
                </motion.div>
             )}

             {activeTab === 'hardware' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 max-w-4xl">
                   <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 flex gap-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400 h-fit">
                         <HardDrive size={24} />
                      </div>
                      <div>
                         <h4 className="font-bold text-purple-900 dark:text-purple-300">Configuración de Hardware Local</h4>
                         <p className="text-sm text-purple-700 dark:text-purple-400/80 mt-1">Configuración de impresoras térmicas ESC/POS (Ej. 3nStar de 58mm).</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-2 md:col-span-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Método de Impresión</label>
                         <select
                           className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-premium-emerald/20 outline-none transition-all appearance-none cursor-pointer"
                           value={settings.printMode || 'browser'}
                           onChange={e => handleChange('printMode', e.target.value)}
                         >
                            <option value="browser">Diálogo del Navegador (Normal, Vista Previa)</option>
                            <option value="escpos">Impresión Silenciosa Backend (Recomendado para POS 58mm - Rápida)</option>
                         </select>
                      </div>

                      {settings.printMode === 'escpos' && (
                         <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Impresora Tiquetera en Windows</label>
                            <input
                              type="text"
                              className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-premium-emerald/20 outline-none transition-all"
                              placeholder="Ejemplo: 3nStar RPT001"
                              value={settings.printerName || ''}
                              onChange={e => handleChange('printerName', e.target.value)}
                            />
                            <p className="text-xs text-slate-500 font-medium px-2 mt-2">
                              Debe ser el nombre EXACTO de la impresora instalada en las opciones de "Dispositivos e impresoras" de Windows. El backend de Java se encargará de enviar los comandos nativos de impresión.
                            </p>
                         </div>
                      )}
                   </div>
                </motion.div>
             )}

             {activeTab === 'advanced' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 max-w-3xl">
                   <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 flex gap-4">
                      <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-lg text-rose-600 dark:text-rose-400 h-fit">
                         <Server size={24} />
                      </div>
                      <div>
                         <h4 className="font-bold text-rose-900 dark:text-rose-300">Backup & Cierre de Día (EOD)</h4>
                         <p className="text-sm text-rose-700 dark:text-rose-400/80 mt-1">Respaldos automáticos y reportes de fin de jornada.</p>
                      </div>
                   </div>
                   <p className="text-slate-500 dark:text-slate-400 text-sm">Módulo en desarrollo. Disponible en próxima versión.</p>
                </motion.div>
             )}

         </div>
      </div>
    </div>
  );
}
