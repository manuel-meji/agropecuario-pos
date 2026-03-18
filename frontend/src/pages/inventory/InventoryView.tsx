import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, Package, AlertCircle, Edit3, Tag,
  PackageCheck, Barcode, Trash2, Pencil, Check, X, ChevronDown, LayoutGrid, Minus
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getProducts, getCategories, createProduct, createCategory,
  updateProduct, updateCategory, deleteCategory, deleteProduct
} from '../../services/api';
import ProfitCalculator from '../../components/ProfitCalculator';
import CabysSearch from '../../components/CabysSearch';

// ─── Searchable Category Select ────────────────────────────────────────────────
function CategorySelect({ categories, value, onChange, onCreate, creating }: {
  categories: any[];
  value: string;
  onChange: (id: string) => void;
  onCreate?: (name: string) => Promise<void>;
  creating?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const selected = categories.find(c => c.id.toString() === value);
  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  // Calcular posición fixed al abrir
  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropH = 260; // altura estimada del dropdown
      const goUp = spaceBelow < dropH && rect.top > dropH;

      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
        ...(goUp
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
      });
    }
    setOpen(o => !o);
    setQuery('');
  };

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        dropRef.current && !dropRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Recalcular si se hace scroll o resize mientras está abierto
  useEffect(() => {
    if (!open) return;
    const recalc = () => {
      if (btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropH = 260;
        const goUp = spaceBelow < dropH && rect.top > dropH;
        setDropdownStyle(prev => ({
          ...prev,
          left: rect.left,
          width: rect.width,
          ...(goUp
            ? { bottom: window.innerHeight - rect.top + 4, top: undefined }
            : { top: rect.bottom + 4, bottom: undefined }),
        }));
      }
    };
    window.addEventListener('scroll', recalc, true);
    window.addEventListener('resize', recalc);
    return () => {
      window.removeEventListener('scroll', recalc, true);
      window.removeEventListener('resize', recalc);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        className="premium-input w-full flex items-center justify-between gap-2 text-left"
      >
        <span className={selected ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400'}>
          {selected ? selected.name : '-- Seleccionar categoría --'}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={dropRef}
            initial={{ opacity: 0, scaleY: 0.95 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.95 }}
            transition={{ duration: 0.12 }}
            style={{ ...dropdownStyle, transformOrigin: 'top' }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
          >
            {/* Search inside dropdown */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-700">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar categoría..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={async e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (query.trim() !== '' && !categories.find(c => c.name.toLowerCase() === query.trim().toLowerCase()) && onCreate) {
                        await onCreate(query.trim());
                        setOpen(false);
                        setQuery('');
                      }
                    }
                  }}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 rounded-xl outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Options list */}
            <div className="max-h-52 overflow-y-auto custom-scrollbar">
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                -- Sin categoría --
              </button>
              {query.trim() !== '' && !categories.find(c => c.name.toLowerCase() === query.trim().toLowerCase()) && onCreate && (
                <button
                  type="button"
                  disabled={creating}
                  onClick={async () => {
                    await onCreate(query.trim());
                    setOpen(false);
                    setQuery('');
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-premium-emerald font-bold hover:bg-premium-emerald/10 transition-colors flex items-center justify-between"
                >
                  <span>Crear "{query.trim()}"</span>
                  <Plus size={14} />
                </button>
              )}
              {filtered.length === 0 && !onCreate && (
                <p className="px-4 py-3 text-sm text-slate-400 text-center">Sin resultados</p>
              )}
              {filtered.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { onChange(c.id.toString()); setOpen(false); setQuery(''); }}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors
                    ${value === c.id.toString()
                      ? 'bg-premium-emerald/10 text-premium-emerald font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  <span>{c.name}</span>
                  {value === c.id.toString() && <Check size={14} />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ─── Category Manager Panel ─────────────────────────────────────────────────────
function CategoryManagerPanel({ categories, onRefresh, onClose }: {
  categories: any[];
  onRefresh: () => void;
  onClose: () => void;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newName.trim()) { toast.error('El nombre es requerido'); return; }
    setLoading(true);
    try {
      await createCategory({ name: newName.trim(), description: newDesc.trim() });
      setNewName(''); setNewDesc('');
      toast.success('Categoría creada');
      onRefresh();
    } catch { toast.error('Error al crear la categoría'); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) { toast.error('El nombre es requerido'); return; }
    setLoading(true);
    try {
      await updateCategory(id, { name: editName.trim(), description: editDesc.trim() });
      setEditingId(null);
      toast.success('Categoría actualizada');
      onRefresh();
    } catch { toast.error('Error al actualizar'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`¿Eliminar la categoría "${name}"? Los productos asociados perderán su categoría.`)) return;
    try {
      await deleteCategory(id);
      toast.success('Categoría eliminada');
      onRefresh();
    } catch { toast.error('No se pudo eliminar. Puede tener productos asociados.'); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden"
        style={{ maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-premium-emerald/10 flex items-center justify-center">
              <LayoutGrid size={20} className="text-premium-emerald" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Gestión de Categorías</h3>
              <p className="text-xs text-slate-500 font-medium">{categories.length} categorías registradas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Nueva categoría */}
        <div className="p-8 pb-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nueva Categoría</p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nombre de la categoría..."
              className="premium-input flex-1 text-slate-900 dark:text-white"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <input
              type="text"
              placeholder="Descripción (opcional)"
              className="premium-input flex-1 text-slate-900 dark:text-white"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <button
              onClick={handleCreate}
              disabled={loading || !newName.trim()}
              className="btn-premium-emerald px-5 shrink-0 disabled:opacity-50"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Search filter */}
        <div className="px-8 pt-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar categorías..."
              className="w-full bg-slate-50 dark:bg-slate-800/60 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none placeholder:text-slate-400"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4 space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              <Tag size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No hay categorías que mostrar</p>
            </div>
          )}
          {filtered.map(cat => (
            <div
              key={cat.id}
              className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 group"
            >
              {editingId === cat.id ? (
                <>
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="premium-input flex-1 text-sm py-2 text-slate-900 dark:text-white"
                    onKeyDown={e => e.key === 'Enter' && handleUpdate(cat.id)}
                  />
                  <input
                    type="text"
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    placeholder="Descripción..."
                    className="premium-input flex-1 text-sm py-2 text-slate-900 dark:text-white"
                    onKeyDown={e => e.key === 'Enter' && handleUpdate(cat.id)}
                  />
                  <button
                    onClick={() => handleUpdate(cat.id)}
                    disabled={loading}
                    className="p-2 rounded-xl bg-premium-emerald/10 text-premium-emerald hover:bg-premium-emerald/20 transition-colors"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-xl bg-premium-emerald/10 flex items-center justify-center shrink-0">
                    <Tag size={14} className="text-premium-emerald" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{cat.name}</p>
                    {cat.description && <p className="text-xs text-slate-400 truncate">{cat.description}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingId(cat.id); setEditName(cat.name); setEditDesc(cat.description || ''); }}
                      className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main InventoryView ─────────────────────────────────────────────────────────
export default function InventoryView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isCreatingInlineCat, setIsCreatingInlineCat] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '', internalCode: '', cabysCode: '',
    purchaseCost: 0, salePrice: 0, stockQuantity: 0,
    taxRate: 13,
    category: { id: '' }
  });

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleQuickCreateCategory = async (name: string) => {
    setIsCreatingInlineCat(true);
    try {
      await createCategory({ name, description: '' });
      const cats = await getCategories();
      setCategories(cats);
      const newCat = cats.find((c: any) => c.name.toLowerCase() === name.toLowerCase());
      if (newCat) {
        setNewProduct(prev => ({ ...prev, category: { id: newCat.id.toString() } }));
      }
      toast.success(`Categoría "${name}" creada y seleccionada`);
    } catch (e) {
      toast.error('Error al crear la categoría rápida');
    } finally {
      setIsCreatingInlineCat(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.cabysCode || !newProduct.category.id) {
      toast.error('El Nombre, CABYS y Categoría son obligatorios.');
      return;
    }
    try {
      const payload = {
        ...newProduct,
        isAgrochemicalInsufficiency: false,
        category: { id: parseInt(newProduct.category.id) }
      };
      if (editingProductId) {
        await updateProduct(editingProductId, payload);
        toast.success('Producto actualizado correctamente');
      } else {
        await createProduct(payload);
        toast.success('Producto registrado exitosamente');
      }
      setIsProductModalOpen(false);
      setEditingProductId(null);
      setNewProduct({ name: '', internalCode: '', cabysCode: '', purchaseCost: 0, salePrice: 0, stockQuantity: 0, taxRate: 13, category: { id: '' } });
      loadData();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data || 'Error validando datos o del servidor.';
      toast.error(typeof msg === 'string' ? msg : 'Error de validación');
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!window.confirm(`¿Está seguro de eliminar el producto "${name}"?`)) return;
    try {
      await deleteProduct(id);
      toast.success('Producto eliminado correctamente');
      loadData();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo eliminar el producto. Revise si tiene ventas o compras asociadas.');
    }
  };

  const handleQuickStockUpdate = async (product: any, delta: number) => {
    try {
      const newStock = Math.max(0, (product.stockQuantity || 0) + delta);
      await updateProduct(product.id, { ...product, stockQuantity: newStock });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stockQuantity: newStock } : p));
      toast.success(`Stock actualizado: ${newStock}`);
    } catch (error) {
      toast.error('Error al actualizar stock');
    }
  };

  const openEditModal = (item: any) => {
    setEditingProductId(item.id);
    setNewProduct({
      name: item.name,
      internalCode: item.internalCode || '',
      cabysCode: item.cabysCode || '',
      purchaseCost: item.purchaseCost || 0,
      salePrice: item.salePrice || 0,
      stockQuantity: item.stockQuantity || 0,
      taxRate: item.taxRate ?? 13,
      category: { id: item.category?.id?.toString() || '' }
    });
    setIsProductModalOpen(true);
  };

  const getStatus = (stock: number) => {
    if (stock <= 0) return 'OUT_OF_STOCK';
    if (stock < 10) return 'LOW_STOCK';
    return 'IN_STOCK';
  };

  const filteredProducts = React.useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.internalCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.cabysCode || '').includes(searchTerm)
    );
  }, [products, searchTerm]);

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Inventario de Agronomía</h2>
          <p className="text-slate-500 font-medium">Control de productos y categorías en tiempo real.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCategoryPanelOpen(true)}
            className="premium-panel flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border-none font-bold text-slate-700 dark:text-slate-200 hover:scale-105 transition-transform"
          >
            <LayoutGrid size={18} />
            <span>Categorías</span>
            {categories.length > 0 && (
              <span className="bg-premium-emerald/10 text-premium-emerald text-xs font-black px-2 py-0.5 rounded-lg">
                {categories.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setEditingProductId(null);
              setNewProduct({ name: '', internalCode: '', cabysCode: '', purchaseCost: 0, salePrice: 0, stockQuantity: 0, taxRate: 13, category: { id: '' } });
              setIsProductModalOpen(true);
            }}
            className="btn-premium-emerald flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Nuevo Producto
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="premium-panel p-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o código interno..."
            className="w-full bg-transparent border-none rounded-2xl px-14 py-4 focus:ring-0 outline-none text-slate-800 dark:text-white placeholder:text-slate-400 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mr-1">
          <Filter size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      {/* Products Table */}
      <div className="flex-1 premium-panel overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="p-6">Estado</th>
                <th className="p-6">Producto</th>
                <th className="p-6">Categoría</th>
                <th className="p-6 text-right">Existencias</th>
                <th className="p-6 text-right">Precio Venta</th>
                <th className="p-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((item, index) => {
                const status = getStatus(item.stockQuantity);
                return (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    key={item.id}
                    className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="p-6">
                      {status === 'IN_STOCK' && (
                        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800 font-bold text-xs w-fit">
                          <PackageCheck size={14} /> En Stock
                        </div>
                      )}
                      {status === 'LOW_STOCK' && (
                        <div className="flex items-center gap-2 text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-800 font-bold text-xs w-fit">
                          <AlertCircle size={14} /> Bajo Stock
                        </div>
                      )}
                      {status === 'OUT_OF_STOCK' && (
                        <div className="flex items-center gap-2 text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-xl border border-rose-100 dark:border-rose-800 font-bold text-xs w-fit">
                          <AlertCircle size={14} /> Agotado
                        </div>
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                          <Barcode size={12} className="opacity-50" />
                          {item.internalCode || 'N/A'} | CABYS: {item.cabysCode}
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                        {item.category?.name || 'Genérico'}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleQuickStockUpdate(item, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className={`text-lg font-black min-w-[30px] text-center ${status === 'IN_STOCK' ? 'text-slate-900 dark:text-white' : status === 'LOW_STOCK' ? 'text-amber-500' : 'text-rose-500'}`}>
                          {item.stockQuantity}
                        </span>
                        <button 
                          onClick={() => handleQuickStockUpdate(item, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-premium-emerald hover:bg-premium-emerald/10 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-black text-slate-900 dark:text-white text-lg">₡{item.salePrice?.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-slate-400">Costo: ₡{item.purchaseCost?.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-premium-emerald hover:border-premium-emerald transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(item.id, item.name)}
                          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-500 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <Package size={48} className="mb-4" />
                      <p className="font-black uppercase tracking-widest">
                        {searchTerm ? 'Sin resultados para tu búsqueda' : 'Inventario Vacío'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {/* Category Manager Panel */}
        {isCategoryPanelOpen && (
          <CategoryManagerPanel
            categories={categories}
            onRefresh={loadData}
            onClose={() => setIsCategoryPanelOpen(false)}
          />
        )}

        {/* Product Modal */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-slate-900 dark:text-white">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-xl shadow-2xl relative z-10 flex flex-col overflow-hidden"
              style={{ maxHeight: 'min(90vh, 780px)' }}
            >
              {/* Deco blob */}
              <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />

              {/* ── Header (fijo) ── */}
              <div className="px-10 pt-10 pb-4 shrink-0 relative">
                <h3 className="text-2xl font-black mb-1">
                  {editingProductId ? 'Modificar Producto' : 'Nuevo Producto'}
                </h3>
                <p className="text-slate-500 text-sm font-medium">Información técnica del artículo en almacén.</p>
              </div>

              {/* ── Scrollable fields & Form ── */}
              <form onSubmit={e => { e.preventDefault(); handleCreateProduct(); }} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-2 relative">
                <div className="grid grid-cols-2 gap-4 pb-2">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Descripción Comercial</label>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Ej. Fertilizante QPK 100 ml" 
                      className="premium-input w-full"
                      value={newProduct.name} 
                      onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && handleCreateProduct()} 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Código Interno / SKU</label>
                    <input type="text" placeholder="SKU-2353" className="premium-input w-full"
                      value={newProduct.internalCode} onChange={e => setNewProduct({ ...newProduct, internalCode: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Código CABYS</label>
                    <CabysSearch
                      value={newProduct.cabysCode}
                      onChange={(code) => setNewProduct({ ...newProduct, cabysCode: code })}
                      onCabysDetails={(taxRate, desc) => {
                        setNewProduct((prev: any) => ({
                          ...prev,
                          taxRate,
                          name: prev.name || desc // Pre-fill name if empty
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Costo Compra (₡)</label>
                    <input type="number" placeholder="₡ 0" className="premium-input w-full"
                      value={newProduct.purchaseCost || ''} onChange={e => setNewProduct({ ...newProduct, purchaseCost: parseFloat(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Precio Venta (₡)</label>
                    <input type="number" placeholder="₡ 0" className="premium-input w-full"
                      value={newProduct.salePrice || ''} onChange={e => setNewProduct({ ...newProduct, salePrice: parseFloat(e.target.value) })} />
                  </div>

                  {/* Profit Calculator */}
                  {newProduct.purchaseCost > 0 && (
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Calculadora de Ganancia</label>
                      <ProfitCalculator
                        purchaseCost={newProduct.purchaseCost}
                        salePrice={newProduct.salePrice || 0}
                        onPriceChange={(newPrice) => setNewProduct({ ...newProduct, salePrice: newPrice })}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Stock Disponible</label>
                    <input type="number" placeholder="Cantidad..." className="premium-input w-full"
                      value={newProduct.stockQuantity || ''} onChange={e => setNewProduct({ ...newProduct, stockQuantity: parseInt(e.target.value) })} />
                  </div>

                  {/* Searchable category select */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Categoría</label>
                    <CategorySelect
                      categories={categories}
                      value={newProduct.category.id}
                      onChange={id => setNewProduct({ ...newProduct, category: { id } })}
                      onCreate={handleQuickCreateCategory}
                      creating={isCreatingInlineCat}
                    />
                  </div>

                  {/* Tax Rate selector */}
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tasa de Impuesto (IVA)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[{ label: '0% Exento', value: 0 }, { label: '1% Agroc.', value: 1 }, { label: '4% Reducido', value: 4 }, { label: '13% Estándar', value: 13 }].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setNewProduct({ ...newProduct, taxRate: opt.value })}
                          className={`py-2.5 rounded-xl text-xs font-black border-2 transition-all ${
                            newProduct.taxRate === opt.value
                              ? 'border-premium-emerald bg-premium-emerald/10 text-premium-emerald'
                              : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Footer (fijo) ── */}
              <div className="px-10 py-6 shrink-0 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                <button type="button" onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isCreatingInlineCat} className="flex-1 btn-premium-emerald py-4">
                  {editingProductId ? 'Aplicar Cambios' : 'Confirmar'}
                </button>
              </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
