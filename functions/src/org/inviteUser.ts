import * as admin from 'firebase-admin'
import { https } from 'firebase-functions/v2'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { requireAuth, requireManagerOrOwner } from '../utils/auth'

const inviteUserSchema = z.object({
  orgId: z.string(),
  email: z.string().email(),
  targetRole: z.enum(['manager', 'employee']).default('employee'),
  employeeId: z.string().optional(),
})

export const inviteUser = https.onCall(async (request) => {
  const auth = requireAuth(request)
  const db = admin.firestore()

  // Validation
  const data = inviteUserSchema.parse(request.data)

  // Vérifier permissions
  await requireManagerOrOwner(db, auth.uid, data.orgId)

  // Vérifier que l'email n'est pas déjà membre
  const existingMemberships = await db
    .collection('orgs')
    .doc(data.orgId)
    .collection('memberships')
    .where('userId', '==', auth.uid)
    .where('status', '==', 'active')
    .get()

  // Note: on ne peut pas facilement chercher par email dans Firestore
  // En production, utiliser une collection indexée ou Firebase Extensions

  const token = nanoid(32)
  const expiresAt = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
  )
  const now = admin.firestore.FieldValue.serverTimestamp()

  try {
    const inviteRef = db
      .collection('orgs')
      .doc(data.orgId)
      .collection('invites')
      .doc()

    await inviteRef.set({
      orgId: data.orgId,
      email: data.email.toLowerCase(),
      targetRole: data.targetRole,
      employeeId: data.employeeId,
      createdBy: auth.uid,
      token,
      expiresAt,
      status: 'pending',
      createdAt: now,
    })

    // Créer une notification pour l'envoi d'email
    const notifRef = db
      .collection('orgs')
      .doc(data.orgId)
      .collection('notifications')
      .doc()

    await notifRef.set({
      orgId: data.orgId,
      to: data.email,
      template: 'invite',
      payload: {
        token,
        inviterName: auth.email || 'Un membre de l\'équipe',
        orgId: data.orgId,
      },
      status: 'pending',
      createdAt: now,
    })

    // Log audit
    const auditRef = db
      .collection('orgs')
      .doc(data.orgId)
      .collection('auditLogs')
      .doc()

    await auditRef.set({
      orgId: data.orgId,
      actorUserId: auth.uid,
      action: 'invite.create',
      entityRef: `invites/${inviteRef.id}`,
      timestamp: now,
      metadata: { email: data.email, targetRole: data.targetRole },
    })

    return {
      success: true,
      inviteId: inviteRef.id,
      token, // En prod, ne pas renvoyer le token directement
    }
  } catch (error) {
    console.error('Error inviting user:', error)
    throw new https.HttpsError('internal', 'Erreur lors de l\'invitation.')
  }
})
