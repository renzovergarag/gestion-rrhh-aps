import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Users, Building2, ShieldCheck, UserCircle } from 'lucide-react'
import UserManagementTable from '@/components/users/UserManagementTable'

export const metadata = { title: 'Gestión de Usuarios' }

export default async function UsuariosPage() {
  const session = await auth()
  if (session?.user.role !== 'SUPER_ADMIN') {
    return <div className="text-red-400 p-8">Sin permisos</div>
  }

  const [users, centers] = await Promise.all([
    prisma.user.findMany({
      include: { healthCenter: { select: { name: true, code: true } } },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    }),
    prisma.healthCenter.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  const counts = {
    total: users.length,
    superAdmin: users.filter(u => u.role === 'SUPER_ADMIN').length,
    adminCentro: users.filter(u => u.role === 'ADMIN_CENTRO').length,
    profesional: users.filter(u => u.role === 'PROFESIONAL').length,
    active: users.filter(u => u.isActive).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
          <p className="text-slate-400 text-sm mt-1">{counts.total} usuarios registrados en el sistema</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Super Admins', value: counts.superAdmin, icon: ShieldCheck, color: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
          { label: 'Admin de Centro', value: counts.adminCentro, icon: Building2, color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
          { label: 'Profesionales', value: counts.profesional, icon: UserCircle, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
          { label: 'Activos', value: counts.active, icon: Users, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        ].map(s => (
          <div key={s.label} className="card-premium p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: s.bg }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
            <p className="text-slate-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabla de usuarios */}
      <UserManagementTable users={users} centers={centers} />
    </div>
  )
}
