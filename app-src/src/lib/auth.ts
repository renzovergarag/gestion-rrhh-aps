import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { authConfig } from '@/lib/auth.config'

console.log('--- AUTH INIT ---')
console.log('AUTH_GOOGLE_ID:', process.env.AUTH_GOOGLE_ID ? 'SET' : 'UNDEFINED')
console.log('AUTH_GOOGLE_SECRET:', process.env.AUTH_GOOGLE_SECRET ? 'SET' : 'UNDEFINED')
console.log('AUTH_SECRET:', process.env.AUTH_SECRET ? 'SET' : 'UNDEFINED')

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  debug: true,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, healthCenterId: true, isActive: true },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.healthCenterId = dbUser.healthCenterId
          token.isActive = dbUser.isActive
        }
      }
      return token
    },
    async signIn({ user }) {
      // Verificar si el usuario existe y está activo
      if (!user.email) return false
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { isActive: true },
      })
      // Si el usuario no existe, se crea automáticamente por el adapter
      // Si existe, verificar que esté activo
      if (dbUser && !dbUser.isActive) return false
      return true
    },
  },
})
