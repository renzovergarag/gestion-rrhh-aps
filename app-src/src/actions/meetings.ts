'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const meetingSchema = z.object({
  title: z.string().min(3, 'El título es muy corto'),
  description: z.string().optional(),
  startDatetime: z.coerce.date(),
  endDatetime: z.coerce.date(),
  participantIds: z.array(z.string()).min(1, 'Debe seleccionar al menos un participante'),
})

export async function getMeetings(centerId?: string) {
  const session = await auth()
  if (!session?.user) throw new Error('No autorizado')

  const targetCenterId = centerId || session.user.healthCenterId
  if (!targetCenterId) throw new Error('Centro no especificado')

  const meetings = await prisma.meeting.findMany({
    where: { healthCenterId: targetCenterId },
    include: {
      participants: {
        include: { professional: true }
      }
    },
    orderBy: { startDatetime: 'asc' }
  })

  return meetings
}

export async function createMeeting(data: z.infer<typeof meetingSchema>) {
  const session = await auth()
  if (!session?.user?.healthCenterId) throw new Error('No autorizado')

  const validated = meetingSchema.parse(data)

  // 1. Verificar colisiones para los participantes seleccionados
  const conflictingMeetings = await prisma.meetingParticipant.findMany({
    where: {
      professionalId: { in: validated.participantIds },
      meeting: {
        status: { in: ['PROGRAMADA', 'REALIZADA'] },
        AND: [
          { startDatetime: { lt: validated.endDatetime } },
          { endDatetime: { gt: validated.startDatetime } }
        ]
      }
    },
    include: {
      professional: true,
      meeting: true
    }
  })

  if (conflictingMeetings.length > 0) {
    const profNames = [...new Set(conflictingMeetings.map(c => `${c.professional.firstName} ${c.professional.lastName}`))]
    throw new Error(`Colisión de horario detectada para: ${profNames.join(', ')}`)
  }

  const durationHours = (validated.endDatetime.getTime() - validated.startDatetime.getTime()) / (1000 * 60 * 60)

  // 2. Crear reunión
  const meeting = await prisma.meeting.create({
    data: {
      title: validated.title,
      description: validated.description || '',
      startDatetime: validated.startDatetime,
      endDatetime: validated.endDatetime,
      duration: durationHours,
      healthCenterId: session.user.healthCenterId,
      participants: {
        create: validated.participantIds.map(id => ({
          professionalId: id
        }))
      }
    }
  })

  revalidatePath('/centro/calendario')
  return meeting
}

export async function cancelMeeting(meetingId: string) {
  const session = await auth()
  if (!session?.user) throw new Error('No autorizado')

  // Opcional: verificar permisos de edición

  await prisma.meeting.update({
    where: { id: meetingId },
    data: { status: 'CANCELADA' }
  })

  revalidatePath('/centro/calendario')
}

export async function markMeetingAsDone(meetingId: string) {
  const session = await auth()
  if (!session?.user) throw new Error('No autorizado')

  await prisma.meeting.update({
    where: { id: meetingId },
    data: { status: 'REALIZADA' }
  })

  revalidatePath('/centro/calendario')
}
