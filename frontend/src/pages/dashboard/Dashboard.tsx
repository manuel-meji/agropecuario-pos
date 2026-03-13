import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, Banknote, Receipt, AlertTriangle,
  ShoppingCart, TrendingDown, Package, Users, RefreshCw,
  ArrowUpRight, ArrowDownRight, CreditCard, Smartphone, Wallet, Banknote as BanknoteIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import CashClosingModal from '../../components/CashClosingModal';
import api from '../../services/api';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface DashboardSummary {
  todayRevenue: number;
  todayExpenses: number;
  todayDiscount: number;
  todayTransactions: number;
  estimatedProfit: number;
  todayAbonos: number;
  paymentByMethod: Record<string, number>;
  dailyChart: { name: string; sales: number; expenses: number; profit: number; transactions: number }[];
  lowStockProducts: { id: number; name: string; stock: number; category: string }[];
  recentSales: { id: number; invoiceNumber: string; client: string; total: number; paymentMethod: string; date: string }[];
  totalProducts: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number | null | undefined) =>
  `₡${(Number(n) || 0).toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const fmtK = (val: number) =>
  val >= 1_000_000 ? `₡${(val / 1_000_000).toFixed(1)}M` :
  val >= 1_000 ? `₡${(val / 1_000).toFixed(0)}k` : `₡${val}`;

const PM_LABELS: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  CASH:       { label: 'Efectivo',    icon: BanknoteIcon, color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20' },
  CARD:       { label: 'Tarjeta',     icon: CreditCard,   color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  SINPE_MOVIL:{ label: 'SINPE Móvil', icon: Smartphone,   color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  SIMPE_MOVIL:{ label: 'SINPE Móvil', icon: Smartphone,   color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  CREDIT:     { label: 'Crédito',     icon: Wallet,       color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-900/20' },
  TRANSFER:   { label: 'Transferencia', icon: ArrowUpRight, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
};

const PIE_COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#14b8a6'];

// ─── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-2xl ${className}`} />;
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [isCashClosingOpen, setIsCashClosingOpen] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartDays, setChartDays] = useState(7);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async (days = chartDays) => {
    setLoading(true);
    try {
      const { data } = await api.get('/dashboard/summary', { params: { days } });
      setSummary(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard load error', err);
    } finally {
      setLoading(false);
    }
  }, [chartDays]);

  useEffect(() => { load(chartDays); }, [chartDays]);

  // ── KPI cards config (derived from real data) ─────────────────────────────
  const kpis = summary ? [
    {
      title: 'Ingresos Brutos (Hoy)',
      value: fmt(summary.todayRevenue),
      sub: `${summary.todayTransactions} transacciones`,
      icon: Banknote,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      positive: true,
    },
    {
      title: 'Utilidad Estimada (Hoy)',
      value: fmt(summary.estimatedProfit),
      sub: `Gastos: ${fmt(summary.todayExpenses)}`,
      icon: TrendingUp,
      color: summary.estimatedProfit >= 0 ? 'text-blue-500' : 'text-rose-500',
      bg: summary.estimatedProfit >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-rose-50 dark:bg-rose-900/20',
      positive: summary.estimatedProfit >= 0,
    },
    {
      title: 'Abonos Recibidos (Hoy)',
      value: fmt(summary.todayAbonos),
      sub: 'Pagos a crédito',
      icon: Receipt,
      color: 'text-teal-500',
      bg: 'bg-teal-50 dark:bg-teal-900/20',
      positive: true,
    },
    {
      title: 'Productos en Catálogo',
      value: String(summary.totalProducts),
      sub: `${summary.lowStockProducts.length} con bajo stock`,
      icon: summary.lowStockProducts.length > 0 ? AlertTriangle : Package,
      color: summary.lowStockProducts.length > 0 ? 'text-rose-500' : 'text-slate-500',
      bg: summary.lowStockProducts.length > 0 ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-slate-50 dark:bg-slate-800/50',
      positive: summary.lowStockProducts.length === 0,
    },
  ] : [];

  // Payment method pie data
  const pieData = summary
    ? Object.entries(summary.paymentByMethod)
        .filter(([, v]) => Number(v) > 0)
        .map(([k, v]) => ({ name: PM_LABELS[k]?.label || k, value: Number(v) }))
    : [];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Análisis Operativo</h2>
            <p className="text-slate-500 font-medium text-sm">
              Panel de control con métricas reales en tiempo real.
              {lastUpdated && (
                <span className="ml-2 text-slate-400">
                  Actualizado: {lastUpdated.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => load(chartDays)}
              disabled={loading}
              className="premium-panel flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border-none font-bold text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button onClick={() => setIsCashClosingOpen(true)} className="btn-premium-emerald flex items-center justify-center gap-2">
              Cierre de Caja
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
            : kpis.map((kpi, idx) => {
                const Icon = kpi.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="premium-panel p-6 flex items-start gap-4 group"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 ${kpi.bg}`}>
                      <Icon className={`w-6 h-6 ${kpi.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5 truncate">{kpi.title}</p>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{kpi.value}</h3>
                      <p className="text-[11px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                        {kpi.positive
                          ? <ArrowUpRight size={11} className="text-emerald-500" />
                          : <ArrowDownRight size={11} className="text-rose-500" />}
                        {kpi.sub}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-900 dark:text-white">

          {/* Bar Chart – Ventas por día */}
          <div className="lg:col-span-2 premium-panel p-7">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black tracking-tight">Volumen de Ventas</h3>
              <div className="flex gap-2">
                {[7, 14, 30].map(d => (
                  <button
                    key={d}
                    onClick={() => setChartDays(d)}
                    className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all ${
                      chartDays === d
                        ? 'bg-premium-emerald text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
            {loading
              ? <Skeleton className="h-64 w-full" />
              : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary?.dailyChart || []} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156,163,175,0.1)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} tickFormatter={fmtK} dx={-4} />
                      <Tooltip
                        cursor={{ fill: 'rgba(16,185,129,0.04)', radius: 10 }}
                        contentStyle={{ backgroundColor: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px' }}
                        itemStyle={{ color: '#fff', fontWeight: 700, fontSize: 13 }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: 600, fontSize: 11 }}
                        formatter={(val: number, name: string) => [fmt(val), name === 'sales' ? 'Ventas' : name === 'expenses' ? 'Gastos' : 'Utilidad']}
                      />
                      <defs>
                        <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                          <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                        </linearGradient>
                        <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#e11d48" stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <Bar dataKey="sales" fill="url(#gSales)" radius={[8,8,8,8]} maxBarSize={28} />
                      <Bar dataKey="expenses" fill="url(#gExp)" radius={[8,8,8,8]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            {/* Legend */}
            <div className="flex items-center gap-6 mt-4 text-xs font-bold text-slate-400">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500" />Ventas</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-500" />Gastos</div>
            </div>
          </div>

          {/* Right: Pie + Utilidad */}
          <div className="flex flex-col gap-5">

            {/* Pie: método de pago */}
            <div className="premium-panel p-6 flex-1">
              <h3 className="text-base font-black tracking-tight mb-4">Pagos por Método (Hoy)</h3>
              {loading ? <Skeleton className="h-36 w-full" /> : (
                pieData.length > 0 ? (
                  <>
                    <div className="h-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={3} dataKey="value">
                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(15,23,42,0.92)', borderRadius: '12px', border: 'none', padding: '8px 12px' }}
                            itemStyle={{ color: '#fff', fontWeight: 700, fontSize: 12 }}
                            formatter={(val: number) => [fmt(val)]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-1.5 mt-2">
                      {pieData.map((d, i) => (
                        <div key={d.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="font-bold text-slate-600 dark:text-slate-300">{d.name}</span>
                          </div>
                          <span className="font-black text-slate-800 dark:text-slate-200">{fmt(d.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-36 text-slate-300 dark:text-slate-600">
                    <ShoppingCart size={32} className="mb-2" />
                    <p className="text-xs font-bold">Sin ventas hoy</p>
                  </div>
                )
              )}
            </div>

            {/* Utilidad del día */}
            <div className={`premium-panel p-6 ${!loading && summary && summary.estimatedProfit >= 0 ? 'border-l-4 border-emerald-400' : 'border-l-4 border-rose-400'}`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Utilidad Estimada Hoy</p>
              {loading ? <Skeleton className="h-8 w-24 mt-1" /> : (
                <>
                  <p className={`text-3xl font-black ${summary && summary.estimatedProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {fmt(summary?.estimatedProfit)}
                  </p>
                  <p className="text-xs text-slate-400 font-bold mt-1">
                    Ventas − Gastos deducibles
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom Row: Bajo stock + Ventas recientes ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Productos bajo stock */}
          <div className="premium-panel overflow-hidden">
            <div className="px-7 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <AlertTriangle size={18} className="text-rose-500" />
              <h3 className="font-black text-slate-800 dark:text-white">Productos con Bajo Stock</h3>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 mx-5 my-3" />)
                : summary?.lowStockProducts.length === 0
                  ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <Package size={32} className="mb-2 opacity-40" />
                      <p className="text-sm font-bold">Todo el inventario tiene stock suficiente</p>
                    </div>
                  )
                  : summary?.lowStockProducts.map(p => (
                    <div key={p.id} className="flex items-center justify-between px-7 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div>
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{p.name}</p>
                        <p className="text-[11px] text-slate-400 font-bold">{p.category}</p>
                      </div>
                      <span className={`text-sm font-black px-3 py-1 rounded-xl ${
                        p.stock === 0
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                      }`}>
                        {p.stock === 0 ? 'Agotado' : `${p.stock} uds.`}
                      </span>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Ventas recientes */}
          <div className="premium-panel overflow-hidden">
            <div className="px-7 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <ShoppingCart size={18} className="text-premium-emerald" />
              <h3 className="font-black text-slate-800 dark:text-white">Ventas Recientes</h3>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 mx-5 my-3" />)
                : summary?.recentSales.length === 0
                  ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <ShoppingCart size={32} className="mb-2 opacity-40" />
                      <p className="text-sm font-bold">Sin ventas registradas</p>
                    </div>
                  )
                  : summary?.recentSales.map(s => {
                    const pm = PM_LABELS[s.paymentMethod] || { label: s.paymentMethod, icon: Receipt, color: 'text-slate-500', bg: 'bg-slate-50' };
                    const PMIcon = pm.icon;
                    return (
                      <div key={s.id} className="flex items-center justify-between px-7 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${pm.bg}`}>
                            <PMIcon size={14} className={pm.color} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{s.client}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase">{s.invoiceNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm text-slate-900 dark:text-white">{fmt(s.total)}</p>
                          <p className="text-[10px] text-slate-400 font-bold">
                            {new Date(s.date).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>
        </div>

        {/* ── Utilidad Line chart ── */}
        {!loading && summary && (
          <div className="premium-panel p-7">
            <h3 className="text-lg font-black tracking-tight mb-6">Curva de Utilidad ({chartDays} días)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.dailyChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156,163,175,0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} tickFormatter={fmtK} width={50} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.92)', borderRadius: '14px', border: 'none', padding: '10px 14px' }}
                    itemStyle={{ color: '#60a5fa', fontWeight: 700, fontSize: 12 }}
                    formatter={(val: number) => [fmt(val), 'Utilidad']}
                  />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>

      <CashClosingModal isOpen={isCashClosingOpen} onClose={() => setIsCashClosingOpen(false)} />
    </div>
  );
}
