'use client'

import { useState, useEffect } from 'react'
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
import { ChevronLeft, ChevronRight, Check, Plus, Trash2 } from 'lucide-react'
import type { OpenDay, TimeSegment } from '@/types/firestore'

export const dynamic = 'force-dynamic'

const STEPS = [
  { id: 1, name: 'Identité', description: 'Informations de base' },
  { id: 2, name: 'Jours ouvrés', description: 'Configuration des horaires' },
  { id: 3, name: 'Rôles', description: 'Postes de travail' },
  { id: 4, name: 'Employés', description: 'Équipe initiale' },
  { id: 5, name: 'Gabarits', description: 'Modèles de planning' },
  { id: 6, name: 'Validation', description: 'Récapitulatif' },
]

type RoleData = {
  name: string
  color: string
  level?: number
}

type EmployeeData = {
  firstName: string
  lastName: string
  roles: string[] // Indices dans le tableau roles
  contractType: 'cdi' | 'cdd' | 'extra' | 'interim' | 'stage'
}

type TemplateData = {
  name: string
  season?: 'low' | 'high' | 'normal'
  matrix: {
    [day: string]: {
      [segmentName: string]: {
        roleIndex: number // Index dans le tableau roles
        count: number
      }[]
    }
  }
}

type OnboardingData = {
  // Étape 1
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
  // Étape 2
  openDays: OpenDay[]
  // Étape 3
  roles: RoleData[]
  // Étape 4
  employees: EmployeeData[]
  // Étape 5
  templates: TemplateData[]
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    name: '',
    industry: 'restaurant',
    timezone: 'Europe/Paris',
    locale: 'fr-FR',
    openDays: [],
    roles: [],
    employees: [],
    templates: [],
  })

  // Initialiser les données par défaut au montage du composant
  useEffect(() => {
    if (data.openDays.length === 0 && data.roles.length === 0) {
      const defaultOpenDays = getDefaultOpenDays(data.industry)
      const defaultRoles = getDefaultRoles(data.industry)
      setData((prev) => ({
        ...prev,
        openDays: defaultOpenDays,
        roles: defaultRoles,
      }))
    }
  }, [])

  // Initialiser les données par défaut lors du changement d'industrie
  const initializeDefaults = (industry: OnboardingData['industry']) => {
    const defaultOpenDays = getDefaultOpenDays(industry)
    const defaultRoles = getDefaultRoles(industry)
    setData((prev) => ({
      ...prev,
      industry,
      openDays: defaultOpenDays,
      roles: defaultRoles,
    }))
  }

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
    // Validation de base
    if (!data.name.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom de l\'organisation est requis',
        variant: 'destructive',
      })
      return
    }

    if (data.roles.length === 0) {
      toast({
        title: 'Attention',
        description: 'Vous devez définir au moins un rôle',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      console.log('🚀 Tentative de création d\'organisation:', {
        name: data.name,
        industry: data.industry,
        rolesCount: data.roles.length,
        employeesCount: data.employees.length,
        templatesCount: data.templates.length,
      })

      const result = await createOrg({
        name: data.name,
        industry: data.industry,
        timezone: data.timezone,
        locale: data.locale,
        openDays: data.openDays,
        roles: data.roles,
        employees: data.employees,
        templates: data.templates,
      })

      console.log('✅ Résultat de la création:', result)

      if (result.data.success) {
        toast({
          title: 'Organisation créée !',
          description: `${data.name} a été créé avec succès.`,
        })
        router.push('/app')
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la création:', error)
      
      // Extraire le message d'erreur détaillé
      let errorMessage = 'Impossible de créer l\'organisation.'
      
      if (error.code) {
        errorMessage = `Erreur ${error.code}: ${error.message || errorMessage}`
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: 'Erreur',
        description: errorMessage,
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
                  onChange={(updates) => {
                    setData({ ...data, ...updates })
                    // Initialiser les valeurs par défaut si l'industrie change
                    if (updates.industry && updates.industry !== data.industry) {
                      initializeDefaults(updates.industry)
                    }
                  }}
                />
              )}
              {currentStep === 2 && (
                <Step2
                  data={data}
                  onChange={(updates) => setData({ ...data, ...updates })}
                />
              )}
              {currentStep === 3 && (
                <Step3
                  data={data}
                  onChange={(updates) => setData({ ...data, ...updates })}
                />
              )}
              {currentStep === 4 && (
                <Step4
                  data={data}
                  onChange={(updates) => setData({ ...data, ...updates })}
                />
              )}
              {currentStep === 5 && (
                <Step5
                  data={data}
                  onChange={(updates) => setData({ ...data, ...updates })}
                />
              )}
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

// Fonctions helper pour obtenir les valeurs par défaut
function getDefaultOpenDays(
  industry: OnboardingData['industry']
): OpenDay[] {
  const segments = getDefaultSegments(industry)

  return [
    { day: 1, isOpen: true, segments }, // Lundi
    { day: 2, isOpen: true, segments }, // Mardi
    { day: 3, isOpen: true, segments }, // Mercredi
    { day: 4, isOpen: true, segments }, // Jeudi
    { day: 5, isOpen: true, segments }, // Vendredi
    { day: 6, isOpen: true, segments }, // Samedi
    { day: 0, isOpen: industry === 'restaurant', segments }, // Dimanche
  ]
}

function getDefaultSegments(industry: OnboardingData['industry']): TimeSegment[] {
  switch (industry) {
    case 'restaurant':
      return [
        { name: 'Midi', start: '11:30', end: '15:00' },
        { name: 'Soir', start: '18:30', end: '23:00' },
      ]
    case 'retail':
      return [
        { name: 'Matin', start: '09:00', end: '13:00' },
        { name: 'Après-midi', start: '13:00', end: '18:00' },
      ]
    case 'healthcare':
      return [
        { name: 'Matin', start: '06:00', end: '14:00' },
        { name: 'Après-midi', start: '14:00', end: '22:00' },
        { name: 'Nuit', start: '22:00', end: '06:00' },
      ]
    default:
      return [{ name: 'Journée', start: '09:00', end: '17:00' }]
  }
}

function getDefaultRoles(
  industry: OnboardingData['industry']
): RoleData[] {
  switch (industry) {
    case 'restaurant':
      return [
        { name: 'Serveur', color: '#3b82f6', level: 1 },
        { name: 'Chef', color: '#ef4444', level: 3 },
        { name: 'Commis', color: '#8b5cf6', level: 1 },
        { name: 'Manager', color: '#10b981', level: 4 },
      ]
    case 'retail':
      return [
        { name: 'Vendeur', color: '#3b82f6', level: 1 },
        { name: 'Caissier', color: '#8b5cf6', level: 1 },
        { name: 'Manager', color: '#10b981', level: 3 },
      ]
    case 'healthcare':
      return [
        { name: 'Infirmier', color: '#3b82f6', level: 2 },
        { name: 'Aide-soignant', color: '#8b5cf6', level: 1 },
        { name: 'Médecin', color: '#ef4444', level: 4 },
      ]
    default:
      return [
        { name: 'Employé', color: '#3b82f6', level: 1 },
        { name: 'Manager', color: '#10b981', level: 2 },
      ]
  }
}

const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

// === STEP 2: JOURS OUVRÉS ===
function Step2({
  data,
  onChange,
}: {
  data: OnboardingData
  onChange: (updates: Partial<OnboardingData>) => void
}) {
  const toggleDay = (dayIndex: number) => {
    const newOpenDays = [...data.openDays]
    const day = newOpenDays.find((d) => d.day === dayIndex)
    if (day) {
      day.isOpen = !day.isOpen
    }
    onChange({ openDays: newOpenDays })
  }

  const updateSegment = (
    dayIndex: number,
    segmentIndex: number,
    updates: Partial<TimeSegment>
  ) => {
    const newOpenDays = [...data.openDays]
    const day = newOpenDays.find((d) => d.day === dayIndex)
    if (day && day.segments[segmentIndex]) {
      day.segments[segmentIndex] = {
        ...day.segments[segmentIndex],
        ...updates,
      }
      onChange({ openDays: newOpenDays })
    }
  }

  const addSegment = (dayIndex: number) => {
    const newOpenDays = [...data.openDays]
    const day = newOpenDays.find((d) => d.day === dayIndex)
    if (day) {
      day.segments.push({
        name: 'Nouveau segment',
        start: '09:00',
        end: '17:00',
      })
      onChange({ openDays: newOpenDays })
    }
  }

  const removeSegment = (dayIndex: number, segmentIndex: number) => {
    const newOpenDays = [...data.openDays]
    const day = newOpenDays.find((d) => d.day === dayIndex)
    if (day && day.segments.length > 1) {
      day.segments.splice(segmentIndex, 1)
      onChange({ openDays: newOpenDays })
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Sélectionnez vos jours d&apos;ouverture et configurez les segments horaires
      </p>

      <div className="space-y-4">
        {data.openDays.map((openDay) => (
          <div
            key={openDay.day}
            className="rounded-lg border p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={openDay.isOpen}
                  onChange={() => toggleDay(openDay.day)}
                  className="h-4 w-4"
                />
                <span className="font-medium">{dayNames[openDay.day]}</span>
              </div>
              {openDay.isOpen && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSegment(openDay.day)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter un segment
                </Button>
              )}
            </div>

            {openDay.isOpen && (
              <div className="mt-3 space-y-2">
                {openDay.segments.map((segment, segmentIndex) => (
                  <div
                    key={segmentIndex}
                    className="flex items-center gap-2"
                  >
                    <Input
                      placeholder="Nom"
                      value={segment.name}
                      onChange={(e) =>
                        updateSegment(openDay.day, segmentIndex, {
                          name: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                    <Input
                      type="time"
                      value={segment.start}
                      onChange={(e) =>
                        updateSegment(openDay.day, segmentIndex, {
                          start: e.target.value,
                        })
                      }
                      className="w-32"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="time"
                      value={segment.end}
                      onChange={(e) =>
                        updateSegment(openDay.day, segmentIndex, {
                          end: e.target.value,
                        })
                      }
                      className="w-32"
                    />
                    {openDay.segments.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSegment(openDay.day, segmentIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// === STEP 3: RÔLES ===
function Step3({
  data,
  onChange,
}: {
  data: OnboardingData
  onChange: (updates: Partial<OnboardingData>) => void
}) {
  const updateRole = (index: number, updates: Partial<RoleData>) => {
    const newRoles = [...data.roles]
    newRoles[index] = { ...newRoles[index], ...updates }
    onChange({ roles: newRoles })
  }

  const addRole = () => {
    onChange({
      roles: [
        ...data.roles,
        { name: '', color: '#3b82f6', level: 1 },
      ],
    })
  }

  const removeRole = (index: number) => {
    const newRoles = [...data.roles]
    newRoles.splice(index, 1)
    onChange({ roles: newRoles })
  }

  const presetColors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Définissez les rôles/postes de travail de votre organisation
        </p>
        <Button type="button" variant="outline" size="sm" onClick={addRole}>
          <Plus className="h-4 w-4 mr-1" />
          Ajouter un rôle
        </Button>
      </div>

      <div className="space-y-3">
        {data.roles.map((role, index) => (
          <div
            key={index}
            className="rounded-lg border p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor={`role-name-${index}`}>Nom du rôle</Label>
                    <Input
                      id={`role-name-${index}`}
                      placeholder="Ex: Serveur, Chef, Manager..."
                      value={role.name}
                      onChange={(e) => updateRole(index, { name: e.target.value })}
                    />
                  </div>
                  <div className="w-24">
                    <Label htmlFor={`role-level-${index}`}>Niveau</Label>
                    <Input
                      id={`role-level-${index}`}
                      type="number"
                      min="1"
                      max="5"
                      value={role.level || 1}
                      onChange={(e) =>
                        updateRole(index, { level: parseInt(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Couleur</Label>
                  <div className="mt-2 flex gap-2">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-8 w-8 rounded border-2 ${
                          role.color === color
                            ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateRole(index, { color })}
                      />
                    ))}
                    <Input
                      type="color"
                      value={role.color}
                      onChange={(e) => updateRole(index, { color: e.target.value })}
                      className="h-8 w-16"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRole(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {data.roles.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <p>Aucun rôle défini</p>
            <p className="mt-2 text-sm">
              Cliquez sur &quot;Ajouter un rôle&quot; pour commencer
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// === STEP 4: EMPLOYÉS ===
function Step4({
  data,
  onChange,
}: {
  data: OnboardingData
  onChange: (updates: Partial<OnboardingData>) => void
}) {
  const updateEmployee = (index: number, updates: Partial<EmployeeData>) => {
    const newEmployees = [...data.employees]
    newEmployees[index] = { ...newEmployees[index], ...updates }
    onChange({ employees: newEmployees })
  }

  const addEmployee = () => {
    onChange({
      employees: [
        ...data.employees,
        {
          firstName: '',
          lastName: '',
          roles: [],
          contractType: 'cdi',
        },
      ],
    })
  }

  const removeEmployee = (index: number) => {
    const newEmployees = [...data.employees]
    newEmployees.splice(index, 1)
    onChange({ employees: newEmployees })
  }

  const toggleEmployeeRole = (employeeIndex: number, roleIndex: number) => {
    const employee = data.employees[employeeIndex]
    const roleIndexStr = roleIndex.toString()
    const newRoles = employee.roles.includes(roleIndexStr)
      ? employee.roles.filter((r) => r !== roleIndexStr)
      : [...employee.roles, roleIndexStr]
    updateEmployee(employeeIndex, { roles: newRoles })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Optionnel :</strong> Vous pouvez ajouter des employés maintenant
          ou le faire plus tard depuis l&apos;application.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Ajoutez les membres de votre équipe
        </p>
        <Button type="button" variant="outline" size="sm" onClick={addEmployee}>
          <Plus className="h-4 w-4 mr-1" />
          Ajouter un employé
        </Button>
      </div>

      <div className="space-y-3">
        {data.employees.map((employee, index) => (
          <div
            key={index}
            className="rounded-lg border p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label htmlFor={`emp-first-${index}`}>Prénom</Label>
                    <Input
                      id={`emp-first-${index}`}
                      placeholder="Jean"
                      value={employee.firstName}
                      onChange={(e) =>
                        updateEmployee(index, { firstName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`emp-last-${index}`}>Nom</Label>
                    <Input
                      id={`emp-last-${index}`}
                      placeholder="Dupont"
                      value={employee.lastName}
                      onChange={(e) =>
                        updateEmployee(index, { lastName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`emp-contract-${index}`}>Type de contrat</Label>
                  <Select
                    value={employee.contractType}
                    onValueChange={(value) =>
                      updateEmployee(index, {
                        contractType: value as EmployeeData['contractType'],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cdi">CDI</SelectItem>
                      <SelectItem value="cdd">CDD</SelectItem>
                      <SelectItem value="extra">Extra</SelectItem>
                      <SelectItem value="interim">Intérim</SelectItem>
                      <SelectItem value="stage">Stage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {data.roles.length > 0 && (
                  <div>
                    <Label>Rôles</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {data.roles.map((role, roleIndex) => (
                        <button
                          key={roleIndex}
                          type="button"
                          onClick={() => toggleEmployeeRole(index, roleIndex)}
                          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                            employee.roles.includes(roleIndex.toString())
                              ? 'text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          style={{
                            backgroundColor: employee.roles.includes(
                              roleIndex.toString()
                            )
                              ? role.color
                              : undefined,
                          }}
                        >
                          {role.name || `Rôle ${roleIndex + 1}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeEmployee(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {data.employees.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <p>Aucun employé ajouté</p>
            <p className="mt-2 text-sm">
              Vous pourrez ajouter des employés plus tard
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// === STEP 5: GABARITS ===
function Step5({
  data,
  onChange,
}: {
  data: OnboardingData
  onChange: (updates: Partial<OnboardingData>) => void
}) {
  const addTemplate = () => {
    const newTemplate: TemplateData = {
      name: '',
      season: 'normal',
      matrix: {},
    }
    
    // Initialiser la matrice avec les jours ouverts et leurs segments
    data.openDays.forEach((openDay) => {
      if (openDay.isOpen) {
        const dayKey = openDay.day.toString()
        newTemplate.matrix[dayKey] = {}
        openDay.segments.forEach((segment) => {
          newTemplate.matrix[dayKey][segment.name] = []
        })
      }
    })
    
    onChange({ templates: [...data.templates, newTemplate] })
  }

  const removeTemplate = (index: number) => {
    const newTemplates = [...data.templates]
    newTemplates.splice(index, 1)
    onChange({ templates: newTemplates })
  }

  const updateTemplate = (index: number, updates: Partial<TemplateData>) => {
    const newTemplates = [...data.templates]
    newTemplates[index] = { ...newTemplates[index], ...updates }
    onChange({ templates: newTemplates })
  }

  const addRoleToSegment = (
    templateIndex: number,
    dayKey: string,
    segmentName: string
  ) => {
    const newTemplates = [...data.templates]
    const segment = newTemplates[templateIndex].matrix[dayKey]?.[segmentName]
    if (segment) {
      segment.push({ roleIndex: 0, count: 1 })
      onChange({ templates: newTemplates })
    }
  }

  const updateSegmentRole = (
    templateIndex: number,
    dayKey: string,
    segmentName: string,
    roleSlotIndex: number,
    updates: { roleIndex?: number; count?: number }
  ) => {
    const newTemplates = [...data.templates]
    const roleSlot =
      newTemplates[templateIndex].matrix[dayKey]?.[segmentName]?.[roleSlotIndex]
    if (roleSlot) {
      Object.assign(roleSlot, updates)
      onChange({ templates: newTemplates })
    }
  }

  const removeRoleFromSegment = (
    templateIndex: number,
    dayKey: string,
    segmentName: string,
    roleSlotIndex: number
  ) => {
    const newTemplates = [...data.templates]
    const segment = newTemplates[templateIndex].matrix[dayKey]?.[segmentName]
    if (segment) {
      segment.splice(roleSlotIndex, 1)
      onChange({ templates: newTemplates })
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Optionnel :</strong> Les gabarits sont des modèles de planning
          réutilisables qui définissent les besoins en personnel pour chaque jour
          et segment horaire.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Créez des modèles de planning type (ex: semaine calme, semaine chargée)
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTemplate}
          disabled={data.roles.length === 0 || data.openDays.filter(d => d.isOpen).length === 0}
        >
          <Plus className="h-4 w-4 mr-1" />
          Ajouter un gabarit
        </Button>
      </div>

      {data.roles.length === 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm text-orange-900">
            Vous devez d&apos;abord définir des rôles (étape 3) pour créer des gabarits.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {data.templates.map((template, templateIndex) => (
          <div key={templateIndex} className="rounded-lg border p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label htmlFor={`template-name-${templateIndex}`}>
                      Nom du gabarit
                    </Label>
                    <Input
                      id={`template-name-${templateIndex}`}
                      placeholder="Ex: Semaine normale, Haute saison..."
                      value={template.name}
                      onChange={(e) =>
                        updateTemplate(templateIndex, { name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`template-season-${templateIndex}`}>
                      Type de période
                    </Label>
                    <Select
                      value={template.season || 'normal'}
                      onValueChange={(value) =>
                        updateTemplate(templateIndex, {
                          season: value as TemplateData['season'],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Basse saison</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">Haute saison</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Configuration par jour */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Besoins en personnel</h4>
                  {data.openDays
                    .filter((d) => d.isOpen)
                    .map((openDay) => {
                      const dayKey = openDay.day.toString()
                      return (
                        <div key={dayKey} className="rounded-lg bg-muted p-3">
                          <div className="mb-2 font-medium text-sm">
                            {dayNames[openDay.day]}
                          </div>
                          <div className="space-y-2">
                            {openDay.segments.map((segment) => (
                              <div
                                key={segment.name}
                                className="rounded bg-white p-3 space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    {segment.name} ({segment.start} - {segment.end})
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      addRoleToSegment(
                                        templateIndex,
                                        dayKey,
                                        segment.name
                                      )
                                    }
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Ajouter
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {template.matrix[dayKey]?.[segment.name]?.map(
                                    (roleSlot, roleSlotIndex) => (
                                      <div
                                        key={roleSlotIndex}
                                        className="flex items-center gap-2"
                                      >
                                        <Select
                                          value={roleSlot.roleIndex.toString()}
                                          onValueChange={(value) =>
                                            updateSegmentRole(
                                              templateIndex,
                                              dayKey,
                                              segment.name,
                                              roleSlotIndex,
                                              { roleIndex: parseInt(value) }
                                            )
                                          }
                                        >
                                          <SelectTrigger className="flex-1">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {data.roles.map((role, roleIndex) => (
                                              <SelectItem
                                                key={roleIndex}
                                                value={roleIndex.toString()}
                                              >
                                                <span className="flex items-center gap-2">
                                                  <span
                                                    className="inline-block w-3 h-3 rounded-full"
                                                    style={{
                                                      backgroundColor: role.color,
                                                    }}
                                                  />
                                                  {role.name || `Rôle ${roleIndex + 1}`}
                                                </span>
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="20"
                                          value={roleSlot.count}
                                          onChange={(e) =>
                                            updateSegmentRole(
                                              templateIndex,
                                              dayKey,
                                              segment.name,
                                              roleSlotIndex,
                                              { count: parseInt(e.target.value) }
                                            )
                                          }
                                          className="w-20"
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            removeRoleFromSegment(
                                              templateIndex,
                                              dayKey,
                                              segment.name,
                                              roleSlotIndex
                                            )
                                          }
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )
                                  )}
                                  {(!template.matrix[dayKey]?.[segment.name] ||
                                    template.matrix[dayKey][segment.name].length ===
                                      0) && (
                                    <p className="text-xs text-muted-foreground">
                                      Aucun besoin défini
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTemplate(templateIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {data.templates.length === 0 && data.roles.length > 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <p>Aucun gabarit créé</p>
            <p className="mt-2 text-sm">
              Les gabarits sont optionnels mais facilitent la création de plannings
            </p>
          </div>
        )}
      </div>
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

  const openDaysCount = data.openDays.filter((d) => d.isOpen).length

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted p-4">
        <h3 className="font-semibold mb-4">Récapitulatif de votre configuration</h3>
        
        <div className="space-y-4">
          {/* Informations générales */}
          <div>
            <h4 className="text-sm font-medium mb-2">Informations générales</h4>
            <div className="space-y-1 text-sm">
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
            </div>
          </div>

          {/* Jours ouvrés */}
          <div>
            <h4 className="text-sm font-medium mb-2">Jours ouvrés</h4>
            <div className="text-sm">
              <span className="text-muted-foreground">
                {openDaysCount} jour{openDaysCount > 1 ? 's' : ''} d&apos;ouverture configuré{openDaysCount > 1 ? 's' : ''}
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.openDays
                  .filter((d) => d.isOpen)
                  .map((d) => (
                    <span
                      key={d.day}
                      className="rounded bg-primary/10 px-2 py-1 text-xs font-medium"
                    >
                      {dayNames[d.day]} ({d.segments.length} segment{d.segments.length > 1 ? 's' : ''})
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {/* Rôles */}
          <div>
            <h4 className="text-sm font-medium mb-2">Rôles</h4>
            <div className="text-sm">
              <span className="text-muted-foreground">
                {data.roles.length} rôle{data.roles.length > 1 ? 's' : ''} défini{data.roles.length > 1 ? 's' : ''}
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.roles.map((role, index) => (
                  <span
                    key={index}
                    className="rounded-full px-3 py-1 text-xs font-medium text-white"
                    style={{ backgroundColor: role.color }}
                  >
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Employés */}
          <div>
            <h4 className="text-sm font-medium mb-2">Employés</h4>
            <div className="text-sm">
              {data.employees.length > 0 ? (
                <>
                  <span className="text-muted-foreground">
                    {data.employees.length} employé{data.employees.length > 1 ? 's' : ''}
                  </span>
                  <div className="mt-2 space-y-1">
                    {data.employees.map((emp, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        {emp.firstName} {emp.lastName} ({emp.contractType.toUpperCase()})
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <span className="text-muted-foreground">Aucun employé ajouté</span>
              )}
            </div>
          </div>

          {/* Gabarits */}
          <div>
            <h4 className="text-sm font-medium mb-2">Gabarits de planning</h4>
            <div className="text-sm">
              {data.templates.length > 0 ? (
                <>
                  <span className="text-muted-foreground">
                    {data.templates.length} gabarit{data.templates.length > 1 ? 's' : ''} créé{data.templates.length > 1 ? 's' : ''}
                  </span>
                  <div className="mt-2 space-y-1">
                    {data.templates.map((template, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        {template.name || `Gabarit ${index + 1}`} ({template.season === 'low' ? 'Basse saison' : template.season === 'high' ? 'Haute saison' : 'Normal'})
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <span className="text-muted-foreground">Aucun gabarit créé</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm text-green-900">
          <strong>Prêt !</strong> Votre organisation sera créée avec cette configuration.
          Vous pourrez toujours la modifier depuis les paramètres.
        </p>
      </div>
    </div>
  )
}
