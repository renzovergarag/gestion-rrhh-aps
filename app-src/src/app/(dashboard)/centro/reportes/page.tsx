import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getConsolidationSummary } from '@/actions/consolidation'
import { BarChart3, Download } from 'lucide-react'
import { formatHours, CATEGORY_LABELS } from '@/lib/utils'
import ExportCSVButton from '@/components/ExportCSVButton'

export const metadata = { title: 'Reportes del Centro' }

export default async function ReportesCentroPage() {
  const session = await auth()
  const centerId = session!.user.healthCenterId!
  const year = new Date().getFullYear()

  const [center, reports, professionals] = await Promise.all([
    prisma.healthCenter.findUnique({ where: { id: centerId } }),
    getConsolidationSummary(centerId, year),
    prisma.professional.findMany({
      where: { healthCenterId: centerId, isActive: true },
      include: { workConfigs: { where: { year } } },
    }),
  ])

  const totalHNC = reports.reduce((s, r) => s + r.hncTotal, 0)
  const totalHC = reports.reduce((s, r) => s + r.hcTotal, 0)
  const avgHNC = reports.length > 0 ? reports.reduce((s, r) => s + r.hncPercentage, 0) / reports.length : 0

  // Distribución por categoría
  const byCategory = reports.reduce<Record<string, { hnc: number; hc: number; count: number }>>((acc, r) => {
    const cat = r.professional.category
    if (!acc[cat]) acc[cat] = { hnc: 0, hc: 0, count: 0 }
    acc[cat].hnc += r.hncTotal
    acc[cat].hc += r.hcTotal
    acc[cat].count++
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reportes del Centro</h1>
          <p className="text-slate-400 text-sm mt-1">{center?.name} · Año {year}</p>
        </div>
        <ExportCSVButton data={reports} filename={`reporte_${center?.code}_${year}`} />
      </div>

      {/* Resumen global */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'HNC Total Año', value: formatHours(totalHNC), color: '#6366f1', bg: 'rgba(99,102,241,0.1)', desc: 'Horas No Clínicas acumuladas' },
          { label: 'HC Total Año', value: formatHours(totalHC), color: '#10b981', bg: 'rgba(16,185,129,0.1)', desc: 'Horas Clínicas acumuladas' },
          { label: '% HNC Promedio', value: `${avgHNC.toFixed(1)}%`, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', desc: `Promedio del equipo (${reports.length} consolidados)` },
        ].map(s => (
          <div key={s.label} className="card-premium p-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: s.bg }}>
              <BarChart3 size={22} style={{ color: s.color }} />
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-white font-medium text-sm mb-1">{s.label}</p>
            <p className="text-slate-500 text-xs">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Distribución por categoría */}
      {Object.keys(byCategory).length > 0 && (
        <div className="card-premium overflow-hidden">
          <div className="p-5" style={{ borderBottom: '1px solid rgba(71,85,105,0.2)' }}>
            <h2 className="text-white font-semibold">Distribución por Categoría Profesional</h2>
            <p className="text-slate-500 text-xs mt-1">Año {year}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Profesionales</th>
                  <th>HNC Total</th>
                  <th>HC Total</th>
                  <th>% HNC Prom.</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byCategory).map(([cat, data]) => {
                  const pctHNC = (data.hnc / (data.hnc + data.hc)) * 100 || 0
                  return (
                    <tr key={cat}>
                      <td className="text-white font-medium">{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}</td>
                      <td className="text-center text-slate-300">{data.count}</td>
                      <td className="text-indigo-400">{formatHours(data.hnc)}</td>
                      <td className="text-emerald-400">{formatHours(data.hc)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(pctHNC, 100)}%`,
                                background: pctHNC > 50 ? '#ef4444' : pctHNC > 30 ? '#f59e0b' : '#6366f1',
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold" style={{ color: pctHNC > 50 ? '#fca5a5' : pctHNC > 30 ? '#fcd34d' : '#a5b4fc' }}>
                            {pctHNC.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detalle individual */}
      <div className="card-premium overflow-hidden">
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(71,85,105,0.2)' }}>
          <div>
            <h2 className="text-white font-semibold">Disponibilidad por Profesional</h2>
            <p className="text-slate-500 text-xs mt-1">{professionals.length} profesionales activos</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Contrato (h/sem)</th>
                <th>Disponible/Sem</th>
                <th>Disponible/Año</th>
              </tr>
            </thead>
            <tbody>
              {professionals.map(p => {
                const wc = p.workConfigs[0]
                return (
                  <tr key={p.id}>
                    <td>
                      <span className="text-white font-medium text-sm">{p.lastName}, {p.firstName}</span>
                    </td>
                    <td className="text-slate-400 text-xs">{CATEGORY_LABELS[p.category as keyof typeof CATEGORY_LABELS] || p.category}</td>
                    <td className="text-center text-slate-300">{p.weeklyHours}h</td>
                    <td className="text-center">
                      {wc ? (
                        <span className="text-emerald-400 font-medium">{wc.availableHoursWeek.toFixed(1)}h</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="text-center">
                      {wc ? (
                        <span className="text-emerald-400 font-medium">{wc.availableHoursYear.toFixed(0)}h</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
