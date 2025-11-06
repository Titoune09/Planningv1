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

const createOrgSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().optional(),
  timezone: z.string().default('Europe/Paris'),
  locale: z.string().default('fr-FR'),
  industry: z
    .enum(['restaurant', 'retail', 'healthcare', 'agency', 'events', 'other'])
    .default('restaurant'),
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
          openDays: getDefaultOpenDays(data.industry as Industry),
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

      // 3. Créer les rôles par défaut
      const defaultRoles = getDefaultRoles(data.industry as Industry)
      for (const role of defaultRoles) {
        const roleRef = orgRef.collection('roles').doc()
        transaction.set(roleRef, {
          ...role,
          orgId,
          createdAt: now,
        })
      }

      // 4. Créer une politique de congés par défaut
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

      // 5. Log audit
      const auditRef = orgRef.collection('auditLogs').doc()
      transaction.set(auditRef, {
        orgId,
        actorUserId: auth.uid,
        action: 'org.create',
        entityRef: `orgs/${orgId}`,
        timestamp: now,
        metadata: { industry: data.industry },
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
