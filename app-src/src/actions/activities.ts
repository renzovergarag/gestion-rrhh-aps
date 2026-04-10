'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function getSession() {
  const session = await auth()
  if (!session?.user) throw new Error('No autenticado')
  return session
}

export async function toggleActivityStatus(id: string) {
  const session = await getSession()
  if (!['SUPER_ADMIN', 'ADMIN_CENTRO'].includes(session.user.role)) {
    throw new Error('Sin permisos')
  }

  const existing = await prisma.activity.findUnique({ where: { id } })
  if (!existing) throw new Error('Actividad no encontrada')

  // Si es ADMIN_CENTRO, solo puede editar actividades de su centro o (dependiendo de la lógica) 
  // tal vez solo ver las globales. En este caso el requerimiento es aislar por centerId.
  // Si la actividad es global (healthCenterId is null), solo el SUPER_ADMIN debería poder desactivarla.
  
  if (session.user.role === 'ADMIN_CENTRO') {
    if (existing.healthCenterId === null) {
      throw new Error('Solo el Super Admin puede modificar actividades globales')
    }
    if (existing.healthCenterId !== session.user.healthCenterId) {
      throw new Error('No tienes permiso para modificar esta actividad')
    }
  }

  await prisma.activity.update({
    where: { id },
    data: { isActive: !existing.isActive }
  })

  revalidatePath('/centro/actividades')
  return { success: true }
}
