'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { decideLeave } from '@/lib/firebase-client'
import { Check, X } from 'lucide-react'
import type { LeaveRequest } from '@/types/firestore'

interface LeavePanelProps {
  orgId: string
  requests: LeaveRequest[]
  onUpdate?: () => void
}

export function LeavePanel({ orgId, requests, onUpdate }: LeavePanelProps) {
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null
  )
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(
    null
  )
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const pendingRequests = requests.filter((r) => r.status === 'pending')

  const handleDecision = (
    request: LeaveRequest,
    dec: 'approved' | 'rejected'
  ) => {
    setSelectedRequest(request)
    setDecision(dec)
  }

  const handleSubmit = async () => {
    if (!selectedRequest || !decision) return

    setIsLoading(true)
    try {
      const result = await decideLeave({
        orgId,
        requestId: selectedRequest.id,
        decision,
        reason: reason || undefined,
      })

      if (result.data.success) {
        toast({
          title: decision === 'approved' ? 'Demande approuvée' : 'Demande refusée',
          description: 'La décision a été enregistrée.',
        })
        setSelectedRequest(null)
        setDecision(null)
        setReason('')
        onUpdate?.()
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer la décision',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Aucune demande en attente
              </p>
            </CardContent>
          </Card>
        ) : (
          pendingRequests.map((request) => (
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
                  <Badge variant="secondary">En attente</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {request.reason && (
                  <p className="mb-4 text-sm text-muted-foreground">
                    {request.reason}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleDecision(request, 'approved')}
                    className="flex-1"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approuver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDecision(request, 'rejected')}
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Refuser
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de confirmation */}
      <Dialog
        open={!!selectedRequest}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequest(null)
            setDecision(null)
            setReason('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decision === 'approved'
                ? 'Approuver la demande'
                : 'Refuser la demande'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest &&
                `${getLeaveTypeLabel(selectedRequest.type)} du ${
                  selectedRequest.startDate
                } au ${selectedRequest.endDate}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">
                Commentaire {decision === 'rejected' && '(requis)'}
              </Label>
              <Input
                id="reason"
                placeholder="Motif de votre décision..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required={decision === 'rejected'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRequest(null)
                setDecision(null)
                setReason('')
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || (decision === 'rejected' && !reason)}
            >
              {isLoading ? 'Enregistrement...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
