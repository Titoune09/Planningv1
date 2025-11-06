'use client'

import { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    
    // Vérifier si l'email est vérifié
    if (!userCredential.user.emailVerified) {
      throw new Error('Veuillez vérifier votre email avant de vous connecter. Consultez votre boîte de réception.')
    }
    
    return userCredential
  }

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Envoyer l'email de vérification
    await sendEmailVerification(userCredential.user, {
      url: window.location.origin + '/login',
      handleCodeInApp: false,
    })
    
    // Déconnecter l'utilisateur pour qu'il vérifie son email
    await firebaseSignOut(auth)
    
    return userCredential
  }

  const signOut = async () => {
    return firebaseSignOut(auth)
  }

  const resetPassword = async (email: string) => {
    return sendPasswordResetEmail(auth, email)
  }

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      return sendEmailVerification(auth.currentUser, {
        url: window.location.origin + '/login',
        handleCodeInApp: false,
      })
    }
    throw new Error('Aucun utilisateur connecté')
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resendVerificationEmail,
  }
}
