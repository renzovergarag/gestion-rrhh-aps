'use client'

import React, { useState, useTransition } from 'react'
import { createMeeting } from '@/actions/meetings'
import { toast } from 'sonner'
import { X, Calendar as CalendarIcon, Clock, Users } from 'lucide-react'
import { CATEGORY_LABELS } from '@/lib/utils'
import { format } from 'date-fns'

interface Professional {
  id: string
  firstName: string
  lastName: string
  rut: string
  category: string
}

interface Props {
  initialDate: Date | null
  professionals: Professional[]
  onClose: () => void
}

export default function MeetingForm({ initialDate, professionals, onClose }: Props) {
  const [isPending, startTransition] = useTransition()
  
  // Format initial values
  const defaultDate = initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  const defaultTime = initialDate ? format(initialDate, 'HH:mm') : '09:00'

  const [date, setDate] = useState(defaultDate)
  const [startTime, setStartTime] = useState(defaultTime)
  const [endTime, setEndTime] = useState('10:00')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const selectedParticipants = formData.getAll('participants') as string[]

    if (selectedParticipants.length === 0) {
      toast.error('Debe seleccionar al menos un participante')
      return
    }

    if (startTime >= endTime) {
      toast.error('La hora de término debe ser posterior a la de inicio')
      return
    }

    startTransition(async () => {
      try {
        await createMeeting({
          title,
          description,
          startDatetime: new Date(`${date}T${startTime}:00`),
          endDatetime: new Date(`${date}T${endTime}:00`),
          participantIds: selectedParticipants,
        })
        toast.success('Reunión agendada exitosamente')
        onClose()
      } catch (error: any) {
        toast.error(error.message || 'Error al agendar la reunión')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-indigo-500/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon size={20} className="text-indigo-400" />
            Agendar Reunión
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Formulary body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Título de la reunión</label>
              <input
                name="title"
                required
                placeholder="Ej. Reunión Clínica Sector Azul"
                className="input-dark"
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Fecha</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="input-dark"
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock size={14} className="text-indigo-400" /> Hora Inicio
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="input-dark"
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock size={14} className="text-fuchsia-400" /> Hora Término
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="input-dark"
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Descripción (Opcional)</label>
              <textarea
                name="description"
                rows={2}
                placeholder="Temas a tratar, enlaces, etc."
                className="input-dark resize-none"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <Users size={18} className="text-emerald-400" />
              Seleccionar Participantes
            </label>
            <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 max-h-60 overflow-y-auto">
              {professionals.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No hay profesionales disponibles en el centro.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {professionals.map((prof) => (
                    <label key={prof.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/10">
                      <input
                        type="checkbox"
                        name="participants"
                        value={prof.id}
                        className="mt-1 flex-shrink-0 w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500 bg-slate-800 border-slate-600"
                        disabled={isPending}
                      />
                      <div>
                        <p className="text-white text-sm font-medium leading-none">{prof.firstName} {prof.lastName}</p>
                        <p className="text-slate-400 text-xs mt-1">{CATEGORY_LABELS[prof.category] || prof.category}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary"
            >
              {isPending ? 'Programando...' : 'Agendar y Notificar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
