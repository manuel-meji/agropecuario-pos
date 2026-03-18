import { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, RefreshCw, Calendar, PieChart, CheckCircle, Archive } from 'lucide-react';
import { getTaxReport, exportSentInvoicesZip } from '../../services/api';
import toast from 'react-hot-toast';

export default function TaxesView() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'sent'>('summary');
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [dates, setDates] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Ajustar fechas para que incluyan todo el día
      const start = `${dates.start}T00:00:00`;
      const end = `${dates.end}T23:59:59`;
      const data = await getTaxReport(start, end);
      setReport(data);
    } catch (e) {
      toast.error("Error al cargar reporte tributario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dates]);

  const exportToCSV = () => {
    if (!report) return;
    const headers = ["Tasa (%)", "Base Imponible", "Monto Impuesto"];
    const rows = Object.entries(report.taxBreakdown).map(([rate, data]: [string, any]) => [
      rate + "%",
      data.netAmount.toFixed(2),
      data.taxAmount.toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `reporte_tributario_${dates.start}_a_${dates.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      const blob = await exportSentInvoicesZip(dates.start, dates.end);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FacturasEmitidas_${dates.start}_al_${dates.end}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Descarga completada');
    } catch (e) {
      toast.error('Error al exportar facturas emitidas');
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <PieChart className="text-premium-emerald" size={32} />
            Módulo Tributario
          </h2>
          <p className="text-slate-500 font-medium">Gestión de Impuestos y Documentos Electrónicos</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 px-3 border-r border-slate-100 dark:border-slate-700">
            <Calendar size={16} className="text-slate-400" />
            <input 
              type="date" 
              className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-200 outline-none"
              value={dates.start}
              onChange={e => setDates({...dates, start: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-2 px-3">
            <input 
              type="date" 
              className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-200 outline-none"
              value={dates.end}
              onChange={e => setDates({...dates, end: e.target.value})}
            />
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-white rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('summary')}
          className={`pb-3 font-bold text-sm transition-colors ${activeTab === 'summary' ? 'text-premium-emerald border-b-2 border-premium-emerald' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
        >
          Resumen de IVA
        </button>
        <button 
          onClick={() => setActiveTab('sent')}
          className={`pb-3 font-bold text-sm transition-colors ${activeTab === 'sent' ? 'text-premium-emerald border-b-2 border-premium-emerald' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
        >
          Facturas Emitidas
        </button>
      </div>

      {activeTab === 'summary' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="premium-card bg-emerald-50/50 dark:bg-premium-emerald/5 border-emerald-100 dark:border-premium-emerald/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Total IVA Recaudado</p>
          <p className="text-3xl font-black text-emerald-700 dark:text-premium-emerald">
            ₡{report?.totalTaxCollected?.toLocaleString() || '0'}
          </p>
          <div className="mt-4 pt-4 border-t border-emerald-100 dark:border-premium-emerald/10 flex items-center gap-2 text-[10px] font-bold text-emerald-600/60 uppercase">
            <CheckCircle size={12} /> Basado en ventas completadas
          </div>
        </div>

        <div className="premium-card">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Base Imponible (Ventas Netas)</p>
          <p className="text-3xl font-black text-slate-800 dark:text-white">
            ₡{report?.totalSalesNet?.toLocaleString() || '0'}
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
            <RefreshCw size={12} /> Actualizado en tiempo real
          </div>
        </div>

        <div className="premium-card">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ventas Brutas Totales</p>
          <p className="text-3xl font-black text-slate-800 dark:text-white">
            ₡{report?.totalSalesGross?.toLocaleString() || '0'}
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
            <FileSpreadsheet size={12} /> Incluye impuestos
          </div>
        </div>
      </div>

      <div className="premium-panel overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-white">Desglose por Tasa de Impuesto</h3>
          <div className="flex gap-2">
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform"
            >
              <Download size={16} /> Exportar CSV
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-left">
                <th className="p-4 text-[10px] font-black uppercase text-slate-400">Tasa IVA</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400">Concepto</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 text-right">Base Imponible</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 text-right">IVA Recaudado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {report && Object.entries(report.taxBreakdown).filter(([_, data]: [any, any]) => data.netAmount > 0 || data.taxAmount > 0).map(([rate, data]: [string, any]) => (
                <tr key={rate} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <span className="px-2 py-1 bg-premium-emerald/10 text-premium-emerald rounded-lg text-xs font-black">
                      {rate}%
                    </span>
                  </td>
                  <td className="p-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                    {rate === "0" ? "Ventas Exentas" : rate === "1" ? "Canasta Básica / Insumos" : rate === "4" ? "Servicios de Salud / Otros" : "Tasa Estándar"}
                  </td>
                  <td className="p-4 text-sm font-bold text-slate-700 dark:text-slate-200 text-right">
                    ₡{data.netAmount.toLocaleString()}
                  </td>
                  <td className="p-4 text-sm font-black text-premium-emerald text-right">
                    ₡{data.taxAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {(!report || Object.values(report.taxBreakdown).every((d: any) => d.netAmount === 0)) && !loading && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 font-medium italic">
                    No hay ventas registradas en el periodo seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {activeTab === 'sent' && (
        <div className="premium-panel p-8 flex flex-col items-center justify-center text-center max-w-2xl mx-auto mt-8">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
            <Archive size={40} className="text-premium-emerald" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Exportar Facturas Electrónicas</h3>
          <p className="text-slate-500 mb-8 max-w-md">
            Descarga un archivo ZIP que contiene todos los archivos XML (Enviados, Firmados y Respuestas de Hacienda) emitidos en el rango de fechas seleccionado.
          </p>
          
          <button 
            onClick={handleDownloadZip}
            disabled={downloadingZip}
            className="flex items-center justify-center gap-3 w-full max-w-md py-4 bg-premium-emerald text-white font-bold rounded-2xl hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-premium-emerald/20"
          >
            {downloadingZip ? (
              <><RefreshCw size={20} className="animate-spin" /> Generando ZIP...</>
            ) : (
              <><Download size={20} /> Descargar ZIP de {dates.start} al {dates.end}</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
