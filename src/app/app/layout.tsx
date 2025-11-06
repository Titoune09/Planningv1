import { AuthGuard } from '@/components/auth/auth-guard'
import { AppHeader } from '@/components/app-header'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <AppHeader />
        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  )
}
