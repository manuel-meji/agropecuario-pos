import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useThemeStore } from "../../store/themeStore";
import { Moon, Sun } from "lucide-react";

export default function RootLayout() {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500 overflow-hidden relative">
      {/* Liquid Mesh Background Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 z-0 bg-[radial-gradient(rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Sidebar Navigation */}
      <div className="z-10">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-0 h-full overflow-hidden">
        {/* Top Liquid Glass Navigation Bar */}
        <header className="h-16 liquid-glass mx-4 mt-4 mb-2 flex items-center justify-between px-6 z-20 shrink-0">
          <h1 className="text-xl font-bold text-gradient">
            POS <span className="text-gray-600 dark:text-gray-300">Terminal</span>
          </h1>

          <div className="flex items-center gap-4">
             {/* User Profile placeholder */}
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-agro-green to-emerald-400 p-1 flex items-center justify-center text-white font-bold text-sm shadow-md">
                   OP
                </div>
                <div className="hidden md:flex flex-col text-sm">
                   <span className="font-semibold text-gray-800 dark:text-gray-100">Caja Principal</span>
                   <span className="text-xs text-gray-500">Operador</span>
                </div>
             </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Dynamic Outlet for Pages */}
        <div className="flex-1 overflow-auto p-4 z-10 w-full h-full custom-scrollbar">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
