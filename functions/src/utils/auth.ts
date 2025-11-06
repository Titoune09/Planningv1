import { https } from 'firebase-functions/v2'

export interface AuthContext {
  uid: string
  email?: string
}

/**
 * Valide que l'utilisateur est authentifié
 */
export function requireAuth(request: https.CallableRequest): AuthContext {
  if (!request.auth) {
    throw new https.HttpsError('unauthenticated', 'Vous devez être connecté.')
  }

  return {
    uid: request.auth.uid,
    email: request.auth.token.email,
  }
}

/**
 * Vérifie que l'utilisateur est membre d'une org
 */
export async function requireMembership(
  db: FirebaseFirestore.Firestore,
  userId: string,
  orgId: string
): Promise<FirebaseFirestore.DocumentSnapshot> {
  const membershipRef = db
    .collection('orgs')
    .doc(orgId)
    .collection('memberships')
    .doc(userId)

  const membership = await membershipRef.get()

  if (!membership.exists || membership.data()?.status !== 'active') {
    throw new https.HttpsError(
      'permission-denied',
      'Vous n\'êtes pas membre de cette organisation.'
    )
  }

  return membership
}

/**
 * Vérifie que l'utilisateur est manager ou owner
 */
export async function requireManagerOrOwner(
  db: FirebaseFirestore.Firestore,
  userId: string,
  orgId: string
): Promise<void> {
  const membership = await requireMembership(db, userId, orgId)
  const role = membership.data()?.role

  if (role !== 'manager' && role !== 'owner') {
    throw new https.HttpsError(
      'permission-denied',
      'Action réservée aux managers et propriétaires.'
    )
  }
}
