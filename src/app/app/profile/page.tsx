'use client'

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, Shield, Key } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mon profil</h1>
        <p className="mt-2 text-muted-foreground">
          Gérer vos informations personnelles
        </p>
      </div>

      <div className="space-y-6">
        {/* Photo et informations principales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>
              Vos informations de compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials(user.email || '')}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm" disabled>
                  Changer la photo
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG ou GIF. Max 2MB.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Nom d&apos;affichage</Label>
                <Input
                  id="display-name"
                  defaultValue={user.displayName || ''}
                  placeholder="Votre nom"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user.email || ''}
                    disabled
                  />
                  {user.emailVerified ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      ✓ Vérifié
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                      Non vérifié
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button disabled>Enregistrer les modifications</Button>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Sécurité</CardTitle>
            </div>
            <CardDescription>
              Gérer votre mot de passe et la sécurité de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Mot de passe</p>
                  <p className="text-xs text-muted-foreground">
                    Dernière modification: inconnue
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Modifier
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email de vérification</p>
                  <p className="text-xs text-muted-foreground">
                    {user.emailVerified ? 'Email vérifié' : 'Email non vérifié'}
                  </p>
                </div>
              </div>
              {!user.emailVerified && (
                <Button variant="outline" size="sm" disabled>
                  Renvoyer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informations du compte */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID utilisateur:</span>
              <span className="font-mono text-xs">{user.uid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Créé le:</span>
              <span>{user.metadata.creationTime || 'Inconnu'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dernière connexion:</span>
              <span>{user.metadata.lastSignInTime || 'Inconnu'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Note de développement */}
      <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-900">
          <strong>🚧 En développement :</strong> Les fonctionnalités d&apos;édition 
          du profil seront activées prochainement. Pour l&apos;instant, 
          les informations sont en lecture seule.
        </p>
      </div>
    </div>
  )
}
