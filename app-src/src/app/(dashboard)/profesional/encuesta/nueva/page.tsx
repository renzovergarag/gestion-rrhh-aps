import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getActivitiesForProfessional } from '@/actions/surveys'
import { AlertCircle } from 'lucide-react'
import SurveyForm from '@/components/surveys/SurveyForm'
import { getWeekNumber } from '@/lib/utils'

export const metadata = { title: 'Nueva Encuesta Semanal' }

export default async function NuevaEncuestaPage() {
  const session = await auth()
  const userId = session!.user.id
  const now = new Date()
  const currentWeek = getWeekNumber(now)
  const currentYear = now.getFullYear()

  const professional = await prisma.professional.findFirst({
    where: { userId },
    include: {
      workConfigs: { where: { year: currentYear } },
      healthCenter: true,
    },
  })

  if (!professional) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle size={48} className="text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Perfil no configurado</h2>
        <p className="text-slate-400 max-w-sm">
          Tu cuenta no está vinculada a un perfil profesional. Contacta al administrador de tu centro.
        </p>
      </div>
    )
  }

  const activities = await getActivitiesForProfessional(professional.id)

  // Verificar si ya existe encuesta para esta semana
  const existingSurvey = await prisma.survey.findUnique({
    where: {
      professionalId_weekNumber_year: {
        professionalId: professional.id,
        weekNumber: currentWeek,
        year: currentYear,
      },
    },
    include: { items: true },
  })

  const wc = professional.workConfigs[0]
  const maxHours = wc?.availableHoursWeek || professional.weeklyHours

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Encuesta Semanal</h1>
        <p className="text-slate-400 text-sm mt-1">
          {professional.firstName} {professional.lastName} · {professional.healthCenter.name}
        </p>
        <p className="text-indigo-400 text-sm mt-1 font-medium">
          Semana {currentWeek} — {currentYear} · Máx. {maxHours.toFixed(1)}h disponibles
        </p>
      </div>

      <SurveyForm
        professionalId={professional.id}
        activities={activities}
        maxHours={maxHours}
        weekNumber={currentWeek}
        year={currentYear}
        existingItems={existingSurvey?.items || []}
        existingSurveyId={existingSurvey?.id}
        existingStatus={existingSurvey?.status}
      />
    </div>
  )
}
