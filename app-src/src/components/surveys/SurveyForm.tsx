'use client'

import { useState, useTransition } from 'react'
import { createOrUpdateSurvey, submitSurvey } from '@/actions/surveys'
import { Save, Send, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Activity = {
  id: string
  name: string
  code: string
  pillar: string
  description: string | null
  isObligatory: boolean
}

type ExistingItem = {
  activityId: string
  weeklyHours: number
  notes?: string | null
}

const pillarConfig: Record<string, { label: string; color: string; bg: string }> = {
  GESTION: { label: 'Gestión', color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
  REUNION: { label: 'Reuniones', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  DERECHO: { label: 'Derechos', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
}

interface Props {
  professionalId: string
  activities: Activity[]
  maxHours: number
  weekNumber: number
  year: number
  existingItems: ExistingItem[]
  existingSurveyId?: string
  existingStatus?: string
}

export default function SurveyForm({
  professionalId,
  activities,
  maxHours,
  weekNumber,
  year,
  existingItems,
  existingSurveyId,
  existingStatus,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Inicializar horas desde items existentes
  const [hours, setHours] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    existingItems.forEach(i => { init[i.activityId] = i.weeklyHours })
    return init
  })

  const totalHNC = Object.values(hours).reduce((s, h) => s + h, 0)
  const overLimit = totalHNC > maxHours
  const percentage = Math.min((totalHNC / maxHours) * 100, 100)

  const byPillar = activities.reduce<Record<string, Activity[]>>((acc, a) => {
    if (!acc[a.pillar]) acc[a.pillar] = []
    acc[a.pillar].push(a)
    return acc
  }, {})

  const handleSave = () => {
    startTransition(async () => {
      try {
        const items = Object.entries(hours)
          .filter(([, h]) => h > 0)
          .map(([activityId, weeklyHours]) => ({ activityId, weeklyHours }))

        await createOrUpdateSurvey(professionalId, items, weekNumber, year)
        setMessage({ type: 'success', text: 'Encuesta guardada como borrador.' })
      } catch (e: unknown) {
        setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Error al guardar' })
      }
    })
  }

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        const items = Object.entries(hours)
          .filter(([, h]) => h > 0)
          .map(([activityId, weeklyHours]) => ({ activityId, weeklyHours }))

        const result = await createOrUpdateSurvey(professionalId, items, weekNumber, year)
        if (result.surveyId) {
          await submitSurvey(result.surveyId)
        }
        setMessage({ type: 'success', text: 'Encuesta enviada correctamente para revisión.' })
        setTimeout(() => router.push('/profesional/encuesta'), 1500)
      } catch (e: unknown) {
        setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Error al enviar' })
      }
    })
  }

  const isSubmitted = existingStatus === 'ENVIADA' || existingStatus === 'APROBADA'

  return (
    <div className="space-y-6">
      {/* Barra de progreso */}
      <div className="card-premium p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-sm">Total HNC ingresado</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${overLimit ? 'text-red-400' : 'text-white'}`}>
              {totalHNC.toFixed(1)}h
            </span>
            <span className="text-slate-500 text-sm">/ {maxHours.toFixed(1)}h disponibles</span>
          </div>
        </div>
        <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(percentage, 100)}%`,
              background: overLimit ? '#ef4444' : percentage > 80 ? '#f59e0b' : '#6366f1',
            }}
          />
        </div>
        {overLimit && (
          <div className="flex items-center gap-2 mt-3 text-red-400 text-sm">
            <AlertTriangle size={14} />
            <span>El total supera tu jornada disponible. Reduce las horas.</span>
          </div>
        )}
      </div>

      {/* Formulario por pilar */}
      {(Object.entries(byPillar) as [string, Activity[]][]).map(([pillar, acts]) => {
        const cfg = pillarConfig[pillar]
        return (
          <div key={pillar} className="card-premium overflow-hidden">
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{ borderBottom: '1px solid rgba(71,85,105,0.15)', background: cfg.bg }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
              <h3 className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</h3>
              <span className="text-slate-600 text-xs">({acts.length} actividades)</span>
            </div>

            <div className="divide-y" style={{ borderColor: 'rgba(71,85,105,0.1)' }}>
              {acts.map(act => (
                <div key={act.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm">{act.name}</span>
                      {act.isObligatory && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                          Obligatoria
                        </span>
                      )}
                    </div>
                    {act.description && (
                      <p className="text-slate-500 text-xs mt-0.5">{act.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input
                      type="number"
                      min="0"
                      max={maxHours}
                      step="0.5"
                      value={hours[act.id] || 0}
                      disabled={isSubmitted}
                      onChange={e => setHours(prev => ({ ...prev, [act.id]: Math.max(0, parseFloat(e.target.value) || 0) }))}
                      className="input-dark w-20 text-center text-sm"
                      placeholder="0"
                    />
                    <span className="text-slate-500 text-xs w-6">h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Mensaje de feedback */}
      {message && (
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{
            background: message.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}
        >
          {message.type === 'success' ? (
            <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
          )}
          <span style={{ color: message.type === 'success' ? '#6ee7b7' : '#fca5a5' }} className="text-sm">
            {message.text}
          </span>
        </div>
      )}

      {/* Acciones */}
      {!isSubmitted && (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="btn-secondary"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Guardar Borrador
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || overLimit || totalHNC === 0}
            className="btn-primary"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Enviar para Revisión
          </button>
        </div>
      )}

      {isSubmitted && (
        <div
          className="rounded-xl p-4 text-center"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <p className="text-indigo-300 text-sm font-medium">
            Esta encuesta ya fue {existingStatus === 'APROBADA' ? 'aprobada' : 'enviada para revisión'}.
          </p>
        </div>
      )}
    </div>
  )
}
