import * as admin from 'firebase-admin'
import { https } from 'firebase-functions/v2'
import { z } from 'zod'
import { requireAuth } from '../utils/auth'

const redeemInviteSchema = z.object({
  token: z.string(),
})

export const redeemInvite = https.onCall(
  {
    cors: true,
  },
  async (request) => {
    const auth = requireAuth(request)
    const db = admin.firestore()

  // Validation
  const data = redeemInviteSchema.parse(request.data)

  try {
    // Trouver l'invitation par token
    const invitesQuery = await db
      .collectionGroup('invites')
      .where('token', '==', data.token)
      .where('status', '==', 'pending')
      .limit(1)
      .get()

    if (invitesQuery.empty) {
      throw new https.HttpsError(
        'not-found',
        'Invitation non trouvée ou déjà utilisée.'
      )
    }

    const inviteDoc = invitesQuery.docs[0]
    const invite = inviteDoc.data()

    // Vérifier expiration
    if (invite.expiresAt.toDate() < new Date()) {
      await inviteDoc.ref.update({ status: 'expired' })
      throw new https.HttpsError('failed-precondition', 'Cette invitation a expiré.')
    }

    // Vérifier que l'email correspond (si l'utilisateur a un email)
    if (auth.email && auth.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw new https.HttpsError(
        'permission-denied',
        'Cette invitation n\'est pas pour votre adresse email.'
      )
    }

    const orgId = invite.orgId
    const now = admin.firestore.FieldValue.serverTimestamp()

    await db.runTransaction(async (transaction) => {
      // 1. Vérifier que l'utilisateur n'est pas déjà membre
      const membershipRef = db
        .collection('orgs')
        .doc(orgId)
        .collection('memberships')
        .doc(auth.uid)

      const existingMembership = await transaction.get(membershipRef)

      if (existingMembership.exists) {
        throw new https.HttpsError(
          'already-exists',
          'Vous êtes déjà membre de cette organisation.'
        )
      }

      // 2. Créer/activer le membership
      transaction.set(membershipRef, {
        userId: auth.uid,
        orgId,
        role: invite.targetRole,
        status: 'active',
        linkedEmployeeId: invite.employeeId,
        createdAt: now,
        updatedAt: now,
      })

      // 3. Si employeeId fourni, lier l'employé au user
      if (invite.employeeId) {
        const employeeRef = db
          .collection('orgs')
          .doc(orgId)
          .collection('employees')
          .doc(invite.employeeId)

        transaction.update(employeeRef, {
          linkedUserId: auth.uid,
          updatedAt: now,
        })
      }

      // 4. Marquer l'invitation comme utilisée
      transaction.update(inviteDoc.ref, {
        status: 'used',
        usedAt: now,
        usedBy: auth.uid,
      })

      // 5. Log audit
      const auditRef = db
        .collection('orgs')
        .doc(orgId)
        .collection('auditLogs')
        .doc()

      transaction.set(auditRef, {
        orgId,
        actorUserId: auth.uid,
        action: 'invite.redeem',
        entityRef: `invites/${inviteDoc.id}`,
        timestamp: now,
        metadata: { email: invite.email },
      })
    })

    return {
      success: true,
      orgId,
      role: invite.targetRole,
    }
  } catch (error) {
    if (error instanceof https.HttpsError) {
      throw error
    }
    console.error('Error redeeming invite:', error)
    throw new https.HttpsError('internal', 'Erreur lors de l\'acceptation de l\'invitation.')
  }
  }
)
