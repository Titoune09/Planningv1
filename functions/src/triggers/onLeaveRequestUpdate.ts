import { firestore } from 'firebase-functions/v2'
import type { QueryDocumentSnapshot } from 'firebase-functions/v2/firestore'

/**
 * Trigger: mise à jour automatique lors de décision sur une demande de congé
 */
export const onLeaveRequestUpdate = firestore
  .onDocumentUpdated('orgs/{orgId}/leaveRequests/{requestId}', async (event) => {
    const before = event.data?.before.data()
    const after = event.data?.after.data()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { orgId } = event.params

    if (!before || !after) return null

    // Si passage de pending à approved
    if (before.status === 'pending' && after.status === 'approved') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const employeeId = after.employeeId as string

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
