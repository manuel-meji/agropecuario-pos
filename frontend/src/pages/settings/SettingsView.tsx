import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Save, X, Server, ShieldCheck, Cloud, HardDrive, Wallet, CheckCircle2, UserCircle, Users, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCompanySettings, saveCompanySettings, uploadCertificate, CompanySettings } from '../../utils/companySettings';
import { getConsecutive, updateConsecutive, updateProfile, getUsers, createUser, deleteUser } from '../../services/api';
import authService from '../../services/authService';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [dirty, setDirty] = useState(false);
  const [consecutive, setConsecutive] = useState<number | null>(null);
  const [consecutiveDirty, setConsecutiveDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [certFile, setCertFile] = useState<File | null>(null);
  
  // Profile update states
  const [profileData, setProfileData] = useState({ currentPassword: '', newUsername: '', newPassword: '', newEmail: '' });
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN');

  // Users management states
  const [usersList, setUsersList] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ username: '', name: '', email: '', password: '', role: ['user'] });
  const [userLoading, setUserLoading] = useState(false);

  // Cargar al montar
  useEffect(() => {
    async function init() {
      const s = await getCompanySettings();
      setSettings(s);
      
      if (isAdmin) {
         try {
             const uList = await getUsers();
             setUsersList(uList);
         } catch(e) {}
      }

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
               onClick={() => setActiveTab('payments')}
               className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all text-left ${activeTab === 'payments' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
               <Wallet size={20} /> Billeteras & Pagos
            </button>
            <button 
               onClick={() => setActiveTab('advanced')}
               className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all text-left ${activeTab === 'advanced' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
               <Server size={20} /> Backup & EOD
            </button>
            <button 
               onClick={() => setActiveTab('profile')}
               className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all text-left ${activeTab === 'profile' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
               <UserCircle size={20} /> Mi Perfil
            </button>
            {isAdmin && (
               <button 
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all text-left ${activeTab === 'users' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
               >
                  <Users size={20} /> Usuarios (Admin)
               </button>
            )}
         </div>

         {/* Panel de Contenido */}
         <div className="flex-1 liquid-glass-panel p-6 overflow-y-auto custom-scrollbar relative">              {activeTab === 'payments' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-3xl">
                   <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-4">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-600 dark:text-amber-400 h-fit">
                         <Wallet size={24} />
                      </div>
                      <div>
                         <h4 className="font-bold text-amber-900 dark:text-amber-300">Configuración de Billeteras</h4>
                         <p className="text-sm text-amber-700 dark:text-amber-400/80 mt-1">Activa o desactiva los medios de pago disponibles en el sistema. Los métodos desactivados no aparecerán en el POS ni en cierres de caja.</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'CASH', label: 'Efectivo', desc: 'Cobros físicos en billetes y monedas' },
                        { id: 'SINPE_MOVIL', label: 'SINPE Móvil', desc: 'Transferencias rápidas vía número telefónico' },
                        { id: 'CARD', label: 'Tarjeta', desc: 'Cobros vía Datáfono (Visa/Mastercard)' },
                        { id: 'TRANSFER', label: 'Transferencia', desc: 'Depósitos bancarios directos' },
                        { id: 'CREDIT', label: 'Venta a Crédito', desc: 'Permitir que ciertos clientes compren a crédito' }
                      ].map(method => {
                        const isEnabled = settings.enabledPaymentMethods?.includes(method.id);
                        return (
                          <div 
                            key={method.id}
                            onClick={() => {
                              const current = settings.enabledPaymentMethods || [];
                              const next = isEnabled 
                                ? current.filter(m => m !== method.id)
                                : [...current, method.id];
                              handleChange('enabledPaymentMethods', next);
                            }}
                            className={`group cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-start gap-4 ${isEnabled ? 'bg-amber-500/5 border-amber-500/30' : 'bg-slate-50 dark:bg-slate-900/50 border-transparent opacity-60 hover:opacity-100 hover:border-slate-200 dark:hover:border-slate-800'}`}
                          >
                            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isEnabled ? 'bg-amber-500 border-amber-500' : 'border-slate-300 dark:border-slate-600'}`}>
                              {isEnabled && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                            <div className="flex-1">
                               <p className={`font-black uppercase tracking-widest text-xs ${isEnabled ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>{method.label}</p>
                               <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-relaxed">{method.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                   </div>
                </motion.div>
              )}


             
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

             {activeTab === 'profile' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 max-w-3xl">
                   <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 flex gap-4">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400 h-fit">
                         <UserCircle size={24} />
                      </div>
                      <div>
                         <h4 className="font-bold text-indigo-900 dark:text-indigo-300">Editar Perfil de Acceso</h4>
                         <p className="text-sm text-indigo-700 dark:text-indigo-400/80 mt-1">Actualiza el usuario o contraseña de tu cuenta actual ({currentUser?.username}).</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contraseña Actual <span className="text-red-500">*</span></label>
                         <p className="text-xs text-slate-500 mb-1">Necesaria para autorizar cualquier cambio.</p>
                         <input 
                           type="password" 
                           className="liquid-input w-full" 
                           value={profileData.currentPassword}
                           onChange={e => setProfileData({...profileData, currentPassword: e.target.value})}
                         />
                      </div>

                       <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Correo Electrónico Actualizado</label>
                          <input 
                            type="email" 
                            className="liquid-input w-full" 
                            placeholder={currentUser?.email || 'tu@correo.com'}
                            value={profileData.newEmail}
                            onChange={e => setProfileData({...profileData, newEmail: e.target.value})}
                          />
                       </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nuevo Nombre de Usuario</label>
                           <input 
                             type="text" 
                             className="liquid-input w-full" 
                             placeholder={currentUser?.username}
                             value={profileData.newUsername}
                             onChange={e => setProfileData({...profileData, newUsername: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nueva Contraseña</label>
                           <input 
                             type="password" 
                             className="liquid-input w-full" 
                             placeholder="Dejar en blanco para no cambiar"
                             value={profileData.newPassword}
                             onChange={e => setProfileData({...profileData, newPassword: e.target.value})}
                           />
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                         <button 
                           onClick={async () => {
                              if (!profileData.currentPassword) {
                                  toast.error("Debes ingresar tu contraseña actual.");
                                  return;
                              }
                              const loadId = toast.loading('Actualizando perfil...');
                              try {
                                 const res = await updateProfile({
                                     currentPassword: profileData.currentPassword,
                                     newUsername: profileData.newUsername || undefined,
                                     newPassword: profileData.newPassword || undefined,
                                     newEmail: profileData.newEmail || undefined
                                 });
                                 toast.success(typeof res === 'string' ? res : 'Perfil actualizado con éxito.', { id: loadId });
                                 setProfileData({ currentPassword: '', newUsername: '', newPassword: '', newEmail: '' });
                                 setTimeout(() => { authService.logout(); window.location.href = '/login'; }, 2000);
                              } catch(e: any) {
                                 toast.error(e.response?.data || 'Error al actualizar', { id: loadId });
                              }
                           }}
                           className="liquid-btn-primary px-6 py-2 shadow-sm text-sm flex items-center gap-2 font-semibold transition-transform hover:scale-[1.02]"
                         >
                           <Save size={18} /> Actualizar Credenciales
                         </button>
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === 'users' && isAdmin && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-4xl">
                   <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4 flex gap-4">
                      <div className="p-2 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg text-cyan-600 dark:text-cyan-400 h-fit">
                         <Users size={24} />
                      </div>
                      <div>
                         <h4 className="font-bold text-cyan-900 dark:text-cyan-300">Gestión de Usuarios del Sistema</h4>
                         <p className="text-sm text-cyan-700 dark:text-cyan-400/80 mt-1">Crea nuevas cuentas de acceso y gestiona los trabajadores del sistema. Los correos deben ser reales para que los trabajadores puedan recuperar su contraseña si la olvidan.</p>
                      </div>
                   </div>

                   <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                      <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Añadir Nuevo Empleado</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                         <input type="text" className="liquid-input text-sm" placeholder="Nombre de Usuario (ej. cajero1)" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                         <input type="email" className="liquid-input text-sm" placeholder="Correo (MUUY IMPORTANTE)" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                         <input type="password" className="liquid-input text-sm" placeholder="Contraseña Temporal" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                         <select className="liquid-input text-sm" value={newUser.role[0]} onChange={e => setNewUser({...newUser, role: [e.target.value]})}>
                             <option value="user">Cajero (ROLE_USER)</option>
                             <option value="admin">Administrador (ROLE_ADMIN)</option>
                         </select>
                      </div>
                      <div className="mt-4 flex justify-end">
                         <button 
                           onClick={async () => {
                               if (!newUser.username || !newUser.password || !newUser.email) return toast.error('Llene todos los campos');
                               setUserLoading(true);
                               const loadingToast = toast.loading('Creando cuenta...');
                               try {
                                   await createUser(newUser);
                                   toast.success('Cuenta creada exitosamente', { id: loadingToast });
                                   setUsersList(await getUsers());
                                   setNewUser({ username: '', name: '', email: '', password: '', role: ['user'] });
                               } catch(e:any) {
                                   toast.error(e.response?.data || 'Error al crear', { id: loadingToast });
                               } finally {
                                   setUserLoading(false);
                               }
                           }}
                           disabled={userLoading}
                           className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 text-sm transition-colors disabled:opacity-50"
                         >
                           <Plus size={16} /> Crear Cuenta
                         </button>
                      </div>
                   </div>

                   <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <table className="w-full text-left text-sm">
                         <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                            <tr>
                               <th className="p-4">Usuario</th>
                               <th className="p-4">Correo Electrónico</th>
                               <th className="p-4">Rol en Sistema</th>
                               <th className="p-4 text-right">Acciones</th>
                            </tr>
                         </thead>
                         <tbody>
                            {usersList.map(u => (
                               <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{u.username}</td>
                                  <td className="p-4 text-slate-500">{u.email}</td>
                                  <td className="p-4">
                                     <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md ${u.roles?.some((r:any) => r.name === 'ROLE_ADMIN') ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                        {u.roles?.some((r:any) => r.name === 'ROLE_ADMIN') ? 'Administrador' : 'Cajero'}
                                     </span>
                                  </td>
                                  <td className="p-4 text-right">
                                     <button 
                                        disabled={u.username === currentUser?.username}
                                        onClick={async () => {
                                            if(!window.confirm(`¿Seguro que deseas eliminar a ${u.username}?`)) return;
                                            const tl = toast.loading('Eliminando...');
                                            try {
                                                await deleteUser(u.id);
                                                setUsersList(usersList.filter(x => x.id !== u.id));
                                                toast.success('Eliminado correctamente', { id: tl });
                                            } catch(e) {
                                                toast.error('Error al eliminar', { id: tl });
                                            }
                                        }}
                                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        title={u.username === currentUser?.username ? 'No puedes eliminarte a ti mismo' : 'Eliminar Cuenta'}
                                     >
                                        <Trash2 size={16} />
                                     </button>
                                  </td>
                               </tr>
                            ))}
                            {usersList.length === 0 && (
                               <tr><td colSpan={4} className="p-6 text-center text-slate-500 font-medium">No hay usuarios registrados o cargando...</td></tr>
                            )}
                         </tbody>
                      </table>
                   </div>
                </motion.div>
             )}

         </div>
      </div>
    </div>
  );
}
