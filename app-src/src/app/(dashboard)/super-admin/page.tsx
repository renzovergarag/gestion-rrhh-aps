import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGlobalSummary } from '@/actions/consolidation'
import {
  Building2,
  Users,
  BarChart3,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'
import GlobalComparisonChart from '@/components/charts/GlobalComparisonChart'
import ExportCSVButton from '@/components/ExportCSVButton'

export const metadata = { title: 'Dashboard Global' }

export default async function SuperAdminPage() {
  const session = await auth()
  const year = new Date().getFullYear()

  const [totalCenters, totalUsers, totalProfessionals, globalSummary] = await Promise.all([
    prisma.healthCenter.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.professional.count({ where: { isActive: true } }),
    getGlobalSummary(year),
  ])

  const avgHNC =
    globalSummary.length > 0
      ? globalSummary.reduce((s, c) => s + c.avgHNCPercentage, 0) / globalSummary.length
      : 0

  const highHNCCenters = globalSummary.filter((c) => c.avgHNCPercentage > 50)
  const wellBalancedCenters = globalSummary.filter((c) => c.avgHNCPercentage <= 30)

  const stats = [
    { label: 'Centros Activos', value: totalCenters, icon: Building2, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Usuarios', value: totalUsers, icon: Users, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Profesionales', value: totalProfessionals, icon: Activity, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Promedio HNC Global', value: `${avgHNC.toFixed(1)}%`, icon: BarChart3, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Global</h1>
          <p className="text-slate-400 text-sm mt-1">
            Vista consolidada de los {totalCenters} centros de salud APS — {year}
          </p>
        </div>
        <Link href="/super-admin/centros" className="btn-primary">
          <Building2 size={16} />
          Gestionar Centros
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card-premium p-5">
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: stat.bg }}
              >
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-slate-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {highHNCCenters.length > 0 && (
          <div
            className="rounded-xl p-5"
            style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle size={18} className="text-amber-400" />
              <span className="text-amber-300 font-semibold text-sm">
                {highHNCCenters.length} centros con HNC &gt; 50%
              </span>
            </div>
            <div className="space-y-2">
              {highHNCCenters.slice(0, 4).map((c) => (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{c.name}</span>
                  <span className="text-amber-400 font-semibold">{c.avgHNCPercentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className="rounded-xl p-5"
          style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16,185,129,0.25)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle size={18} className="text-emerald-400" />
            <span className="text-emerald-300 font-semibold text-sm">
              {wellBalancedCenters.length} centros bien equilibrados (HNC ≤ 30%)
            </span>
          </div>
          <div className="space-y-2">
            {wellBalancedCenters.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{c.name}</span>
                <span className="text-emerald-400 font-semibold">{c.avgHNCPercentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráfico comparativo */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-semibold">Comparativa HC vs HNC por Centro</h2>
            <p className="text-slate-500 text-sm">Año {year} — Top 15 centros</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#6366f1' }} />
              HNC
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#10b981' }} />
              HC
            </span>
          </div>
        </div>
        <GlobalComparisonChart data={globalSummary.slice(0, 15)} />
      </div>

      {/* Tabla de centros */}
      <div className="card-premium overflow-hidden">
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(71,85,105,0.2)' }}>
          <h2 className="text-white font-semibold">Resumen por Centro</h2>
          <div className="flex gap-2">
            <ExportCSVButton data={globalSummary} filename={`resumen_global_${year}`} />
            <Link href="/super-admin/reportes" className="btn-secondary text-xs py-1.5 px-3">
              <TrendingUp size={14} />
              Ver Reportes
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Centro</th>
                <th>Comuna</th>
                <th>Profesionales</th>
                <th>Encuestados</th>
                <th>HNC Prom.</th>
                <th>HC Prom.</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {globalSummary.map((center) => (
                <tr key={center.id}>
                  <td>
                    <div>
                      <p className="text-white font-medium text-sm">{center.name}</p>
                      <p className="text-slate-500 text-xs">{center.code}</p>
                    </div>
                  </td>
                  <td className="text-slate-300">{center.commune}</td>
                  <td className="text-center text-slate-300">{center.totalProfessionals}</td>
                  <td className="text-center text-slate-300">{center.surveyed}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(center.avgHNCPercentage, 100)}%`,
                            background: center.avgHNCPercentage > 50 ? '#ef4444' : '#f59e0b',
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium" style={{ color: center.avgHNCPercentage > 50 ? '#fca5a5' : '#fcd34d', minWidth: '40px' }}>
                        {center.avgHNCPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="text-emerald-400 text-sm font-medium">
                      {center.avgHCPercentage.toFixed(1)}%
                    </span>
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                        center.surveyed === 0
                          ? 'status-borrador'
                          : center.avgHNCPercentage > 50
                          ? 'status-rechazada'
                          : 'status-aprobada'
                      }`}
                    >
                      {center.surveyed === 0 ? 'Sin datos' : center.avgHNCPercentage > 50 ? 'Alto HNC' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
