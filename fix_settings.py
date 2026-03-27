import re

file_path = r'c:\agropecuario-pos\frontend\src\pages\settings\SettingsView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add the new tab panel before the 'hacienda' one.
# Match: {activeTab === 'hacienda' && (
# Ensure we include exactly the spaces or whitespace used in the file.
pattern = r'(\s*\{activeTab === \'hacienda\' && \()'

new_panel = """              {activeTab === 'payments' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-3xl">
                   <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-4">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-600 dark:text-amber-400 h-fit">
                         <Wallet size={24} />
                      </div>
                      <div>
                         <h4 className="font-bold text-amber-900 dark:text-amber-300">Configuración de Billeteras</h4>
                         <p className="text-sm text-amber-700 dark:text-amber-400/80 mt-1">Activa o desactiva los medios de pago disponibles en el sistema. Los métodos desactivados no aparecerán en el POS ni en cierres de caja.</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'CASH', label: 'Efectivo', desc: 'Cobros físicos en billetes y monedas' },
                        { id: 'SINPE_MOVIL', label: 'SINPE Móvil', desc: 'Transferencias rápidas vía número telefónico' },
                        { id: 'CARD', label: 'Tarjeta', desc: 'Cobros vía Datáfono (Visa/Mastercard)' },
                        { id: 'TRANSFER', label: 'Transferencia', desc: 'Depósitos bancarios directos' },
                        { id: 'CREDIT', label: 'Venta a Crédito', desc: 'Permitir que ciertos clientes compren a crédito' }
                      ].map(method => {
                        const isEnabled = settings.enabledPaymentMethods?.includes(method.id);
                        return (
                          <div 
                            key={method.id}
                            onClick={() => {
                              const current = settings.enabledPaymentMethods || [];
                              const next = isEnabled 
                                ? current.filter(m => m !== method.id)
                                : [...current, method.id];
                              handleChange('enabledPaymentMethods', next);
                            }}
                            className={`group cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-start gap-4 ${isEnabled ? 'bg-amber-500/5 border-amber-500/30' : 'bg-slate-50 dark:bg-slate-900/50 border-transparent opacity-60 hover:opacity-100 hover:border-slate-200 dark:hover:border-slate-800'}`}
                          >
                            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isEnabled ? 'bg-amber-500 border-amber-500' : 'border-slate-300 dark:border-slate-600'}`}>
                              {isEnabled && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                            <div className="flex-1">
                               <p className={`font-black uppercase tracking-widest text-xs ${isEnabled ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>{method.label}</p>
                               <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-relaxed">{method.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                   </div>
                </motion.div>
              )}

"""

if pattern in content or re.search(pattern, content):
    new_content = re.sub(pattern, new_panel + r'\1', content)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replacement success")
else:
    print("Pattern not found")
