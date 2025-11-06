'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { OrgSelector } from '@/components/org-selector'
import { 
  User, 
  LogOut, 
  Settings, 
  Calendar,
  Users,
  FileText,
  Home
} from 'lucide-react'
import Link from 'next/link'

export function AppHeader() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Erreur de déconnexion:', error)
    }
  }

  // Obtenir les initiales de l'utilisateur
  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  const userEmail = user?.email || ''
  const userInitials = userEmail ? getInitials(userEmail) : '??'
  const displayName = user?.displayName || userEmail

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo et navigation */}
        <div className="flex items-center gap-6">
          <Link href="/app" className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Planificateur</h1>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app">
                <Home className="h-4 w-4 mr-2" />
                Accueil
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/planning">
                <Calendar className="h-4 w-4 mr-2" />
                Planning
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/leaves">
                <FileText className="h-4 w-4 mr-2" />
                Congés
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/employees">
                <Users className="h-4 w-4 mr-2" />
                Employés
              </Link>
            </Button>
          </nav>
        </div>

        {/* Organisation et utilisateur */}
        <div className="flex items-center gap-4">
          <OrgSelector />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.photoURL || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.displayName || 'Utilisateur'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/app/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/app/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
