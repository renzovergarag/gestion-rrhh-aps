import { auth } from '@/lib/auth'
import { getMeetings } from '@/actions/meetings'
import { prisma } from '@/lib/prisma'
import { Calendar, AlertCircle } from 'lucide-react'
import MeetingCalendar from '@/components/calendar/MeetingCalendar'

export const metadata = { title: 'Calendario de Reuniones' }

export default async function CalendarioPage() {
  const session = await auth()
  const centerId = session!.user.healthCenterId
  
  if (!centerId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle size={48} className="text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Centro no asignado</h2>
        <p className="text-slate-400">Su cuenta no está asociada a ningún centro de salud.</p>
      </div>
    )
  }

  const [meetings, professionals, center] = await Promise.all([
    getMeetings(centerId),
    prisma.professional.findMany({ 
      where: { healthCenterId: centerId, isActive: true },
      select: { id: true, firstName: true, lastName: true, rut: true, category: true },
      orderBy: { lastName: 'asc' }
    }),
    prisma.healthCenter.findUnique({ where: { id: centerId }, select: { name: true } })
  ])

  // Convert dates to simple JS dates to pass them to Client Component safely
  const serializedMeetings = meetings.map(m => ({
    ...m,
    startDatetime: new Date(m.startDatetime),
    endDatetime: new Date(m.endDatetime),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar size={24} className="text-indigo-400" />
            Calendario de Reuniones
          </h1>
          <p className="text-slate-400 text-sm mt-1">{center?.name} · Gestión, Clínicas y Administrativas</p>
        </div>
      </div>

      <MeetingCalendar meetings={serializedMeetings} professionals={professionals} />
    </div>
  )
}
