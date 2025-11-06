'use client'

import { useCurrentOrg } from '@/hooks/use-org'
import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus } from 'lucide-react'
import type { LeaveRequest } from '@/types/firestore'
import Link from 'next/link'

export default function LeavesPage() {
  const { currentOrgId, currentMembership } = useCurrentOrg()

  const { data: leaveRequests, isLoading } = useQuery({
    queryKey: ['leaveRequests', currentOrgId],
    queryFn: async () => {
      if (!currentOrgId) return []

      const q = query(
        collection(db, `orgs/${currentOrgId}/leaveRequests`)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LeaveRequest[]
    },
    enabled: !!currentOrgId,
  })

  const isManagerOrOwner =
    currentMembership?.role === 'manager' ||
    currentMembership?.role === 'owner'

  if (isLoading) {
    return <div className="container py-8">Chargement...</div>
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Demandes de congés</h1>
          <p className="mt-2 text-muted-foreground">
            {isManagerOrOwner
              ? 'Gérer les demandes d\'absence de l\'équipe'
              : 'Consulter et créer vos demandes d\'absence'}
          </p>
        </div>
        {!isManagerOrOwner && (
          <Button asChild>
            <Link href="/app/leaves/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle demande
            </Link>
          </Button>
        )}
      </div>

      {leaveRequests && leaveRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold">Aucune demande</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {!isManagerOrOwner && 'Commencez par créer votre première demande de congés'}
            </p>
            {!isManagerOrOwner && (
              <Button asChild className="mt-4">
                <Link href="/app/leaves/new">Créer une demande</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {leaveRequests?.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {getLeaveTypeLabel(request.type)}
                    </CardTitle>
                    <CardDescription>
                      Du {request.startDate} au {request.endDate}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(request.status)}>
                    {getStatusLabel(request.status)}
                  </Badge>
                </div>
              </CardHeader>
              {request.reason && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{request.reason}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function getLeaveTypeLabel(type: string) {
  const labels: Record<string, string> = {
    paid: 'Congé payé',
    unpaid: 'Congé sans solde',
    rtt: 'RTT',
    sick: 'Arrêt maladie',
    other: 'Autre',
  }
  return labels[type] || type
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Refusé',
    canceled: 'Annulé',
  }
  return labels[status] || status
}

function getStatusVariant(status: string) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'secondary',
    approved: 'default',
    rejected: 'destructive',
    canceled: 'outline',
  }
  return variants[status] || 'default'
}
