import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Percent, DollarSign, TrendingUp } from 'lucide-react';

interface ProfitCalculatorProps {
  purchaseCost: number;
  salePrice: number;
  onPriceChange: (newPrice: number) => void;
}

export default function ProfitCalculator({ purchaseCost, salePrice, onPriceChange }: ProfitCalculatorProps) {
  const [profitMode, setProfitMode] = React.useState<'percentage' | 'fixed' | 'price'>('percentage');
  const [profitValue, setProfitValue] = React.useState(20);
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Calculate profit amount based on current sale price
  const profitAmount = salePrice - purchaseCost;
  const profitPercentage = purchaseCost > 0 ? (profitAmount / purchaseCost) * 100 : 0;

  // Apply profit calculation based on mode
  useEffect(() => {
    if (!isExpanded) return;
    
    let newPrice = salePrice;
    if (profitMode === 'percentage') {
      newPrice = purchaseCost * (1 + profitValue / 100);
    } else if (profitMode === 'fixed') {
      newPrice = purchaseCost + profitValue;
    }
    // 'price' mode doesn't recalculate, user sets it directly
    
    onPriceChange(Math.max(purchaseCost, Math.round(newPrice * 100) / 100));
  }, [profitMode, profitValue, purchaseCost, isExpanded]);

  const handleProfitChange = (mode: 'percentage' | 'fixed' | 'price', value: number) => {
    setProfitMode(mode);
    setProfitValue(value);
  };

  const handleDirectPriceChange = (newPrice: number) => {
    setProfitValue(newPrice);
    onPriceChange(Math.max(purchaseCost, newPrice));
  };

  return (
    <motion.div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
          isExpanded 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400' 
            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
        }`}
      >
        <div className="flex items-center gap-3">
          <TrendingUp size={18} />
          <span className="font-bold text-sm">
            Ganancia: {profitPercentage > 0 ? '+' : ''}{profitPercentage.toFixed(1)}% (₡{profitAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })})
          </span>
        </div>
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
              {/* Info Box */}
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Costo de Compra</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mb-3">₡{purchaseCost.toLocaleString()}</p>
                <div className="flex justify-center gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Precio Venta</p>
                    <p className="text-xl font-black text-emerald-600">₡{salePrice.toLocaleString()}</p>
                  </div>
                  <div className="w-px bg-slate-200 dark:bg-slate-600" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Ganancia</p>
                    <p className={`text-xl font-black ${profitAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      ₡{profitAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mode Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleProfitChange('percentage', profitValue)}
                  className={`flex flex-col items-center py-3 rounded-xl font-bold text-xs transition-all gap-1 ${
                    profitMode === 'percentage'
                      ? 'bg-premium-emerald text-white shadow-lg shadow-premium-emerald/30'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Percent size={16} />
                  Porcentaje
                </button>
                <button
                  type="button"
                  onClick={() => handleProfitChange('fixed', profitValue)}
                  className={`flex flex-col items-center py-3 rounded-xl font-bold text-xs transition-all gap-1 ${
                    profitMode === 'fixed'
                      ? 'bg-premium-emerald text-white shadow-lg shadow-premium-emerald/30'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <DollarSign size={16} />
                  Monto Fijo
                </button>
                <button
                  type="button"
                  onClick={() => handleProfitChange('price', salePrice)}
                  className={`flex flex-col items-center py-3 rounded-xl font-bold text-xs transition-all gap-1 ${
                    profitMode === 'price'
                      ? 'bg-premium-emerald text-white shadow-lg shadow-premium-emerald/30'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <TrendingUp size={16} />
                  Precio Final
                </button>
              </div>

              {/* Input Section */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {profitMode !== 'price' && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                        {profitMode === 'percentage' ? 'Porcentaje de Ganancia' : 'Monto de Ganancia (₡)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={profitValue}
                        onChange={(e) => setProfitValue(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-center font-bold text-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-premium-emerald/20 transition-all"
                      />
                    </div>

                    {/* Preset Buttons */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Presets</p>
                      <div className="grid grid-cols-4 gap-2">
                        {profitMode === 'percentage' ? (
                          [10, 20, 30, 50].map(pct => (
                            <button
                              type="button"
                              key={pct}
                              onClick={() => setProfitValue(pct)}
                              className={`py-2 rounded-lg font-bold text-xs transition-all ${
                                profitValue === pct
                                  ? 'bg-premium-emerald text-white'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                              }`}
                            >
                              +{pct}%
                            </button>
                          ))
                        ) : (
                          [5000, 10000, 25000, 50000].map(amt => (
                            <button
                              type="button"
                              key={amt}
                              onClick={() => setProfitValue(amt)}
                              className={`py-2 rounded-lg font-bold text-xs transition-all ${
                                profitValue === amt
                                  ? 'bg-premium-emerald text-white'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                              }`}
                            >
                              ₡{(amt / 1000).toFixed(0)}k
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Slider */}
                    <div>
                      <input
                        type="range"
                        min="0"
                        max={profitMode === 'percentage' ? 200 : purchaseCost * 3}
                        value={profitValue}
                        onChange={(e) => setProfitValue(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-premium-emerald"
                      />
                    </div>
                  </>
                )}

                {profitMode === 'price' && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                        Precio Final de Venta (₡)
                      </label>
                      <input
                        type="number"
                        min={purchaseCost}
                        value={salePrice}
                        onChange={(e) => handleDirectPriceChange(parseFloat(e.target.value) || purchaseCost)}
                        className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-center font-bold text-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-premium-emerald/20 transition-all"
                      />
                      <p className="text-[10px] text-slate-400 mt-2">
                        Mínimo: ₡{purchaseCost.toLocaleString()} (costo de compra)
                      </p>
                    </div>

                    {/* Slider */}
                    <div>
                      <input
                        type="range"
                        min={purchaseCost}
                        max={purchaseCost * 3}
                        value={salePrice}
                        onChange={(e) => handleDirectPriceChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-premium-emerald"
                      />
                    </div>
                  </>
                )}

                {/* Result Preview */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                      Resultado
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        ₡{salePrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70">
                        +{profitPercentage.toFixed(1)}% de ganancia
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
