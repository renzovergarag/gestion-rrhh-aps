'use client'

import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import esLocale from '@fullcalendar/core/locales/es'
import { Plus } from 'lucide-react'
import MeetingForm from './MeetingForm'

interface Meeting {
  id: string
  title: string
  description: string | null
  startDatetime: Date
  endDatetime: Date
  status: string
  participants: any[]
}

interface Professional {
  id: string
  firstName: string
  lastName: string
  rut: string
  category: string
}

interface Props {
  meetings: Meeting[]
  professionals: Professional[]
}

export default function MeetingCalendar({ meetings, professionals }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.date)
    setIsModalOpen(true)
  }

  const events = meetings.map((m) => {
    let color = '#6366f1' // PROGRAMADA -> Indigo
    if (m.status === 'REALIZADA') color = '#10b981' // Emerald
    if (m.status === 'CANCELADA') color = '#ef4444' // Red

    return {
      id: m.id,
      title: m.title,
      start: m.startDatetime,
      end: m.endDatetime,
      backgroundColor: color,
      extendedProps: {
        description: m.description,
        status: m.status,
        participantsList: m.participants.map((p) => `${p.professional.firstName} ${p.professional.lastName}`).join(', '),
      },
    }
  })

  return (
    <div className="card-premium p-6 relative">
      <div className="absolute top-6 right-6 z-10 flex gap-2">
        <button
          onClick={() => {
            setSelectedDate(null)
            setIsModalOpen(true)
          }}
          className="btn-primary py-1.5 px-3 text-sm"
        >
          <Plus size={16} />
          Agendar Reunión
        </button>
      </div>

      <div className="calendar-container mt-2">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          locales={[esLocale]}
          locale="es"
          events={events}
          dateClick={handleDateClick}
          height="auto"
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          eventClick={(info) => {
            // For now, simple alert. We can enhance this to a view modal later.
            const props = info.event.extendedProps
            alert(`Reunión: ${info.event.title}\nEstado: ${props.status}\nParticipantes: ${props.participantsList}\n\nDescripción: ${props.description || 'Sin descripción'}`)
          }}
        />
      </div>

      {isModalOpen && (
        <MeetingForm
          initialDate={selectedDate}
          professionals={professionals}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}
