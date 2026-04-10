'use client'

import { useState, useTransition } from 'react'
import { updateUserRole, toggleUserStatus } from '@/actions/users'
import { ShieldCheck, Building2, UserCircle, Power, ChevronDown } from 'lucide-react'

type User = {
  id: string
  email: string
  name: string | null
  role: string
  isActive: boolean
  healthCenter: { name: string; code: string } | null
}

type Center = { id: string; name: string }

const roleColors: Record<string, string> = {
  SUPER_ADMIN: '#818cf8',
  ADMIN_CENTRO: '#34d399',
  PROFESIONAL: '#60a5fa',
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN_CENTRO: 'Admin Centro',
  PROFESIONAL: 'Profesional',
}

const RoleIcon: Record<string, React.ElementType> = {
  SUPER_ADMIN: ShieldCheck,
  ADMIN_CENTRO: Building2,
  PROFESIONAL: UserCircle,
}

interface Props {
  users: User[]
  centers: Center[]
}

export default function UserManagementTable({ users: initialUsers, centers }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newRole, setNewRole] = useState('')
  const [newCenter, setNewCenter] = useState('')

  const handleToggle = (userId: string) => {
    startTransition(async () => {
      await toggleUserStatus(userId)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u))
    })
  }

  const handleRoleUpdate = (userId: string) => {
    startTransition(async () => {
      await updateUserRole(userId, newRole, newRole !== 'SUPER_ADMIN' ? newCenter : undefined)
      setUsers(prev => prev.map(u => {
        if (u.id !== userId) return u
        const center = centers.find(c => c.id === newCenter)
        return {
          ...u,
          role: newRole,
          healthCenter: center ? { name: center.name, code: '' } : null,
        }
      }))
      setEditingId(null)
    })
  }

  return (
    <div className="card-premium overflow-hidden">
      <div className="p-5" style={{ borderBottom: '1px solid rgba(71,85,105,0.2)' }}>
        <h2 className="text-white font-semibold">Todos los Usuarios</h2>
        <p className="text-slate-500 text-xs mt-1">Administra roles y centros asignados</p>
      </div>
      <div className="overflow-x-auto">
        <table className="table-dark">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Centro Asignado</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const Icon = RoleIcon[user.role] || UserCircle
              const isEditing = editingId === user.id
              return (
                <tr key={user.id}>
                  <td>
                    <div>
                      <p className="text-white font-medium text-sm">{user.name || '—'}</p>
                      <p className="text-slate-500 text-xs">{user.email}</p>
                    </div>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: roleColors[user.role] }}>
                      <Icon size={12} />
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="text-slate-400 text-sm">
                    {user.healthCenter?.name || <span className="text-slate-600 italic">Global</span>}
                  </td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.isActive ? 'status-aprobada' : 'status-rechazada'}`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={newRole}
                          onChange={e => setNewRole(e.target.value)}
                          className="input-dark text-xs py-1"
                        >
                          <option value="SUPER_ADMIN">Super Admin</option>
                          <option value="ADMIN_CENTRO">Admin Centro</option>
                          <option value="PROFESIONAL">Profesional</option>
                        </select>
                        {newRole !== 'SUPER_ADMIN' && (
                          <select
                            value={newCenter}
                            onChange={e => setNewCenter(e.target.value)}
                            className="input-dark text-xs py-1"
                          >
                            <option value="">— Centro —</option>
                            {centers.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        )}
                        <button
                          onClick={() => handleRoleUpdate(user.id)}
                          disabled={isPending}
                          className="btn-primary text-xs py-1 px-3"
                        >
                          {isPending ? '…' : 'Guardar'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn-secondary text-xs py-1 px-3"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingId(user.id)
                            setNewRole(user.role)
                            setNewCenter('')
                          }}
                          className="btn-secondary text-xs py-1 px-2.5"
                        >
                          Editar rol
                        </button>
                        <button
                          onClick={() => handleToggle(user.id)}
                          disabled={isPending}
                          className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                          style={{
                            background: user.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                            border: user.isActive ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.3)',
                            color: user.isActive ? '#fca5a5' : '#6ee7b7',
                          }}
                        >
                          <Power size={12} className="inline mr-1" />
                          {user.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
