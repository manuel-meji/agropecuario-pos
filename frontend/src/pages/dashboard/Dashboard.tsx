import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { TrendingUp, Banknote, Receipt, AlertTriangle } from 'lucide-react';

const WEEKLY_DATA = [
  { name: 'Lun', sales: 450000, profit: 120000 },
  { name: 'Mar', sales: 380000, profit: 95000 },
  { name: 'Mié', sales: 520000, profit: 145000 },
  { name: 'Jue', sales: 610000, profit: 180000 },
  { name: 'Vie', sales: 850000, profit: 260000 },
  { name: 'Sáb', sales: 920000, profit: 310000 },
  { name: 'Dom', sales: 410000, profit: 110000 },
];

const METRICS = [
  { title: "Ingresos Brutos (Hoy)", value: "₡850,000", icon: Banknote, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { title: "Utilidad Neta Estimada", value: "₡260,000", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
  { title: "Doc. Hacienda Emitidos", value: "142", icon: Receipt, color: "text-purple-500", bg: "bg-purple-500/10" },
  { title: "Fallas Contingencia", value: "0", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      
      {/* Header Info */}
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Panorama General</h2>
            <p className="text-gray-500 dark:text-gray-400">Resumen operativo y rendimientos del día en curso.</p>
         </div>
         <button className="liquid-btn-primary py-2 px-4 shadow-sm text-sm">
            Generar Arqueo EOD
         </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="liquid-glass-panel p-5 flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-default">
              <div className={`p-3 rounded-xl ${metric.bg}`}>
                <Icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{metric.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{metric.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico Principal: Volumen Ventas */}
        <div className="lg:col-span-2 liquid-glass-panel p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Volumen de Transacciones (Últimos 7 Días)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} tickFormatter={(val) => `₡${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: number) => [`₡${value.toLocaleString()}`, 'Ingresos']}
                />
                <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Secundario: Tendencia de Utilidad */}
        <div className="liquid-glass-panel p-6 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Tendencia Utilidad Neta</h3>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEEKLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
                <XAxis dataKey="name" hide />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(val) => `₡${val/1000}k`} width={60} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: number) => [`₡${value.toLocaleString()}`, 'Utilidad Neta']}
                />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Crecimiento Intersemanal</span>
                 <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded">+14.2%</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
