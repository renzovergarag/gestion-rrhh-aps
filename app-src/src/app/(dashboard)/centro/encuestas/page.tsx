import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSurveysForCenter } from '@/actions/surveys'
import { FileText, Plus, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react'
import Link from 'next/link'
import SurveyApprovalButton from '@/components/surveys/SurveyApprovalButton'
import { CATEGORY_LABELS } from '@/lib/utils'

export const metadata = { title: 'Encuestas del Centro' }

const statusConfig = {
  BORRADOR: { label: 'Borrador', className: 'status-borrador', icon: Clock },
  ENVIADA: { label: 'Enviada', className: 'status-enviada', icon: AlertTriangle },
  APROBADA: { label: 'Aprobada', className: 'status-aprobada', icon: CheckCircle },
  RECHAZADA: { label: 'Rechazada', className: 'status-rechazada', icon: XCircle },
}

export default async function EncuestasCentroPage() {
  const session = await auth()
  const centerId = session!.user.healthCenterId!
  const year = new Date().getFullYear()

  const [surveys, center] = await Promise.all([
    getSurveysForCenter(centerId),
    prisma.healthCenter.findUnique({ where: { id: centerId } }),
  ])

  const thisYearSurveys = surveys.filter(s => s.year === year)

  const counts = {
    BORRADOR: thisYearSurveys.filter(s => s.status === 'BORRADOR').length,
    ENVIADA: thisYearSurveys.filter(s => s.status === 'ENVIADA').length,
    APROBADA: thisYearSurveys.filter(s => s.status === 'APROBADA').length,
    RECHAZADA: thisYearSurveys.filter(s => s.status === 'RECHAZADA').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Encuestas</h1>
          <p className="text-slate-400 text-sm mt-1">{center?.name} · Año {year}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Borradores', value: counts.BORRADOR, color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
          { label: 'Enviadas', value: counts.ENVIADA, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Aprobadas', value: counts.APROBADA, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Rechazadas', value: counts.RECHAZADA, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        ].map(s => (
          <div key={s.label} className="card-premium p-5">
            <p className="text-3xl font-bold text-white mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-slate-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Alerta encuestas pendientes */}
      {counts.ENVIADA > 0 && (
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
        >
          <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
          <span className="text-amber-300 text-sm">
            <strong>{counts.ENVIADA} encuesta{counts.ENVIADA !== 1 ? 's' : ''}</strong> esperando aprobación.
            Revísalas a continuación.
          </span>
        </div>
      )}

      {/* Tabla de encuestas */}
      <div className="card-premium overflow-hidden">
        <div className="p-5" style={{ borderBottom: '1px solid rgba(71,85,105,0.2)' }}>
          <h2 className="text-white font-semibold">Todas las Encuestas — {year}</h2>
          <p className="text-slate-500 text-xs mt-1">{surveys.length} encuestas totales registradas</p>
        </div>

        {surveys.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-2">Sin encuestas registradas</p>
            <p className="text-slate-500 text-sm">
              Los profesionales deben ingresar sus encuestas semanales desde su perfil.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Profesional</th>
                  <th>Categoría</th>
                  <th>Semana</th>
                  <th>Año</th>
                  <th>Actividades</th>
                  <th>Total HNC</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map(survey => {
                  const cfg = statusConfig[survey.status]
                  const StatusIcon = cfg.icon
                  const totalHNC = survey.items.reduce((s, i) => s + i.weeklyHours, 0)
                  return (
                    <tr key={survey.id}>
                      <td>
                        <span className="text-white font-medium text-sm">
                          {survey.professional.lastName}, {survey.professional.firstName}
                        </span>
                      </td>
                      <td className="text-slate-400 text-xs">
                        {CATEGORY_LABELS[survey.professional.category as keyof typeof CATEGORY_LABELS] || survey.professional.category}
                      </td>
                      <td className="text-slate-300 text-center font-mono">S{survey.weekNumber}</td>
                      <td className="text-slate-300 text-center">{survey.year}</td>
                      <td className="text-center text-slate-400">{survey.items.length}</td>
                      <td className="text-center">
                        <span className="text-white font-semibold">{totalHNC.toFixed(1)}h</span>
                        <span className="text-slate-500 text-xs ml-1">/ {survey.professional.weeklyHours}h</span>
                      </td>
                      <td>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                          <StatusIcon size={11} />
                          {cfg.label}
                        </span>
                      </td>
                      <td>
                        {survey.status === 'ENVIADA' && (
                          <SurveyApprovalButton surveyId={survey.id} />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
