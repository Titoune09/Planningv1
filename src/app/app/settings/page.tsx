'use client'

import { useCurrentOrg } from '@/hooks/use-org'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Building2, 
  Users, 
  Calendar, 
  Shield,
  Bell,
  Trash2
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
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
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="mt-2 text-muted-foreground">
          Gérer les paramètres de {currentOrg.name}
        </p>
      </div>

      {/* Navigation des paramètres */}
      <div className="space-y-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Informations générales</CardTitle>
            </div>
            <CardDescription>
              Modifier les informations de base de votre organisation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Nom de l&apos;organisation</Label>
              <Input 
                id="org-name" 
                defaultValue={currentOrg.name}
                disabled
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuseau horaire</Label>
                <Input 
                  id="timezone" 
                  defaultValue={currentOrg.timezone}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locale">Langue</Label>
                <Input 
                  id="locale" 
                  defaultValue={currentOrg.locale}
                  disabled
                />
              </div>
            </div>

            <Button disabled>Enregistrer les modifications</Button>
          </CardContent>
        </Card>

        {/* Jours ouvrés */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Jours et horaires d&apos;ouverture</CardTitle>
            </div>
            <CardDescription>
              Configurer les jours de travail et les segments horaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {currentOrg.settings.openDays.filter(d => d.isOpen).length} jour(s) d&apos;ouverture configuré(s)
            </p>
            <Button disabled>Modifier les horaires</Button>
          </CardContent>
        </Card>

        {/* Rôles */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Rôles et postes</CardTitle>
            </div>
            <CardDescription>
              Gérer les rôles disponibles dans votre organisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>Gérer les rôles</Button>
          </CardContent>
        </Card>

        {/* Membres et permissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Membres et permissions</CardTitle>
            </div>
            <CardDescription>
              Gérer les membres de l&apos;organisation et leurs permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>Gérer les membres</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configurer les préférences de notification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>Configurer les notifications</Button>
          </CardContent>
        </Card>

        {/* Zone de danger */}
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">Zone de danger</CardTitle>
            </div>
            <CardDescription>
              Actions irréversibles concernant votre organisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" disabled>
              Supprimer l&apos;organisation
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Note de développement */}
      <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-900">
          <strong>🚧 En développement :</strong> Les fonctionnalités d&apos;édition 
          des paramètres seront activées prochainement. Pour l&apos;instant, 
          les paramètres sont en lecture seule.
        </p>
      </div>
    </div>
  )
}
