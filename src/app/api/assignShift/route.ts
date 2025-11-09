import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminDb, admin } from '@/lib/firebase-admin'
import { requireAuth, requireManagerOrOwner } from '@/lib/api-auth'

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

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const body = await request.json()
    const data = assignShiftSchema.parse(body)

    // Vérifier permissions
    await requireManagerOrOwner(auth.uid, data.orgId)

    const dayRef = adminDb
      .collection('orgs')
      .doc(data.orgId)
      .collection('schedules')
      .doc(data.scheduleId)
      .collection('days')
      .doc(data.dayId)

    const result = await adminDb.runTransaction(async (transaction) => {
      const day = await transaction.get(dayRef)

      if (!day.exists) {
        throw new Error('NOT_FOUND')
      }

      const dayData = day.data()!
      const segments = dayData.segments || []

      // Trouver le segment
      const segmentIndex = segments.findIndex(
        (s: { name: string }) => s.name === data.segmentName
      )

      if (segmentIndex === -1) {
        throw new Error('SEGMENT_NOT_FOUND')
      }

      const segment = segments[segmentIndex]

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
      const auditRef = adminDb
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

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error assigning shift:', error)

    if (error.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (error.message === 'PERMISSION_DENIED') {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 })
    }

    if (error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Jour de planning non trouvé' }, { status: 404 })
    }

    if (error.message === 'SEGMENT_NOT_FOUND') {
      return NextResponse.json({ error: 'Segment non trouvé' }, { status: 404 })
    }

    return NextResponse.json(
      { error: "Erreur lors de l'affectation" },
      { status: 500 }
    )
  }
}

