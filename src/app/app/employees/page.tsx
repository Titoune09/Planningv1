'use client'

import { useCurrentOrg } from '@/hooks/use-org'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Plus, UserPlus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function EmployeesPage() {
  const { currentOrg, isLoading } = useCurrentOrg()

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="mt-2 h-4 w-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!currentOrg) {
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">Sélectionnez une organisation</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employés</h1>
          <p className="mt-2 text-muted-foreground">
            Gérer les membres de votre équipe
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Inviter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel employé
          </Button>
        </div>
      </div>

      {/* État vide */}
      <Card>
        <CardContent className="py-16 text-center">
          <Users className="mx-auto h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Aucun employé</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Commencez par ajouter des employés à votre organisation. 
            Vous pourrez ensuite leur assigner des rôles et gérer leurs plannings.
          </p>
          
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un employé
            </Button>
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Inviter par email
            </Button>
          </div>

          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 max-w-2xl mx-auto">
            <p className="text-sm text-blue-900">
              <strong>💡 Astuce :</strong> Vous pouvez créer des profils d&apos;employés sans compte,
              puis leur envoyer une invitation pour qu&apos;ils puissent accéder à l&apos;application
              et faire des demandes de congés.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Note de développement */}
      <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-900">
          <strong>🚧 En développement :</strong> La page complète de gestion des employés
          avec CRUD, recherche et filtres sera implémentée prochainement.
        </p>
      </div>
    </div>
  )
}
