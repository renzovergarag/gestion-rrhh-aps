'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatHours } from '@/lib/utils'

interface PillarData {
  name: string
  value: number
  color: string
}

interface Props {
  data: PillarData[]
  totalHNC: number
  totalHC: number
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(13, 21, 38, 0.98)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '12px',
          padding: '10px 14px',
        }}
      >
        <p style={{ color: '#cbd5e1', fontSize: '12px', marginBottom: '4px' }}>{payload[0].name}</p>
        <p style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 700 }}>{formatHours(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function HNCPieChart({ data, totalHNC, totalHC }: Props) {
  return (
    <div>
      <div className="flex justify-center gap-6 mb-4 text-sm">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{formatHours(totalHNC)}</p>
          <p className="text-slate-500 text-xs">Total HNC</p>
        </div>
        <div className="w-px" style={{ background: 'rgba(71,85,105,0.3)' }} />
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-400">{formatHours(totalHC)}</p>
          <p className="text-slate-500 text-xs">Total HC</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '8px' }}
            formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
