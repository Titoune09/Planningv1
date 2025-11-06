import { Timestamp } from 'firebase/firestore'

// ==================== ORGANIZATION ====================

export type Industry =
  | 'restaurant'
  | 'retail'
  | 'healthcare'
  | 'agency'
  | 'events'
  | 'other'

export interface TimeSegment {
  name: string
  start: string // HH:mm format
  end: string // HH:mm format
}

export interface OpenDay {
  day: number // 0=dimanche, 1=lundi, ..., 6=samedi
  isOpen: boolean
  openTime?: string // HH:mm
  closeTime?: string // HH:mm
  segments: TimeSegment[]
}

export interface OrgSettings {
  weekStartsOn: number // 0=dimanche, 1=lundi
  openDays: OpenDay[]
  holidaysRegion?: string // ex: 'FR', 'CA-QC'
  overtimeRules?: {
    dailyThreshold: number // heures
    weeklyThreshold: number // heures
    multiplier: number // ex: 1.5
  }
}

export interface Organization {
  id: string
  name: string
  slug: string
  timezone: string // ex: 'Europe/Paris'
  locale: string // ex: 'fr-FR'
  industry: Industry
  ownerUserId: string
  createdAt: Timestamp
  settings: OrgSettings
}

// ==================== MEMBERSHIP ====================

export type MemberRole = 'owner' | 'manager' | 'employee'
export type MembershipStatus = 'active' | 'invited' | 'disabled'

export interface Membership {
  id: string
  userId: string
  orgId: string
  role: MemberRole
  status: MembershipStatus
  linkedEmployeeId?: string // Lien optionnel vers un profil employé
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ==================== EMPLOYEE ====================

export type ContractType = 'cdi' | 'cdd' | 'extra' | 'interim' | 'stage'

export interface Unavailability {
  day: number // 0-6
  segmentName?: string // si vide, tout le jour
  reason?: string
}

export interface Employee {
  id: string
  orgId: string
  firstName: string
  lastName: string
  roles: string[] // IDs des rôles (définis dans orgs/{orgId}/roles)
  contractType: ContractType
  weeklyHoursTarget?: number
  unavailabilities: Unavailability[]
  notes?: string
  linkedUserId?: string // Lien optionnel vers un compte Auth
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ==================== ROLE ====================

export interface RoleConstraints {
  minStaffPerSegment?: number
  requiredSkills?: string[]
  ageRestriction?: {
    minAge?: number
    maxAge?: number
  }
  regulatoryNotes?: string
}

export interface Role {
  id: string
  orgId: string
  name: string
  color: string // hex color
  level?: number // pour hiérarchie
  constraints?: RoleConstraints
  createdAt: Timestamp
}

// ==================== INVITE ====================

export type InviteStatus = 'pending' | 'used' | 'expired' | 'canceled'

export interface Invite {
  id: string
  orgId: string
  email: string
  targetRole: MemberRole
  employeeId?: string // Si on veut lier à un profil employé existant
  createdBy: string // userId
  token: string
  expiresAt: Timestamp
  status: InviteStatus
  createdAt: Timestamp
  usedAt?: Timestamp
  usedBy?: string
}

// ==================== TEMPLATE ====================

export interface TemplateAssignment {
  role: string // roleId
  count?: number
  employeeIds?: string[]
}

export interface TemplateMatrix {
  [day: string]: {
    // 'monday', 'tuesday', etc.
    [segmentName: string]: TemplateAssignment
  }
}

export interface Template {
  id: string
  orgId: string
  name: string
  season?: string // 'low' | 'high' | 'normal'
  rules?: string[] // descriptions textuelles des règles
  matrix: TemplateMatrix
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ==================== SCHEDULE ====================

export type ScheduleStatus = 'draft' | 'published' | 'archived'

export interface Assignment {
  employeeId: string
  role: string // roleId
  start?: string // HH:mm (override du segment)
  end?: string // HH:mm (override du segment)
}

export interface ScheduleSegment {
  name: string
  start: string // HH:mm
  end: string // HH:mm
  assignments: Assignment[]
}

export interface ScheduleDay {
  id: string
  scheduleId: string
  date: string // YYYY-MM-DD
  segments: ScheduleSegment[]
}

export interface Schedule {
  id: string
  orgId: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  status: ScheduleStatus
  lockedSegments?: string[] // [date-segmentName] ex: ['2024-01-15-midi']
  createdBy: string
  publishedAt?: Timestamp
  publishedBy?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ==================== LEAVE REQUEST ====================

export type LeaveType = 'paid' | 'unpaid' | 'rtt' | 'sick' | 'other'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'canceled'

export interface LeaveRequest {
  id: string
  orgId: string
  employeeId: string
  createdByUserId: string // doit être linkedUserId de l'employé
  type: LeaveType
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  segments?: string[] // si vide, toute la journée
  reason?: string
  status: LeaveStatus
  decidedBy?: string // userId du manager
  decidedAt?: Timestamp
  decisionReason?: string
  attachments?: string[] // URLs vers Storage
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ==================== POLICY ====================

export interface AccrualRule {
  type: LeaveType
  daysPerYear: number
  accrualFrequency: 'monthly' | 'yearly' | 'per_hour'
}

export interface LeavePolicy {
  id: string
  orgId: string
  type: LeaveType
  accrualRules: AccrualRule
  carryOverDays?: number
  maxConcurrentByRole?: { [roleId: string]: number }
  minNoticeDays?: number
  requiresApproval: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ==================== AUDIT LOG ====================

export interface AuditLog {
  id: string
  orgId: string
  actorUserId: string
  action: string // ex: 'schedule.publish', 'leave.approve', 'employee.create'
  entityRef: string // ex: 'schedules/xyz', 'employees/abc'
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  timestamp: Timestamp
  metadata?: Record<string, unknown>
}

// ==================== NOTIFICATION ====================

export type NotificationStatus = 'pending' | 'sent' | 'failed'

export interface Notification {
  id: string
  orgId: string
  to: string // email
  template: string // ex: 'invite', 'schedule_published', 'leave_decision'
  payload: Record<string, unknown>
  status: NotificationStatus
  error?: string
  createdAt: Timestamp
  sentAt?: Timestamp
}

// ==================== USER (global) ====================

export interface User {
  id: string // Auth UID
  displayName?: string
  photoURL?: string
  emailVerified: boolean
  lastOrgId?: string // dernière org visitée
  createdAt: Timestamp
}
