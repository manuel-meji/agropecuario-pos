import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Hash, Upload, Search, CheckCircle, XCircle, Clock,
  AlertTriangle, Download, ArrowRight, ArrowLeft, ShieldCheck,
  Info, Building2, Calendar, Banknote, Globe, Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  importDocumentByClave, importDocumentFromXml,
  acceptDocument, acceptPartialDocument, rejectDocument,
  downloadReceivedXml
} from '../../services/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface DocPreview {
  id?: number;
  clave: string;
  cedulaEmisor: string;
  nombreEmisor: string;
  emailEmisor: string;
  numeroConsecutivo: string;
  fechaEmisionDoc: string;
  montoTotal: number;
  codigoMoneda: string;
  estadoConfirmacion: 'PENDIENTE' | 'ACEPTADO_TOTAL' | 'ACEPTADO_PARCIAL' | 'RECHAZADO';
  tieneXml: boolean;
  fuenteImportacion: string;
  yaExistia?: boolean;
  contingencia?: boolean;
  mensajeContingencia?: string;
  estadoHacienda?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtMoney = (n: number, currency = 'CRC') =>
  `${currency} ${(n || 0).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (s: string) => {
  if (!s) return '—';
  try { return new Date(s).toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return s; }
};

const ESTADO_INFO: Record<string, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  PENDIENTE:        { label: 'Pendiente de confirmación', color: 'text-amber-700', bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',   icon: Clock },
  ACEPTADO_TOTAL:   { label: 'Aceptado Total',            color: 'text-emerald-700', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', icon: CheckCircle },
  ACEPTADO_PARCIAL: { label: 'Aceptado Parcial',          color: 'text-blue-700',   bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',     icon: CheckCircle },
  RECHAZADO:        { label: 'Rechazado',                 color: 'text-red-700',    bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',         icon: XCircle },
};

// ─── Steps ────────────────────────────────────────────────────────────────────
type Step = 'import' | 'preview' | 'confirm' | 'done';

// ─────────────────────────────────────────────────────────────────────────────
export default function ImportarFactura() {
  const [step, setStep] = useState<Step>('import');
  const [mode, setMode] = useState<'clave' | 'xml'>('clave');
  const [claveInput, setClaveInput] = useState('');
  const [claveError, setClaveError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [doc, setDoc] = useState<DocPreview | null>(null);

  // Confirmación
  const [confirmMode, setConfirmMode] = useState<'accept' | 'partial' | 'reject'>('accept');
  const [monto, setMonto] = useState('');
  const [detalle, setDetalle] = useState('');
  const [seguro, setSeguro] = useState(false);
  const [sending, setSending] = useState(false);
  const [doneResult, setDoneResult] = useState<{ tipo: string; estadoEnvio: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Validación clave en tiempo real ──────────────────────────────────────
  const handleClaveChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 50);
    setClaveInput(clean);
    if (clean.length > 0 && clean.length < 50) {
      setClaveError(`La clave debe tener exactamente 50 dígitos numéricos (tiene ${clean.length})`);
    } else if (clean.length === 0) {
      setClaveError('');
    } else {
      setClaveError('');
    }
  };

  // ── Importar por clave ────────────────────────────────────────────────────
  const handleImportClave = async () => {
    if (claveInput.length !== 50) {
      setClaveError('La clave debe tener exactamente 50 dígitos numéricos');
      return;
    }
    setImporting(true);
    const id = toast.loading('Consultando Hacienda...');
    try {
      const data = await importDocumentByClave(claveInput);
      setDoc(data);
      toast.success(data.yaExistia ? 'Factura ya registrada en el sistema' : 'Factura importada desde Hacienda', { id });
      setStep('preview');
    } catch (e: any) {
      const msg = e?.response?.data?.error || e.message;
      toast.error('Error: ' + msg, { id });
    } finally {
      setImporting(false);
    }
  };

  // ── Importar XML/ZIP ──────────────────────────────────────────────────────
  const handleImportXml = async (file: File) => {
    setImporting(true);
    const id = toast.loading('Procesando archivo XML...');
    try {
      const data = await importDocumentFromXml(file);
      setDoc(data);
      toast.success('Factura importada correctamente', { id });
      setStep('preview');
    } catch (e: any) {
      const msg = e?.response?.data?.error || e.message;
      toast.error('Error: ' + msg, { id });
    } finally {
      setImporting(false);
    }
  };

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { handleImportXml(f); }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { handleImportXml(f); }
  };

  // ── Descargar XML ─────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!doc?.tieneXml) return;
    try {
      const blob = await downloadReceivedXml(doc.clave);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `Recibido_${doc.clave}.xml`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Error descargando XML'); }
  };

  // ── Enviar confirmación ───────────────────────────────────────────────────
  const handleSendConfirm = async () => {
    if (!doc) return;
    if (!seguro) { toast.error('Debes marcar "Estoy seguro" para continuar'); return; }
    if (confirmMode === 'reject' && detalle.trim().length < 5) {
      toast.error('El motivo de rechazo debe tener al menos 5 caracteres'); return;
    }
    if (confirmMode === 'partial' && (!monto || isNaN(parseFloat(monto)))) {
      toast.error('Ingresa el monto aceptado parcialmente'); return;
    }

    setSending(true);
    const id = toast.loading('Firmando y enviando a Hacienda...');
    try {
      let result: any;
      if (confirmMode === 'accept') {
        result = await acceptDocument(doc.clave);
        toast.success('¡Confirmación enviada! Hacienda la procesará en máx. 3 horas.', { id });
      } else if (confirmMode === 'partial') {
        result = await acceptPartialDocument(doc.clave, parseFloat(monto), detalle || 'Aceptación parcial');
        toast.success('¡Aceptación parcial enviada a Hacienda!', { id });
      } else {
        result = await rejectDocument(doc.clave, detalle);
        toast.success('Rechazo enviado correctamente a Hacienda.', { id });
      }
      setDoneResult({ tipo: confirmMode, estadoEnvio: result.estadoEnvio || 'OK' });
      setStep('done');
    } catch (e: any) {
      const msg = e?.response?.data?.error || e.message;
      toast.error('Error: ' + msg, { id });
    } finally {
      setSending(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setStep('import'); setDoc(null); setClaveInput(''); setClaveError('');
    setMode('clave'); setConfirmMode('accept');
    setMonto(''); setDetalle(''); setSeguro(false); setDoneResult(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col gap-5">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
            <Inbox size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Importar Factura Recibida</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Art. 10 · Resolución MH-DGT-RES-0027-2024 · Plazo máximo: 8 días hábiles del mes siguiente
            </p>
          </div>
        </div>

        {/* Banner informativo legal */}
        <div className="mt-3 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl px-5 py-3.5">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            <strong>Obligación legal:</strong> Como Emisor-Receptor Electrónico, debes confirmar o rechazar cada factura recibida
            en máximo 8 días hábiles del mes siguiente a su emisión. Si no lo haces, Hacienda presume aceptación total
            y puede usarla en fiscalizaciones. Este módulo genera el <em>MensajeReceptor</em> firmado con XAdES-EPES y lo envía a Hacienda.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <StepIndicator current={step} />

      {/* Content area */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {step === 'import' && (
            <StepImport
              key="import"
              mode={mode} setMode={setMode}
              claveInput={claveInput} claveError={claveError}
              onClaveChange={handleClaveChange}
              onImportClave={handleImportClave}
              importing={importing}
              dragOver={dragOver} setDragOver={setDragOver}
              onFileDrop={handleFileDrop}
              fileInputRef={fileInputRef}
              onFileSelect={handleFileSelect}
            />
          )}
          {step === 'preview' && doc && (
            <StepPreview
              key="preview"
              doc={doc}
              onNext={() => setStep('confirm')}
              onBack={handleReset}
              onDownload={handleDownload}
            />
          )}
          {step === 'confirm' && doc && (
            <StepConfirm
              key="confirm"
              doc={doc}
              confirmMode={confirmMode} setConfirmMode={setConfirmMode}
              monto={monto} setMonto={setMonto}
              detalle={detalle} setDetalle={setDetalle}
              seguro={seguro} setSeguro={setSeguro}
              sending={sending}
              onSend={handleSendConfirm}
              onBack={() => setStep('preview')}
            />
          )}
          {step === 'done' && doc && doneResult && (
            <StepDone
              key="done"
              doc={doc}
              result={doneResult}
              onImportOtra={handleReset}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: 'import',  label: 'Importar'    },
    { id: 'preview', label: 'Verificar'   },
    { id: 'confirm', label: 'Confirmar'   },
    { id: 'done',    label: 'Completado'  },
  ];
  const idx = steps.findIndex(s => s.id === current);
  return (
    <div className="flex items-center gap-0 shrink-0">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center flex-1">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black transition-all
            ${i <= idx ? 'bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black
              bg-white/20">
              {i < idx ? '✓' : i + 1}
            </span>
            {s.label}
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all ${i < idx ? 'bg-violet-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── PASO 1: Importar ─────────────────────────────────────────────────────────
function StepImport({
  mode, setMode, claveInput, claveError, onClaveChange, onImportClave, importing,
  dragOver, setDragOver, onFileDrop, fileInputRef, onFileSelect
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="premium-panel p-6 space-y-6"
    >
      {/* Selector de modo */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setMode('clave')}
          className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
            mode === 'clave'
              ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <div className={`p-2.5 rounded-xl ${mode === 'clave' ? 'bg-violet-100 dark:bg-violet-800' : 'bg-slate-100 dark:bg-slate-800'}`}>
            <Hash size={18} className={mode === 'clave' ? 'text-violet-600' : 'text-slate-500'} />
          </div>
          <div>
            <p className={`font-black text-sm ${mode === 'clave' ? 'text-violet-700 dark:text-violet-300' : 'text-slate-700 dark:text-slate-300'}`}>
              Pegar Clave Numérica
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">50 dígitos de la factura</p>
          </div>
        </button>
        <button
          onClick={() => setMode('xml')}
          className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
            mode === 'xml'
              ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <div className={`p-2.5 rounded-xl ${mode === 'xml' ? 'bg-violet-100 dark:bg-violet-800' : 'bg-slate-100 dark:bg-slate-800'}`}>
            <FileText size={18} className={mode === 'xml' ? 'text-violet-600' : 'text-slate-500'} />
          </div>
          <div>
            <p className={`font-black text-sm ${mode === 'xml' ? 'text-violet-700 dark:text-violet-300' : 'text-slate-700 dark:text-slate-300'}`}>
              Subir Archivo XML / ZIP
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Archivo .xml o .zip con la factura</p>
          </div>
        </button>
      </div>

      {/* Panel de clave */}
      {mode === 'clave' && (
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
              Clave Numérica (50 dígitos)
              <span className="ml-2 normal-case font-medium text-slate-400">
                — Posición 1–50 del XML del proveedor
              </span>
            </label>
            <div className="relative">
              <input
                id="clave-input"
                type="text"
                inputMode="numeric"
                value={claveInput}
                onChange={(e) => onClaveChange(e.target.value)}
                placeholder="Pegue aquí los 50 dígitos de la clave..."
                maxLength={50}
                className={`w-full px-4 py-3.5 rounded-2xl border-2 font-mono text-sm bg-white dark:bg-slate-800 outline-none transition-all ${
                  claveError
                    ? 'border-red-400 focus:border-red-500'
                    : claveInput.length === 50
                    ? 'border-emerald-400 focus:border-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 focus:border-violet-400 dark:focus:border-violet-500'
                } text-slate-800 dark:text-slate-100 placeholder-slate-300`}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className={`text-xs font-black ${claveInput.length === 50 ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {claveInput.length}/50
                </span>
                {claveInput.length === 50 && <CheckCircle size={16} className="text-emerald-500" />}
              </div>
            </div>
            {claveError && (
              <p className="flex items-center gap-1.5 text-xs text-red-600 mt-2 font-bold">
                <XCircle size={13} />
                {claveError}
              </p>
            )}
          </div>

          {/* Tooltip explicativo */}
          <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-[11px] text-slate-500">
            <Info size={13} className="shrink-0 mt-0.5 text-violet-400" />
            <span>
              La clave de 50 dígitos identifica unívocamente cada factura en el sistema de Hacienda.
              Encuéntrala en el XML recibido dentro del nodo <code className="font-mono bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">&lt;Clave&gt;</code>.
            </span>
          </div>

          <button
            id="btn-importar-clave"
            onClick={onImportClave}
            disabled={importing || claveInput.length !== 50}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black rounded-2xl hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900/30"
          >
            {importing ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Consultando Hacienda...</>
            ) : (
              <><Search size={17} /> Importar y consultar en Hacienda</>
            )}
          </button>
        </div>
      )}

      {/* Panel de XML */}
      {mode === 'xml' && (
        <div className="space-y-3">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-4 py-12 px-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
              dragOver
                ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                : 'border-slate-300 dark:border-slate-600 hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10'
            }`}
          >
            <div className={`p-4 rounded-2xl transition-colors ${dragOver ? 'bg-violet-100 dark:bg-violet-800' : 'bg-slate-100 dark:bg-slate-800'}`}>
              <Upload size={28} className={dragOver ? 'text-violet-600' : 'text-slate-400'} />
            </div>
            <div className="text-center">
              <p className="font-black text-slate-700 dark:text-slate-200 text-sm">
                {dragOver ? 'Suelte el archivo aquí' : 'Arrastre el XML o haga clic para seleccionar'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Formatos: <strong>.xml</strong> o <strong>.zip</strong> (XML + PDF)</p>
            </div>
            {importing && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-slate-900/80">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-bold text-violet-700">Procesando XML...</span>
                </div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xml,.zip"
            className="hidden"
            onChange={onFileSelect}
          />

          <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-[11px] text-slate-500">
            <Info size={13} className="shrink-0 mt-0.5 text-violet-400" />
            <span>
              El sistema extraerá automáticamente la <code className="font-mono bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">&lt;Clave&gt;</code> del XML
              y la consultará en Hacienda. Si Hacienda no está disponible, la guardará localmente (modo contingencia).
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── PASO 2: Previsualización ─────────────────────────────────────────────────
function StepPreview({ doc, onNext, onBack, onDownload }: {
  doc: DocPreview; onNext: () => void; onBack: () => void; onDownload: () => void
}) {
  const estadoInfo = ESTADO_INFO[doc.estadoConfirmacion] || ESTADO_INFO.PENDIENTE;
  const EstadoIcon = estadoInfo.icon;
  const yaConfirmado = doc.estadoConfirmacion !== 'PENDIENTE';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Estado badge */}
      <div className={`flex items-center gap-3 p-4 rounded-2xl border ${estadoInfo.bgColor}`}>
        <EstadoIcon size={20} className={estadoInfo.color} />
        <div>
          <p className={`font-black text-sm ${estadoInfo.color}`}>{estadoInfo.label}</p>
          {doc.yaExistia && (
            <p className="text-xs text-slate-500 mt-0.5">Esta factura ya estaba registrada en el sistema.</p>
          )}
          {doc.contingencia && (
            <p className="text-xs text-amber-600 mt-0.5">
              ⚠️ {doc.mensajeContingencia || 'Guardada en modo contingencia (Hacienda no disponible). Use "Sincronizar" para obtener los detalles completos cuando Hacienda esté disponible.'}
            </p>
          )}
        </div>
        <div className="ml-auto">
          <span className="text-[10px] font-black px-2 py-1 bg-white dark:bg-slate-800 rounded-lg text-slate-500 uppercase tracking-widest">
            {doc.fuenteImportacion}
          </span>
        </div>
      </div>

      {/* Datos del comprobante */}
      <div className="premium-panel p-6 space-y-4">
        <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
          <FileText size={17} /> Datos del Comprobante
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <DataField icon={Building2} label="Emisor (Proveedor)" value={doc.nombreEmisor || '—'} />
          <DataField icon={Hash} label="Cédula del Emisor" value={doc.cedulaEmisor || '—'} mono />
          <DataField icon={Calendar} label="Fecha de Emisión" value={fmtDate(doc.fechaEmisionDoc)} />
          <DataField icon={Banknote}
            label="Monto Total"
            value={fmtMoney(doc.montoTotal, doc.codigoMoneda)}
            highlight
          />
          {doc.emailEmisor && (
            <DataField icon={Globe} label="Email del Emisor" value={doc.emailEmisor} />
          )}
          {doc.numeroConsecutivo && (
            <DataField icon={Hash} label="Número Consecutivo" value={doc.numeroConsecutivo} mono />
          )}
        </div>

        {/* Clave completa */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Clave de 50 dígitos</p>
          <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all">{doc.clave}</p>
        </div>
      </div>

      {/* Acciones de la previsualización */}
      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm transition-colors">
          <ArrowLeft size={15} /> Importar otra
        </button>
        {doc.tieneXml && (
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm transition-colors">
            <Download size={15} /> Descargar XML
          </button>
        )}
        <div className="flex-1" />
        {yaConfirmado ? (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 font-black text-sm rounded-xl border border-emerald-200 dark:border-emerald-800">
            <CheckCircle size={16} /> Ya fue confirmada — sin acción pendiente
          </div>
        ) : (
          <button
            id="btn-continuar-confirmar"
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900/30 text-sm"
          >
            Continuar y Confirmar <ArrowRight size={15} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Campo de datos ───────────────────────────────────────────────────────────
function DataField({ icon: Icon, label, value, mono, highlight }: {
  icon: any; label: string; value: string; mono?: boolean; highlight?: boolean
}) {
  return (
    <div className={`p-3.5 rounded-2xl ${highlight ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={12} className={highlight ? 'text-emerald-500' : 'text-slate-400'} />
        <p className={`text-[9px] font-black uppercase tracking-widest ${highlight ? 'text-emerald-600' : 'text-slate-400'}`}>{label}</p>
      </div>
      <p className={`text-sm font-black ${mono ? 'font-mono' : ''} ${highlight ? 'text-emerald-700 dark:text-emerald-300 text-base' : 'text-slate-800 dark:text-slate-200'}`}>
        {value}
      </p>
    </div>
  );
}

