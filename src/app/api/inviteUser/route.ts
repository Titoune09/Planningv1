import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminDb, admin } from '@/lib/firebase-admin'
import { requireAuth, requireManagerOrOwner } from '@/lib/api-auth'
import { nanoid } from 'nanoid'

const inviteUserSchema = z.object({
  orgId: z.string(),
  email: z.string().email(),
  targetRole: z.enum(['manager', 'employee']).default('employee'),
  employeeId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const body = await request.json()
    const data = inviteUserSchema.parse(body)

    // Vérifier permissions
    await requireManagerOrOwner(auth.uid, data.orgId)

    const token = nanoid(32)
    const expiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
    )
    const now = admin.firestore.FieldValue.serverTimestamp()

    const inviteRef = adminDb
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

    // Créer une notification
    const notifRef = adminDb
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
        inviterName: auth.email || "Un membre de l'équipe",
        orgId: data.orgId,
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

    await auditRef.set({
      orgId: data.orgId,
      actorUserId: auth.uid,
      action: 'invite.create',
      entityRef: `invites/${inviteRef.id}`,
      timestamp: now,
      metadata: { email: data.email, targetRole: data.targetRole },
    })

    return NextResponse.json({
      success: true,
      inviteId: inviteRef.id,
      token,
    })
  } catch (error: any) {
    console.error('Error inviting user:', error)

    if (error.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (error.message === 'PERMISSION_DENIED') {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 })
    }

    return NextResponse.json(
      { error: "Erreur lors de l'invitation" },
      { status: 500 }
    )
  }
}

