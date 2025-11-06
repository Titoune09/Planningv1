import * as admin from 'firebase-admin'

// Initialize Firebase Admin
admin.initializeApp()

// Export all functions
export { createOrg } from './org/createOrg'
export { inviteUser } from './org/inviteUser'
export { redeemInvite } from './org/redeemInvite'
export { submitLeave } from './leave/submitLeave'
export { decideLeave } from './leave/decideLeave'
export { assignShift } from './schedule/assignShift'

// Triggers
export { onUserCreated } from './triggers/onUserCreated'
export { onLeaveRequestUpdate } from './triggers/onLeaveRequestUpdate'
