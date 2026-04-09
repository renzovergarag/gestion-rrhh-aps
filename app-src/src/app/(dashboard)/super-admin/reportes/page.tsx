import { auth } from '@/lib/auth'
import { getGlobalSummary } from '@/actions/consolidation'
import { BarChart3, TrendingUp, AlertTriangle, FileText } from 'lucide-react'
import ExportCSVButton from '@/components/ExportCSVButton'

export const metadata = { title: 'Reportes Globales' }

export default async function ReportesGlobalesPage() {
  const session = await auth()
  const year = new Date().getFullYear()
  const globalSummary = await getGlobalSummary(year)

  const highHNCCenters = globalSummary.filter((c) => c.avgHNCPercentage > 50)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 size={24} className="text-indigo-400" />
            Reportes Globales
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Análisis detallado de todos los centros de salud — Año {year}
          </p>
        </div>
        <ExportCSVButton data={globalSummary} filename={`reporte_global_centros_${year}`} />
      </div>

      <div className="card-premium p-12 text-center">
        <FileText size={48} className="text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Módulo de Reportes Avanzados</h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          Aquí se pueden integrar herramientas de BI o descargas masivas de PDF/Excel 
          para la gestión documental y auditorías ministeriales.
        </p>
      </div>

      {highHNCCenters.length > 0 && (
        <div className="card-premium border-amber-500/30">
          <div className="p-5 border-b border-white/10 bg-amber-500/10 flex items-center gap-2">
            <AlertTriangle className="text-amber-400" size={20} />
            <h2 className="text-amber-300 font-semibold">Centros Críticos (HNC &gt; 50%)</h2>
          </div>
          <div className="p-5">
            <p className="text-slate-300 text-sm mb-4">
              Los siguientes centros requieren revisión administrativa debido a un alto porcentaje de Horas No Clínicas.
            </p>
            <div className="space-y-3">
              {highHNCCenters.map((c) => (
                <div key={c.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
                  <span className="text-white font-medium">{c.name}</span>
                  <span className="text-amber-400 font-bold">{c.avgHNCPercentage.toFixed(1)}% HNC</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
