import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  PackageSearch,
  Users,
  CreditCard,
  FileSpreadsheet,
  Settings,
  Receipt,
  Wallet,
  Truck,
  Leaf
} from "lucide-react";
import { motion } from "framer-motion";

const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
    { name: "Terminal POS", path: "/pos", icon: ShoppingCart },
    { name: "Historial de Transacciones", path: "/sales", icon: Receipt },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Inventario", path: "/inventory", icon: PackageSearch },
    { name: "Clientes", path: "/clients", icon: Users },
    { name: "Proveedores", path: "/suppliers", icon: Truck },
    { name: "Cuentas por Cobrar", path: "/receivables", icon: Wallet },
    { name: "Cuentas por Pagar", path: "/payables", icon: CreditCard },
    { name: "Módulo Tributario", path: "/taxes", icon: FileSpreadsheet },
    { name: "Configuración", path: "/settings", icon: Settings }
  ];

  return (
    <aside
      className={`h-[calc(100vh-40px)] m-5 ios-glass rounded-[40px] sticky top-5 z-40 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col pt-8 group shadow-2xl shadow-black/5 dark:shadow-black/20 ${isHovered ? 'w-72' : 'w-24'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Brand Icon */}
      <div className="flex items-center px-7 mb-10 overflow-hidden">
        <div className="w-10 h-10 shrink-0 emerald-gradient rounded-[14px] flex items-center justify-center shadow-lg shadow-premium-emerald/20 text-white">
          <Leaf size={22} />
        </div>
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -20 }}
          className={`ml-3 whitespace-nowrap overflow-hidden ${!isHovered && 'pointer-events-none'}`}
        >
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight">Agro <span className="text-premium-emerald">POS</span></h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[2px]">Enterprise</p>
        </motion.div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-x-hidden overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative
                 ${isActive
                  ? 'ios-active-link'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`
              }
            >
              <Icon className={`w-[22px] h-[22px] shrink-0 transition-transform duration-500 group-hover:scale-110`} />

              <motion.span
                initial={false}
                animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
                className={`font-semibold text-sm whitespace-nowrap transition-all ${!isHovered && 'pointer-events-none absolute'}`}
              >
                {item.name}
              </motion.span>

              {/* Tooltip purely for collapsed state can be added here if needed */}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Branding */}
      <div className={`p-8 text-center transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="h-[2px] w-8 bg-slate-200 dark:bg-slate-800 mx-auto mb-4 rounded-full"></div>
        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">System v4.0.2</p>
      </div>
    </aside>
  );
};

export default Sidebar;
