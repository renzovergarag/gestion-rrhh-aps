import { auth } from '@/lib/auth'
import { getProfessionals } from '@/actions/professionals'
import { CATEGORY_LABELS, CONTRACT_LABELS, formatHours } from '@/lib/utils'
import Link from 'next/link'
import { UserPlus, Search } from 'lucide-react'

export const metadata = { title: 'Profesionales' }

export default async function ProfesionalesPage() {
  const session = await auth()
  const centerId = session!.user.role === 'SUPER_ADMIN' ? undefined : session!.user.healthCenterId || undefined
  const professionals = await getProfessionals(centerId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Profesionales</h1>
          <p className="text-slate-400 text-sm mt-1">{professionals.length} profesionales registrados</p>
        </div>
        <Link href="/centro/profesionales/nuevo" className="btn-primary">
          <UserPlus size={16} />
          Nuevo Profesional
        </Link>
      </div>

      {/* Table */}
      <div className="card-premium overflow-hidden">
        <div className="p-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(71,85,105,0.2)' }}>
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Buscar profesional..."
              className="input-dark pl-9 py-2 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Categoría</th>
                <th>Contrato</th>
                <th>Hrs/Semana</th>
                <th>Disponible/Sem.</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {professionals.map((prof) => {
                const wc = prof.workConfigs[0]
                return (
                  <tr key={prof.id}>
                    <td>
                      <div>
                        <p className="text-white font-medium">{prof.firstName} {prof.lastName}</p>
                        {session!.user.role === 'SUPER_ADMIN' && (
                          <p className="text-xs text-slate-500">{prof.healthCenter.name}</p>
                        )}
                      </div>
                    </td>
                    <td className="text-slate-400 text-sm font-mono">{prof.rut}</td>
                    <td>
                      <span className="badge-gestion text-xs px-2 py-0.5 rounded-full">
                        {CATEGORY_LABELS[prof.category] || prof.category}
                      </span>
                    </td>
                    <td className="text-slate-400 text-xs">{CONTRACT_LABELS[prof.contractType]}</td>
                    <td className="text-center text-slate-300 text-sm">{prof.weeklyHours}h</td>
                    <td className="text-center">
                      <span className="text-emerald-400 text-sm font-medium">
                        {wc ? formatHours(wc.availableHoursWeek) : '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${prof.isActive ? 'status-aprobada' : 'status-borrador'}`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
                        {prof.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/centro/profesionales/${prof.id}`}
                          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                          style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}
                        >
                          Ver perfil
                        </Link>
                        <Link
                          href={`/centro/profesionales/${prof.id}/disponibilidad`}
                          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                          style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.2)' }}
                        >
                          HC/HNC
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {professionals.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No hay profesionales registrados.{' '}
                    <Link href="/centro/profesionales/nuevo" className="text-indigo-400 underline">
                      Registrar primero
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
