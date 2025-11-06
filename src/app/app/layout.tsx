import { AuthGuard } from '@/components/auth/auth-guard'
import { OrgSelector } from '@/components/org-selector'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-white">
          <div className="container flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold">Planificateur</h1>
            <div className="flex items-center gap-4">
              <OrgSelector />
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  )
}
