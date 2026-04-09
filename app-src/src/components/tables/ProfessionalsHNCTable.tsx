'use client'

import { formatHours, CATEGORY_LABELS } from '@/lib/utils'

interface ReportRow {
  professional: { firstName: string; lastName: string; category: string; weeklyHours: number }
  contractedHours: number
  hncTotal: number
  hcTotal: number
  hncPercentage: number
  hcPercentage: number
  hncGestion: number
  hncReunion: number
  hncDerecho: number
}

interface Props {
  data: ReportRow[]
}

export default function ProfessionalsHNCTable({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="p-10 text-center text-slate-500">
        <p>Sin datos de consolidación.</p>
        <p className="text-xs mt-1">Aprueba encuestas y ejecuta la consolidación.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="table-dark">
        <thead>
          <tr>
            <th>Profesional</th>
            <th>Categoría</th>
            <th>Contratadas</th>
            <th>HNC Total</th>
            <th>HC Total</th>
            <th>% HNC</th>
            <th>% HC</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>
                <span className="text-white font-medium">
                  {row.professional.lastName}, {row.professional.firstName}
                </span>
              </td>
              <td>
                <span className="text-slate-400 text-xs">
                  {CATEGORY_LABELS[row.professional.category] || row.professional.category}
                </span>
              </td>
              <td className="text-slate-300">{formatHours(row.contractedHours)}</td>
              <td>
                <span className="text-indigo-400 font-medium">{formatHours(row.hncTotal)}</span>
              </td>
              <td>
                <span className="text-emerald-400 font-medium">{formatHours(row.hcTotal)}</span>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(row.hncPercentage, 100)}%`,
                        background: row.hncPercentage > 50 ? '#ef4444' : row.hncPercentage > 30 ? '#f59e0b' : '#6366f1',
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: row.hncPercentage > 50 ? '#fca5a5' : row.hncPercentage > 30 ? '#fcd34d' : '#a5b4fc' }}
                  >
                    {row.hncPercentage.toFixed(1)}%
                  </span>
                </div>
              </td>
              <td>
                <span className="text-emerald-400 text-sm font-medium">{row.hcPercentage.toFixed(1)}%</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
