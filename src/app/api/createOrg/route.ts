import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminDb, admin } from '@/lib/firebase-admin'
import { requireAuth, generateUniqueSlug } from '@/lib/api-auth'

const timeSegmentSchema = z.object({
  name: z.string(),
  start: z.string(),
  end: z.string(),
})

const openDaySchema = z.object({
  day: z.number().min(0).max(6),
  isOpen: z.boolean(),
  segments: z.array(timeSegmentSchema),
})

const roleSchema = z.object({
  name: z.string().min(1),
  color: z.string(),
  level: z.number().optional(),
})

const employeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  roles: z.array(z.string()),
  contractType: z.enum(['cdi', 'cdd', 'extra', 'interim', 'stage']),
})

const templateRoleSlotSchema = z.object({
  roleIndex: z.number(),
  count: z.number().min(1),
})

const templateSchema = z.object({
  name: z.string().min(1),
  season: z.enum(['low', 'high', 'normal']).optional(),
  matrix: z.record(
    z.string(),
    z.record(z.string(), z.array(templateRoleSlotSchema))
  ),
})

const createOrgSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().optional(),
  timezone: z.string().default('Europe/Paris'),
  locale: z.string().default('fr-FR'),
  industry: z
    .enum(['restaurant', 'retail', 'healthcare', 'agency', 'events', 'other'])
    .default('restaurant'),
  openDays: z.array(openDaySchema).optional(),
  roles: z.array(roleSchema).optional(),
  employees: z.array(employeeSchema).optional(),
  templates: z.array(templateSchema).optional(),
})

// Valeurs par défaut
function getDefaultOpenDays(industry: string) {
  const segments = getDefaultSegments(industry)
  return [
    { day: 1, isOpen: true, segments },
    { day: 2, isOpen: true, segments },
    { day: 3, isOpen: true, segments },
    { day: 4, isOpen: true, segments },
    { day: 5, isOpen: true, segments },
    { day: 6, isOpen: true, segments },
    { day: 0, isOpen: industry === 'restaurant', segments },
  ]
}

function getDefaultSegments(industry: string) {
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

function getDefaultRoles(industry: string) {
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

export async function POST(request: NextRequest) {
  try {
    // Authentification
    const auth = await requireAuth(request)

    // Validation
    const body = await request.json()
    const data = createOrgSchema.parse(body)

    // Génération du slug unique
    const slug = data.slug
      ? await generateUniqueSlug(data.slug)
      : await generateUniqueSlug(data.name)

    const orgId = adminDb.collection('orgs').doc().id
    const now = admin.firestore.FieldValue.serverTimestamp()

    // Transaction
    await adminDb.runTransaction(async (transaction) => {
      // 1. Créer l'organisation
      const orgRef = adminDb.collection('orgs').doc(orgId)

      const openDays =
        data.openDays && data.openDays.length > 0
          ? data.openDays
          : getDefaultOpenDays(data.industry)

      transaction.set(orgRef, {
        name: data.name,
        slug,
        timezone: data.timezone,
        locale: data.locale,
        industry: data.industry,
        ownerUserId: auth.uid,
        createdAt: now,
        settings: {
          weekStartsOn: 1,
          openDays,
          holidaysRegion: 'FR',
        },
      })

      // 2. Créer le membership owner
      const membershipRef = orgRef.collection('memberships').doc(auth.uid)
      transaction.set(membershipRef, {
        userId: auth.uid,
        orgId,
        role: 'owner',
        status: 'active',
        createdAt: now,
        updatedAt: now,
      })

      // 3. Créer les rôles
      const rolesToCreate =
        data.roles && data.roles.length > 0
          ? data.roles
          : getDefaultRoles(data.industry)

      const createdRoleIds: string[] = []
      for (const role of rolesToCreate) {
        const roleRef = orgRef.collection('roles').doc()
        transaction.set(roleRef, {
          ...role,
          orgId,
          createdAt: now,
        })
        createdRoleIds.push(roleRef.id)
      }

      // 4. Créer les employés initiaux
      if (data.employees && data.employees.length > 0) {
        for (const employee of data.employees) {
          const employeeRef = orgRef.collection('employees').doc()
          const employeeRoleIds = employee.roles
            .map((roleIndex) => {
              const index = parseInt(roleIndex)
              return index >= 0 && index < createdRoleIds.length
                ? createdRoleIds[index]
                : null
            })
            .filter((id): id is string => id !== null)

          transaction.set(employeeRef, {
            orgId,
            firstName: employee.firstName,
            lastName: employee.lastName,
            roles: employeeRoleIds,
            contractType: employee.contractType,
            unavailabilities: [],
            createdAt: now,
            updatedAt: now,
          })
        }
      }

      // 5. Créer une politique de congés par défaut
      const policyRef = orgRef.collection('policies').doc()
      transaction.set(policyRef, {
        orgId,
        type: 'paid',
        accrualRules: {
          type: 'paid',
          daysPerYear: 25,
          accrualFrequency: 'yearly',
        },
        carryOverDays: 5,
        minNoticeDays: 7,
        requiresApproval: true,
        createdAt: now,
        updatedAt: now,
      })

      // 6. Créer les gabarits de planning
      if (data.templates && data.templates.length > 0) {
        for (const template of data.templates) {
          const templateRef = orgRef.collection('templates').doc()

          const convertedMatrix: Record<
            string,
            Record<string, Array<{ role: string; count: number }>>
          > = {}

          for (const [day, segments] of Object.entries(template.matrix)) {
            convertedMatrix[day] = {}
            for (const [segmentName, roleSlots] of Object.entries(segments)) {
              convertedMatrix[day][segmentName] = roleSlots
                .map((slot) => {
                  const roleId = createdRoleIds[slot.roleIndex]
                  return roleId ? { role: roleId, count: slot.count } : null
                })
                .filter((slot): slot is { role: string; count: number } => slot !== null)
            }
          }

          transaction.set(templateRef, {
            orgId,
            name: template.name,
            season: template.season || 'normal',
            matrix: convertedMatrix,
            createdAt: now,
            updatedAt: now,
          })
        }
      }

      // 7. Log audit
      const auditRef = orgRef.collection('auditLogs').doc()
      transaction.set(auditRef, {
        orgId,
        actorUserId: auth.uid,
        action: 'org.create',
        entityRef: `orgs/${orgId}`,
        timestamp: now,
        metadata: {
          industry: data.industry,
          rolesCount: rolesToCreate.length,
          employeesCount: data.employees?.length || 0,
          templatesCount: data.templates?.length || 0,
        },
      })
    })

    return NextResponse.json({
      success: true,
      orgId,
      slug,
    })
  } catch (error: any) {
    console.error('Error creating org:', error)

    if (error.message === 'UNAUTHENTICATED') {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de l'organisation" },
      { status: 500 }
    )
  }
}

