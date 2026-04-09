import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Gestión RRHH APS — HC y HNC',
    template: '%s | Gestión RRHH APS',
  },
  description:
    'Sistema multi-tenant para el cálculo y gestión de Horas Clínicas (HC) y Horas No Clínicas (HNC) en centros de salud APS.',
  keywords: ['APS', 'RRHH', 'horas clínicas', 'gestión', 'salud', 'CESFAM'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
