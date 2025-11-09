import { auth } from './firebase'

type TimeSegment = {
  name: string
  start: string
  end: string
}

type OpenDay = {
  day: number
  isOpen: boolean
  segments: TimeSegment[]
}

type RoleData = {
  name: string
  color: string
  level?: number
}

type EmployeeData = {
  firstName: string
  lastName: string
  roles: string[]
  contractType: 'cdi' | 'cdd' | 'extra' | 'interim' | 'stage'
}

type TemplateData = {
  name: string
  season?: 'low' | 'high' | 'normal'
  matrix: {
    [day: string]: {
      [segmentName: string]: {
        roleIndex: number
        count: number
      }[]
    }
  }
}

/**
 * Helper pour appeler les API Routes avec authentification
 */
async function apiCall<T = any>(endpoint: string, data: any): Promise<T> {
  const user = auth.currentUser
  if (!user) {
    throw new Error('Non authentifié')
  }

  const token = await user.getIdToken()

  const response = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erreur lors de la requête')
  }

  return response.json()
}

export const createOrg = async (data: {
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
  openDays?: OpenDay[]
  roles?: RoleData[]
  employees?: EmployeeData[]
  templates?: TemplateData[]
}): Promise<{ data: { success: boolean; orgId: string; slug: string } }> => {
  const result = await apiCall<{ success: boolean; orgId: string; slug: string }>(
    'createOrg',
    data
  )
  return { data: result }
}

export const inviteUser = async (data: {
  orgId: string
  email: string
  targetRole?: 'manager' | 'employee'
  employeeId?: string
}): Promise<{ data: { success: boolean; inviteId: string; token: string } }> => {
  const result = await apiCall<{ success: boolean; inviteId: string; token: string }>(
    'inviteUser',
    data
  )
  return { data: result }
}

export const redeemInvite = async (data: {
  token: string
}): Promise<{ data: { success: boolean; orgId: string; role: string } }> => {
  const result = await apiCall<{ success: boolean; orgId: string; role: string }>(
    'redeemInvite',
    data
  )
  return { data: result }
}

export const submitLeave = async (data: {
  orgId: string
  employeeId: string
  type: 'paid' | 'unpaid' | 'rtt' | 'sick' | 'other'
  startDate: string
  endDate: string
  segments?: string[]
  reason?: string
  attachments?: string[]
}): Promise<{ data: { success: boolean; requestId: string } }> => {
  const result = await apiCall<{ success: boolean; requestId: string }>(
    'submitLeave',
    data
  )
  return { data: result }
}

export const decideLeave = async (data: {
  orgId: string
  requestId: string
  decision: 'approved' | 'rejected'
  reason?: string
}): Promise<{ data: { success: boolean; requestId: string; decision: string } }> => {
  const result = await apiCall<{ success: boolean; requestId: string; decision: string }>(
    'decideLeave',
    data
  )
  return { data: result }
}

export const createSchedule = async (data: {
  orgId: string
  startDate: string
  endDate: string
  templateId?: string
}): Promise<{ data: { success: boolean; scheduleId: string; daysCreated: number } }> => {
  const result = await apiCall<{ success: boolean; scheduleId: string; daysCreated: number }>(
    'createSchedule',
    data
  )
  return { data: result }
}

export const assignShift = async (data: {
  orgId: string
  scheduleId: string
  dayId: string
  segmentName: string
  employeeId: string
  role: string
  start?: string
  end?: string
}): Promise<{ data: { success: boolean } }> => {
  const result = await apiCall<{ success: boolean }>('assignShift', data)
  return { data: result }
}
