import * as admin from 'firebase-admin'
import { identity } from 'firebase-functions/v2'

/**
 * Trigger: création automatique du profil utilisateur global
 */
export const onUserCreated = identity.beforeUserCreated(async (event) => {
  const user = event.data
  const db = admin.firestore()

  try {
    await db.collection('users').doc(user.uid).set({
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      emailVerified: user.emailVerified,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log(`User profile created for ${user.uid}`)
  } catch (error) {
    console.error('Error creating user profile:', error)
  }
})
