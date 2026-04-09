'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface CenterData {
  id: string
  name: string
  code: string
  avgHNCPercentage: number
  avgHCPercentage: number
  totalProfessionals: number
  surveyed: number
}

interface Props {
  data: CenterData[]
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(13, 21, 38, 0.98)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
        }}
      >
        <p style={{ color: '#cbd5e1', fontSize: '12px', marginBottom: '8px' }}>{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: entry.color }} />
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>{entry.name}:</span>
            <span style={{ color: '#f1f5f9', fontSize: '12px', fontWeight: 600 }}>{entry.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function GlobalComparisonChart({ data }: Props) {
  const chartData = data.map((c) => ({
    name: c.code.replace('CESFAM_', 'C'),
    fullName: c.name,
    HNC: parseFloat(c.avgHNCPercentage.toFixed(1)),
    HC: parseFloat(c.avgHCPercentage.toFixed(1)),
  }))

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        <p>Sin datos de consolidación disponibles para este año.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.2)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(71,85,105,0.3)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
        <Legend
          wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '16px' }}
          formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
        />
        <Bar dataKey="HNC" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={20} />
        <Bar dataKey="HC" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}
