'use client'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import type { Employee } from '@/types/firestore'

interface EmployeeDrawerProps {
  employee: Employee | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmployeeDrawer({
  employee,
  open,
  onOpenChange,
}: EmployeeDrawerProps) {
  if (!employee) return null

  const contractLabels = {
    cdi: 'CDI',
    cdd: 'CDD',
    extra: 'Extra',
    interim: 'Intérim',
    stage: 'Stage',
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {employee.firstName} {employee.lastName}
          </SheetTitle>
          <SheetDescription>
            <Badge variant="secondary">
              {contractLabels[employee.contractType]}
            </Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Informations générales */}
          <div>
            <h3 className="mb-2 font-semibold">Informations</h3>
            <div className="space-y-2 text-sm">
              {employee.weeklyHoursTarget && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Heures/semaine :</span>
                  <span>{employee.weeklyHoursTarget}h</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type de contrat :</span>
                <span>{contractLabels[employee.contractType]}</span>
              </div>
              {employee.linkedUserId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Compte lié :</span>
                  <Badge variant="outline" className="text-xs">
                    Oui
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Rôles */}
          <div>
            <h3 className="mb-2 font-semibold">Rôles</h3>
            <div className="flex flex-wrap gap-2">
              {employee.roles.map((roleId) => (
                <Badge key={roleId} variant="secondary">
                  {roleId}
                </Badge>
              ))}
            </div>
          </div>

          {/* Indisponibilités */}
          {employee.unavailabilities.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Indisponibilités</h3>
              <div className="space-y-2">
                {employee.unavailabilities.map((unavail, index) => (
                  <div
                    key={index}
                    className="rounded-lg border bg-muted p-3 text-sm"
                  >
                    <div className="font-medium">
                      {getDayName(unavail.day)}
                    </div>
                    {unavail.segmentName && (
                      <div className="text-muted-foreground">
                        Segment : {unavail.segmentName}
                      </div>
                    )}
                    {unavail.reason && (
                      <div className="text-muted-foreground">
                        {unavail.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {employee.notes && (
            <div>
              <h3 className="mb-2 font-semibold">Notes</h3>
              <p className="text-sm text-muted-foreground">{employee.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="w-full">
              Modifier
            </Button>
            <Button variant="outline" className="w-full">
              Historique
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function getDayName(day: number): string {
  const days = [
    'Dimanche',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
  ]
  return days[day] || ''
}
