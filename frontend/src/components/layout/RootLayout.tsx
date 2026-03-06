import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useThemeStore } from "../../store/themeStore";
import { Moon, Sun, Bell, Search as SearchIcon, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import authService from "../../services/authService";

export default function RootLayout() {
  const { isDark, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, [location.pathname]);

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
      '/sales': 'Historial de Ventas',
      '/clients': 'Directorio de Clientes',
      '/suppliers': 'Gestión de Proveedores',
      '/taxes': 'Módulo Tributario',
      '/settings': 'Configuración',
      '/pos': 'Terminal de Ventas'
    };
    return titles[location.pathname] || 'Terminal de Ventas';
  };

  return (
    <div className="flex h-screen overflow-hidden relative font-sans">
      {/* Mesh Background Circles */}
      <div className="mesh-bg overflow-hidden p-0 m-0">
        <div className="mesh-circle w-[500px] h-[500px] bg-premium-emerald top-[-100px] right-[-100px] animate-premium-float"></div>
        <div className="mesh-circle w-[300px] h-[300px] bg-blue-500 bottom-[10%] left-[-50px] animate-premium-float" style={{ animationDelay: '2s' }}></div>
        <div className="mesh-circle w-[400px] h-[400px] bg-purple-500 bottom-[-100px] right-[20%] animate-premium-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Sidebar Navigation */}
      <div className="z-30 hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
        {/* iOS Style Top Navigation Bar */}
        <header className="h-20 flex items-center justify-between px-8 z-20 shrink-0">
          <div className="flex flex-col">
            <motion.h1 
              key={location.pathname}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
            >
              {getPageTitle()}
            </motion.h1>
            <span className="text-xs text-slate-500 font-medium">Agropecuario POS v4.0</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Search Tooltip Style */}
            <div className="hidden lg:flex items-center bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl px-4 py-2 border border-black/5 dark:border-white/5 mr-4 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
              <SearchIcon size={18} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
              <span className="ml-2 text-sm text-slate-400 font-medium pr-8">Buscar módulo...</span>
              <kbd className="text-[10px] font-bold bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400">⌘K</kbd>
            </div>

             {/* Notifications */}
            <button className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </button>

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
           <motion.div
             key={location.pathname}
             initial={{ opacity: 0, y: 8 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.2, ease: "easeOut" }}
             className="h-full w-full custom-scrollbar overflow-auto"
           >
              <Outlet />
           </motion.div>
        </div>
      </main>
    </div>
  );
}
