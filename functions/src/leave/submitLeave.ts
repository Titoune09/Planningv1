import * as admin from 'firebase-admin'
import { https } from 'firebase-functions/v2'
import { z } from 'zod'
import { requireAuth } from '../utils/auth'

const submitLeaveSchema = z.object({
  orgId: z.string(),
  employeeId: z.string(),
  type: z.enum(['paid', 'unpaid', 'rtt', 'sick', 'other']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  segments: z.array(z.string()).optional(),
  reason: z.string().optional(),
  attachments: z.array(z.string()).optional(),
})

export const submitLeave = https.onCall(async (request) => {
  const auth = requireAuth(request)
  const db = admin.firestore()

  // Validation
  const data = submitLeaveSchema.parse(request.data)

  // Vérifier que l'employé est lié à l'utilisateur
  const employeeRef = db
    .collection('orgs')
    .doc(data.orgId)
    .collection('employees')
    .doc(data.employeeId)

  const employee = await employeeRef.get()

  if (!employee.exists) {
    throw new https.HttpsError('not-found', 'Employé non trouvé.')
  }

  if (employee.data()?.linkedUserId !== auth.uid) {
    throw new https.HttpsError(
      'permission-denied',
      'Vous ne pouvez faire une demande que pour votre propre profil.'
    )
  }

  // Vérifier que startDate <= endDate
  if (data.startDate > data.endDate) {
    throw new https.HttpsError(
      'invalid-argument',
      'La date de début doit être avant la date de fin.'
    )
  }

  const now = admin.firestore.FieldValue.serverTimestamp()

  try {
    const requestRef = db
      .collection('orgs')
      .doc(data.orgId)
      .collection('leaveRequests')
      .doc()

    await db.runTransaction(async (transaction) => {
      // 1. Créer la demande
      transaction.set(requestRef, {
        orgId: data.orgId,
        employeeId: data.employeeId,
        createdByUserId: auth.uid,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        segments: data.segments || [],
        reason: data.reason || '',
        status: 'pending',
        attachments: data.attachments || [],
        createdAt: now,
        updatedAt: now,
      })

      // 2. Créer une notification pour les managers
      const notifRef = db
        .collection('orgs')
        .doc(data.orgId)
        .collection('notifications')
        .doc()

      transaction.set(notifRef, {
        orgId: data.orgId,
        to: '', // À remplir par un trigger qui trouve les managers
        template: 'leave_request_submitted',
        payload: {
          requestId: requestRef.id,
          employeeName: `${employee.data()?.firstName} ${employee.data()?.lastName}`,
          type: data.type,
          startDate: data.startDate,
          endDate: data.endDate,
        },
        status: 'pending',
        createdAt: now,
      })

      // 3. Log audit
      const auditRef = db
        .collection('orgs')
        .doc(data.orgId)
        .collection('auditLogs')
        .doc()

      transaction.set(auditRef, {
        orgId: data.orgId,
        actorUserId: auth.uid,
        action: 'leave.submit',
        entityRef: `leaveRequests/${requestRef.id}`,
        timestamp: now,
        metadata: {
          employeeId: data.employeeId,
          type: data.type,
          startDate: data.startDate,
          endDate: data.endDate,
        },
      })
    })

    return {
      success: true,
      requestId: requestRef.id,
    }
  } catch (error) {
    console.error('Error submitting leave:', error)
    throw new https.HttpsError('internal', 'Erreur lors de la soumission de la demande.')
  }
})
