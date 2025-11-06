import * as admin from 'firebase-admin'
import { firestore } from 'firebase-functions/v2'

/**
 * Trigger: mise à jour automatique lors de décision sur une demande de congé
 */
export const onLeaveRequestUpdate = firestore
  .document('orgs/{orgId}/leaveRequests/{requestId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data()
    const after = change.after.data()
    const { orgId } = context.params

    // Si passage de pending à approved
    if (before.status === 'pending' && after.status === 'approved') {
      const db = admin.firestore()

      // Optionnel: créer des "blocages" automatiques dans les schedules
      // pour la période concernée
      console.log(
        `Leave approved for employee ${after.employeeId} from ${after.startDate} to ${after.endDate}`
      )

      // TODO: bloquer les créneaux dans les schedules existants
      // ou marquer l'employé comme indisponible pour la période
    }

    return null
  })
