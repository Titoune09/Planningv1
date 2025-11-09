import * as admin from 'firebase-admin'
import { https } from 'firebase-functions/v2'
import { z } from 'zod'
import { requireAuth, requireManagerOrOwner } from '../utils/auth'

const decideLeaveSchema = z.object({
  orgId: z.string(),
  requestId: z.string(),
  decision: z.enum(['approved', 'rejected']),
  reason: z.string().optional(),
})

export const decideLeave = https.onCall(
  {
    cors: true,
  },
  async (request) => {
    const auth = requireAuth(request)
    const db = admin.firestore()

  // Validation
  const data = decideLeaveSchema.parse(request.data)

  // Vérifier permissions
  await requireManagerOrOwner(db, auth.uid, data.orgId)

  const requestRef = db
    .collection('orgs')
    .doc(data.orgId)
    .collection('leaveRequests')
    .doc(data.requestId)

  const leaveRequest = await requestRef.get()

  if (!leaveRequest.exists) {
    throw new https.HttpsError('not-found', 'Demande non trouvée.')
  }

  const requestData = leaveRequest.data()

  if (requestData?.status !== 'pending') {
    throw new https.HttpsError(
      'failed-precondition',
      'Cette demande a déjà été traitée.'
    )
  }

  const now = admin.firestore.FieldValue.serverTimestamp()

  try {
    await db.runTransaction(async (transaction) => {
      // 1. Mettre à jour le statut
      transaction.update(requestRef, {
        status: data.decision,
        decidedBy: auth.uid,
        decidedAt: now,
        decisionReason: data.reason || '',
        updatedAt: now,
      })

      // 2. Créer une notification pour l'employé
      const employeeRef = db
        .collection('orgs')
        .doc(data.orgId)
        .collection('employees')
        .doc(requestData.employeeId)

      const employee = await transaction.get(employeeRef)

      if (employee.exists && employee.data()?.linkedUserId) {
        const notifRef = db
          .collection('orgs')
          .doc(data.orgId)
          .collection('notifications')
          .doc()

        transaction.set(notifRef, {
          orgId: data.orgId,
          to: '', // Email à résoudre via linkedUserId
          template: 'leave_decision',
          payload: {
            requestId: data.requestId,
            decision: data.decision,
            reason: data.reason,
            startDate: requestData.startDate,
            endDate: requestData.endDate,
          },
          status: 'pending',
          createdAt: now,
        })
      }

      // 3. Log audit
      const auditRef = db
        .collection('orgs')
        .doc(data.orgId)
        .collection('auditLogs')
        .doc()

      transaction.set(auditRef, {
        orgId: data.orgId,
        actorUserId: auth.uid,
        action: `leave.${data.decision}`,
        entityRef: `leaveRequests/${data.requestId}`,
        timestamp: now,
        metadata: {
          employeeId: requestData.employeeId,
          decision: data.decision,
          reason: data.reason,
        },
      })
    })

    return {
      success: true,
      requestId: data.requestId,
      decision: data.decision,
    }
  } catch (error) {
    console.error('Error deciding leave:', error)
    throw new https.HttpsError('internal', 'Erreur lors de la décision.')
  }
  }
)
