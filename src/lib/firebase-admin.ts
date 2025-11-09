import * as admin from 'firebase-admin'

// Initialize Firebase Admin (singleton pattern)
if (!admin.apps.length) {
  try {
    // En production, utiliser les variables d'environnement
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    
    if (process.env.FIREBASE_PROJECT_ID && privateKey && process.env.FIREBASE_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      })
      console.log('✅ Firebase Admin initialized')
    } else {
      console.warn('⚠️ Firebase Admin credentials not found in environment variables')
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error)
  }
}

export const adminDb = admin.firestore()
export const adminAuth = admin.auth()

export { admin }

