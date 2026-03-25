import { useState, useEffect } from 'react';
import { Banknote, Smartphone, CreditCard, ArrowLeftRight, Wallet } from 'lucide-react';
import { getCompanySettings } from '../utils/companySettings';

// ─── Payment Method Config ──────────────────────────────────────────────────
export const PAYMENT_METHODS = [
  { value: 'CASH',        label: 'Efectivo',       Icon: Banknote,       color: 'text-green-600'  },
  { value: 'SINPE_MOVIL', label: 'SINPE Móvil',    Icon: Smartphone,     color: 'text-purple-600' },
  { value: 'CARD',        label: 'Tarjeta',         Icon: CreditCard,     color: 'text-blue-600'   },
  { value: 'TRANSFER',    label: 'Transferencia',   Icon: ArrowLeftRight, color: 'text-teal-600'   },
  { value: 'CREDIT',      label: 'Crédito',         Icon: Wallet,         color: 'text-amber-600'  },
] as const;

export type PaymentMethodValue = typeof PAYMENT_METHODS[number]['value'];

export function getPaymentMethodMeta(value?: string | null) {
  return PAYMENT_METHODS.find(m => m.value === value) ?? null;
}

// ─── Selector Component ─────────────────────────────────────────────────────
interface PaymentMethodSelectorProps {
  value: string;
  onChange(v: string): void;
  accentColor?: 'emerald' | 'rose';
  filterEnabled?: boolean; // New prop to enable/disable company filtering
  excludeMethods?: string[]; // New prop to explicitly exclude methods (e.g., CREDIT)
}

export default function PaymentMethodSelector({
  value,
  onChange,
  accentColor = 'emerald',
  filterEnabled = true,
  excludeMethods = ['CREDIT'] // Default exclude CREDIT for standard form selectors
}: PaymentMethodSelectorProps) {
  const [enabledList, setEnabledList] = useState<string[]>([]);

  useEffect(() => {
    if (!filterEnabled) return;
    async function load() {
      const settings = await getCompanySettings();
      if (settings.enabledPaymentMethods) {
        setEnabledList(settings.enabledPaymentMethods);
      }
    }
    load();
  }, [filterEnabled]);

  let visibleMethods = filterEnabled && enabledList.length > 0
    ? PAYMENT_METHODS.filter(m => enabledList.includes(m.value))
    : PAYMENT_METHODS;

  if (excludeMethods.length > 0) {
    visibleMethods = visibleMethods.filter(m => !excludeMethods.includes(m.value));
  }

  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
        Medio de Pago
      </p>
      <div className="grid grid-cols-2 gap-2">
        {visibleMethods.map(({ value: v, label, Icon, color }) => {
          const active = value === v;
          const ringClass =
            accentColor === 'emerald'
              ? 'border-premium-emerald bg-emerald-50 dark:bg-emerald-900/20 text-premium-emerald'
              : 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600';
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 text-sm font-black transition-all ${
                active
                  ? ringClass
                  : `border-slate-200 dark:border-slate-700 ${color} hover:border-slate-300 dark:hover:border-slate-600`
              }`}
            >
              <Icon size={16} className={active ? '' : color} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
