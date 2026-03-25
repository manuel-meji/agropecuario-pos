import re
import os

file_path = r'c:\agropecuario-pos\frontend\src\pages\pos\POSTerminal.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Lucide Icons (add ArrowUpRight, check for Wallet)
content = re.sub(r'import {([\s\S]*?)} from \'lucide-react\';', 
                 lambda m: f"import {{{m.group(1).strip().replace('DollarSign', 'DollarSign, ArrowUpRight')}}} from 'lucide-react';", 
                 content)

# 2. Add imports for Settings and getPaymentMethodMeta
if 'getCompanySettings' not in content:
    content = content.replace("import { getProducts,", 
        "import { getCompanySettings } from '../../utils/companySettings';\nimport { getPaymentMethodMeta } from '../../components/PaymentMethodSelector';\nimport { getProducts,")

# 3. Add state for enabledMethods
if 'enabledMethods' not in content:
    content = re.sub(r'(const \[showPaymentMethods, setShowPaymentMethods\] = useState\(false\);)', 
                     r'\1\n  const [enabledMethods, setEnabledMethods] = useState<string[]>([]);', 
                     content)

# 4. Update useEffect to fetch settings
content = re.sub(r'useEffect\(\(\) => \{ loadProducts\(\); loadClients\(\); \}, \[\]\);', 
                 'useEffect(() => { loadProducts(); loadClients(); async function load() { const s = await getCompanySettings(); if (s.enabledPaymentMethods) setEnabledMethods(s.enabledPaymentMethods); } load(); }, []);', 
                 content)

# 5. Fix checkout grid - making it dynamic and includes TRANSFER/CREDIT icon consistency
# We look for the <div className="grid grid-cols-2 gap-2"> that contains handleCheckout('CASH')
# Note: In the previous view, it was around line 797.
payment_grid_start = content.find("<div className=\"grid grid-cols-2 gap-2\">")
while payment_grid_start != -1:
    # Check if this is the correct grid by looking for handleCheckout('CASH') inside it
    next_block = content[payment_grid_start:payment_grid_start+1000]
    if "handleCheckout('CASH')" in next_block:
        # Find the end of this div
        end_index = content.find("</div>", payment_grid_start)
        # It has multiple buttons, so we need to find the final closing div of the grid.
        # But for this specific layout, let's just use regex to match the whole payment block.
        break
    payment_grid_start = content.find("<div className=\"grid grid-cols-2 gap-2\">", payment_grid_start + 1)

if payment_grid_start != -1:
    pattern = r'<div className="grid grid-cols-2 gap-2">[\s\S]*?handleCheckout\(\'CREDIT\'\)[\s\S]*?<\/div>'
    
    new_grid = """<div className="grid grid-cols-2 gap-2">
                    {(enabledMethods.length > 0 ? enabledMethods : ['CASH', 'CARD', 'SINPE_MOVIL', 'TRANSFER', 'CREDIT']).map(m => {
                        const meta = getPaymentMethodMeta(m);
                        if (!meta) return null;
                        
                        const isDisabled = m === 'CREDIT' && !selectedClientId;
                        
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => handleCheckout(m as any)}
                            disabled={isDisabled}
                            className={`flex items-center justify-center gap-2 font-black rounded-2xl py-4 transition-all text-sm group ${
                              isDisabled ? 'opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400' :
                              (m === 'CASH' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:scale-[1.02] active:scale-[0.98]' : 
                               'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:scale-[1.02] active:scale-[0.98]')
                            }`}
                          >
                            <meta.Icon size={16} /> {meta.label}
                          </button>
                        );
                    })}
                  </div>"""
    
    # We'll do a replacement of the whole block from the start we found to the matching closing div.
    # But regex is easier if we find the pattern.
    content = re.sub(pattern, new_grid, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("POSTerminal updated successfully")
