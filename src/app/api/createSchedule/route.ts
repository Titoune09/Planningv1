import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminDb, admin } from '@/lib/firebase-admin'
import { requireAuth, requireManagerOrOwner } from '@/lib/api-auth'

const createScheduleSchema = z.object({
  orgId: z.string(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  templateId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const body = await request.json()
    const data = createScheduleSchema.parse(body)

    // Vérifier permissions
    await requireManagerOrOwner(auth.uid, data.orgId)

    const now = admin.firestore.FieldValue.serverTimestamp()

    const result = await adminDb.runTransaction(async (transaction) => {
      // Récupérer l'organisation
      const orgRef = adminDb.collection('orgs').doc(data.orgId)
      const orgDoc = await transaction.get(orgRef)

      if (!orgDoc.exists) {
        throw new Error('NOT_FOUND')
      }

      const org = orgDoc.data()!
      const openDays = org.settings?.openDays || []

      // Vérifier les dates
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)

      if (startDate > endDate) {
        throw new Error('INVALID_DATES')
      }

      // Limite à 4 semaines
      const daysDiff = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysDiff > 28) {
        throw new Error('PERIOD_TOO_LONG')
      }

      // Récupérer le template si fourni
      let template: any = null
      if (data.templateId) {
        const templateRef = orgRef.collection('templates').doc(data.templateId)
        const templateDoc = await transaction.get(templateRef)
        if (templateDoc.exists) {
          template = templateDoc.data()
        }
      }

      // Créer le schedule
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

      // Créer les jours
      const currentDate = new Date(startDate)
      const daysCreated: string[] = []

      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0]
        const dayOfWeek = currentDate.getDay()

        const openDay = openDays.find((d: any) => d.day === dayOfWeek)

        if (openDay && openDay.isOpen) {
          const dayRef = scheduleRef.collection('days').doc()

          const segments = openDay.segments.map((segment: any) => {
            const segmentData: any = {
              name: segment.name,
              start: segment.start,
              end: segment.end,
              assignments: [],
            }

            if (template && template.matrix) {
              const dayKey = dayOfWeek.toString()
              const templateSegment = template.matrix[dayKey]?.[segment.name]

              if (templateSegment && Array.isArray(templateSegment)) {
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

        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Log audit
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

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error creating schedule:', error)

    if (error.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (error.message === 'PERMISSION_DENIED') {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 })
    }

    if (error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    if (error.message === 'INVALID_DATES') {
      return NextResponse.json(
        { error: 'La date de début doit être antérieure à la date de fin' },
        { status: 400 }
      )
    }

    if (error.message === 'PERIOD_TOO_LONG') {
      return NextResponse.json(
        { error: 'La période ne peut pas dépasser 4 semaines' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création du planning' },
      { status: 500 }
    )
  }
}

