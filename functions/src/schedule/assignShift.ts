import * as admin from 'firebase-admin'
import { https } from 'firebase-functions/v2'
import { z } from 'zod'
import { requireAuth, requireManagerOrOwner } from '../utils/auth'

const assignShiftSchema = z.object({
  orgId: z.string(),
  scheduleId: z.string(),
  dayId: z.string(),
  segmentName: z.string(),
  employeeId: z.string(),
  role: z.string(),
  start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  end: z.string().regex(/^\d{2}:\d{2}$/).optional(),
})

export const assignShift = https.onCall(
  {
    cors: true,
  },
  async (request) => {
    const auth = requireAuth(request)
    const db = admin.firestore()

  // Validation
  const data = assignShiftSchema.parse(request.data)

  // Vérifier permissions
  await requireManagerOrOwner(db, auth.uid, data.orgId)

  const dayRef = db
    .collection('orgs')
    .doc(data.orgId)
    .collection('schedules')
    .doc(data.scheduleId)
    .collection('days')
    .doc(data.dayId)

  try {
    const result = await db.runTransaction(async (transaction) => {
      const day = await transaction.get(dayRef)

      if (!day.exists) {
        throw new https.HttpsError('not-found', 'Jour de planning non trouvé.')
      }

      const dayData = day.data()!
      const segments = dayData.segments || []

      // Trouver le segment
      const segmentIndex = segments.findIndex(
        (s: { name: string }) => s.name === data.segmentName
      )

      if (segmentIndex === -1) {
        throw new https.HttpsError('not-found', 'Segment non trouvé.')
      }

      const segment = segments[segmentIndex]

      // TODO: Vérifier les conflits
      // - Employé déjà affecté sur un autre segment qui chevauche
      // - Absence approuvée
      // - Indisponibilité déclarée
      // - Dépassement quota hebdo

      // Ajouter l'affectation
      const newAssignment = {
        employeeId: data.employeeId,
        role: data.role,
        start: data.start,
        end: data.end,
      }

      segment.assignments = segment.assignments || []
      segment.assignments.push(newAssignment)

      segments[segmentIndex] = segment

      // Mettre à jour le document
      transaction.update(dayRef, { segments })

      // Log audit
      const auditRef = db
        .collection('orgs')
        .doc(data.orgId)
        .collection('auditLogs')
        .doc()

      transaction.set(auditRef, {
        orgId: data.orgId,
        actorUserId: auth.uid,
        action: 'shift.assign',
        entityRef: `schedules/${data.scheduleId}/days/${data.dayId}`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          employeeId: data.employeeId,
          role: data.role,
          segmentName: data.segmentName,
        },
      })

      return { success: true }
    })

    return result
  } catch (error) {
    if (error instanceof https.HttpsError) {
      throw error
    }
    console.error('Error assigning shift:', error)
    throw new https.HttpsError('internal', 'Erreur lors de l\'affectation.')
  }
  }
)
