'use client'

import { useCurrentOrg } from '@/hooks/use-org'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronLeft, ChevronRight, Plus, Download, Eye } from 'lucide-react'
import { useState } from 'react'
import { addWeeks, format, startOfWeek, addDays, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion } from 'framer-motion'

export const dynamic = 'force-dynamic'

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
      {/* Header animé */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Planning
            </h1>
            <p className="mt-2 text-muted-foreground">
              📅 Semaine du {format(weekStart, 'd MMMM yyyy', { locale: fr })}
            </p>
          </div>
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau planning
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Publier
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Navigation semaine */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="outline" size="icon" onClick={previousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={today} className="min-w-[140px]">
              Aujourd&apos;hui
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="outline" size="icon" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Calendar Grid avec animations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="overflow-hidden shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Vue hebdomadaire
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-3">
              {days.map((day, index) => (
                <motion.div
                  key={day.toISOString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className={`min-h-[250px] rounded-xl border-2 p-4 transition-all ${
                    isToday(day)
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="mb-3 text-center">
                    <p className="text-sm font-medium text-muted-foreground uppercase">
                      {format(day, 'EEE', { locale: fr })}
                    </p>
                    <p className={`text-3xl font-bold ${isToday(day) ? 'text-blue-600' : ''}`}>
                      {format(day, 'd')}
                    </p>
                    {isToday(day) && (
                      <span className="mt-1 inline-block rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                        Aujourd&apos;hui
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {/* Placeholder pour les segments/affectations avec animations */}
                    <motion.div 
                      className="rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 p-3 text-xs"
                      whileHover={{ scale: 1.05 }}
                    >
                      <p className="font-semibold text-blue-900">Midi</p>
                      <p className="mt-1 text-blue-700">11:30 - 15:00</p>
                      <p className="mt-2 text-blue-600">Aucune affectation</p>
                    </motion.div>
                    <motion.div 
                      className="rounded-lg bg-gradient-to-r from-purple-100 to-purple-200 p-3 text-xs"
                      whileHover={{ scale: 1.05 }}
                    >
                      <p className="font-semibold text-purple-900">Soir</p>
                      <p className="mt-1 text-purple-700">18:30 - 23:00</p>
                      <p className="mt-2 text-purple-600">Aucune affectation</p>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Note de développement avec animation */}
      <motion.div 
        className="mt-6 rounded-xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-start gap-3">
          <Calendar className="h-6 w-6 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-900 mb-2">
              🚧 Fonctionnalités à venir
            </p>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Glisser-déposer des employés sur les segments</li>
              <li>Gestion des affectations en temps réel</li>
              <li>Détection automatique des conflits d&apos;horaires</li>
              <li>Templates de planning réutilisables</li>
              <li>Notifications automatiques aux employés</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
