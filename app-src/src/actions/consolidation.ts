'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ActivityPillar } from '@prisma/client'

async function getSession() {
  const session = await auth()
  if (!session?.user) throw new Error('No autenticado')
  return session
}

export async function consolidateCenter(centerId: string, year: number, month?: number) {
  const session = await getSession()
  if (!['SUPER_ADMIN', 'ADMIN_CENTRO'].includes(session.user.role)) throw new Error('Sin permisos')
  if (session.user.role === 'ADMIN_CENTRO' && session.user.healthCenterId !== centerId) {
    throw new Error('Sin permisos para este centro')
  }

  const professionals = await prisma.professional.findMany({
    where: { healthCenterId: centerId, isActive: true },
    include: {
      workConfigs: { where: { year } },
      surveys: {
        where: {
          year,
          ...(month ? { weekStartDate: { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) } } : {}),
          status: 'APROBADA',
        },
        include: { items: { include: { activity: true } } },
      },
    },
  })

  const reports = []

  for (const prof of professionals) {
    const workConfig = prof.workConfigs[0]
    if (!workConfig) continue

    // Calcular horas contratadas del período
    const weeksInPeriod = month ? 4.33 : 52
    const contractedHours = workConfig.availableHoursWeek * weeksInPeriod

    let hncGestion = 0, hncReunion = 0, hncDerecho = 0

    for (const survey of prof.surveys) {
      for (const item of survey.items) {
        const pillar = item.activity.pillar
        if (pillar === ActivityPillar.GESTION) hncGestion += item.weeklyHours
        else if (pillar === ActivityPillar.REUNION) hncReunion += item.weeklyHours
        else if (pillar === ActivityPillar.DERECHO) hncDerecho += item.weeklyHours
      }
    }

    const hncTotal = hncGestion + hncReunion + hncDerecho
    const hcTotal = Math.max(0, contractedHours - hncTotal)
    const hncPercentage = contractedHours > 0 ? (hncTotal / contractedHours) * 100 : 0
    const hcPercentage = 100 - hncPercentage

    await prisma.consolidationReport.upsert({
      where: {
        professionalId_year_month_weekNumber: {
          professionalId: prof.id,
          year,
          month: month ?? -1,
          weekNumber: -1,
        },
      },
      create: {
        year,
        month: month ?? -1,
        weekNumber: -1,
        contractedHours,
        hncGestion,
        hncReunion,
        hncDerecho,
        hncTotal,
        hcTotal,
        hncPercentage,
        hcPercentage,
        healthCenterId: centerId,
        professionalId: prof.id,
      },
      update: {
        contractedHours,
        hncGestion,
        hncReunion,
        hncDerecho,
        hncTotal,
        hcTotal,
        hncPercentage,
        hcPercentage,
        updatedAt: new Date(),
      },
    })

    reports.push({ professionalId: prof.id, hncTotal, hcTotal, hncPercentage })
  }

  revalidatePath('/centro/consolidacion')
  revalidatePath('/super-admin')
  return { success: true, processed: reports.length, reports }
}

export async function getConsolidationSummary(centerId?: string, year?: number) {
  const session = await getSession()
  const filterCenter = session.user.role === 'SUPER_ADMIN' ? centerId : session.user.healthCenterId
  const filterYear = year || new Date().getFullYear()

  const reports = await prisma.consolidationReport.findMany({
    where: {
      ...(filterCenter ? { healthCenterId: filterCenter } : {}),
      year: filterYear,
      month: -1,
    },
    include: {
      professional: { select: { firstName: true, lastName: true, category: true, weeklyHours: true } },
      healthCenter: { select: { name: true, code: true } },
    },
    orderBy: { hncPercentage: 'desc' },
  })

  return reports
}

export async function getGlobalSummary(year?: number) {
  const session = await getSession()
  if (session.user.role !== 'SUPER_ADMIN') throw new Error('Sin permisos')

  const filterYear = year || new Date().getFullYear()

  const centers = await prisma.healthCenter.findMany({
    where: { isActive: true },
    include: {
      consolidations: { where: { year: filterYear, month: -1 } },
      professionals: { where: { isActive: true }, select: { id: true } },
    },
  })

  return centers.map((center) => {
    const reports = center.consolidations
    const avgHNC = reports.length > 0
      ? reports.reduce((s, r) => s + r.hncPercentage, 0) / reports.length
      : 0
    const avgHC = 100 - avgHNC
    const totalProfessionals = center.professionals.length
    const surveyed = reports.length

    return {
      id: center.id,
      name: center.name,
      code: center.code,
      commune: center.commune,
      totalProfessionals,
      surveyed,
      avgHNCPercentage: avgHNC,
      avgHCPercentage: avgHC,
    }
  })
}
