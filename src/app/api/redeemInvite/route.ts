import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminDb, admin } from '@/lib/firebase-admin'
import { requireAuth } from '@/lib/api-auth'

const redeemInviteSchema = z.object({
  token: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const body = await request.json()
    const data = redeemInviteSchema.parse(body)

    // Trouver l'invitation par token
    const invitesQuery = await adminDb
      .collectionGroup('invites')
      .where('token', '==', data.token)
      .where('status', '==', 'pending')
      .limit(1)
      .get()

    if (invitesQuery.empty) {
      return NextResponse.json(
        { error: 'Invitation non trouvée ou déjà utilisée' },
        { status: 404 }
      )
    }

    const inviteDoc = invitesQuery.docs[0]
    const invite = inviteDoc.data()

    // Vérifier expiration
    if (invite.expiresAt.toDate() < new Date()) {
      await inviteDoc.ref.update({ status: 'expired' })
      return NextResponse.json(
        { error: 'Cette invitation a expiré' },
        { status: 400 }
      )
    }

    // Vérifier que l'email correspond
    if (auth.email && auth.email.toLowerCase() !== invite.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Cette invitation n'est pas pour votre adresse email" },
        { status: 403 }
      )
    }

    const orgId = invite.orgId
    const now = admin.firestore.FieldValue.serverTimestamp()

    await adminDb.runTransaction(async (transaction) => {
      // Vérifier que l'utilisateur n'est pas déjà membre
      const membershipRef = adminDb
        .collection('orgs')
        .doc(orgId)
        .collection('memberships')
        .doc(auth.uid)

      const existingMembership = await transaction.get(membershipRef)

      if (existingMembership.exists) {
        throw new Error('ALREADY_MEMBER')
      }

      // Créer/activer le membership
      transaction.set(membershipRef, {
        userId: auth.uid,
        orgId,
        role: invite.targetRole,
        status: 'active',
        linkedEmployeeId: invite.employeeId,
        createdAt: now,
        updatedAt: now,
      })

      // Si employeeId fourni, lier l'employé au user
      if (invite.employeeId) {
        const employeeRef = adminDb
          .collection('orgs')
          .doc(orgId)
          .collection('employees')
          .doc(invite.employeeId)

        transaction.update(employeeRef, {
          linkedUserId: auth.uid,
          updatedAt: now,
        })
      }

      // Marquer l'invitation comme utilisée
      transaction.update(inviteDoc.ref, {
        status: 'used',
        usedAt: now,
        usedBy: auth.uid,
      })

      // Log audit
      const auditRef = adminDb
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

    return NextResponse.json({
      success: true,
      orgId,
      role: invite.targetRole,
    })
  } catch (error: any) {
    console.error('Error redeeming invite:', error)

    if (error.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (error.message === 'ALREADY_MEMBER') {
      return NextResponse.json(
        { error: 'Vous êtes déjà membre de cette organisation' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de l'acceptation de l'invitation" },
      { status: 500 }
    )
  }
}

