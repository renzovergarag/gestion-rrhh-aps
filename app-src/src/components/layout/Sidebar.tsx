'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  BarChart3,
  Calendar,
  Settings,
  Activity,
  UserCheck,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const superAdminNav: NavItem[] = [
  { label: 'Dashboard Global', href: '/super-admin', icon: LayoutDashboard },
  { label: 'Centros de Salud', href: '/super-admin/centros', icon: Building2 },
  { label: 'Usuarios', href: '/super-admin/usuarios', icon: Users },
  { label: 'Reportes Globales', href: '/super-admin/reportes', icon: BarChart3 },
]

const adminCentroNav: NavItem[] = [
  { label: 'Dashboard Centro', href: '/centro', icon: LayoutDashboard },
  { label: 'Profesionales', href: '/centro/profesionales', icon: UserCheck },
  { label: 'Actividades', href: '/centro/actividades', icon: ClipboardList },
  { label: 'Encuestas', href: '/centro/encuestas', icon: FileText },
  { label: 'Consolidación', href: '/centro/consolidacion', icon: BarChart3 },
  { label: 'Calendario', href: '/centro/calendario', icon: Calendar },
  { label: 'Reportes', href: '/centro/reportes', icon: Activity },
]

const profesionalNav: NavItem[] = [
  { label: 'Mi Disponibilidad', href: '/profesional', icon: LayoutDashboard },
  { label: 'Mis Encuestas', href: '/profesional/encuesta', icon: FileText },
  { label: 'Mi Calendario', href: '/profesional/calendario', icon: Calendar },
]

const navByRole: Record<string, NavItem[]> = {
  SUPER_ADMIN: superAdminNav,
  ADMIN_CENTRO: adminCentroNav,
  PROFESIONAL: profesionalNav,
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN_CENTRO: 'Admin Centro',
  PROFESIONAL: 'Profesional',
}

interface SidebarProps {
  role: string
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const navItems = navByRole[role] || profesionalNav

  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col h-full"
      style={{
        background: 'linear-gradient(180deg, #0d1526 0%, #0b1120 100%)',
        borderRight: '1px solid rgba(71, 85, 105, 0.2)',
      }}
    >
      {/* Logo */}
      <div className="p-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(71,85,105,0.2)' }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <Activity size={18} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">RRHH APS</p>
          <p className="text-indigo-400 text-xs font-medium">HC / HNC</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
          style={{
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span className="text-indigo-300 font-medium">{roleLabels[role]}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto space-y-1">
        <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest px-3 pb-2 pt-1">
          Menú Principal
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/super-admin' && item.href !== '/centro' && item.href !== '/profesional' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'sidebar-item group',
                isActive && 'active',
              )}
            >
              <item.icon size={17} className="flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} className="opacity-40" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(71,85,105,0.2)' }}>
        <Link href="/configuracion" className="sidebar-item">
          <Settings size={17} />
          <span>Configuración</span>
        </Link>
      </div>
    </aside>
  )
}
