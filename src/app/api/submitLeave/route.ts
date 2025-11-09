import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminDb, admin } from '@/lib/firebase-admin'
import { requireAuth } from '@/lib/api-auth'

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

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const body = await request.json()
    const data = submitLeaveSchema.parse(body)

    // Vérifier que l'employé est lié à l'utilisateur
    const employeeRef = adminDb
      .collection('orgs')
      .doc(data.orgId)
      .collection('employees')
      .doc(data.employeeId)

    const employee = await employeeRef.get()

    if (!employee.exists) {
      return NextResponse.json(
        { error: 'Employé non trouvé' },
        { status: 404 }
      )
    }

    if (employee.data()?.linkedUserId !== auth.uid) {
      return NextResponse.json(
        { error: 'Vous ne pouvez faire une demande que pour votre propre profil' },
        { status: 403 }
      )
    }

    // Vérifier les dates
    if (data.startDate > data.endDate) {
      return NextResponse.json(
        { error: 'La date de début doit être avant la date de fin' },
        { status: 400 }
      )
    }

    const now = admin.firestore.FieldValue.serverTimestamp()

    const requestRef = adminDb
      .collection('orgs')
      .doc(data.orgId)
      .collection('leaveRequests')
      .doc()

    await adminDb.runTransaction(async (transaction) => {
      // Créer la demande
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

      // Créer une notification pour les managers
      const notifRef = adminDb
        .collection('orgs')
        .doc(data.orgId)
        .collection('notifications')
        .doc()

      transaction.set(notifRef, {
        orgId: data.orgId,
        to: '',
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

      // Log audit
      const auditRef = adminDb
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

    return NextResponse.json({
      success: true,
      requestId: requestRef.id,
    })
  } catch (error: any) {
    console.error('Error submitting leave:', error)

    if (error.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Erreur lors de la soumission de la demande' },
      { status: 500 }
    )
  }
}

