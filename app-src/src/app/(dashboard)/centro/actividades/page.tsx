import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ActivityPillar } from '@prisma/client'
import { ClipboardList, Plus } from 'lucide-react'
import ActivityToggleButton from '@/components/activities/ActivityToggleButton'

export const metadata = { title: 'Catálogo de Actividades' }

const pillarConfig = {
  GESTION: { label: 'Gestión', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  REUNION: { label: 'Reuniones', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  DERECHO: { label: 'Derechos', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
}

export default async function ActividadesPage() {
  const session = await auth()
  const centerId = session!.user.healthCenterId!

  // Obtener actividades globales + las propias del centro
  const activities = await prisma.activity.findMany({
    where: {
      OR: [
        { healthCenterId: null },
        { healthCenterId: centerId },
      ],
    },
    orderBy: [{ pillar: 'asc' }, { order: 'asc' }],
  })

  const byPillar = {
    GESTION: activities.filter(a => a.pillar === ActivityPillar.GESTION),
    REUNION: activities.filter(a => a.pillar === ActivityPillar.REUNION),
    DERECHO: activities.filter(a => a.pillar === ActivityPillar.DERECHO),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Catálogo de Actividades</h1>
          <p className="text-slate-400 text-sm mt-1">
            {activities.length} actividades — Gestión, Reuniones y Derechos (HNC)
          </p>
        </div>
      </div>

      {(Object.entries(byPillar) as [keyof typeof byPillar, typeof activities][]).map(([pillar, acts]) => {
        const cfg = pillarConfig[pillar]
        return (
          <div key={pillar} className="card-premium overflow-hidden">
            <div
              className="p-5 flex items-center gap-3"
              style={{ borderBottom: '1px solid rgba(71,85,105,0.2)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: cfg.bg }}
              >
                <ClipboardList size={16} style={{ color: cfg.color }} />
              </div>
              <div>
                <h2 className="text-white font-semibold">{cfg.label}</h2>
                <p className="text-slate-500 text-xs">{acts.length} actividades</p>
              </div>
            </div>

            <div className="divide-y" style={{ borderColor: 'rgba(71,85,105,0.1)' }}>
              {acts.map(act => {
                const cats = Array.isArray(act.applicableCategories)
                  ? act.applicableCategories
                  : JSON.parse(act.applicableCategories as string || '[]')
                return (
                  <div
                    key={act.id}
                    className="flex items-start justify-between gap-4 px-5 py-4"
                    style={{ background: act.isActive ? 'transparent' : 'rgba(239,68,68,0.03)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white text-sm font-medium">{act.name}</span>
                        <span className="text-slate-600 font-mono text-xs">{act.code}</span>
                        {act.isObligatory && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                            Obligatoria
                          </span>
                        )}
                        {!act.healthCenterId && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7' }}>
                            Global
                          </span>
                        )}
                      </div>
                      {act.description && (
                        <p className="text-slate-500 text-xs mt-1">{act.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(cats as string[]).slice(0, 5).map(cat => (
                          <span key={cat} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(71,85,105,0.2)', color: '#94a3b8' }}>
                            {cat}
                          </span>
                        ))}
                        {cats.length > 5 && (
                          <span className="text-xs text-slate-600">+{cats.length - 5} más</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${act.isActive ? 'status-aprobada' : 'status-borrador'}`}>
                        {act.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
