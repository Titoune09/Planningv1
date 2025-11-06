'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createOrg } from '@/lib/firebase-client'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STEPS = [
  { id: 1, name: 'Identité', description: 'Informations de base' },
  { id: 2, name: 'Jours ouvrés', description: 'Configuration des horaires' },
  { id: 3, name: 'Rôles', description: 'Postes de travail' },
  { id: 4, name: 'Employés', description: 'Équipe initiale' },
  { id: 5, name: 'Gabarits', description: 'Modèles de planning' },
  { id: 6, name: 'Validation', description: 'Récapitulatif' },
]

type OnboardingData = {
  name: string
  industry:
    | 'restaurant'
    | 'retail'
    | 'healthcare'
    | 'agency'
    | 'events'
    | 'other'
  timezone: string
  locale: string
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    name: '',
    industry: 'restaurant',
    timezone: 'Europe/Paris',
    locale: 'fr-FR',
  })

  const router = useRouter()
  const { toast } = useToast()

  const progress = (currentStep / STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = async () => {
    setIsSubmitting(true)
    try {
      const result = await createOrg({
        name: data.name,
        industry: data.industry,
        timezone: data.timezone,
        locale: data.locale,
      })

      if (result.data.success) {
        toast({
          title: 'Organisation créée !',
          description: `${data.name} a été créé avec succès.`,
        })
        router.push('/app')
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'organisation.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Créer votre organisation</h1>
            <p className="mt-2 text-muted-foreground">
              Configurez votre espace de travail en quelques étapes
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="font-medium">
                Étape {currentStep} sur {STEPS.length}
              </span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Stepper */}
          <div className="mb-8 hidden md:flex md:justify-between">
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    step.id < currentStep
                      ? 'bg-primary text-white'
                      : step.id === currentStep
                      ? 'border-2 border-primary bg-white text-primary'
                      : 'border-2 border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {step.id < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium">{step.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
              <CardDescription>
                {STEPS[currentStep - 1].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <Step1
                  data={data}
                  onChange={(updates) => setData({ ...data, ...updates })}
                />
              )}
              {currentStep === 2 && <Step2Placeholder />}
              {currentStep === 3 && <Step3Placeholder />}
              {currentStep === 4 && <Step4Placeholder />}
              {currentStep === 5 && <Step5Placeholder />}
              {currentStep === 6 && <Step6 data={data} />}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>
            {currentStep < STEPS.length ? (
              <Button onClick={handleNext}>
                Suivant
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={isSubmitting}>
                {isSubmitting ? 'Création...' : 'Terminer'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

// === STEP 1: IDENTITÉ ===
function Step1({
  data,
  onChange,
}: {
  data: OnboardingData
  onChange: (updates: Partial<OnboardingData>) => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom de l&apos;organisation *</Label>
        <Input
          id="name"
          placeholder="Ex: Restaurant Le Gourmet"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Type d&apos;activité</Label>
        <Select
          value={data.industry}
          onValueChange={(value) =>
            onChange({
              industry: value as OnboardingData['industry'],
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="restaurant">Restauration</SelectItem>
            <SelectItem value="retail">Commerce / Retail</SelectItem>
            <SelectItem value="healthcare">Santé / Soins</SelectItem>
            <SelectItem value="agency">Agence</SelectItem>
            <SelectItem value="events">Événementiel</SelectItem>
            <SelectItem value="other">Autre</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Cela permet d&apos;initialiser des rôles et horaires adaptés
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="timezone">Fuseau horaire</Label>
          <Select
            value={data.timezone}
            onValueChange={(value) => onChange({ timezone: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
              <SelectItem value="America/New_York">
                America/New_York (EST)
              </SelectItem>
              <SelectItem value="America/Los_Angeles">
                America/Los_Angeles (PST)
              </SelectItem>
              <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="locale">Langue</Label>
          <Select
            value={data.locale}
            onValueChange={(value) => onChange({ locale: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr-FR">Français</SelectItem>
              <SelectItem value="en-US">English</SelectItem>
              <SelectItem value="es-ES">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

// Placeholders pour les autres étapes
function Step2Placeholder() {
  return (
    <div className="py-8 text-center text-muted-foreground">
      <p>Configuration des jours ouvrés (à implémenter)</p>
      <p className="mt-2 text-sm">
        Sélection des jours, heures d&apos;ouverture et segments horaires
      </p>
    </div>
  )
}

function Step3Placeholder() {
  return (
    <div className="py-8 text-center text-muted-foreground">
      <p>Création des rôles (à implémenter)</p>
      <p className="mt-2 text-sm">
        Définir les postes de travail avec couleurs et contraintes
      </p>
    </div>
  )
}

function Step4Placeholder() {
  return (
    <div className="py-8 text-center text-muted-foreground">
      <p>Ajout des employés (à implémenter)</p>
      <p className="mt-2 text-sm">
        Créer les profils d&apos;employés avec rôles et contrats
      </p>
    </div>
  )
}

function Step5Placeholder() {
  return (
    <div className="py-8 text-center text-muted-foreground">
      <p>Gabarits d&apos;horaires (à implémenter)</p>
      <p className="mt-2 text-sm">
        Définir des modèles de planning réutilisables
      </p>
    </div>
  )
}

// === STEP 6: VALIDATION ===
function Step6({ data }: { data: OnboardingData }) {
  const industryLabels = {
    restaurant: 'Restauration',
    retail: 'Commerce / Retail',
    healthcare: 'Santé / Soins',
    agency: 'Agence',
    events: 'Événementiel',
    other: 'Autre',
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted p-4">
        <h3 className="font-semibold">Récapitulatif</h3>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Organisation :</span>
            <span className="font-medium">{data.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type d&apos;activité :</span>
            <span className="font-medium">{industryLabels[data.industry]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fuseau horaire :</span>
            <span className="font-medium">{data.timezone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Langue :</span>
            <span className="font-medium">{data.locale}</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Note :</strong> Après création, vous pourrez compléter la
          configuration (jours ouvrés, rôles, employés) depuis les paramètres.
        </p>
      </div>
    </div>
  )
}
