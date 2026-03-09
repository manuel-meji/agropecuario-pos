import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Percent, DollarSign, X, Plus, Minus } from 'lucide-react';

interface DiscountManagerProps {
  subtotal: number;
  onDiscountChange: (discount: { type: 'percentage' | 'fixed', value: number } | null) => void;
  currentDiscount: { type: 'percentage' | 'fixed', value: number } | null;
}

export default function DiscountManager({ subtotal, onDiscountChange, currentDiscount }: DiscountManagerProps) {
  const [discountType, setDiscountType] = React.useState<'percentage' | 'fixed' | null>(currentDiscount?.type || null);
  const [discountValue, setDiscountValue] = React.useState(currentDiscount?.value || 0);
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Calculate discount amount
  const discountAmount = () => {
    if (!discountType) return 0;
    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  };

  const getMaxDiscount = () => {
    if (discountType === 'percentage') return 100;
    return subtotal;
  };

  const handleDiscountChange = (type: 'percentage' | 'fixed', value: number) => {
    const maxDiscount = getMaxDiscount();
    const validValue = Math.min(Math.max(value, 0), maxDiscount);
    
    setDiscountType(type);
    setDiscountValue(validValue);
    onDiscountChange({ type, value: validValue });
  };

  const handleClear = () => {
    setDiscountType(null);
    setDiscountValue(0);
    setIsExpanded(false);
    onDiscountChange(null);
  };

  return (
    <motion.div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
          discountType 
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400' 
            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
        }`}
      >
        <div className="flex items-center gap-3">
          {discountType === 'percentage' ? (
            <Percent size={18} />
          ) : discountType === 'fixed' ? (
            <DollarSign size={18} />
          ) : (
            <Plus size={18} className="opacity-50" />
          )}
          <span className="font-bold text-sm">
            {discountType
              ? `Descuento: ${discountType === 'percentage' ? `${discountValue}%` : `₡${discountValue.toLocaleString()}`} (-₡${discountAmount().toLocaleString(undefined, { maximumFractionDigits: 2 })})`
              : 'Sin Descuento'}
          </span>
        </div>
        {discountType && (
          <X 
            size={16} 
            className="opacity-70 hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
          />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              {/* Discount Type Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDiscountChange('percentage', 0)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                    discountType === 'percentage'
                      ? 'bg-premium-emerald text-white shadow-lg shadow-premium-emerald/30'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Percent size={16} />
                  Porcentaje
                </button>
                <button
                  onClick={() => handleDiscountChange('fixed', 0)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                    discountType === 'fixed'
                      ? 'bg-premium-emerald text-white shadow-lg shadow-premium-emerald/30'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <DollarSign size={16} />
                  Monto Fijo
                </button>
              </div>

              {/* Input & Slider */}
              {discountType && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Value Display */}
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      {discountType === 'percentage' ? 'Porcentaje' : 'Monto'}
                    </p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                      {discountType === 'percentage' ? `${discountValue}%` : `₡${discountValue.toLocaleString()}`}
                    </p>
                    <p className="text-xs font-bold text-premium-emerald mt-2">
                      Descuento: ₡{discountAmount().toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Number Input */}
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block ml-1">
                      Ingresa el {discountType === 'percentage' ? 'porcentaje' : 'monto'}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDiscountChange(discountType, Math.max(0, discountValue - (discountType === 'percentage' ? 5 : 5000)))}
                        className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors text-slate-600 dark:text-slate-300"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={getMaxDiscount()}
                        value={discountValue}
                        onChange={(e) => handleDiscountChange(discountType, parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-center font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-premium-emerald/20 transition-all"
                      />
                      <button
                        onClick={() => handleDiscountChange(discountType, Math.min(getMaxDiscount(), discountValue + (discountType === 'percentage' ? 5 : 5000)))}
                        className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors text-slate-600 dark:text-slate-300"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Preset Buttons for Percentage */}
                  {discountType === 'percentage' && (
                    <div className="grid grid-cols-4 gap-2">
                      {[5, 10, 15, 20].map(pct => (
                        <button
                          key={pct}
                          onClick={() => handleDiscountChange('percentage', pct)}
                          className={`py-2 rounded-lg font-bold text-xs transition-all ${
                            discountValue === pct
                              ? 'bg-premium-emerald text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Slider */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={getMaxDiscount()}
                      value={discountValue}
                      onChange={(e) => handleDiscountChange(discountType, parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-premium-emerald"
                    />
                  </div>

                  {/* Clear Button */}
                  <button
                    onClick={handleClear}
                    className="w-full py-2 text-slate-500 dark:text-slate-400 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Limpiar Descuento
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
