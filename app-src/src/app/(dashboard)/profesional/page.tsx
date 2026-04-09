import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getConsolidationSummary } from '@/actions/consolidation'
import { getSurveysForCenter } from '@/actions/surveys'
import { Activity, ClipboardList, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import HNCPieChart from '@/components/charts/HNCPieChart'

export const metadata = { title: 'Mi Disponibilidad' }

export default async function ProfesionalDashboardPage() {
  const session = await auth()
  const userId = session!.user.id
  const year = new Date().getFullYear()

  const professional = await prisma.professional.findFirst({
    where: { userId },
    include: {
      workConfigs: { where: { year } },
      healthCenter: true,
    },
  })

  if (!professional) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <AlertCircle size={48} className="text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Perfil no configurado</h2>
        <p className="text-slate-400 max-w-sm">
          Tu cuenta aún no está vinculada a un perfil profesional. Contacta al administrador de tu centro.
        </p>
      </div>
    )
  }

  const wc = professional.workConfigs[0]
  const surveys = await getSurveysForCenter(professional.healthCenterId)
  const mySurveys = surveys.filter((s) => s.professionalId === professional.id)
  const consolidation = await getConsolidationSummary(professional.healthCenterId, year)
  const myReport = consolidation.find((r) => r.professionalId === professional.id)

  const pillarData = myReport ? [
    { name: 'Gestión', value: myReport.hncGestion, color: '#6366f1' },
    { name: 'Reunión', value: myReport.hncReunion, color: '#f59e0b' },
    { name: 'Derechos', value: myReport.hncDerecho, color: '#10b981' },
  ].filter((d) => d.value > 0) : []

  const approvedCount = mySurveys.filter((s) => s.status === 'APROBADA').length
  const pendingCount = mySurveys.filter((s) => s.status === 'ENVIADA').length
  const draftCount = mySurveys.filter((s) => s.status === 'BORRADOR').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Hola, {professional.firstName} 👋</h1>
        <p className="text-slate-400 text-sm mt-1">
          {professional.healthCenter.name} · {professional.weeklyHours}h semanales · {year}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Horas Disponibles/Sem',
            value: wc ? `${wc.availableHoursWeek.toFixed(1)}h` : '—',
            icon: Clock,
            color: '#6366f1',
            bg: 'rgba(99,102,241,0.1)',
          },
          {
            label: 'HC Anuales',
            value: myReport ? `${myReport.hcPercentage.toFixed(0)}%` : '—',
            icon: Activity,
            color: '#10b981',
            bg: 'rgba(16,185,129,0.1)',
          },
          {
            label: 'Encuestas Aprobadas',
            value: approvedCount,
            icon: CheckCircle,
            color: '#34d399',
            bg: 'rgba(52,211,153,0.1)',
          },
          {
            label: 'Encuestas Pendientes',
            value: pendingCount + draftCount,
            icon: ClipboardList,
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.1)',
          },
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Disponibilidad Teórica */}
        {wc && (
          <div className="card-premium p-6">
            <h2 className="text-white font-semibold mb-4">Disponibilidad Teórica {year}</h2>
            <div className="space-y-3">
              {[
                { label: 'Horas teóricas anuales', value: `${wc.theoreticalHoursYear}h`, color: '#94a3b8' },
                { label: 'Días feriados', value: `-${wc.holidayDays * (professional.weeklyHours / 5)}h (${wc.holidayDays} días)`, color: '#fca5a5' },
                { label: 'Vacaciones', value: `-${wc.vacationDays * (professional.weeklyHours / 5)}h (${wc.vacationDays} días)`, color: '#fcd34d' },
                { label: 'Otros permisos', value: `-${(wc.adminDays + wc.sickLeaveDays + wc.otherAbsenceDays) * (professional.weeklyHours / 5)}h`, color: '#fcd34d' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-medium" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
              <div className="pt-3 mt-3" style={{ borderTop: '1px solid rgba(71,85,105,0.3)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">Total Disponible/Año</span>
                  <span className="text-emerald-400 font-bold text-lg">{wc.availableHoursYear.toFixed(0)}h</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate-400 text-sm">Por Semana</span>
                  <span className="text-emerald-300 font-semibold">{wc.availableHoursWeek.toFixed(1)}h</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Distribución HNC */}
        <div className="card-premium p-6">
          <h2 className="text-white font-semibold mb-1">Mi Distribución HNC</h2>
          <p className="text-slate-500 text-xs mb-4">Por pilar de actividad</p>
          {pillarData.length > 0 && myReport ? (
            <HNCPieChart
              data={pillarData}
              totalHNC={myReport.hncTotal}
              totalHC={myReport.hcTotal}
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm text-center">
              <div>
                <p>Sin consolidación disponible.</p>
                <p className="text-xs mt-1">Completa y envía tus encuestas.</p>
              </div>
            </div>
          )}
        </div>

        {/* Últimas encuestas */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Mis Encuestas</h2>
            <Link href="/profesional/encuesta" className="text-xs text-indigo-400 hover:text-indigo-300">
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {mySurveys.slice(0, 5).map((survey) => (
              <div
                key={survey.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div>
                  <p className="text-white text-sm font-medium">
                    Semana {survey.weekNumber}/{survey.year}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {survey.items.length} actividades
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    survey.status === 'APROBADA' ? 'status-aprobada' :
                    survey.status === 'ENVIADA' ? 'status-enviada' :
                    survey.status === 'RECHAZADA' ? 'status-rechazada' : 'status-borrador'
                  }`}
                >
                  {survey.status === 'APROBADA' ? 'Aprobada' :
                   survey.status === 'ENVIADA' ? 'Enviada' :
                   survey.status === 'RECHAZADA' ? 'Rechazada' : 'Borrador'}
                </span>
              </div>
            ))}
            {mySurveys.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                <p>Sin encuestas registradas.</p>
                <Link href="/profesional/encuesta/nueva" className="text-indigo-400 hover:text-indigo-300 text-xs mt-2 block">
                  Crear primera encuesta →
                </Link>
              </div>
            )}
          </div>

          <Link href="/profesional/encuesta/nueva" className="btn-primary w-full justify-center mt-4">
            <TrendingUp size={16} />
            Nueva Encuesta Semanal
          </Link>
        </div>
      </div>
    </div>
  )
}
