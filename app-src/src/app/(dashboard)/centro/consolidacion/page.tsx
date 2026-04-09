import { auth } from '@/lib/auth'
import { getConsolidationSummary } from '@/actions/consolidation'
import { consolidateCenter } from '@/actions/consolidation'
import { prisma } from '@/lib/prisma'
import { formatHours, CATEGORY_LABELS } from '@/lib/utils'
import { BarChart3, RefreshCw } from 'lucide-react'
import ConsolidateButton from '@/components/ConsolidateButton'
import ExportCSVButton from '@/components/ExportCSVButton'

export const metadata = { title: 'Consolidación HC/HNC' }

export default async function ConsolidacionPage() {
  const session = await auth()
  const centerId = session!.user.healthCenterId!
  const year = new Date().getFullYear()

  const [reports, center] = await Promise.all([
    getConsolidationSummary(centerId, year),
    prisma.healthCenter.findUnique({ where: { id: centerId } }),
  ])

  const totalContracted = reports.reduce((s, r) => s + r.contractedHours, 0)
  const totalHNC = reports.reduce((s, r) => s + r.hncTotal, 0)
  const totalHC = reports.reduce((s, r) => s + r.hcTotal, 0)
  const avgHNC = reports.length > 0 ? reports.reduce((s, r) => s + r.hncPercentage, 0) / reports.length : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Consolidación HC / HNC</h1>
          <p className="text-slate-400 text-sm mt-1">{center?.name} · {year}</p>
        </div>
        <div className="flex gap-2">
            <ExportCSVButton data={reports} filename={`consolidacion_hc_hnc_${center?.name?.replace(/ /g, '_')}_${year}`} />
            <ConsolidateButton centerId={centerId} year={year} />
        </div>
      </div>

      {/* Resumen global */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Horas Contratadas (Total)', value: formatHours(totalContracted), color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
          { label: 'HNC Total', value: formatHours(totalHNC), color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'HC Total', value: formatHours(totalHC), color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: '% HNC Promedio', value: `${avgHNC.toFixed(1)}%`, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        ].map((s) => (
          <div key={s.label} className="card-premium p-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: s.bg }}
            >
              <BarChart3 size={20} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{s.value}</p>
            <p className="text-slate-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabla detallada */}
      <div className="card-premium overflow-hidden">
        <div className="p-5" style={{ borderBottom: '1px solid rgba(71,85,105,0.2)' }}>
          <h2 className="text-white font-semibold">Detalle por Profesional</h2>
          <p className="text-slate-500 text-xs mt-1">Basado en encuestas aprobadas del año {year}</p>
        </div>

        {reports.length === 0 ? (
          <div className="p-12 text-center">
            <RefreshCw size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Sin datos consolidados.</p>
            <p className="text-slate-500 text-sm mt-1">
              Aprueba encuestas y pulsa "Ejecutar Consolidación" para calcular los resultados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Profesional</th>
                  <th>Categoría</th>
                  <th>Hrs Contratadas</th>
                  <th>HNC Gestión</th>
                  <th>HNC Reunión</th>
                  <th>HNC Derechos</th>
                  <th>HNC Total</th>
                  <th>HC Total</th>
                  <th>% HNC</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.professionalId}>
                    <td>
                      <span className="text-white font-medium">
                        {r.professional.lastName}, {r.professional.firstName}
                      </span>
                    </td>
                    <td className="text-slate-400 text-xs">
                      {CATEGORY_LABELS[r.professional.category] || r.professional.category}
                    </td>
                    <td className="text-slate-300">{formatHours(r.contractedHours)}</td>
                    <td className="text-indigo-400">{formatHours(r.hncGestion)}</td>
                    <td className="text-amber-400">{formatHours(r.hncReunion)}</td>
                    <td className="text-emerald-400">{formatHours(r.hncDerecho)}</td>
                    <td>
                      <span className="text-white font-semibold">{formatHours(r.hncTotal)}</span>
                    </td>
                    <td>
                      <span className="text-emerald-400 font-semibold">{formatHours(r.hcTotal)}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(r.hncPercentage, 100)}%`,
                              background: r.hncPercentage > 50 ? '#ef4444' : r.hncPercentage > 30 ? '#f59e0b' : '#6366f1',
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: r.hncPercentage > 50 ? '#fca5a5' : r.hncPercentage > 30 ? '#fcd34d' : '#a5b4fc' }}
                        >
                          {r.hncPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
