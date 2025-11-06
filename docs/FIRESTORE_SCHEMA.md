# Schéma Firestore — Planificateur d'Employés

## Architecture multi-tenant

Toutes les données métier sont **isolées par organisation** sous `/orgs/{orgId}/...`

## Collections principales

### `/orgs`

Organisation racine. Une organisation = une entreprise cliente.

```typescript
{
  id: string
  name: string
  slug: string // unique, pour URLs
  timezone: string // 'Europe/Paris'
  locale: string // 'fr-FR'
  industry: 'restaurant' | 'retail' | 'healthcare' | 'agency' | 'events' | 'other'
  ownerUserId: string // Auth UID
  createdAt: Timestamp
  settings: {
    weekStartsOn: number // 0=dimanche, 1=lundi
    openDays: OpenDay[]
    holidaysRegion?: string
    overtimeRules?: {...}
  }
}
```

**Index nécessaires** :
- `slug` (unique)
- `ownerUserId`

---

### `/orgs/{orgId}/memberships`

Adhésion d'un utilisateur à une organisation. **Jonction entre Auth.uid et l'org**.

```typescript
{
  id: string
  userId: string // Auth UID
  orgId: string
  role: 'owner' | 'manager' | 'employee'
  status: 'active' | 'invited' | 'disabled'
  linkedEmployeeId?: string // lien vers employees/{id}
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Contraintes** :
- Unicité `(orgId, userId)` via logique serveur
- Seul un `owner` ou `manager` peut modifier

**Index** :
- `userId`
- `(orgId, status)`

---

### `/orgs/{orgId}/employees`

Profils internes d'employés (planning). **Distinct du compte utilisateur**.

```typescript
{
  id: string
  orgId: string
  firstName: string
  lastName: string
  roles: string[] // roleIds
  contractType: 'cdi' | 'cdd' | 'extra' | 'interim' | 'stage'
  weeklyHoursTarget?: number
  unavailabilities: Unavailability[]
  notes?: string
  linkedUserId?: string // Auth UID si lié
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Index** :
- `orgId`
- `linkedUserId`

---

### `/orgs/{orgId}/roles`

Rôles/postes définis par l'organisation.

```typescript
{
  id: string
  orgId: string
  name: string // 'Serveur', 'Cuisinier'
  color: string // '#3b82f6'
  level?: number
  constraints?: {
    minStaffPerSegment?: number
    requiredSkills?: string[]
    ageRestriction?: {...}
    regulatoryNotes?: string
  }
  createdAt: Timestamp
}
```

---

### `/orgs/{orgId}/invites`

Invitations en attente.

```typescript
{
  id: string
  orgId: string
  email: string
  targetRole: 'owner' | 'manager' | 'employee'
  employeeId?: string // pour lier à un profil existant
  createdBy: string
  token: string // nanoid
  expiresAt: Timestamp
  status: 'pending' | 'used' | 'expired' | 'canceled'
  createdAt: Timestamp
  usedAt?: Timestamp
  usedBy?: string
}
```

**Index** :
- `token` (unique)
- `(orgId, status)`

---

### `/orgs/{orgId}/templates`

Gabarits de planning.

```typescript
{
  id: string
  orgId: string
  name: string
  season?: 'low' | 'high' | 'normal'
  rules?: string[]
  matrix: {
    [day: string]: {
      [segmentName: string]: {
        role: string // roleId
        count?: number
        employeeIds?: string[]
      }
    }
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

### `/orgs/{orgId}/schedules`

Planning pour une période.

```typescript
{
  id: string
  orgId: string
  startDate: string // YYYY-MM-DD
  endDate: string
  status: 'draft' | 'published' | 'archived'
  lockedSegments?: string[] // ['2024-01-15-midi']
  createdBy: string
  publishedAt?: Timestamp
  publishedBy?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Sous-collection** : `/orgs/{orgId}/schedules/{scheduleId}/days`

```typescript
{
  id: string
  scheduleId: string
  date: string // YYYY-MM-DD
  segments: [
    {
      name: string
      start: string // HH:mm
      end: string
      assignments: [
        {
          employeeId: string
          role: string
          start?: string
          end?: string
        }
      ]
    }
  ]
}
```

**Index** :
- `(orgId, startDate)`
- `(scheduleId, date)`

---

### `/orgs/{orgId}/leaveRequests`

Demandes de congés/absences.

```typescript
{
  id: string
  orgId: string
  employeeId: string
  createdByUserId: string // doit être linkedUserId
  type: 'paid' | 'unpaid' | 'rtt' | 'sick' | 'other'
  startDate: string
  endDate: string
  segments?: string[]
  reason?: string
  status: 'pending' | 'approved' | 'rejected' | 'canceled'
  decidedBy?: string
  decidedAt?: Timestamp
  decisionReason?: string
  attachments?: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Index** :
- `(orgId, employeeId, status)`
- `(orgId, status, startDate)`

---

### `/orgs/{orgId}/policies`

Politiques de congés.

```typescript
{
  id: string
  orgId: string
  type: LeaveType
  accrualRules: {...}
  carryOverDays?: number
  maxConcurrentByRole?: { [roleId]: number }
  minNoticeDays?: number
  requiresApproval: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

### `/orgs/{orgId}/auditLogs`

Traçabilité des actions.

```typescript
{
  id: string
  orgId: string
  actorUserId: string
  action: string
  entityRef: string
  before?: object
  after?: object
  timestamp: Timestamp
  metadata?: object
}
```

**Index** :
- `(orgId, timestamp)`
- `(orgId, actorUserId, timestamp)`

---

### `/orgs/{orgId}/notifications`

Outbox pour e-mails.

```typescript
{
  id: string
  orgId: string
  to: string
  template: string
  payload: object
  status: 'pending' | 'sent' | 'failed'
  error?: string
  createdAt: Timestamp
  sentAt?: Timestamp
}
```

---

### `/users` (global)

Données utilisateur **hors contexte org**.

```typescript
{
  id: string // Auth UID
  displayName?: string
  photoURL?: string
  emailVerified: boolean
  lastOrgId?: string
  createdAt: Timestamp
}
```

**Important** : Cette collection ne contient **aucune donnée métier**. Les permissions et rôles sont gérés via `memberships`.

---

## Règles de sécurité (concepts)

- **Orgs** : read si membre, write si manager/owner
- **Memberships** : read par le membre lui-même ou manager/owner, **write uniquement via CF**
- **Employees** : read par membres, create/update/delete par manager/owner
- **Schedules** : read par membres, write par manager/owner
- **LeaveRequests** : create par employé lié, read par employé (ses propres) ou manager (toutes), update statut par manager uniquement
- **AuditLogs** : read par manager/owner, **write uniquement via CF**

---

## Validation côté serveur

Toutes les opérations critiques passent par **Cloud Functions** :
- Création d'org → `createOrg`
- Invitation → `inviteUser`
- Acceptation → `redeemInvite`
- Affectation planning → `assignShift`
- Demande congé → `submitLeave`
- Décision congé → `decideLeave`

Les **triggers** Firestore gèrent :
- Écriture automatique des `auditLogs`
- Envoi des notifications (via `notifications` outbox)
- Validation d'intégrité
