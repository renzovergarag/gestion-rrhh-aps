import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0b1120' }}>
      {/* Sidebar */}
      <Sidebar role={session.user.role} />

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
