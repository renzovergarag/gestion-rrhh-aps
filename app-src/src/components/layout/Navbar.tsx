'use client'

import { signOut } from 'next-auth/react'
import { LogOut, Bell, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface NavbarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
    healthCenterId?: string | null
  }
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: '#818cf8',
  ADMIN_CENTRO: '#34d399',
  PROFESIONAL: '#60a5fa',
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrador',
  ADMIN_CENTRO: 'Admin de Centro',
  PROFESIONAL: 'Profesional',
}

export default function Navbar({ user }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header
      className="h-16 flex items-center justify-between px-6 flex-shrink-0"
      style={{
        background: 'rgba(11, 17, 32, 0.9)',
        borderBottom: '1px solid rgba(71,85,105,0.2)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Left: Breadcrumb area */}
      <div className="flex items-center gap-2">
        <div
          className="h-6 w-1 rounded-full"
          style={{ background: 'linear-gradient(180deg, #6366f1, #8b5cf6)' }}
        />
        <span className="text-slate-400 text-sm font-medium">
          Sistema de Gestión RRHH APS
        </span>
      </div>

      {/* Right: Actions + User */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Bell size={16} className="text-slate-400" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: '#6366f1' }}
          />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
            style={{
              background: menuOpen ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || 'Avatar'}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {user.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="text-left">
              <p className="text-white text-sm font-medium leading-tight">{user.name || 'Usuario'}</p>
              <p className="text-xs font-medium" style={{ color: roleColors[user.role] }}>
                {roleLabels[user.role]}
              </p>
            </div>
            <ChevronDown
              size={14}
              className="text-slate-500 transition-transform"
              style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-64 rounded-xl p-1 z-50 animate-fade-in"
              style={{
                background: 'rgba(13, 21, 38, 0.98)',
                border: '1px solid rgba(71,85,105,0.4)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="px-3 py-3 mb-1" style={{ borderBottom: '1px solid rgba(71,85,105,0.2)' }}>
                <p className="text-white text-sm font-medium">{user.name}</p>
                <p className="text-slate-500 text-xs">{user.email}</p>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 transition-colors"
                style={{ ':hover': { background: 'rgba(239,68,68,0.1)' } } as React.CSSProperties}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={15} />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
