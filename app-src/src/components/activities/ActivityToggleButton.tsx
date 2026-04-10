'use client'

import { useState, useTransition } from 'react'
import { toggleActivityStatus } from '@/actions/activities'
import { Power, Loader2 } from 'lucide-react'

interface Props {
  activityId: string
  initialStatus: boolean
}

export default function ActivityToggleButton({ activityId, initialStatus }: Props) {
  const [isPending, startTransition] = useTransition()
  const [isActive, setIsActive] = useState(initialStatus)

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleActivityStatus(activityId)
        setIsActive(!isActive)
      } catch (error) {
        console.error('Error toggling activity:', error)
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`text-xs px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
        isActive
          ? 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
          : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
      }`}
    >
      {isPending ? <Loader2 size={12} className="animate-spin" /> : <Power size={12} />}
      {isActive ? 'Desactivar' : 'Activar'}
    </button>
  )
}
