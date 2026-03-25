import re

file = r'c:\agropecuario-pos\frontend\src\pages\receivables\ReceivablesView.tsx'

with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# Match the emoji block in history
pattern = r'\{payment\.paymentMethod && \(\s*<span[^>]+>\s*\{payment\.paymentMethod === \'CASH\'.*?</span>\s*\)\}'

replacement = """{payment.paymentMethod && (() => {
                                         const meta = getPaymentMethodMeta(payment.paymentMethod);
                                         return meta ? (
                                           <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                             <meta.Icon size={10} className={meta.color} /> {meta.label}
                                           </span>
                                         ) : null;
                                       })()}"""

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
if new_content == content:
    print("NO MATCH FOUND")
else:
    print("Replaced successfully")

with open(file, 'w', encoding='utf-8') as f:
    f.write(new_content)

matches = re.findall(r'meta\.Icon|getPaymentMethodMeta|💵|💳|📱|🏦', new_content)
print("Found:", matches)
