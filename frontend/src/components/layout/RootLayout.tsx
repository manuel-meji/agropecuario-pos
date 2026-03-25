import { useEffect, useState, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import { useThemeStore } from "../../store/themeStore";
import { Moon, Sun, Bell, LogOut, CheckCircle, XCircle, Clock } from "lucide-react";
import authService from "../../services/authService";
import { getRecentInvoices } from "../../services/api";

export default function RootLayout() {
  const { isDark, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchInvoices = () => {
    const user = authService.getCurrentUser();
    if (user && user.token) {
      getRecentInvoices().then(data => setInvoices(data)).catch(() => {});
    }
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    if (user && user.token) {
      fetchInvoices();
      const intervalId = setInterval(fetchInvoices, 20000); // Poll every 20s
      return () => clearInterval(intervalId);
    }
  }, [location.pathname]);

  const handleToggleDropdown = () => {
    if (!showDropdown) {
      fetchInvoices();
    }
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasErrors = invoices.some(i => i.estado === 'RECHAZADO' || i.estado === 'ERROR_ENVIO');

  const displayName = currentUser?.name || currentUser?.username || 'Usuario';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w.charAt(0).toUpperCase())
    .join('');
  const role = currentUser?.roles?.includes('ROLE_ADMIN') ? 'Administrador' : 'Operador';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/inventory': 'Inventario',
      '/receivables': 'Cuentas por Cobrar',
      '/payables': 'Cuentas por Pagar',
      '/sales': 'Historial de Transacciones',
      '/clients': 'Directorio de Clientes',
      '/suppliers': 'Gestión de Proveedores',
      '/taxes': 'Módulo Tributario',
      '/expenses': 'Registro de Gastos',
      '/settings': 'Configuración',
      '/pos': 'Terminal de Ventas'
    };
    return titles[location.pathname] || 'Terminal de Ventas';
  };

  return (
    <div className="flex h-screen overflow-hidden relative font-sans">
      {/* Mesh Background — sin animación para evitar compositor overhead en scroll */}
      <div className="mesh-bg overflow-hidden p-0 m-0 print:hidden">
        <div className="mesh-circle w-[600px] h-[600px] bg-premium-emerald top-[-150px] right-[-150px]" />
        <div className="mesh-circle w-[350px] h-[350px] bg-blue-500 bottom-[10%] left-[-80px]" />
        <div className="mesh-circle w-[450px] h-[450px] bg-purple-500 bottom-[-120px] right-[15%]" />
      </div>

      {/* Sidebar Navigation */}
      <div className="z-30 hidden md:block print:hidden">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
        {/* iOS Style Top Navigation Bar */}
        <header className="h-20 flex items-center justify-between px-8 z-20 shrink-0 print:hidden">
          <div className="flex flex-col">
            <h1
              key={location.pathname}
              className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
            >
              {getPageTitle()}
            </h1>
            <span className="text-xs text-slate-500 font-medium">Agropecuario POS v4.0</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Hacienda Monitor Notifications */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={handleToggleDropdown}
                className={`p-2.5 rounded-2xl bg-white dark:bg-slate-800 border ${hasErrors ? 'border-rose-300 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/30' : 'border-slate-200 dark:border-slate-700 hover:scale-105'} text-slate-600 dark:text-slate-300 transition-all relative`}
                title="Estado de Documentos Hacienda"
              >
                <Bell size={20} className={hasErrors ? 'animate-pulse text-rose-500' : ''} />
                {hasErrors && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-ping"></span>}
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[120%] right-0 w-[350px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-50 origin-top-right"
                  >
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 backdrop-blur-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">Monitor Hacienda</h3>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-widest">Últimos documentos procesados</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                          <Bell size={14} />
                        </div>
                      </div>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                      {invoices.length === 0 ? (
                        <div className="p-10 text-center flex flex-col items-center gap-3">
                          <CheckCircle size={32} className="text-slate-200 dark:text-slate-700" />
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sin DTEs Recientes</span>
                        </div>
                      ) : (
                        <div className="p-2 space-y-1">
                          {invoices.map((inv: any) => (
                            <div key={inv.id} className="p-3 bg-white dark:bg-transparent rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                              <div className="flex justify-between items-start mb-1.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                  {String(inv.tipo).replace(/_/g, ' ')}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                  {new Date(inv.fechaActualizacion).toLocaleString('es-CR', {hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit'})}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                {inv.estado === 'ACEPTADO' && <CheckCircle size={14} className="text-emerald-500" />}
                                {(inv.estado === 'RECHAZADO' || inv.estado === 'ERROR_ENVIO') && <XCircle size={14} className="text-rose-500" />}
                                {inv.estado !== 'ACEPTADO' && inv.estado !== 'RECHAZADO' && inv.estado !== 'ERROR_ENVIO' && <Clock size={14} className="text-amber-500 animate-pulse" />}
                                <span className={`text-xs font-black uppercase tracking-wider ${
                                  inv.estado === 'ACEPTADO' ? 'text-emerald-600 dark:text-emerald-400' :
                                  (inv.estado === 'RECHAZADO' || inv.estado === 'ERROR_ENVIO') ? 'text-rose-600 dark:text-rose-400' :
                                  'text-amber-600 dark:text-amber-400'
                                }`}>{String(inv.estado).replace(/_/g, ' ')}</span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 line-clamp-2 leading-tight" title={inv.mensaje || inv.clave}>
                                {inv.mensaje || `Clave: ${inv.clave}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 ml-2 bg-white dark:bg-slate-900 p-1.5 pr-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-9 h-9 rounded-2xl emerald-gradient flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-premium-emerald/20">
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{displayName}</span>
                <span className="text-[10px] text-slate-500 font-medium">{role}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="ml-1 p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Container */}
        <div className="flex-1 overflow-hidden z-10 w-full h-full px-8 pb-8">
          <div
            key={location.pathname}
            className="h-full w-full overflow-hidden page-enter"
          >
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
