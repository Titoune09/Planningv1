/**
 * Types partagés avec le frontend (copie simplifiée)
 */

export type Industry =
  | 'restaurant'
  | 'retail'
  | 'healthcare'
  | 'agency'
  | 'events'
  | 'other'

export type MemberRole = 'owner' | 'manager' | 'employee'
export type MembershipStatus = 'active' | 'invited' | 'disabled'
export type LeaveType = 'paid' | 'unpaid' | 'rtt' | 'sick' | 'other'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'canceled'
