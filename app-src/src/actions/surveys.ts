'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { SurveyStatus } from '@prisma/client'
import { getWeekNumber, getWeekDates } from '@/lib/utils'

async function getSession() {
  const session = await auth()
  if (!session?.user) throw new Error('No autenticado')
  return session
}

export async function createOrUpdateSurvey(professionalId: string, items: { activityId: string; weeklyHours: number; notes?: string }[], weekNumber?: number, year?: number) {
  const session = await getSession()

  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    include: { workConfigs: { where: { year: new Date().getFullYear() } } },
  })
  if (!professional) throw new Error('Profesional no encontrado')

  // Verificar permisos: el profesional solo puede editar sus propias encuestas
  if (session.user.role === 'PROFESIONAL' && professional.userId !== session.user.id) {
    throw new Error('Sin permisos')
  }
  if (session.user.role === 'ADMIN_CENTRO' && professional.healthCenterId !== session.user.healthCenterId) {
    throw new Error('Sin permisos')
  }

  const now = new Date()
  const wk = weekNumber || getWeekNumber(now)
  const yr = year || now.getFullYear()
  const { start, end } = getWeekDates(wk, yr)

  // Validar que el total no supere la jornada
  const totalHNC = items.reduce((sum, i) => sum + i.weeklyHours, 0)
  const workConfig = professional.workConfigs[0]
  const maxHours = workConfig?.availableHoursWeek || professional.weeklyHours

  if (totalHNC > maxHours) {
    throw new Error(`El total de HNC (${totalHNC}h) supera la jornada disponible (${maxHours.toFixed(1)}h)`)
  }

  // Upsert survey
  const survey = await prisma.survey.upsert({
    where: { professionalId_weekNumber_year: { professionalId, weekNumber: wk, year: yr } },
    create: {
      weekNumber: wk,
      year: yr,
      weekStartDate: start,
      weekEndDate: end,
      status: SurveyStatus.BORRADOR,
      healthCenterId: professional.healthCenterId,
      professionalId,
    },
    update: {
      weekStartDate: start,
      weekEndDate: end,
      status: SurveyStatus.BORRADOR,
      updatedAt: now,
    },
  })

  // Borrar items anteriores y reemplazar
  await prisma.surveyItem.deleteMany({ where: { surveyId: survey.id } })
  await prisma.surveyItem.createMany({
    data: items.map((i) => ({
      surveyId: survey.id,
      activityId: i.activityId,
      weeklyHours: i.weeklyHours,
      notes: i.notes,
    })),
  })

  revalidatePath('/centro/encuestas')
  revalidatePath('/profesional/encuesta')
  return { success: true, surveyId: survey.id }
}

export async function submitSurvey(surveyId: string) {
  const session = await getSession()
  const survey = await prisma.survey.findUnique({ where: { id: surveyId } })
  if (!survey) throw new Error('Encuesta no encontrada')

  await prisma.survey.update({
    where: { id: surveyId },
    data: { status: SurveyStatus.ENVIADA, submittedAt: new Date() },
  })

  revalidatePath('/centro/encuestas')
  revalidatePath('/profesional/encuesta')
  return { success: true }
}

export async function approveSurvey(surveyId: string) {
  const session = await getSession()
  if (!['SUPER_ADMIN', 'ADMIN_CENTRO'].includes(session.user.role)) throw new Error('Sin permisos')

  await prisma.survey.update({
    where: { id: surveyId },
    data: {
      status: SurveyStatus.APROBADA,
      approvedAt: new Date(),
      approvedBy: session.user.id,
    },
  })

  revalidatePath('/centro/encuestas')
  return { success: true }
}

export async function getSurveysForCenter(centerId?: string) {
  const session = await getSession()
  const filterCenter = session.user.role === 'SUPER_ADMIN' ? centerId : session.user.healthCenterId

  return prisma.survey.findMany({
    where: filterCenter ? { healthCenterId: filterCenter } : {},
    include: {
      professional: { select: { firstName: true, lastName: true, category: true, weeklyHours: true } },
      items: { include: { activity: { select: { name: true, pillar: true } } } },
    },
    orderBy: [{ year: 'desc' }, { weekNumber: 'desc' }],
  })
}

export async function getActivitiesForProfessional(professionalId: string) {
  const session = await getSession()
  const professional = await prisma.professional.findUnique({ where: { id: professionalId } })
  if (!professional) throw new Error('Profesional no encontrado')

  // MySQL: applicableCategories es JSON, usamos rawQuery con JSON_CONTAINS
  const activities = await prisma.$queryRaw<Array<{
    id: string; name: string; code: string; pillar: string;
    description: string | null; isObligatory: number; isActive: number;
    order: number; healthCenterId: string | null; applicableCategories: string;
  }>>`
    SELECT id, name, code, pillar, description, isObligatory, \`order\`, healthCenterId, applicableCategories
    FROM activities
    WHERE isActive = 1
      AND (healthCenterId IS NULL OR healthCenterId = ${professional.healthCenterId})
      AND JSON_CONTAINS(applicableCategories, ${JSON.stringify(professional.category)})
    ORDER BY pillar ASC, \`order\` ASC
  `

  return activities.map((a) => ({
    ...a,
    isObligatory: Boolean(a.isObligatory),
    isActive: true,
    applicableCategories: typeof a.applicableCategories === 'string'
      ? JSON.parse(a.applicableCategories)
      : a.applicableCategories,
  }))
}
