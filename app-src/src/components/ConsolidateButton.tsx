'use client'

import { consolidateCenter } from '@/actions/consolidation'
import { RefreshCw } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface Props {
  centerId: string
  year: number
}

export default function ConsolidateButton({ centerId, year }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleConsolidate = () => {
    startTransition(async () => {
      try {
        const result = await consolidateCenter(centerId, year)
        toast.success(`Consolidación completada: ${result.processed} profesionales procesados`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error en consolidación')
      }
    })
  }

  return (
    <button
      onClick={handleConsolidate}
      disabled={isPending}
      className="btn-primary"
    >
      <RefreshCw size={16} className={isPending ? 'animate-spin' : ''} />
      {isPending ? 'Consolidando...' : 'Ejecutar Consolidación'}
    </button>
  )
}
