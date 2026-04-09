import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.healthCenterId = token.healthCenterId as string | null
        session.user.isActive = token.isActive as boolean
      }
      return session
    },
  },
} satisfies NextAuthConfig
