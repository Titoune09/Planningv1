import * as admin from 'firebase-admin'
import { https } from 'firebase-functions/v2'
import { z } from 'zod'
import { requireAuth } from '../utils/auth'
import { generateUniqueSlug } from '../utils/slugify'
import {
  getDefaultRoles,
  getDefaultOpenDays,
} from '../utils/defaults'
import type { Industry } from '../types'

const timeSegmentSchema = z.object({
  name: z.string(),
  start: z.string(), // HH:mm
  end: z.string(), // HH:mm
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
  roles: z.array(z.string()), // Indices dans le tableau roles
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
    z.string(), // day (0-6)
    z.record(
      z.string(), // segmentName
      z.array(templateRoleSlotSchema)
    )
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

export const createOrg = https.onCall(async (request) => {
  const auth = requireAuth(request)
  const db = admin.firestore()

  // Validation
  const data = createOrgSchema.parse(request.data)

  // Génération du slug unique
  const slug = data.slug
    ? await generateUniqueSlug(db, data.slug)
    : await generateUniqueSlug(db, data.name)

  const orgId = db.collection('orgs').doc().id
  const now = admin.firestore.FieldValue.serverTimestamp()

  try {
    await db.runTransaction(async (transaction) => {
      // 1. Créer l'organisation
      const orgRef = db.collection('orgs').doc(orgId)
      
      // Utiliser les openDays fournis ou les valeurs par défaut
      const openDays = data.openDays && data.openDays.length > 0
        ? data.openDays
        : getDefaultOpenDays(data.industry as Industry)

      transaction.set(orgRef, {
        name: data.name,
        slug,
        timezone: data.timezone,
        locale: data.locale,
        industry: data.industry,
        ownerUserId: auth.uid,
        createdAt: now,
        settings: {
          weekStartsOn: 1, // Lundi
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

      // 3. Créer les rôles (fournis ou par défaut)
      const rolesToCreate = data.roles && data.roles.length > 0
        ? data.roles
        : getDefaultRoles(data.industry as Industry)
      
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

      // 4. Créer les employés initiaux (si fournis)
      if (data.employees && data.employees.length > 0) {
        for (const employee of data.employees) {
          const employeeRef = orgRef.collection('employees').doc()
          // Convertir les indices de rôles en IDs réels
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
          daysPerYear: 25, // 5 semaines
          accrualFrequency: 'yearly',
        },
        carryOverDays: 5,
        minNoticeDays: 7,
        requiresApproval: true,
        createdAt: now,
        updatedAt: now,
      })

      // 6. Créer les gabarits de planning (si fournis)
      if (data.templates && data.templates.length > 0) {
        for (const template of data.templates) {
          const templateRef = orgRef.collection('templates').doc()
          
          // Convertir les indices de rôles en IDs réels dans la matrice
          const convertedMatrix: Record<string, Record<string, Array<{ role: string; count: number }>>> = {}
          
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

    return {
      success: true,
      orgId,
      slug,
    }
  } catch (error) {
    console.error('Error creating org:', error)
    throw new https.HttpsError('internal', 'Erreur lors de la création de l\'organisation.')
  }
})
