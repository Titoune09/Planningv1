import * as admin from 'firebase-admin'
import { getAuth } from 'firebase-admin/auth'

// Configuration pour l'émulateur
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'

// Initialiser Firebase Admin
admin.initializeApp({
  projectId: 'demo-project',
})

const db = admin.firestore()
const auth = getAuth()

async function seed() {
  console.log('🌱 Démarrage du seed...')

  try {
    // 1. Créer un utilisateur de test
    console.log('Création de l\'utilisateur de test...')
    let user: admin.auth.UserRecord
    try {
      user = await auth.createUser({
        email: 'demo@example.com',
        password: 'password123',
        displayName: 'Demo Manager',
        emailVerified: true,
      })
      console.log('✓ Utilisateur créé:', user.uid)
    } catch (error: unknown) {
      if ((error as { code: string }).code === 'auth/email-already-exists') {
        user = await auth.getUserByEmail('demo@example.com')
        console.log('✓ Utilisateur existant:', user.uid)
      } else {
        throw error
      }
    }

    // 2. Créer le profil utilisateur
    await db.collection('users').doc(user.uid).set({
      displayName: user.displayName,
      photoURL: null,
      emailVerified: user.emailVerified,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    console.log('✓ Profil utilisateur créé')

    // 3. Créer une organisation
    const orgRef = db.collection('orgs').doc()
    const orgId = orgRef.id

    await orgRef.set({
      name: 'Demo Bistro',
      slug: 'demo-bistro',
      timezone: 'Europe/Paris',
      locale: 'fr-FR',
      industry: 'restaurant',
      ownerUserId: user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        weekStartsOn: 1,
        openDays: [
          {
            day: 1,
            isOpen: true,
            segments: [
              { name: 'Midi', start: '11:30', end: '15:00' },
              { name: 'Soir', start: '18:30', end: '23:00' },
            ],
          },
          {
            day: 2,
            isOpen: true,
            segments: [
              { name: 'Midi', start: '11:30', end: '15:00' },
              { name: 'Soir', start: '18:30', end: '23:00' },
            ],
          },
          {
            day: 3,
            isOpen: true,
            segments: [
              { name: 'Midi', start: '11:30', end: '15:00' },
              { name: 'Soir', start: '18:30', end: '23:00' },
            ],
          },
          {
            day: 4,
            isOpen: true,
            segments: [
              { name: 'Midi', start: '11:30', end: '15:00' },
              { name: 'Soir', start: '18:30', end: '23:00' },
            ],
          },
          {
            day: 5,
            isOpen: true,
            segments: [
              { name: 'Midi', start: '11:30', end: '15:00' },
              { name: 'Soir', start: '18:30', end: '23:00' },
            ],
          },
          {
            day: 6,
            isOpen: true,
            segments: [
              { name: 'Midi', start: '11:30', end: '15:00' },
              { name: 'Soir', start: '18:30', end: '23:00' },
            ],
          },
          { day: 0, isOpen: false, segments: [] },
        ],
        holidaysRegion: 'FR',
      },
    })
    console.log('✓ Organisation créée:', orgId)

    // 4. Créer le membership
    await orgRef.collection('memberships').doc(user.uid).set({
      userId: user.uid,
      orgId,
      role: 'owner',
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    console.log('✓ Membership créé')

    // 5. Créer des rôles
    const roles = [
      { name: 'Serveur', color: '#3b82f6', level: 1 },
      { name: 'Chef', color: '#ef4444', level: 3 },
      { name: 'Commis', color: '#8b5cf6', level: 1 },
      { name: 'Manager', color: '#10b981', level: 4 },
    ]

    const roleIds: Record<string, string> = {}

    for (const role of roles) {
      const roleRef = orgRef.collection('roles').doc()
      await roleRef.set({
        ...role,
        orgId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      roleIds[role.name] = roleRef.id
      console.log(`✓ Rôle créé: ${role.name}`)
    }

    // 6. Créer des employés
    const employees = [
      {
        firstName: 'Marie',
        lastName: 'Dupont',
        roles: [roleIds['Serveur']],
        contractType: 'cdi',
        weeklyHoursTarget: 35,
        unavailabilities: [],
      },
      {
        firstName: 'Jean',
        lastName: 'Martin',
        roles: [roleIds['Chef']],
        contractType: 'cdi',
        weeklyHoursTarget: 39,
        unavailabilities: [{ day: 0, reason: 'Repos hebdomadaire' }],
      },
      {
        firstName: 'Sophie',
        lastName: 'Bernard',
        roles: [roleIds['Serveur']],
        contractType: 'cdd',
        weeklyHoursTarget: 35,
        unavailabilities: [],
      },
      {
        firstName: 'Thomas',
        lastName: 'Petit',
        roles: [roleIds['Commis']],
        contractType: 'extra',
        weeklyHoursTarget: 20,
        unavailabilities: [{ day: 1, reason: 'Cours' }],
      },
    ]

    const employeeIds: string[] = []

    for (const employee of employees) {
      const employeeRef = orgRef.collection('employees').doc()
      await employeeRef.set({
        ...employee,
        orgId,
        notes: '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      employeeIds.push(employeeRef.id)
      console.log(`✓ Employé créé: ${employee.firstName} ${employee.lastName}`)
    }

    // 7. Créer des demandes de congés
    await orgRef.collection('leaveRequests').doc().set({
      orgId,
      employeeId: employeeIds[0],
      createdByUserId: user.uid,
      type: 'paid',
      startDate: '2024-02-15',
      endDate: '2024-02-20',
      segments: [],
      reason: 'Vacances d\'hiver',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    console.log('✓ Demande de congé créée')

    // 8. Créer une politique de congés
    await orgRef.collection('policies').doc().set({
      orgId,
      type: 'paid',
      accrualRules: {
        type: 'paid',
        daysPerYear: 25,
        accrualFrequency: 'yearly',
      },
      carryOverDays: 5,
      minNoticeDays: 7,
      requiresApproval: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    console.log('✓ Politique de congés créée')

    console.log('\\n✅ Seed terminé avec succès!')
    console.log('\\n📧 Compte de test:')
    console.log('   Email: demo@example.com')
    console.log('   Mot de passe: password123')
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error)
    throw error
  }
}

seed()
  .then(() => {
    console.log('✅ Terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })
