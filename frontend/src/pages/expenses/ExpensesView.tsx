import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, X, TrendingDown, Pencil, Trash2, Filter,
  Banknote, Zap, Users, Truck, Wrench, FileText, MoreHorizontal, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

// ─── Types ─────────────────────────────────────────────────────────────────────
type ExpenseCategory = 'OPERATIONAL_UTILITIES' | 'PAYROLL' | 'LOGISTICS' | 'MAINTENANCE' | 'TAXES' | 'MISCELLANEOUS';

interface Expense {
  id: number;
  description: string;
  category: ExpenseCategory;
  amount: number;
  isDeductibleFromProfit: boolean;
  registeredDate: string;
  registeredBy?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const CATEGORIES: { value: ExpenseCategory; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { value: 'OPERATIONAL_UTILITIES', label: 'Servicios / Utilidades', icon: Zap,          color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800' },
  { value: 'PAYROLL',               label: 'Planilla / Salarios',    icon: Users,         color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800' },
  { value: 'LOGISTICS',             label: 'Logística / Transporte', icon: Truck,         color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800' },
  { value: 'MAINTENANCE',           label: 'Mantenimiento',          icon: Wrench,        color: 'text-rose-600',   bg: 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800' },
  { value: 'TAXES',                 label: 'Impuestos / Cargas',     icon: FileText,      color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800' },
  { value: 'MISCELLANEOUS',         label: 'Misceláneos',            icon: MoreHorizontal, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800' },
];

const getCat = (v: ExpenseCategory) => CATEGORIES.find(c => c.value === v) ?? CATEGORIES[5];

const fmt = (n: number) => `₡${(n || 0).toLocaleString('es-CR', { minimumFractionDigits: 0 })}`;

// ─── Default form ─────────────────────────────────────────────────────────────
const EMPTY = (): Partial<Expense> => ({
  description: '',
  category: 'MISCELLANEOUS',
  amount: 0,
  isDeductibleFromProfit: true,
});

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ExpensesView() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [catFilter, setCatFilter] = useState<ExpenseCategory | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Expense>>(EMPTY());

  // Date range filter (defaults: this month)
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const fmt8601 = (d: Date) => d.toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(fmt8601(firstDay));
  const [endDate,   setEndDate]   = useState(fmt8601(today));

  // ── Load ─────────────────────────────────────────────────────────────────────
  const load = async () => {
    try {
      const res = await api.get('/expenses', { params: { startDate, endDate } });
      setExpenses(res.data);
    } catch { toast.error('Error al cargar gastos.'); }
  };

  useEffect(() => { load(); }, [startDate, endDate]);

  // ── Totals ────────────────────────────────────────────────────────────────────
  const totalAll    = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalDeduct = expenses.filter(e => e.isDeductibleFromProfit).reduce((s, e) => s + Number(e.amount), 0);

  // ── CRUD ──────────────────────────────────────────────────────────────────────
  const openCreate = () => { setForm(EMPTY()); setEditingId(null); setIsModalOpen(true); };
  const openEdit   = (exp: Expense) => { setForm({ ...exp }); setEditingId(exp.id); setIsModalOpen(true); };

  const handleSave = async () => {
    if (!form.description?.trim()) { toast.error('La descripción es obligatoria'); return; }
    if (!form.amount || Number(form.amount) <= 0) { toast.error('El monto debe ser mayor a 0'); return; }
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, form);
        toast.success('Gasto actualizado');
      } else {
        await api.post('/expenses', form);
        toast.success('Gasto registrado');
      }
      setIsModalOpen(false);
      load();
    } catch { toast.error('Error al guardar el gasto.'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este gasto?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Gasto eliminado');
      load();
    } catch { toast.error('No se pudo eliminar.'); }
  };

  // ── Filters ───────────────────────────────────────────────────────────────────
  const filtered = expenses.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === 'ALL' || e.category === catFilter;
    return matchSearch && matchCat;
  });

  // ── Category totals ───────────────────────────────────────────────────────────
  const catTotals = CATEGORIES.map(c => ({
    ...c,
    total: expenses.filter(e => e.category === c.value).reduce((s, e) => s + Number(e.amount), 0),
    count: expenses.filter(e => e.category === c.value).length,
  }));

  return (
    <div className="flex flex-col gap-6 h-full">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Registro de Gastos
          </h2>
          <p className="text-slate-500 font-medium">Control de gastos fijos y variables del negocio.</p>
        </div>
        <button onClick={openCreate} className="btn-premium-emerald flex items-center justify-center gap-2">
          <Plus size={18} /> Registrar Gasto
        </button>
      </div>

      {/* ── KPI Summary ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="premium-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
            <TrendingDown size={22} className="text-rose-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Gastos (período)</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{fmt(totalAll)}</p>
            <p className="text-[10px] text-slate-400 font-bold">{expenses.length} registros</p>
          </div>
        </div>
        <div className="premium-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
            <Banknote size={22} className="text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Deducibles de Utilidad</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{fmt(totalDeduct)}</p>
            <p className="text-[10px] text-slate-400 font-bold">{expenses.filter(e => e.isDeductibleFromProfit).length} deducibles</p>
          </div>
        </div>
        {/* Category breakdown mini-cards */}
        <div className="premium-panel p-5 overflow-hidden">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Por Categoría</p>
          <div className="space-y-1.5 overflow-y-auto max-h-20 custom-scrollbar">
            {catTotals.filter(c => c.total > 0).map(c => {
              const Icon = c.icon;
              return (
                <div key={c.value} className="flex items-center justify-between text-xs">
                  <div className={`flex items-center gap-1.5 font-bold ${c.color}`}>
                    <Icon size={12} /> {c.label}
                  </div>
                  <span className="font-black text-slate-700 dark:text-slate-300">{fmt(c.total)}</span>
                </div>
              );
            })}
            {catTotals.every(c => c.total === 0) && (
              <p className="text-slate-400 text-xs text-center py-2">Sin gastos en este período</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="premium-panel p-3 flex flex-wrap gap-3 items-center shrink-0">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar descripción..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500/50 text-sm font-medium"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5 bg-white/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
          <Filter size={14} className="text-slate-400 ml-2" />
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value as ExpenseCategory | 'ALL')}
            className="bg-transparent outline-none px-2 py-1 text-sm font-bold text-gray-700 dark:text-gray-300"
          >
            <option value="ALL">Todas las categorías</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-bold ml-1 mb-1">Desde</span>
            <input type="date" className="liquid-input text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-bold ml-1 mb-1">Hasta</span>
            <input type="date" className="liquid-input text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 premium-panel overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="p-5">Descripción</th>
                <th className="p-5">Categoría</th>
                <th className="p-5 text-center">Deducible</th>
                <th className="p-5">Fecha</th>
                <th className="p-5 text-right">Monto</th>
                <th className="p-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp, idx) => {
                const cat = getCat(exp.category);
                const Icon = cat.icon;
                return (
                  <motion.tr
                    key={exp.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                    className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="p-5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{exp.description}</span>
                      {exp.registeredBy && <p className="text-[10px] text-slate-400 mt-0.5">Por: {exp.registeredBy}</p>}
                    </td>
                    <td className="p-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black ${cat.bg} ${cat.color}`}>
                        <Icon size={12} /> {cat.label}
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      {exp.isDeductibleFromProfit
                        ? <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800"><Check size={12} /> Sí</span>
                        : <span className="inline-flex items-center gap-1 text-xs font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700"><X size={12} /> No</span>
                      }
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                          {exp.registeredDate ? new Date(exp.registeredDate).toLocaleDateString('es-CR') : '—'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {exp.registeredDate ? new Date(exp.registeredDate).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <span className="font-black text-rose-600 dark:text-rose-400 text-base">{fmt(Number(exp.amount))}</span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(exp)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 rounded-lg transition-colors" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(exp.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg transition-colors" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <TrendingDown size={48} className="mb-4" />
                      <p className="font-black uppercase tracking-widest text-sm">Sin gastos registrados</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create/Edit Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />

            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[36px] p-9 w-full max-w-lg shadow-2xl relative z-10"
            >
              {/* Deco blob */}
              <div className="absolute top-[-40px] right-[-40px] w-40 h-40 bg-rose-500/10 blur-[60px] rounded-full pointer-events-none" />

              <h3 className="text-2xl font-black mb-1 text-slate-900 dark:text-white">
                {editingId ? 'Editar Gasto' : 'Registrar Gasto'}
              </h3>
              <p className="text-slate-500 text-sm mb-8 font-medium">
                {editingId ? 'Modifica los datos del gasto.' : 'Añade un nuevo gasto al registro contable.'}
              </p>

              <div className="space-y-5">
                {/* Descripción */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Descripción</label>
                  <input
                    type="text"
                    placeholder="Ej. Factura de electricidad de febrero..."
                    className="premium-input w-full"
                    value={form.description || ''}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    autoFocus
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Categoría</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      const isSelected = form.category === cat.value;
                      return (
                        <button
                          key={cat.value} type="button"
                          onClick={() => setForm({ ...form, category: cat.value })}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black border-2 transition-all text-left ${
                            isSelected ? `border-current ${cat.bg} ${cat.color}` : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          <Icon size={14} className="shrink-0" /> {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Monto */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Monto (₡)</label>
                  <input
                    type="number"
                    placeholder="₡ 0"
                    className="premium-input w-full"
                    value={form.amount || ''}
                    onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })}
                  />
                </div>

                {/* Deducible toggle */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-5 py-4 border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="font-black text-sm text-slate-800 dark:text-slate-200">Deducible de utilidad</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Afecta el cálculo de ganancia neta</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isDeductibleFromProfit: !form.isDeductibleFromProfit })}
                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${form.isDeductibleFromProfit ? 'bg-premium-emerald' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${form.isDeductibleFromProfit ? 'left-[26px]' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={loading} className="flex-1 btn-premium-emerald py-4 disabled:opacity-60">
                  {loading ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Registrar Gasto'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
