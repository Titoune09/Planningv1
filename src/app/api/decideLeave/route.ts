import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminDb, admin } from '@/lib/firebase-admin'
import { requireAuth, requireManagerOrOwner } from '@/lib/api-auth'

const decideLeaveSchema = z.object({
  orgId: z.string(),
  requestId: z.string(),
  decision: z.enum(['approved', 'rejected']),
  reason: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const body = await request.json()
    const data = decideLeaveSchema.parse(body)

    // Vérifier permissions
    await requireManagerOrOwner(auth.uid, data.orgId)

    const requestRef = adminDb
      .collection('orgs')
      .doc(data.orgId)
      .collection('leaveRequests')
      .doc(data.requestId)

    const leaveRequest = await requestRef.get()

    if (!leaveRequest.exists) {
      return NextResponse.json(
        { error: 'Demande non trouvée' },
        { status: 404 }
      )
    }

    const requestData = leaveRequest.data()

    if (requestData?.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cette demande a déjà été traitée' },
        { status: 400 }
      )
    }

    const now = admin.firestore.FieldValue.serverTimestamp()

    await adminDb.runTransaction(async (transaction) => {
      // Mettre à jour le statut
      transaction.update(requestRef, {
        status: data.decision,
        decidedBy: auth.uid,
        decidedAt: now,
        decisionReason: data.reason || '',
        updatedAt: now,
      })

      // Créer une notification pour l'employé
      const employeeRef = adminDb
        .collection('orgs')
        .doc(data.orgId)
        .collection('employees')
        .doc(requestData.employeeId)

      const employee = await transaction.get(employeeRef)

      if (employee.exists && employee.data()?.linkedUserId) {
        const notifRef = adminDb
          .collection('orgs')
          .doc(data.orgId)
          .collection('notifications')
          .doc()

        transaction.set(notifRef, {
          orgId: data.orgId,
          to: '',
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

      // Log audit
      const auditRef = adminDb
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

    return NextResponse.json({
      success: true,
      requestId: data.requestId,
      decision: data.decision,
    })
  } catch (error: any) {
    console.error('Error deciding leave:', error)

    if (error.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (error.message === 'PERMISSION_DENIED') {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Erreur lors de la décision' },
      { status: 500 }
    )
  }
}

