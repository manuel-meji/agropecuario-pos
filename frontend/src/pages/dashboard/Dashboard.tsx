import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { TrendingUp, Banknote, Receipt, AlertTriangle, Download } from 'lucide-react';
import { motion } from 'framer-motion';

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
  { title: "Ingresos Brutos (Hoy)", value: "₡850,000", icon: Banknote, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { title: "Utilidad Neta Estimada", value: "₡260,000", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { title: "Doc. Hacienda Emitidos", value: "142", icon: Receipt, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
  { title: "Fallas Contingencia", value: "0", icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-10">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Análisis Operativo</h2>
            <p className="text-slate-500 font-medium">Panel de control con métricas críticas en tiempo real.</p>
         </div>
         <div className="flex gap-3">
            <button className="premium-panel flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border-none font-bold text-slate-700 dark:text-slate-200">
              <Download size={18} />
              <span>Reporte PDF</span>
            </button>
            <button className="btn-premium-emerald flex items-center justify-center gap-2">
               Cierre de Caja
            </button>
         </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {METRICS.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="premium-panel p-6 flex items-center gap-5 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500 ${metric.bg}`}>
                <Icon className={`w-7 h-7 ${metric.color}`} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{metric.title}</p>
                <h3 className="text-2xl font-black text-slate-950 dark:text-white leading-none">{metric.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-900 dark:text-white">
        
        {/* Gráfico Principal: Volumen Ventas */}
        <div className="lg:col-span-2 premium-panel p-8">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black tracking-tight">Volumen de Transacciones</h3>
            <select className="bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold px-4 py-2 rounded-xl outline-none">
                <option>Últimos 7 días</option>
                <option>Último mes</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => `₡${val/1000}k`} dx={-10} />
                <Tooltip 
                  cursor={{ fill: 'rgba(16, 185, 129, 0.03)', radius: 12 }}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', padding: '16px' }}
                  itemStyle={{ color: '#fff', fontWeight: 800 }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}
                  formatter={(value: number) => [`₡${value.toLocaleString()}`, 'Ventas']}
                />
                <Bar dataKey="sales" fill="url(#colorSales)" radius={[10, 10, 10, 10]} maxBarSize={32} />
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Secundario: Tendencia de Utilidad */}
        <div className="premium-panel p-8 flex flex-col">
          <h3 className="text-xl font-black tracking-tight mb-10">Curva de Utilidad</h3>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEEKLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.1)" />
                <XAxis dataKey="name" hide />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} tickFormatter={(val) => `₡${val/1000}k`} width={45} />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}
                   itemStyle={{ color: '#60a5fa', fontWeight: 800 }}
                   formatter={(value: number) => [`₡${value.toLocaleString()}`, 'Utilidad']}
                />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={4} dot={false} activeDot={{ r: 8, strokeWidth: 0, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
             <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Crecimiento Semanal</span>
                <span className="text-emerald-500 font-extrabold">+14.2%</span>
             </div>
             <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '70%' }} className="h-full emerald-gradient"></motion.div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
