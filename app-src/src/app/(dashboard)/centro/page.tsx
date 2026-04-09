import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getConsolidationSummary } from '@/actions/consolidation'
import { Users, ClipboardList, BarChart3, Calendar, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import HNCPieChart from '@/components/charts/HNCPieChart'
import ProfessionalsHNCTable from '@/components/tables/ProfessionalsHNCTable'

export const metadata = { title: 'Dashboard Centro' }

export default async function CentroDashboardPage() {
  const session = await auth()
  const centerId = session!.user.healthCenterId!
  const year = new Date().getFullYear()

  const [center, totalProf, pendingSurveys, approvedSurveys, consolidation] = await Promise.all([
    prisma.healthCenter.findUnique({ where: { id: centerId } }),
    prisma.professional.count({ where: { healthCenterId: centerId, isActive: true } }),
    prisma.survey.count({ where: { healthCenterId: centerId, year, status: 'ENVIADA' } }),
    prisma.survey.count({ where: { healthCenterId: centerId, year, status: 'APROBADA' } }),
    getConsolidationSummary(centerId, year),
  ])

  const avgHNC =
    consolidation.length > 0
      ? consolidation.reduce((s, r) => s + r.hncPercentage, 0) / consolidation.length
      : 0

  const avgHC = 100 - avgHNC
  const totalHNCHours = consolidation.reduce((s, r) => s + r.hncTotal, 0)
  const totalHCHours = consolidation.reduce((s, r) => s + r.hcTotal, 0)

  const pillarData = consolidation.length > 0 ? [
    { name: 'Gestión', value: consolidation.reduce((s, r) => s + r.hncGestion, 0), color: '#6366f1' },
    { name: 'Reunión', value: consolidation.reduce((s, r) => s + r.hncReunion, 0), color: '#f59e0b' },
    { name: 'Derechos', value: consolidation.reduce((s, r) => s + r.hncDerecho, 0), color: '#10b981' },
  ] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{center?.name}</h1>
          <p className="text-slate-400 text-sm mt-1">{center?.commune} · {center?.code} · {year}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/centro/encuestas" className="btn-secondary">
            <ClipboardList size={16} />
            Encuestas
          </Link>
          <Link href="/centro/consolidacion" className="btn-primary">
            <BarChart3 size={16} />
            Consolidar
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Profesionales', value: totalProf, icon: Users, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Encuestas Pendientes', value: pendingSurveys, icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'HNC Promedio', value: `${avgHNC.toFixed(1)}%`, icon: TrendingDown, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
          { label: 'HC Promedio', value: `${avgHC.toFixed(1)}%`, icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        ].map((s) => (
          <div key={s.label} className="card-premium p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: s.bg }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
            <p className="text-slate-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Alertas */}
      {pendingSurveys > 0 && (
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
        >
          <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
          <span className="text-amber-300 text-sm">
            Tienes <strong>{pendingSurveys} encuesta{pendingSurveys !== 1 ? 's' : ''}</strong> esperando aprobación.{' '}
            <Link href="/centro/encuestas" className="underline">Revisar ahora</Link>
          </span>
        </div>
      )}

      {/* Charts + Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Donut chart por pilar */}
        <div className="card-premium p-6">
          <h2 className="text-white font-semibold mb-1">Distribución HNC</h2>
          <p className="text-slate-500 text-xs mb-4">Por pilar de actividad</p>
          {pillarData.length > 0 ? (
            <HNCPieChart data={pillarData} totalHNC={totalHNCHours} totalHC={totalHCHours} />
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              Sin datos de consolidación
            </div>
          )}
        </div>

        {/* Tabla resumen */}
        <div className="xl:col-span-2 card-premium overflow-hidden">
          <div className="p-5" style={{ borderBottom: '1px solid rgba(71,85,105,0.2)' }}>
            <h2 className="text-white font-semibold">Resumen por Profesional</h2>
            <p className="text-slate-500 text-xs mt-1">HC vs HNC — Año {year}</p>
          </div>
          <ProfessionalsHNCTable data={consolidation} />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/centro/profesionales', label: 'Gestionar Profesionales', icon: Users, desc: 'CRUD y disponibilidad' },
          { href: '/centro/calendario', label: 'Calendario de Reuniones', icon: Calendar, desc: 'Programar y coordinar' },
          { href: '/centro/reportes', label: 'Reportes del Centro', icon: BarChart3, desc: 'Exportar y analizar' },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="card-premium p-5 block glass-hover">
            <l.icon size={20} className="text-indigo-400 mb-3" />
            <p className="text-white font-medium text-sm">{l.label}</p>
            <p className="text-slate-500 text-xs mt-1">{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
