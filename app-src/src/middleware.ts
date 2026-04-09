import { NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import type { NextRequest } from 'next/server'

const { auth } = NextAuth(authConfig)

const publicPaths = ['/login', '/api/auth']

const routePermissions: { path: string; roles: string[] }[] = [
  { path: '/super-admin', roles: ['SUPER_ADMIN'] },
  { path: '/centro', roles: ['SUPER_ADMIN', 'ADMIN_CENTRO'] },
  { path: '/profesional', roles: ['SUPER_ADMIN', 'ADMIN_CENTRO', 'PROFESIONAL'] },
]

export default auth((req) => {
  const pathname = req.nextUrl.pathname

  // Permitir rutas públicas
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const session = req.auth

  // No autenticado → login
  if (!session?.user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const isActive = session.user.isActive
  if (isActive === false) {
    return NextResponse.redirect(new URL('/login?error=inactive', req.url))
  }

  const userRole: string = session.user.role
  if (!userRole) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Verificar permisos por ruta
  for (const route of routePermissions) {
    if (pathname.startsWith(route.path)) {
      if (!route.roles.includes(userRole)) {
        if (userRole === 'SUPER_ADMIN') return NextResponse.redirect(new URL('/super-admin', req.url))
        if (userRole === 'ADMIN_CENTRO') return NextResponse.redirect(new URL('/centro', req.url))
        return NextResponse.redirect(new URL('/profesional', req.url))
      }
      break
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
