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
  ChevronRight,
  Receipt,
  Wallet,
  Truck
} from "lucide-react";

const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
    { name: "Terminal POS", path: "/pos", icon: ShoppingCart },
    { name: "Historial Ventas", path: "/sales", icon: Receipt },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Inventario", path: "/inventory", icon: PackageSearch },
    { name: "Clientes", path: "/clients", icon: Users },
    { name: "Proveedores", path: "/suppliers", icon: Truck },
    { name: "Cuentas Cobrar", path: "/receivables", icon: Wallet },
    { name: "Cuentas Pagar", path: "/payables", icon: CreditCard },
    { name: "Tributación", path: "/taxes", icon: FileSpreadsheet },
    { name: "Configuración", path: "/settings", icon: Settings }
  ];

  return (
    <aside 
      className={`h-[96%] mt-4 ml-4 mb-4 liquid-glass-panel fixed md:relative z-40 transition-all duration-300 ease-in-out flex flex-col pt-6 ${isHovered ? 'w-64' : 'w-20'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Brand Icon */}
      <div className="flex items-center justify-center h-12 mb-8 relative">
         <div className="bg-gradient-to-tr from-agro-green-dark to-emerald-400 p-2 rounded-xl shadow-lg shadow-emerald-500/30">
            <LayoutDashboard className="text-white w-6 h-6" />
         </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-2 overflow-x-hidden overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group relative
                 ${isActive 
                  ? 'bg-gradient-to-r from-agro-green/20 to-transparent text-agro-green dark:text-emerald-400 border-l-4 border-agro-green shadow-inner' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`
              }
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110`} />
              
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none absolute'}`}>
                {item.name}
              </span>

              {/* Indicator Arrow on Hover open */}
              <ChevronRight className={`absolute right-2 w-4 h-4 opacity-0 transition-opacity ${isHovered ? 'group-hover:opacity-100' : ''}`} />
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Branding */}
      <div className={`p-4 text-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-xs text-gray-400 font-medium tracking-wider">AGRO POS v2.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
