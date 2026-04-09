
// Prisma config — carga .env.local para compatibilidad con Next.js
import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Next.js usa .env.local para variables locales; lo cargamos explícitamente
config({ path: '.env.local', override: true })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