// ─── PASO 3: Confirmación ─────────────────────────────────────────────────────
function StepConfirm({
  doc, confirmMode, setConfirmMode, monto, setMonto, detalle, setDetalle,
  seguro, setSeguro, sending, onSend, onBack
}: any) {
  const OPCIONES = [
    {
      id: 'accept',
      label: 'Aceptar Total',
      desc: 'Mensaje = 1. Acepta la totalidad de la factura.',
      icon: CheckCircle,
      color: 'emerald',
      legal: 'Se acepta el monto total del comprobante. Se genera MensajeReceptor con Mensaje=1.'
    },
    {
      id: 'partial',
      label: 'Aceptar Parcial',
      desc: 'Mensaje = 2. Acepta un monto menor al total.',
      icon: CheckCircle,
      color: 'blue',
      legal: 'Se acepta parcialmente. Se genera MensajeReceptor con Mensaje=2 y el monto aceptado.'
    },
    {
      id: 'reject',
      label: 'Rechazar',
      desc: 'Mensaje = 3. Rechaza el comprobante.',
      icon: XCircle,
      color: 'red',
      legal: 'Se rechaza el comprobante. Se genera MensajeReceptor con Mensaje=3 y el motivo.'
    }
  ] as const;

  const selected = OPCIONES.find(o => o.id === confirmMode)!;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Cabecera del comprobante */}
      <div className="premium-panel p-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Confirmando</p>
          <p className="font-black text-slate-800 dark:text-white">{doc.nombreEmisor || doc.cedulaEmisor}</p>
          <p className="font-mono text-[10px] text-slate-400">{doc.clave.substring(0, 20)}...</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Monto Total</p>
          <p className="text-xl font-black text-emerald-600">{fmtMoney(doc.montoTotal, doc.codigoMoneda)}</p>
          <p className="text-[10px] text-slate-400">{fmtDate(doc.fechaEmisionDoc)}</p>
        </div>
      </div>

      {/* Título obligatorio */}
      <div className="premium-panel p-5 space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-800 dark:text-white mb-0.5">
            Confirmar Factura Recibida
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock size={12} className="text-amber-500" />
            Plazo máximo: 8 días hábiles del mes siguiente (Art. 10, Resolución 0027-2024)
          </p>
        </div>

        {/* Selector de tipo */}
        <div className="grid grid-cols-3 gap-3">
          {OPCIONES.map(opt => (
            <button
              key={opt.id}
              id={`btn-tipo-${opt.id}`}
              onClick={() => setConfirmMode(opt.id)}
              className={`flex flex-col gap-2 p-4 rounded-2xl border-2 text-left transition-all ${
                confirmMode === opt.id
                  ? opt.color === 'emerald'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : opt.color === 'blue'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <opt.icon size={18} className={
                confirmMode === opt.id
                  ? opt.color === 'emerald' ? 'text-emerald-600'
                  : opt.color === 'blue' ? 'text-blue-600'
                  : 'text-red-600'
                  : 'text-slate-400'
              } />
              <div>
                <p className={`font-black text-xs ${
                  confirmMode === opt.id
                    ? opt.color === 'emerald' ? 'text-emerald-700'
                    : opt.color === 'blue' ? 'text-blue-700'
                    : 'text-red-700'
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {opt.label}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Info de la opción seleccionada */}
        <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-400">
          <Info size={13} className="shrink-0 mt-0.5 text-violet-400" />
          <span>{selected.legal}</span>
        </div>

        {/* Campo monto parcial */}
        {confirmMode === 'partial' && (
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
              Monto Aceptado ({doc.codigoMoneda}) *
            </label>
            <input
              type="number"
              step="0.01"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              placeholder={`Máximo: ${doc.montoTotal}`}
              className="premium-input w-full"
            />
            {monto && parseFloat(monto) > doc.montoTotal && (
              <p className="text-xs text-red-500 font-bold mt-1.5">
                ⚠️ El monto aceptado no puede superar el total de la factura
              </p>
            )}
          </div>
        )}

        {/* Campo motivo/detalle */}
        {(confirmMode === 'reject' || confirmMode === 'partial') && (
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
              {confirmMode === 'reject' ? 'Motivo del Rechazo *' : 'Detalle (opcional)'}
              {confirmMode === 'reject' && <span className="text-red-500 ml-1 normal-case font-medium">mínimo 5 caracteres</span>}
            </label>
            <textarea
              value={detalle}
              onChange={e => setDetalle(e.target.value)}
              rows={3}
              placeholder={confirmMode === 'reject' ? 'Describe el motivo del rechazo...' : 'Justificación de la aceptación parcial...'}
              className="premium-input w-full resize-none"
            />
            {confirmMode === 'reject' && (
              <p className={`text-xs mt-1 font-bold ${detalle.trim().length >= 5 ? 'text-emerald-500' : 'text-slate-400'}`}>
                {detalle.trim().length}/5 mínimo
              </p>
            )}
          </div>
        )}

        {/* Mensaje informativo Aceptar Total */}
        {confirmMode === 'accept' && (
          <div className="flex items-center gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              Se generará y firmará el <strong>MensajeReceptor (Mensaje=1)</strong> con XAdES-EPES y se enviará automáticamente a Hacienda.
            </p>
          </div>
        )}

        {/* Checkbox seguridad */}
        <label
          id="checkbox-seguro"
          className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
            seguro
              ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
            seguro ? 'border-violet-500 bg-violet-500' : 'border-slate-300 dark:border-slate-600'
          }`}>
            {seguro && <CheckCircle size={12} className="text-white" />}
          </div>
          <input
            type="checkbox"
            checked={seguro}
            onChange={e => setSeguro(e.target.checked)}
            className="hidden"
          />
          <div>
            <p className={`text-sm font-black ${seguro ? 'text-violet-700 dark:text-violet-300' : 'text-slate-700 dark:text-slate-300'}`}>
              Estoy seguro de esta confirmación
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Confirmo que esta acción es irreversible. Una vez enviada a Hacienda no se puede cambiar
              (solo se puede enviar un segundo mensaje dentro del plazo legal).
            </p>
          </div>
        </label>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm transition-colors">
          <ArrowLeft size={15} /> Volver
        </button>
        <button
          id="btn-firmar-enviar"
          onClick={onSend}
          disabled={sending || !seguro}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-black rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg ${
            confirmMode === 'reject'
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200 dark:shadow-red-900/30'
              : confirmMode === 'partial'
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 dark:shadow-blue-900/30'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-200 dark:shadow-emerald-900/30'
          }`}
        >
          {sending ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Firmando y enviando a Hacienda...</>
          ) : (
            <><ShieldCheck size={17} /> Firmar y Enviar Confirmación a Hacienda</>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ─── PASO 4: Completado ───────────────────────────────────────────────────────
function StepDone({ doc, result, onImportOtra }: {
  doc: DocPreview; result: { tipo: string; estadoEnvio: string }; onImportOtra: () => void
}) {
  const okEnvio = result.estadoEnvio === 'OK' || result.estadoEnvio === 'ENVIADO';
  const tipo = result.tipo;

  const TIPO_LABELS: Record<string, string> = {
    accept: 'Aceptación Total (Mensaje=1)',
    partial: 'Aceptación Parcial (Mensaje=2)',
    reject: 'Rechazo (Mensaje=3)'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Estado principal */}
      <div className={`premium-panel p-8 flex flex-col items-center text-center gap-4 ${
        okEnvio ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'bg-amber-50/50 dark:bg-amber-900/10'
      }`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl ${
          okEnvio
            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-200 dark:shadow-emerald-900/30'
            : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-200 dark:shadow-amber-900/30'
        }`}>
          {okEnvio
            ? <CheckCircle size={32} className="text-white" />
            : <AlertTriangle size={32} className="text-white" />
          }
        </div>

        <div>
          <h2 className={`text-2xl font-black ${okEnvio ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>
            {okEnvio ? '¡Confirmación enviada!' : 'Enviada con advertencias'}
          </h2>
          <p className={`text-sm mt-2 ${okEnvio ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
            {okEnvio
              ? 'Hacienda procesará la confirmación en máximo 3 horas.'
              : `Estado del envío: ${result.estadoEnvio}`
            }
          </p>
        </div>

        <div className="w-full max-w-sm space-y-2 text-left mt-2">
          <SummaryRow label="Tipo de confirmación" value={TIPO_LABELS[tipo] || tipo} />
          <SummaryRow label="Proveedor" value={doc.nombreEmisor || doc.cedulaEmisor} />
          <SummaryRow label="Monto" value={fmtMoney(doc.montoTotal, doc.codigoMoneda)} />
          <SummaryRow label="Fecha emisión" value={fmtDate(doc.fechaEmisionDoc)} />
          <SummaryRow label="Estado Hacienda" value={okEnvio ? '✅ Aceptado en cola' : `⚠️ ${result.estadoEnvio}`} />
        </div>
      </div>

      {/* Próximos pasos */}
      <div className="premium-panel p-5">
        <h4 className="font-black text-sm text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Info size={14} className="text-violet-400" /> Próximos pasos
        </h4>
        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <li className="flex items-center gap-2"><CheckCircle size={12} className="text-emerald-500 shrink-0" /> La factura ahora aparece en "Documentos Recibidos" con el nuevo estado.</li>
          <li className="flex items-center gap-2"><CheckCircle size={12} className="text-emerald-500 shrink-0" /> El XML del MensajeReceptor firmado está guardado en la base de datos.</li>
          <li className="flex items-center gap-2"><Clock size={12} className="text-amber-500 shrink-0" /> Hacienda procesará y responderá el estado final en máximo 3 horas.</li>
          {!okEnvio && <li className="flex items-center gap-2"><AlertTriangle size={12} className="text-amber-500 shrink-0" /> Revisa "Documentos Recibidos" para reenviar si hubo un error de comunicación.</li>}
        </ul>
      </div>

      <button
        onClick={onImportOtra}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black rounded-2xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900/30 text-sm"
      >
        <Inbox size={16} /> Importar otra factura
      </button>
    </motion.div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-xs py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-slate-500 font-bold">{label}</span>
      <span className="text-slate-800 dark:text-slate-200 font-black text-right">{value}</span>
    </div>
  );
}
