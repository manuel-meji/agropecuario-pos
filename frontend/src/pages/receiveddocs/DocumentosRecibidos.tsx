import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, RefreshCw, Archive, CheckCircle, XCircle, Clock,
  FileText, Filter, AlertTriangle, ChevronDown, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getReceivedDocuments, syncAllReceivedDocuments, downloadReceivedXml,
  exportReceivedDocumentsZip, acceptDocument, acceptPartialDocument, rejectDocument
} from '../../services/api';

// ── Tipos ─────────────────────────────────────────────────────────────────
interface ReceivedDoc {
  id: number;
  clave: string;
  cedulaEmisor: string;
  nombreEmisor: string;
  fechaEmisionDoc: string;
  montoTotal: number;
  codigoMoneda: string;
  estadoConfirmacion: 'PENDIENTE' | 'ACEPTADO_TOTAL' | 'ACEPTADO_PARCIAL' | 'RECHAZADO';
  tieneXml: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────
const fmtMoney = (n: number, currency = 'CRC') =>
  `${currency} ${(n || 0).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (s: string) => {
  if (!s) return '—';
  try { return new Date(s).toLocaleDateString('es-CR'); } catch { return s; }
};

const ESTADO_STYLES: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PENDIENTE:        { label: 'Pendiente',       color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',  icon: Clock },
  ACEPTADO_TOTAL:   { label: 'Aceptado Total',  color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle },
  ACEPTADO_PARCIAL: { label: 'Aceptado Parcial',color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',    icon: CheckCircle },
  RECHAZADO:        { label: 'Rechazado',        color: 'text-red-600 bg-red-50 dark:bg-red-900/20',        icon: XCircle },
};

// ── Modal Confirmación/Rechazo ─────────────────────────────────────────────
function ConfirmModal({
  doc, onClose, onDone
}: { doc: ReceivedDoc; onClose: () => void; onDone: () => void }) {
  const [mode, setMode] = useState<'accept' | 'partial' | 'reject'>('accept');
  const [monto, setMonto] = useState('');
  const [detalle, setDetalle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (mode === 'reject' && detalle.trim().length < 5) {
      toast.error('El detalle de rechazo debe tener al menos 5 caracteres');
      return;
    }
    if (mode === 'partial' && (!monto || isNaN(parseFloat(monto)))) {
      toast.error('Ingresa el monto aceptado parcialmente');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Enviando confirmación a Hacienda...');
    try {
      if (mode === 'accept') {
        await acceptDocument(doc.clave);
        toast.success('¡Factura aceptada! MensajeReceptor enviado a Hacienda.', { id: toastId });
      } else if (mode === 'partial') {
        await acceptPartialDocument(doc.clave, parseFloat(monto), detalle || 'Aceptación parcial');
        toast.success('¡Aceptación parcial enviada a Hacienda!', { id: toastId });
      } else {
        await rejectDocument(doc.clave, detalle);
        toast.success('Rechazo enviado a Hacienda.', { id: toastId });
      }
      onDone();
      onClose();
    } catch (e: any) {
      toast.error('Error: ' + (e?.response?.data?.error || e.message), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 16 }}
        className="relative z-10 bg-white dark:bg-slate-900 rounded-[28px] w-full max-w-lg shadow-2xl p-8"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Confirmar Factura Recibida</h3>
            <p className="text-xs text-slate-500 mt-1">
              Clave: <span className="font-mono">{doc.clave.substring(0, 20)}...</span>
            </p>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-0.5">
              {doc.nombreEmisor || doc.cedulaEmisor} · {fmtMoney(doc.montoTotal, doc.codigoMoneda)}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={20} />
          </button>
        </div>

        {/* Selector de tipo */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {([
            { id: 'accept',  label: 'Aceptar Total',  icon: CheckCircle, color: 'emerald' },
            { id: 'partial', label: 'Aceptar Parcial', icon: CheckCircle, color: 'blue' },
            { id: 'reject',  label: 'Rechazar',        icon: XCircle,     color: 'red' },
          ] as const).map(opt => (
            <button
              key={opt.id}
              onClick={() => setMode(opt.id)}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border-2 text-xs font-bold transition-all ${
                mode === opt.id
                  ? opt.color === 'emerald' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700'
                  : opt.color === 'blue' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700'
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              <opt.icon size={18} />
              {opt.label}
            </button>
          ))}
        </div>

        {/* Campos adicionales según modo */}
        {mode === 'partial' && (
          <div className="mb-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">
              Monto Aceptado ({doc.codigoMoneda})
            </label>
            <input
              type="number"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              placeholder={`Máximo: ${doc.montoTotal}`}
              className="premium-input w-full"
            />
          </div>
        )}
        {(mode === 'reject' || mode === 'partial') && (
          <div className="mb-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">
              {mode === 'reject' ? 'Detalle del Rechazo *' : 'Detalle (opcional)'}
              {mode === 'reject' && <span className="text-red-500 ml-1">mín. 5 caracteres</span>}
            </label>
            <textarea
              value={detalle}
              onChange={e => setDetalle(e.target.value)}
              rows={3}
              className="premium-input w-full resize-none"
              placeholder={mode === 'reject' ? 'Motivo del rechazo...' : 'Justificación...'}
            />
          </div>
        )}

        {mode === 'accept' && (
          <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-sm text-emerald-700 dark:text-emerald-400 font-bold">
            Se generará y enviará el <strong>MensajeReceptor (Mensaje=1)</strong> firmado con XAdES a Hacienda.
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 py-3 font-black rounded-2xl transition-all disabled:opacity-50 ${
              mode === 'reject' ? 'bg-red-600 text-white hover:bg-red-700'
              : mode === 'partial' ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {loading ? 'Enviando...' : 'Confirmar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Componente Principal ───────────────────────────────────────────────────
export default function DocumentosRecibidos() {
  const [docs, setDocs] = useState<ReceivedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<ReceivedDoc | null>(null);

  const cargar = async (estado?: string) => {
    setLoading(true);
    try {
      const data = await getReceivedDocuments(estado ? { estado } : undefined);
      setDocs(data);
    } catch (e: any) {
      toast.error('Error cargando documentos recibidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(filtroEstado || undefined); }, [filtroEstado]);

  const handleSync = async () => {
    setSyncing(true);
    const toastId = toast.loading('Sincronizando con Hacienda...');
    try {
      const result = await syncAllReceivedDocuments();
      toast.success(`Sincronización completa. Total guardados: ${result.totalGuardados}`, { id: toastId });
      cargar(filtroEstado || undefined);
    } catch {
      toast.error('Error sincronizando con Hacienda', { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  const handleDownloadXml = async (doc: ReceivedDoc) => {
    if (!doc.tieneXml) {
      toast.error('Este documento no tiene XML descargado. Sincroniza primero.');
      return;
    }
    try {
      const blob = await downloadReceivedXml(doc.clave);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Recibido_${doc.clave}.xml`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Error descargando XML');
    }
  };

  const handleExportZip = async () => {
    setExporting(true);
    const toastId = toast.loading('Generando archivo ZIP...');
    try {
      const blob = await exportReceivedDocumentsZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DocumentosRecibidos_${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('ZIP descargado exitosamente', { id: toastId });
    } catch {
      toast.error('Error generando ZIP', { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  const pendientes = docs.filter(d => d.estadoConfirmacion === 'PENDIENTE').length;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Documentos Recibidos</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Art. 7 Resolución MH-DGT-RES-0027-2024 · Facturas de proveedores recibidas de Hacienda
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
            Sincronizar
          </button>
          <button
            onClick={handleExportZip}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <Archive size={15} />
            Exportar ZIP
          </button>
        </div>
      </div>

      {/* Alerta de pendientes */}
      {pendientes > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-3 shrink-0"
        >
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <div>
            <p className="font-black text-sm text-amber-800 dark:text-amber-300">
              {pendientes} documento{pendientes !== 1 ? 's' : ''} pendiente{pendientes !== 1 ? 's' : ''} de confirmación
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Debes confirmar o rechazar en máximo 8 días hábiles del mes siguiente (Art. 10)
            </p>
          </div>
        </motion.div>
      )}

      {/* Filtros */}
      <div className="flex gap-3 shrink-0">
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="pl-8 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 appearance-none outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="ACEPTADO_TOTAL">Aceptados</option>
            <option value="ACEPTADO_PARCIAL">Aceptados Parcial</option>
            <option value="RECHAZADO">Rechazados</option>
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <span className="self-center text-xs text-slate-400 font-bold">{docs.length} documentos</span>
      </div>

      {/* Tabla */}
      <div className="flex-1 premium-panel overflow-hidden flex flex-col min-h-0">
        <div className="overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-300 dark:text-slate-600">
              <FileText size={40} className="mb-3" />
              <p className="font-bold text-sm">Sin documentos recibidos</p>
              <p className="text-xs mt-1">Usa "Sincronizar" para consultar Hacienda</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="text-left px-5 py-3">Clave</th>
                  <th className="text-left px-4 py-3">Proveedor</th>
                  <th className="text-left px-4 py-3">Fecha</th>
                  <th className="text-right px-4 py-3">Monto</th>
                  <th className="text-center px-4 py-3">Estado</th>
                  <th className="text-right px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc, idx) => {
                  const estado = ESTADO_STYLES[doc.estadoConfirmacion] || ESTADO_STYLES.PENDIENTE;
                  const EstadoIcon = estado.icon;
                  return (
                    <tr
                      key={doc.id}
                      className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${idx === docs.length - 1 ? 'border-b-0' : ''}`}
                    >
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                          {doc.clave.substring(0, 15)}...
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{doc.nombreEmisor || '—'}</p>
                        <p className="text-[10px] text-slate-400">{doc.cedulaEmisor}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 font-bold">
                        {fmtDate(doc.fechaEmisionDoc)}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-sm text-slate-900 dark:text-white">
                        {fmtMoney(doc.montoTotal, doc.codigoMoneda)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${estado.color}`}>
                          <EstadoIcon size={11} />
                          {estado.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {doc.tieneXml && (
                            <button
                              onClick={() => handleDownloadXml(doc)}
                              title="Descargar XML"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              <Download size={14} />
                            </button>
                          )}
                          {doc.estadoConfirmacion === 'PENDIENTE' && (
                            <button
                              onClick={() => setSelectedDoc(doc)}
                              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-black rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                              Confirmar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal confirmación */}
      <AnimatePresence>
        {selectedDoc && (
          <ConfirmModal
            doc={selectedDoc}
            onClose={() => setSelectedDoc(null)}
            onDone={() => cargar(filtroEstado || undefined)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
