import * as admin from 'firebase-admin'
import { https } from 'firebase-functions/v2'
import { z } from 'zod'
import { requireAuth, requireManagerOrOwner } from '../utils/auth'

const createScheduleSchema = z.object({
  orgId: z.string(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  templateId: z.string().optional(), // ID du template à utiliser (optionnel)
})

export const createSchedule = https.onCall(async (request) => {
  const auth = requireAuth(request)
  const db = admin.firestore()

  // Validation
  const data = createScheduleSchema.parse(request.data)

  // Vérifier permissions
  await requireManagerOrOwner(db, auth.uid, data.orgId)

  const now = admin.firestore.FieldValue.serverTimestamp()

  try {
    return await db.runTransaction(async (transaction) => {
      // 1. Récupérer l'organisation pour obtenir les openDays
      const orgRef = db.collection('orgs').doc(data.orgId)
      const orgDoc = await transaction.get(orgRef)

      if (!orgDoc.exists) {
        throw new https.HttpsError('not-found', 'Organisation non trouvée.')
      }

      const org = orgDoc.data()!
      const openDays = org.settings?.openDays || []

      // 2. Vérifier les dates
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)

      if (startDate > endDate) {
        throw new https.HttpsError(
          'invalid-argument',
          'La date de début doit être antérieure à la date de fin.'
        )
      }

      // Limite à 4 semaines (28 jours)
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff > 28) {
        throw new https.HttpsError(
          'invalid-argument',
          'La période ne peut pas dépasser 4 semaines (28 jours).'
        )
      }

      // 3. Récupérer le template si fourni
      let template: any = null
      if (data.templateId) {
        const templateRef = orgRef.collection('templates').doc(data.templateId)
        const templateDoc = await transaction.get(templateRef)
        if (templateDoc.exists) {
          template = templateDoc.data()
        }
      }

      // 4. Créer le schedule
      const scheduleRef = orgRef.collection('schedules').doc()
      transaction.set(scheduleRef, {
        orgId: data.orgId,
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'draft',
        createdBy: auth.uid,
        createdAt: now,
        updatedAt: now,
      })

      // 5. Créer les jours (days) pour chaque jour de la période
      const currentDate = new Date(startDate)
      const daysCreated: string[] = []

      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0] // YYYY-MM-DD
        const dayOfWeek = currentDate.getDay() // 0=dimanche, 1=lundi, ..., 6=samedi

        // Trouver la configuration du jour dans openDays
        const openDay = openDays.find((d: any) => d.day === dayOfWeek)

        if (openDay && openDay.isOpen) {
          // Ce jour est ouvert, créer un ScheduleDay
          const dayRef = scheduleRef.collection('days').doc()

          // Préparer les segments pour ce jour
          const segments = openDay.segments.map((segment: any) => {
            const segmentData: any = {
              name: segment.name,
              start: segment.start,
              end: segment.end,
              assignments: [],
            }

            // Si un template est fourni, essayer de pré-remplir les besoins
            if (template && template.matrix) {
              const dayKey = dayOfWeek.toString()
              const templateSegment = template.matrix[dayKey]?.[segment.name]

              if (templateSegment && Array.isArray(templateSegment)) {
                // Le template contient des besoins pour ce segment
                // On ne crée pas d'assignments, mais on peut stocker les besoins
                segmentData.needs = templateSegment.map((need: any) => ({
                  role: need.role,
                  count: need.count || 1,
                }))
              }
            }

            return segmentData
          })

          transaction.set(dayRef, {
            scheduleId: scheduleRef.id,
            date: dateString,
            segments,
          })

          daysCreated.push(dateString)
        }

        // Passer au jour suivant
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // 6. Log audit
      const auditRef = orgRef.collection('auditLogs').doc()
      transaction.set(auditRef, {
        orgId: data.orgId,
        actorUserId: auth.uid,
        action: 'schedule.create',
        entityRef: `schedules/${scheduleRef.id}`,
        timestamp: now,
        metadata: {
          startDate: data.startDate,
          endDate: data.endDate,
          templateId: data.templateId,
          daysCreated: daysCreated.length,
        },
      })

      return {
        success: true,
        scheduleId: scheduleRef.id,
        daysCreated: daysCreated.length,
      }
    })
  } catch (error) {
    if (error instanceof https.HttpsError) {
      throw error
    }
    console.error('Error creating schedule:', error)
    throw new https.HttpsError('internal', 'Erreur lors de la création du planning.')
  }
})
