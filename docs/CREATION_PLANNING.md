# Création de Planning - Guide d'utilisation

## Problème résolu

**Problème initial** : Impossible de créer un planning à la fin des 5 étapes de l'onboarding.

**Solution** : Ajout de la fonction Cloud `createSchedule` qui permet de créer des plannings réels pour une période donnée.

## Nouvelle fonction : createSchedule

### Description

La fonction `createSchedule` permet de créer un planning (schedule) pour une période donnée. Elle crée automatiquement les jours (days) pour chaque jour ouvré de la période, avec les segments horaires configurés dans l'organisation.

### Paramètres

```typescript
{
  orgId: string          // ID de l'organisation
  startDate: string      // Date de début (format YYYY-MM-DD)
  endDate: string        // Date de fin (format YYYY-MM-DD)
  templateId?: string    // ID du template/gabarit (optionnel)
}
```

### Réponse

```typescript
{
  success: boolean       // Indique si la création a réussi
  scheduleId: string     // ID du planning créé
  daysCreated: number    // Nombre de jours créés
}
```

### Contraintes

- La date de début doit être antérieure à la date de fin
- La période ne peut pas dépasser 4 semaines (28 jours)
- Seuls les jours ouverts (configurés dans `org.settings.openDays`) seront créés
- L'utilisateur doit être manager ou propriétaire de l'organisation

### Utilisation

#### Depuis le frontend (TypeScript/React)

```typescript
import { createSchedule } from '@/lib/firebase-client'

// Créer un planning pour une semaine
const result = await createSchedule({
  orgId: 'org_123',
  startDate: '2024-01-08', // Lundi
  endDate: '2024-01-14',   // Dimanche
})

console.log(`Planning créé avec succès : ${result.data.scheduleId}`)
console.log(`${result.data.daysCreated} jours créés`)
```

#### Avec un template (gabarit)

```typescript
const result = await createSchedule({
  orgId: 'org_123',
  startDate: '2024-01-08',
  endDate: '2024-01-14',
  templateId: 'template_xyz', // Utilise le gabarit pour pré-remplir les besoins
})
```

## Flux complet de création de planning

### 1. Après l'onboarding

Une fois l'onboarding terminé, l'utilisateur a :
- Une organisation créée
- Des rôles définis
- Des jours et segments horaires configurés
- (Optionnel) Des employés ajoutés
- (Optionnel) Des templates/gabarits créés

### 2. Créer un planning

```typescript
// Obtenir la date de début de la semaine courante
const today = new Date()
const startOfWeek = getStartOfWeek(today) // Fonction helper
const endOfWeek = getEndOfWeek(today)     // Fonction helper

// Créer le planning
const schedule = await createSchedule({
  orgId: currentOrg.id,
  startDate: formatDate(startOfWeek),     // YYYY-MM-DD
  endDate: formatDate(endOfWeek),         // YYYY-MM-DD
})
```

### 3. Assigner des employés

Une fois le planning créé, utilisez `assignShift` pour assigner des employés :

```typescript
import { assignShift } from '@/lib/firebase-client'

await assignShift({
  orgId: 'org_123',
  scheduleId: schedule.data.scheduleId,
  dayId: 'day_456',        // ID du jour (récupéré depuis Firestore)
  segmentName: 'Midi',     // Nom du segment
  employeeId: 'emp_789',   // ID de l'employé
  role: 'role_101',        // ID du rôle
  start: '11:30',          // (Optionnel) Heure personnalisée
  end: '15:00',            // (Optionnel) Heure personnalisée
})
```

## Structure Firestore

Après la création d'un planning, la structure Firestore est la suivante :

```
orgs/{orgId}/
  schedules/{scheduleId}/
    - startDate: "2024-01-08"
    - endDate: "2024-01-14"
    - status: "draft"
    - createdBy: "user_123"
    - createdAt: Timestamp
    - updatedAt: Timestamp
    
    days/{dayId}/
      - scheduleId: "schedule_123"
      - date: "2024-01-08"
      - segments: [
          {
            name: "Midi",
            start: "11:30",
            end: "15:00",
            assignments: [],
            needs: [  // Si un template est utilisé
              { role: "role_serveur", count: 3 },
              { role: "role_chef", count: 1 }
            ]
          },
          {
            name: "Soir",
            start: "18:30",
            end: "23:00",
            assignments: [],
            needs: []
          }
        ]
```

## Exemple d'intégration dans la page de planning

Voici comment intégrer la création de planning dans la page `/app/planning` :

```typescript
'use client'

import { useCurrentOrg } from '@/hooks/use-org'
import { createSchedule } from '@/lib/firebase-client'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function PlanningPage() {
  const { currentOrg } = useCurrentOrg()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateWeekSchedule = async () => {
    if (!currentOrg) return
    
    setIsCreating(true)
    try {
      // Obtenir les dates de la semaine courante
      const today = new Date()
      const startOfWeek = getStartOfWeek(today)
      const endOfWeek = getEndOfWeek(today)
      
      const result = await createSchedule({
        orgId: currentOrg.id,
        startDate: formatDate(startOfWeek),
        endDate: formatDate(endOfWeek),
      })
      
      console.log('Planning créé:', result.data)
      // Recharger les données ou rediriger vers le planning
      
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsCreating(false)
    }
  }
  
  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Planning</h1>
        <Button onClick={handleCreateWeekSchedule} disabled={isCreating}>
          {isCreating ? 'Création...' : 'Créer un planning'}
        </Button>
      </div>
      {/* ... reste du contenu ... */}
    </div>
  )
}

// Fonctions helper
function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Lundi = début
  return new Date(d.setDate(diff))
}

function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6) // +6 jours = Dimanche
  return end
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] // YYYY-MM-DD
}
```

## Permissions

La fonction `createSchedule` nécessite que l'utilisateur soit :
- Propriétaire (owner) de l'organisation, OU
- Manager de l'organisation

Les employés simples ne peuvent pas créer de plannings.

## Logs d'audit

Chaque création de planning est enregistrée dans les logs d'audit :

```typescript
{
  orgId: "org_123",
  actorUserId: "user_456",
  action: "schedule.create",
  entityRef: "schedules/schedule_789",
  timestamp: Timestamp,
  metadata: {
    startDate: "2024-01-08",
    endDate: "2024-01-14",
    templateId: "template_xyz",  // si utilisé
    daysCreated: 6
  }
}
```

## Prochaines étapes

Maintenant que vous pouvez créer des plannings, vous pouvez :

1. **Afficher les plannings** : Récupérer et afficher les plannings existants
2. **Assigner des employés** : Utiliser `assignShift` pour affecter des employés
3. **Publier des plannings** : Créer une fonction pour passer un planning de "draft" à "published"
4. **Glisser-déposer** : Implémenter une interface drag & drop pour faciliter les affectations
5. **Gérer les conflits** : Vérifier les conflits d'horaires, absences, etc.

## Fichiers modifiés

- ✅ `/functions/src/schedule/createSchedule.ts` - Nouvelle fonction Cloud
- ✅ `/functions/src/index.ts` - Export de la fonction
- ✅ `/src/lib/firebase-client.ts` - Client TypeScript pour le frontend
- ✅ `/functions/src/__tests__/createSchedule.test.ts` - Tests unitaires (structure)

## Tester localement

Pour tester avec l'émulateur Firebase :

```bash
# Démarrer l'émulateur
cd functions
npm run serve

# Dans un autre terminal, tester depuis le frontend
npm run dev
```

La fonction sera disponible via l'émulateur et vous pourrez créer des plannings sans toucher à la base de production.
