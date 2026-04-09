'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Activity, Shield, Users } from 'lucide-react'

function LoginContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center p-12 overflow-hidden">
        {/* Fondo con gradiente */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 50%), #0f172a',
          }}
        />

        {/* Orbes decorativos */}
        <div
          className="absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'rgba(99,102,241,0.12)' }}
        />
        <div
          className="absolute bottom-20 right-20 w-64 h-64 rounded-full blur-3xl"
          style={{ background: 'rgba(139,92,246,0.1)' }}
        />

        <div className="relative z-10 text-center max-w-lg">
          {/* Logo */}
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Activity size={40} className="text-white" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Gestión RRHH APS
          </h1>
          <p className="text-xl text-gradient font-semibold mb-6">
            Cálculo HC y HNC
          </p>
          <p className="text-slate-400 text-base leading-relaxed mb-12">
            Plataforma centralizada para la gestión de Horas Clínicas y No Clínicas en los 
            centros de salud APS. Toma decisiones basadas en datos reales.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4 text-left">
            {[
              { icon: Shield, title: 'Acceso Multi-Rol', desc: 'Super Admin, Admin de Centro y Profesional' },
              { icon: Users, title: '30 Centros de Salud', desc: 'Datos segmentados por CESFAM' },
              { icon: Activity, title: 'Cálculo HC/HNC', desc: 'Consolidación automática en tiempo real' },
            ].map((f) => (
              <div key={f.title} className="glass rounded-xl p-4 flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(99,102,241,0.2)' }}
                >
                  <f.icon size={16} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{f.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <Activity size={32} className="text-white" />
            </div>
          </div>

          <div className="card-premium p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Iniciar Sesión</h2>
              <p className="text-slate-400 text-sm">
                Accede con tu cuenta institucional de Google
              </p>
            </div>

            {error && (
              <div
                className="mb-6 p-4 rounded-xl text-sm"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                }}
              >
                {error === 'inactive'
                  ? 'Tu cuenta está inactiva. Contacta al administrador.'
                  : 'Error al iniciar sesión. Por favor intenta nuevamente.'}
              </div>
            )}

            <button
              onClick={() => signIn('google', { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#f1f5f9',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
              }}
            >
              {/* Google Logo SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>

            <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(71,85,105,0.3)' }}>
              <p className="text-center text-xs text-slate-500">
                Solo usuarios autorizados por su centro de salud pueden acceder.
                <br />
                Contacta al administrador si no puedes ingresar.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            © {new Date().getFullYear()} Gestión RRHH APS — Sistema Multi-Tenant
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <LoginContent />
    </Suspense>
  )
}
