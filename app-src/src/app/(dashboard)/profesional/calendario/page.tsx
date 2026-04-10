import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Calendar, Clock, Users, MapPin, AlertTriangle } from 'lucide-react'

export const metadata = { title: 'Mi Calendario' }

export default async function ProfesionalCalendarioPage() {
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
          Tu cuenta no está vinculada a un perfil profesional.
        </p>
      </div>
    )
  }

  const now = new Date()
  const meetings = await prisma.meeting.findMany({
    where: {
      healthCenterId: professional.healthCenterId,
      startDatetime: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      participants: { some: { professionalId: professional.id } },
    },
    include: {
      participants: {
        include: { professional: { select: { firstName: true, lastName: true } } },
      },
    },
    orderBy: { startDatetime: 'asc' },
  })

  const upcoming = meetings.filter(m => new Date(m.startDatetime) >= now)
  const past = meetings.filter(m => new Date(m.startDatetime) < now).slice(-5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mi Calendario</h1>
        <p className="text-slate-400 text-sm mt-1">
          {professional.firstName} {professional.lastName} · {professional.healthCenter.name}
        </p>
      </div>

      {/* Próximas reuniones */}
      <div className="card-premium overflow-hidden">
        <div className="p-5" style={{ borderBottom: '1px solid rgba(71,85,105,0.2)' }}>
          <h2 className="text-white font-semibold">Próximas Reuniones</h2>
          <p className="text-slate-500 text-xs mt-1">{upcoming.length} reuniones programadas</p>
        </div>

        {upcoming.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No tienes reuniones próximas programadas.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(71,85,105,0.1)' }}>
            {upcoming.map(meeting => {
              const start = new Date(meeting.startDatetime)
              const end = new Date(meeting.endDatetime)
              const isOrganizer = meeting.participants.find(p => p.professionalId === professional.id)?.isOrganizer
              return (
                <div key={meeting.id} className="flex gap-4 p-5">
                  {/* Fecha */}
                  <div
                    className="flex-shrink-0 w-14 text-center py-2 rounded-xl"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
                  >
                    <p className="text-indigo-400 text-xs font-medium">
                      {start.toLocaleDateString('es-CL', { month: 'short' }).toUpperCase()}
                    </p>
                    <p className="text-white text-2xl font-bold leading-tight">{start.getDate()}</p>
                    <p className="text-slate-500 text-xs">{start.getFullYear()}</p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h3 className="text-white font-semibold text-sm">{meeting.title}</h3>
                      <div className="flex items-center gap-2">
                        {isOrganizer && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(245,158,11,0.15)', color: '#fcd34d' }}>
                            Organizador
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          meeting.status === 'PROGRAMADA' ? 'status-enviada' :
                          meeting.status === 'REALIZADA' ? 'status-aprobada' :
                          meeting.status === 'CANCELADA' ? 'status-rechazada' : 'status-borrador'
                        }`}>
                          {meeting.status}
                        </span>
                      </div>
                    </div>

                    {meeting.description && (
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">{meeting.description}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock size={12} />
                        <span>{start.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} – {end.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-slate-600">({meeting.duration}h)</span>
                      </div>
                      {meeting.location && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <MapPin size={12} />
                          <span>{meeting.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Users size={12} />
                        <span>{meeting.participants.length} participantes</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Historial */}
      {past.length > 0 && (
        <div className="card-premium overflow-hidden">
          <div className="p-5" style={{ borderBottom: '1px solid rgba(71,85,105,0.2)' }}>
            <h2 className="text-white font-semibold">Reuniones Recientes</h2>
            <p className="text-slate-500 text-xs mt-1">Últimas {past.length} realizadas</p>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(71,85,105,0.1)' }}>
            {past.reverse().map(meeting => {
              const start = new Date(meeting.startDatetime)
              return (
                <div key={meeting.id} className="flex items-center justify-between px-5 py-4 opacity-60">
                  <div>
                    <p className="text-white text-sm font-medium">{meeting.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {start.toLocaleDateString('es-CL', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium status-borrador">
                    {meeting.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
