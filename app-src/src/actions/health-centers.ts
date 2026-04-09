'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

async function getSession() {
  const session = await auth()
  if (!session?.user) throw new Error('No autenticado')
  return session
}

export async function getHealthCenters() {
  const session = await getSession()
  if (session.user.role !== 'SUPER_ADMIN') throw new Error('Sin permisos')

  return prisma.healthCenter.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { professionals: true, users: true } },
    },
  })
}

const HealthCenterSchema = z.object({
  name: z.string().min(3),
  code: z.string().min(3).max(20),
  commune: z.string().min(2),
  region: z.string().min(2),
})

export async function createHealthCenter(formData: FormData) {
  const session = await getSession()
  if (session.user.role !== 'SUPER_ADMIN') throw new Error('Sin permisos')

  const parsed = HealthCenterSchema.parse({
    name: formData.get('name'),
    code: formData.get('code'),
    commune: formData.get('commune'),
    region: formData.get('region'),
  })

  const center = await prisma.healthCenter.create({ data: parsed })
  revalidatePath('/super-admin/centros')
  return { success: true, id: center.id }
}

export async function toggleHealthCenterStatus(id: string) {
  const session = await getSession()
  if (session.user.role !== 'SUPER_ADMIN') throw new Error('Sin permisos')

  const existing = await prisma.healthCenter.findUnique({ where: { id } })
  if (!existing) throw new Error('Centro no encontrado')

  await prisma.healthCenter.update({ where: { id }, data: { isActive: !existing.isActive } })
  revalidatePath('/super-admin/centros')
  return { success: true }
}
