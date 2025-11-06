'use client'

import { useCurrentOrg } from '@/hooks/use-org'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { addWeeks, format, startOfWeek, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function PlanningPage() {
  const { currentOrg } = useCurrentOrg()
  const [currentDate, setCurrentDate] = useState(new Date())

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const previousWeek = () => setCurrentDate(addWeeks(currentDate, -1))
  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
  const today = () => setCurrentDate(new Date())

  if (!currentOrg) {
    return <div className="container py-8">Sélectionnez une organisation</div>
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Planning</h1>
          <p className="mt-2 text-muted-foreground">
            Semaine du {format(weekStart, 'd MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={previousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={today}>
            Aujourd&apos;hui
          </Button>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Vue hebdomadaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className="min-h-[200px] rounded-lg border p-4"
              >
                <div className="mb-2 text-center">
                  <p className="text-sm font-medium">
                    {format(day, 'EEE', { locale: fr })}
                  </p>
                  <p className="text-2xl font-bold">{format(day, 'd')}</p>
                </div>
                <div className="space-y-2">
                  {/* Placeholder pour les segments/affectations */}
                  <div className="rounded bg-blue-100 p-2 text-xs text-blue-900">
                    Midi: vide
                  </div>
                  <div className="rounded bg-purple-100 p-2 text-xs text-purple-900">
                    Soir: vide
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Placeholder notice */}
      <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-start gap-2">
          <Calendar className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-900">
              Composant CalendarGrid en développement
            </p>
            <p className="mt-1 text-sm text-yellow-700">
              Le glisser-déposer des employés sur les segments sera implémenté prochainement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
