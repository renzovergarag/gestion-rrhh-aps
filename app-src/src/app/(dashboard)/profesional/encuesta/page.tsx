import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSurveysForCenter } from '@/actions/surveys'
import { FileText, Plus, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Mis Encuestas' }

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  BORRADOR: { label: 'Borrador', className: 'status-borrador', icon: Clock },
  ENVIADA: { label: 'Enviada (Pendiente)', className: 'status-enviada', icon: AlertTriangle },
  APROBADA: { label: 'Aprobada', className: 'status-aprobada', icon: CheckCircle },
  RECHAZADA: { label: 'Rechazada', className: 'status-rechazada', icon: XCircle },
}

export default async function MisEncuestasPage() {
  const session = await auth()
  const userId = session!.user.id

  const professional = await prisma.professional.findFirst({
    where: { userId },
    include: { healthCenter: true },
  })

  if (!professional) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle size={48} className="text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Perfil no configurado</h2>
        <p className="text-slate-400 max-w-sm">
          Tu cuenta no está vinculada a un perfil profesional. Contacta al administrador de tu centro.
        </p>
      </div>
    )
  }

  const surveys = await getSurveysForCenter(professional.healthCenterId)
  const mySurveys = surveys.filter(s => s.professionalId === professional.id)

  const byYear = mySurveys.reduce<Record<number, typeof mySurveys>>((acc, s) => {
    if (!acc[s.year]) acc[s.year] = []
    acc[s.year].push(s)
    return acc
  }, {})

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Encuestas Semanales</h1>
          <p className="text-slate-400 text-sm mt-1">
            {professional.firstName} {professional.lastName} · {professional.healthCenter.name}
          </p>
        </div>
        <Link href="/profesional/encuesta/nueva" className="btn-primary">
          <Plus size={16} />
          Nueva Encuesta
        </Link>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, cfg]) => {
          const count = mySurveys.filter(s => s.status === status).length
          const Icon = cfg.icon
          return (
            <div key={status} className="card-premium p-5">
              <Icon size={20} className="mb-3" style={{ color: status === 'APROBADA' ? '#10b981' : status === 'ENVIADA' ? '#f59e0b' : status === 'RECHAZADA' ? '#ef4444' : '#64748b' }} />
              <p className="text-3xl font-bold text-white mb-1">{count}</p>
              <p className="text-slate-400 text-sm">{cfg.label}</p>
            </div>
          )
        })}
      </div>

      {/* Lista por año */}
      {years.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <FileText size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">Aún no has registrado ninguna encuesta.</p>
          <Link href="/profesional/encuesta/nueva" className="btn-primary inline-flex">
            <Plus size={16} />
            Crear mi primera encuesta
          </Link>
        </div>
      ) : (
        years.map(year => (
          <div key={year} className="card-premium overflow-hidden">
            <div className="p-5" style={{ borderBottom: '1px solid rgba(71,85,105,0.2)' }}>
              <h2 className="text-white font-semibold">Año {year}</h2>
              <p className="text-slate-500 text-xs mt-1">{byYear[year].length} encuestas</p>
            </div>
            <div className="overflow-x-auto">
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>Semana</th>
                    <th>Período</th>
                    <th>Actividades</th>
                    <th>Total HNC</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {byYear[year].map(survey => {
                    const cfg = statusConfig[survey.status]
                    const StatusIcon = cfg.icon
                    const totalHNC = survey.items.reduce((s, i) => s + i.weeklyHours, 0)
                    const start = new Date(survey.weekStartDate).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })
                    const end = new Date(survey.weekEndDate).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })
                    return (
                      <tr key={survey.id}>
                        <td className="font-mono text-white font-semibold">S{survey.weekNumber}</td>
                        <td className="text-slate-400 text-sm">{start} – {end}</td>
                        <td className="text-center text-slate-300">{survey.items.length}</td>
                        <td className="text-center">
                          <span className="text-white font-semibold">{totalHNC.toFixed(1)}h</span>
                          <span className="text-slate-500 text-xs ml-1">/ {professional.weeklyHours}h</span>
                        </td>
                        <td>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                            <StatusIcon size={11} />
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
