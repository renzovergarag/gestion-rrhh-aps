'use client'

import { useState, useTransition } from 'react'
import { approveSurvey } from '@/actions/surveys'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function SurveyApprovalButton({ surveyId }: { surveyId: string }) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
        <CheckCircle size={12} /> Aprobada
      </span>
    )
  }

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await approveSurvey(surveyId)
          setDone(true)
        })
      }
      disabled={isPending}
      className="btn-primary text-xs py-1 px-3"
      style={{ minWidth: 80 }}
    >
      {isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
      {isPending ? 'Aprobando…' : 'Aprobar'}
    </button>
  )
}
