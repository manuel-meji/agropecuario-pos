import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Package, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProducts, getCategories, createProduct, createCategory, updateProduct } from '../../services/api';

export default function InventoryView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Form states
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '', internalCode: '', cabysCode: '', purchaseCost: 0, salePrice: 0, stockQuantity: 0, category: { id: '' }
  });

  const loadData = async () => {
    try {
      const prods = await getProducts();
      const cats = await getCategories();
      setProducts(prods);
      setCategories(cats);
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }
    try {
      await createCategory({ name: newCategoryName, description: 'Creada desde UI' });
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
      toast.success('Categoría guardada con éxito');
      loadData();
    } catch (error) {
      console.error(error);
      toast.error('Hubo un error al guardar la categoría');
    }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.cabysCode || !newProduct.category.id) {
       toast.error("El Nombre, CABYS y Categoría son obligatorios.");
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
        toast.success("Producto actualizado correctamente");
      } else {
        await createProduct(payload);
        toast.success("Producto registrado exitosamente");
      }
      
      setIsProductModalOpen(false);
      setEditingProductId(null);
      setNewProduct({
        name: '', internalCode: '', cabysCode: '', purchaseCost: 0, salePrice: 0, stockQuantity: 0, category: { id: '' }
      });
      loadData();
    } catch (error) {
      console.error(error);
      toast.error("Error validando datos o del servidor.");
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
      category: { id: item.category?.id?.toString() || '' }
    });
    setIsProductModalOpen(true);
  };

  const getStatus = (stock: number) => {
    if (stock <= 0) return 'OUT_OF_STOCK';
    if (stock < 10) return 'LOW_STOCK';
    return 'IN_STOCK';
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Inventario de Agronomía</h2>
          <p className="text-gray-500 dark:text-gray-400">Control de productos y categorías conectado en tiempo real.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setIsCategoryModalOpen(true)} className="p-2 border border-agro-green text-agro-green rounded-lg shadow-sm text-sm hover:bg-agro-green/10 transition-colors">
            + Categoría
            </button>
            <button onClick={() => { setEditingProductId(null); setNewProduct({name: '', internalCode: '', cabysCode: '', purchaseCost: 0, salePrice: 0, stockQuantity: 0, category: { id: '' }}); setIsProductModalOpen(true); }} className="liquid-btn-primary py-2 px-4 shadow-sm text-sm flex items-center justify-center gap-2">
            <Plus size={18} /> Nuevo Producto
            </button>
        </div>
      </div>

      {/* Controles de Filtrado */}
      <div className="liquid-glass-panel p-4 flex flex-col md:flex-row gap-4 items-center shrink-0">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, SKU..." 
            className="liquid-input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 justify-center text-gray-700 dark:text-gray-300">
          <Filter size={18} />
          <span>Filtros</span>
        </button>
      </div>

      {/* Tabla Principal */}
      <div className="liquid-glass-panel flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-semibold rounded-tl-xl w-32">Estado</th>
                <th className="p-4 font-semibold">Producto</th>
                <th className="p-4 font-semibold">Categoría</th>
                <th className="p-4 font-semibold text-right">Existencias</th>
                <th className="p-4 font-semibold text-right rounded-tr-xl">Precio (CRC)</th>
              </tr>
            </thead>
            <tbody>
              {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item, index) => {
                const status = getStatus(item.stockQuantity);
                return (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={item.id} 
                  onClick={() => openEditModal(item)}
                  className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors group cursor-pointer"
                >
                  <td className="p-4">
                    {status === 'IN_STOCK' && <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"><Package size={12}/> En Stock</span>}
                    {status === 'LOW_STOCK' && <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800"><AlertCircle size={12}/> Bajo</span>}
                    {status === 'OUT_OF_STOCK' && <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"><AlertCircle size={12}/> Agotado</span>}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-800 dark:text-gray-200">{item.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{item.internalCode || 'Sin SKU'} | CABYS: {item.cabysCode}</div>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    <span className="py-1 px-2.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                      {item.category?.name || 'Sin Categoría'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-medium text-gray-800 dark:text-gray-200">{item.stockQuantity}</div>
                  </td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white text-right">
                    ₡{item.salePrice?.toLocaleString()}
                  </td>
                </motion.tr>
              )})}
              {products.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">No hay productos. Agrega uno nuevo para empezar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals de Formulario rápidos */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="text-lg font-bold mb-4 dark:text-white">Nueva Categoría</h3>
              <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Categoría</label>
                  <input type="text" placeholder="Ej. Fertilizantes" className="liquid-input w-full" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">Cancelar</button>
                <button onClick={handleCreateCategory} className="liquid-btn-primary px-4 py-2 text-sm">Guardar</button>
              </div>
            </div>
          </motion.div>
        )}
        
        {isProductModalOpen && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <h3 className="text-lg font-bold mb-4 dark:text-white">{editingProductId ? 'Editar Producto' : 'Registrar Producto Agrícola'}</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Comercial <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Ej. Fertilizante QPK 100 ml" required className="liquid-input w-full" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código Interno/SKU</label>
                  <input type="text" placeholder="Ej. 2353" className="liquid-input w-full" value={newProduct.internalCode} onChange={(e) => setNewProduct({...newProduct, internalCode: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código CABYS (13 díg) <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Ej. 1234567890123" required className="liquid-input w-full" value={newProduct.cabysCode} onChange={(e) => setNewProduct({...newProduct, cabysCode: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Costo de Compra (₡)</label>
                  <input type="number" placeholder="Ej. 3000" className="liquid-input w-full" value={newProduct.purchaseCost || ''} onChange={(e) => setNewProduct({...newProduct, purchaseCost: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio de Venta (₡)</label>
                  <input type="number" placeholder="Ej. 5000" className="liquid-input w-full" value={newProduct.salePrice || ''} onChange={(e) => setNewProduct({...newProduct, salePrice: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Inicial</label>
                  <input type="number" placeholder="Ej. 50" className="liquid-input w-full" value={newProduct.stockQuantity || ''} onChange={(e) => setNewProduct({...newProduct, stockQuantity: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría <span className="text-red-500">*</span></label>
                  <select className="liquid-input w-full" value={newProduct.category.id} onChange={(e) => setNewProduct({...newProduct, category: { id: e.target.value }})}>
                      <option value="">-- Seleccionar --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">Cancelar</button>
                <button onClick={handleCreateProduct} className="liquid-btn-primary px-4 py-2 text-sm">{editingProductId ? 'Actualizar' : 'Registrar'}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
