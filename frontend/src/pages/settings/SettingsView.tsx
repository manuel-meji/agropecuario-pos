import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Save, X, Server, ShieldCheck, Cloud, HardDrive } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCompanySettings, saveCompanySettings, uploadCertificate, CompanySettings } from '../../utils/companySettings';
import { getConsecutive, updateConsecutive } from '../../services/api';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [dirty, setDirty] = useState(false);
  const [consecutive, setConsecutive] = useState<number | null>(null);
  const [consecutiveDirty, setConsecutiveDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [certFile, setCertFile] = useState<File | null>(null);

  // Cargar al montar
  useEffect(() => {
    async function init() {
      const s = await getCompanySettings();
      setSettings(s);
      setLoading(false);
      
      try {
        const res = await getConsecutive('01');
        setConsecutive(res.ultimoConsecutivo);
      } catch {
        setConsecutive(0);
      }
    }
    init();
  }, []);

  const handleChange = (field: keyof CompanySettings, value: any) => {
    if (!settings) return;
    setSettings(prev => prev ? ({ ...prev, [field]: value }) : null);
    setDirty(true);
  };

  const handleSave = async () => {
    if (!settings) return;
    const loadId = toast.loading('Guardando configuración...');
    try {
      await saveCompanySettings(settings);
      
      if (certFile) {
        await uploadCertificate(certFile);
        setCertFile(null);
      }

      setDirty(false);
      
      if (consecutiveDirty && consecutive !== null) {
        await updateConsecutive('01', consecutive);
        await updateConsecutive('04', consecutive);
        setConsecutiveDirty(false);
      }
      
      toast.success('¡Configuración guardada correctamente!', { id: loadId });
    } catch (error) {
      toast.error('Error al guardar la configuración.', { id: loadId });
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    const s = await getCompanySettings();
    setSettings(s);
    setDirty(false);
    setLoading(false);
    toast('Cambios descartados.', { icon: '↩️' });
  };

  if (loading || !settings) {
    return <div className="flex h-full items-center justify-center">Cargando... de base de datos...</div>;
  }

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
             disabled={!dirty && !consecutiveDirty}
             className={`liquid-btn-primary py-2 px-6 shadow-sm flex items-center justify-center gap-2 text-sm font-semibold transition-all ${(!dirty && !consecutiveDirty) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
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
                         <h4 className="font-bold text-blue-900 dark:text-blue-300">Conexión Segura Tributación</h4>
                         <p className="text-sm text-blue-700 dark:text-blue-400/80 mt-1">Configura las credenciales de ATV. Los datos se almacenan de forma encriptada en el servidor (AES-256).</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Usuario API (Hacienda)</label>
                         <input 
                           type="text" 
                           className="liquid-input w-full" 
                           value={settings.haciendaUsername || ''} 
                           onChange={e => handleChange('haciendaUsername', e.target.value)}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ambiente</label>
                         <select 
                           className="liquid-input w-full cursor-pointer appearance-none"
                           value={settings.haciendaAmbiente}
                           onChange={e => handleChange('haciendaAmbiente', e.target.value as any)}
                         >
                            <option value="stag">Sandbox (Pruebas)</option>
                            <option value="prod">Producción (Real)</option>
                         </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                         <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contraseña API</label>
                         <input 
                           type="password" 
                           className="liquid-input w-full" 
                           placeholder="Dejar en blanco para no cambiar"
                           value={settings.haciendaPassword || ''}
                           onChange={e => handleChange('haciendaPassword', e.target.value)}
                         />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                         <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Último Consecutivo Utilizado</label>
                         <p className="text-xs text-slate-500 mb-2">Define o ajusta el número consecutivo donde quieres empezar a facturar.</p>
                         <input 
                           type="number" 
                           min="0"
                           className="liquid-input w-full" 
                           value={consecutive ?? ''} 
                           onChange={e => {
                             setConsecutive(parseInt(e.target.value) || 0);
                             setConsecutiveDirty(true);
                           }}
                         />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                         <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Código Actividad Económica (Hacienda)</label>
                         <input 
                           type="text" 
                           className="liquid-input w-full" 
                           placeholder="Ej: 512102"
                           value={settings.haciendaActividadEconomica || ''}
                           onChange={e => handleChange('haciendaActividadEconomica', e.target.value)}
                         />
                      </div>
                   </div>

                   <hr className="border-gray-200 dark:border-gray-800" />

                   <div>
                      <h4 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                         <ShieldCheck size={18} className="text-agro-green" /> Llave Criptográfica (.p12)
                      </h4>
                      <div className="space-y-4">
                        <div className="flex gap-4 items-center">
                          <input 
                            type="password" 
                            className="liquid-input flex-1" 
                            placeholder="Contraseña del certificado .p12"
                            value={settings.haciendaKeystorePassword || ''}
                            onChange={e => handleChange('haciendaKeystorePassword', e.target.value)}
                          />
                        </div>
                        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-gray-900/20">
                           <HardDrive className="text-gray-400 mb-2" />
                           <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                             {certFile ? certFile.name : (settings.hasCertificate ? '✅ Certificado cargado en sistema' : 'Subir archivo de certificado (.p12)')}
                           </p>
                           <input 
                             type="file" 
                             accept=".p12" 
                             className="hidden" 
                             id="cert-upload" 
                             onChange={e => setCertFile(e.target.files?.[0] || null)}
                           />
                           <label 
                             htmlFor="cert-upload"
                             className="mt-3 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                           >
                             {certFile ? 'Cambiar Archivo' : 'Seleccionar Archivo'}
                           </label>
                        </div>
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
                               <option value="1">San José (1)</option>
                               <option value="2">Alajuela (2)</option>
                               <option value="3">Cartago (3)</option>
                               <option value="4">Heredia (4)</option>
                               <option value="5">Guanacaste (5)</option>
                               <option value="6">Puntarenas (6)</option>
                               <option value="7">Limón (7)</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cantón (Código 2 dígitos)</label>
                            <input
                              type="text"
                              className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-premium-emerald/20 outline-none transition-all"
                              placeholder="Ej: 01"
                              value={settings.canton || ''}
                              onChange={e => handleChange('canton', e.target.value)}
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Distrito (Código 2 dígitos)</label>
                            <input
                              type="text"
                              className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-premium-emerald/20 outline-none transition-all"
                              placeholder="Ej: 01"
                              value={settings.distrito || ''}
                              onChange={e => handleChange('distrito', e.target.value)}
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Barrio (Código 2 dígitos)</label>
                            <input
                              type="text"
                              className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-premium-emerald/20 outline-none transition-all"
                              placeholder="Ej: 01"
                              value={settings.barrio || ''}
                              onChange={e => handleChange('barrio', e.target.value)}
                            />
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
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Persona Atendiendo (Cajero/a)</label>
                           <input
                             type="text"
                             className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-premium-emerald/20 outline-none transition-all"
                             placeholder="Nombre del cajero..."
                             value={settings.cashierName}
                             onChange={e => handleChange('cashierName', e.target.value)}
                           />
                        </div>
                        <div className="space-y-2 md:col-span-2 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
                           <div>
                             <label className="font-bold text-orange-800 dark:text-orange-400">Régimen Exento de Impuestos</label>
                             <p className="text-xs text-orange-600 dark:text-orange-500/80 mt-1">Habilita esta opción si tu negocio pertenece al Régimen de Tributación Simplificada o Agropecuario sin IVA.</p>
                           </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked={settings.taxExempt} onChange={e => handleChange('taxExempt', e.target.checked)} />
                              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                            </label>
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
