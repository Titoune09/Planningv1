'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './use-auth'
import type { Membership, Organization } from '@/types/firestore'

export function useUserMemberships() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['memberships', user?.uid],
    queryFn: async () => {
      if (!user) return []

      const memberships: (Membership & { org: Organization })[] = []

      // Query all active memberships for this user
      const membershipsQuery = query(
        collection(db, 'orgs'),
        where('ownerUserId', '==', user.uid)
      )

      // Note: In reality, we'd need to use a collectionGroup query
      // but Firestore rules make this complex. For now, simplified.

      const snapshot = await getDocs(membershipsQuery)

      for (const doc of snapshot.docs) {
        const org = doc.data() as Organization
        memberships.push({
          id: user.uid,
          userId: user.uid,
          orgId: doc.id,
          role: 'owner',
          status: 'active',
          createdAt: org.createdAt,
          updatedAt: org.createdAt,
          org,
        })
      }

      return memberships
    },
    enabled: !!user,
  })
}

export function useCurrentOrg() {
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const { data: memberships, isLoading } = useUserMemberships()

  useEffect(() => {
    if (!isLoading && memberships && memberships.length > 0) {
      // Auto-sélectionner la première org si aucune n'est sélectionnée
      const stored = localStorage.getItem('currentOrgId')
      if (stored && memberships.find((m) => m.orgId === stored)) {
        setCurrentOrgId(stored)
      } else {
        setCurrentOrgId(memberships[0].orgId)
      }
    }
  }, [memberships, isLoading])

  const setOrg = (orgId: string) => {
    setCurrentOrgId(orgId)
    localStorage.setItem('currentOrgId', orgId)
  }

  const currentMembership = memberships?.find((m) => m.orgId === currentOrgId)

  return {
    currentOrgId,
    currentOrg: currentMembership?.org,
    currentMembership,
    setOrg,
    allMemberships: memberships || [],
    isLoading,
  }
}
