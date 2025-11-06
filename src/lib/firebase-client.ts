import { httpsCallable } from 'firebase/functions'
import { functions } from './firebase'

export const createOrg = httpsCallable<
  {
    name: string
    slug?: string
    timezone?: string
    locale?: string
    industry?:
      | 'restaurant'
      | 'retail'
      | 'healthcare'
      | 'agency'
      | 'events'
      | 'other'
  },
  { success: boolean; orgId: string; slug: string }
>(functions, 'createOrg')

export const inviteUser = httpsCallable<
  {
    orgId: string
    email: string
    targetRole?: 'manager' | 'employee'
    employeeId?: string
  },
  { success: boolean; inviteId: string; token: string }
>(functions, 'inviteUser')

export const redeemInvite = httpsCallable<
  { token: string },
  { success: boolean; orgId: string; role: string }
>(functions, 'redeemInvite')

export const submitLeave = httpsCallable<
  {
    orgId: string
    employeeId: string
    type: 'paid' | 'unpaid' | 'rtt' | 'sick' | 'other'
    startDate: string
    endDate: string
    segments?: string[]
    reason?: string
    attachments?: string[]
  },
  { success: boolean; requestId: string }
>(functions, 'submitLeave')

export const decideLeave = httpsCallable<
  {
    orgId: string
    requestId: string
    decision: 'approved' | 'rejected'
    reason?: string
  },
  { success: boolean; requestId: string; decision: string }
>(functions, 'decideLeave')

export const assignShift = httpsCallable<
  {
    orgId: string
    scheduleId: string
    dayId: string
    segmentName: string
    employeeId: string
    role: string
    start?: string
    end?: string
  },
  { success: boolean }
>(functions, 'assignShift')
