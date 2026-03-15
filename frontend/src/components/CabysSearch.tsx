import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { getCabysSearch, getCabysByCode } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function CabysSearch({
  value,
  onChange,
  onCabysDetails
}: {
  value: string;
  onChange: (val: string) => void;
  onCabysDetails?: (taxRate: number, description: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync incoming value to query if changed from outside
  useEffect(() => {
    if (value !== query && !open) {
      setQuery(value);
    }
  }, [value, open]);

  // Click outside listener
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await getCabysSearch(query);
        setResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, open]);

  const handleSelect = (cabys: any) => {
    setQuery(cabys.cabysCode);
    onChange(cabys.cabysCode);
    setOpen(false);
    if (onCabysDetails) {
      onCabysDetails(cabys.taxRate * 100, cabys.description);
    }
  };

  const handleBlur = async () => {
    if (!open && query && query.length === 13 && query !== value) {
      // Automatic validation on blur for manual entry
      try {
        const cabys = await getCabysByCode(query);
        onChange(cabys.cabysCode);
        if (onCabysDetails) {
          onCabysDetails(cabys.taxRate * 100, cabys.description);
        }
      } catch (e: any) {
        toast.error('El código CABYS ingresado no es válido o no existe.');
      }
    } else if (!open) {
        onChange(query);
    }
  };

  return (
    <div className="relative group" ref={containerRef}>
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-premium-emerald transition-colors" />
        <input
          type="text"
          className="premium-input w-full !pl-16"
          placeholder="Buscar por descripción o código CABYS..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (query.length >= 2) setOpen(true);
          }}
          onBlur={handleBlur}
          maxLength={100}
        />
        {loading && (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {open && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.95 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transform origin-top"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {results.length === 0 && !loading && (
                <div className="p-4 text-center text-slate-400 text-sm">
                  No se encontraron resultados para "{query}"
                </div>
              )}
              {results.map((cabys) => (
                <button
                  key={cabys.id}
                  type="button"
                  onClick={() => handleSelect(cabys)}
                  className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-50 dark:border-slate-700/50 last:border-0 transition-colors"
                >
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{cabys.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-premium-emerald/10 text-premium-emerald px-2 py-0.5 rounded uppercase text-[10px] font-black">
                      CABYS: {cabys.cabysCode}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      Impuesto: {(cabys.taxRate * 100).toFixed(0)}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
