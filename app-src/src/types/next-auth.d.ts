import { DefaultSession } from 'next-auth'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      healthCenterId: string | null
      isActive: boolean
    } & DefaultSession['user']
  }

  interface User {
    role?: UserRole
    healthCenterId?: string | null
    isActive?: boolean
  }
}
