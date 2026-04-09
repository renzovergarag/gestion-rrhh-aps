import { getHealthCenters } from '@/actions/health-centers'
import { Building2, Plus, Users, Activity } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Centros de Salud' }

export default async function CentrosPage() {
  const centers = await getHealthCenters()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Centros de Salud</h1>
          <p className="text-slate-400 text-sm mt-1">{centers.length} centros registrados</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} />
          Nuevo Centro
        </button>
      </div>

      {/* Grid de centros */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {centers.map((center) => (
          <div key={center.id} className="card-premium p-5 glass-hover">
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.15)' }}
              >
                <Building2 size={20} className="text-indigo-400" />
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  center.isActive ? 'status-aprobada' : 'status-borrador'
                }`}
              >
                {center.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <h3 className="text-white font-semibold text-sm leading-tight mb-1">{center.name}</h3>
            <p className="text-slate-500 text-xs mb-3 font-mono">{center.code}</p>

            <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
              <span>{center.commune}</span>
              <span>·</span>
              <span>{center.region}</span>
            </div>

            <div className="flex items-center gap-4 pt-3" style={{ borderTop: '1px solid rgba(71,85,105,0.2)' }}>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Activity size={12} className="text-indigo-400" />
                <span>{center._count.professionals} profesionales</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Users size={12} className="text-emerald-400" />
                <span>{center._count.users} usuarios</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
