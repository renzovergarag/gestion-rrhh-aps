'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

async function getSession() {
  const session = await auth()
  if (!session?.user) throw new Error('No autenticado')
  if (session.user.role !== 'SUPER_ADMIN') throw new Error('Sin permisos')
  return session
}

export async function toggleUserStatus(userId: string) {
  await getSession()
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('Usuario no encontrado')

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  })

  revalidatePath('/super-admin/usuarios')
  return { success: true }
}

const UpdateRoleSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(UserRole),
  healthCenterId: z.string().optional().nullable(),
})

export async function updateUserRole(userId: string, role: string, healthCenterId?: string) {
  await getSession()

  const parsed = UpdateRoleSchema.parse({ userId, role, healthCenterId: healthCenterId || null })

  // Validar que si no es SUPER_ADMIN, tenga centro
  if (parsed.role !== 'SUPER_ADMIN' && !parsed.healthCenterId) {
    throw new Error('Se requiere un centro de salud para este rol')
  }

  await prisma.user.update({
    where: { id: parsed.userId },
    data: {
      role: parsed.role,
      healthCenterId: parsed.role === 'SUPER_ADMIN' ? null : parsed.healthCenterId,
    },
  })

  revalidatePath('/super-admin/usuarios')
  return { success: true }
}

export async function getUsers() {
  await getSession()
  return prisma.user.findMany({
    include: { healthCenter: { select: { name: true, code: true } } },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  })
}
