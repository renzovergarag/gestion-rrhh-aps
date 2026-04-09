'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { ProfessionalCategory, ContractType } from '@prisma/client'
import { calculateAvailableHours, CONTRACT_HOURS } from '@/lib/utils'

const ProfessionalSchema = z.object({
  rut: z.string().min(9).max(12),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  category: z.nativeEnum(ProfessionalCategory),
  contractType: z.nativeEnum(ContractType),
  weeklyHours: z.coerce.number().min(1).max(44),
  startDate: z.string().transform((s) => new Date(s)),
})

async function getSessionAndCenter() {
  const session = await auth()
  if (!session?.user) throw new Error('No autenticado')
  return session
}

export async function createProfessional(formData: FormData) {
  const session = await getSessionAndCenter()
  if (!['SUPER_ADMIN', 'ADMIN_CENTRO'].includes(session.user.role)) {
    throw new Error('Sin permisos')
  }
  const healthCenterId = session.user.healthCenterId
  if (!healthCenterId && session.user.role !== 'SUPER_ADMIN') throw new Error('Sin centro asignado')

  const centerId = formData.get('healthCenterId')?.toString() || healthCenterId!

  const raw = {
    rut: formData.get('rut'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    category: formData.get('category'),
    contractType: formData.get('contractType'),
    weeklyHours: formData.get('weeklyHours'),
    startDate: formData.get('startDate'),
  }

  const parsed = ProfessionalSchema.parse(raw)

  const professional = await prisma.professional.create({
    data: { ...parsed, healthCenterId: centerId },
  })

  // Auto-crear WorkConfig para el año actual
  const year = new Date().getFullYear()
  const holidays = await prisma.holiday.count({ where: { year, healthCenterId: null } })
  const { availableHoursYear, availableHoursWeek } = calculateAvailableHours(
    parsed.weeklyHours, holidays, 3, 15, 0, 0
  )

  await prisma.workConfig.create({
    data: {
      year,
      theoreticalHoursYear: parsed.weeklyHours * 52,
      holidayDays: holidays,
      adminDays: 3,
      vacationDays: 15,
      sickLeaveDays: 0,
      otherAbsenceDays: 0,
      availableHoursYear,
      availableHoursWeek,
      healthCenterId: centerId,
      professionalId: professional.id,
    },
  })

  revalidatePath('/centro/profesionales')
  return { success: true, id: professional.id }
}

export async function updateProfessional(id: string, formData: FormData) {
  const session = await getSessionAndCenter()
  if (!['SUPER_ADMIN', 'ADMIN_CENTRO'].includes(session.user.role)) throw new Error('Sin permisos')

  // Verificar que el profesional pertenece al centro
  const existing = await prisma.professional.findUnique({ where: { id } })
  if (!existing) throw new Error('Profesional no encontrado')
  if (session.user.role === 'ADMIN_CENTRO' && existing.healthCenterId !== session.user.healthCenterId) {
    throw new Error('Sin permisos para este profesional')
  }

  const raw = {
    rut: formData.get('rut'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    category: formData.get('category'),
    contractType: formData.get('contractType'),
    weeklyHours: formData.get('weeklyHours'),
    startDate: formData.get('startDate'),
  }
  const parsed = ProfessionalSchema.parse(raw)
  await prisma.professional.update({ where: { id }, data: parsed })

  revalidatePath('/centro/profesionales')
  return { success: true }
}

export async function toggleProfessionalStatus(id: string) {
  const session = await getSessionAndCenter()
  if (!['SUPER_ADMIN', 'ADMIN_CENTRO'].includes(session.user.role)) throw new Error('Sin permisos')

  const existing = await prisma.professional.findUnique({ where: { id } })
  if (!existing) throw new Error('No encontrado')
  if (session.user.role === 'ADMIN_CENTRO' && existing.healthCenterId !== session.user.healthCenterId) {
    throw new Error('Sin permisos')
  }

  await prisma.professional.update({ where: { id }, data: { isActive: !existing.isActive } })
  revalidatePath('/centro/profesionales')
  return { success: true }
}

export async function getProfessionals(centerId?: string) {
  const session = await getSessionAndCenter()
  const filterCenter = session.user.role === 'SUPER_ADMIN' ? centerId : session.user.healthCenterId

  return prisma.professional.findMany({
    where: {
      ...(filterCenter ? { healthCenterId: filterCenter } : {}),
    },
    include: {
      workConfigs: { where: { year: new Date().getFullYear() } },
      healthCenter: { select: { name: true, code: true } },
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  })
}
