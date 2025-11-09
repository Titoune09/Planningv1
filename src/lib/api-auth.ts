import { NextRequest } from 'next/server'
import { adminAuth, adminDb } from './firebase-admin'

export interface AuthContext {
  uid: string
  email?: string
}

/**
 * Vérifie le token Firebase et retourne les infos de l'utilisateur
 */
export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('UNAUTHENTICATED')
  }

  const token = authHeader.substring(7)
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    throw new Error('UNAUTHENTICATED')
  }
}

/**
 * Vérifie que l'utilisateur est manager ou owner de l'organisation
 */
export async function requireManagerOrOwner(
  uid: string,
  orgId: string
): Promise<void> {
  const membershipDoc = await adminDb
    .collection('orgs')
    .doc(orgId)
    .collection('memberships')
    .doc(uid)
    .get()

  if (!membershipDoc.exists) {
    throw new Error('PERMISSION_DENIED')
  }

  const membership = membershipDoc.data()
  if (membership?.role !== 'owner' && membership?.role !== 'manager') {
    throw new Error('PERMISSION_DENIED')
  }
}

/**
 * Génère un slug unique pour une organisation
 */
export async function generateUniqueSlug(
  baseSlug: string
): Promise<string> {
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  let slug = slugify(baseSlug)
  let counter = 1

  while (true) {
    const existingOrg = await adminDb
      .collection('orgs')
      .where('slug', '==', slug)
      .limit(1)
      .get()

    if (existingOrg.empty) {
      return slug
    }

    slug = `${slugify(baseSlug)}-${counter}`
    counter++
  }
}

