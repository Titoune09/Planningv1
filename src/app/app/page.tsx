'use client'

import { useCurrentOrg } from '@/hooks/use-org'
import { Button } from '@/components/ui/button'
import { Calendar, Users, FileText, Settings } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function AppHomePage() {
  const { currentOrg, isLoading } = useCurrentOrg()

  if (isLoading) {
    return <div className="container py-8">Chargement...</div>
  }

  if (!currentOrg) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Bienvenue !</h2>
          <p className="mt-2 text-muted-foreground">
            Vous n&apos;avez pas encore d&apos;organisation.
          </p>
          <Button asChild className="mt-4">
            <Link href="/onboarding">Créer une organisation</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header avec statistiques */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold">{currentOrg.name}</h2>
        <p className="mt-2 text-muted-foreground">
          Bienvenue dans votre espace de gestion
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Employés</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">-</p>
          <p className="text-xs text-muted-foreground">Aucune donnée</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Demandes de congés</p>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">-</p>
          <p className="text-xs text-muted-foreground">En attente</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Plannings publiés</p>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">-</p>
          <p className="text-xs text-muted-foreground">Ce mois</p>
        </div>
      </div>

      {/* Actions rapides */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Actions rapides</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/app/planning"
          className="block rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
        >
          <Calendar className="h-8 w-8 text-primary" />
          <h3 className="mt-4 font-semibold">Planning</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Gérer les horaires de travail
          </p>
        </Link>

        <Link
          href="/app/employees"
          className="block rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
        >
          <Users className="h-8 w-8 text-primary" />
          <h3 className="mt-4 font-semibold">Employés</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Gérer l&apos;équipe
          </p>
        </Link>

        <Link
          href="/app/leaves"
          className="block rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
        >
          <FileText className="h-8 w-8 text-primary" />
          <h3 className="mt-4 font-semibold">Congés</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Gérer les demandes d&apos;absence
          </p>
        </Link>

        <Link
          href="/app/settings"
          className="block rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
        >
          <Settings className="h-8 w-8 text-primary" />
          <h3 className="mt-4 font-semibold">Paramètres</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Configuration de l&apos;organisation
          </p>
        </Link>
      </div>
    </div>
  )
}
