'use client'

import { useCurrentOrg } from '@/hooks/use-org'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Plus, UserPlus, Search, Filter, Download } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'

export const dynamic = 'force-dynamic'

export default function EmployeesPage() {
  const { currentOrg, isLoading } = useCurrentOrg()

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="mt-2 h-4 w-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!currentOrg) {
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">Sélectionnez une organisation</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header animé */}
      <motion.div 
        className="mb-8 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Employés
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gérer les membres de votre équipe 👥
          </p>
        </div>
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Inviter
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel employé
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Barre de recherche et filtres */}
      <motion.div 
        className="mb-6 flex gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un employé..." 
            className="pl-9"
            disabled
          />
        </div>
        <Button variant="outline" disabled>
          <Filter className="mr-2 h-4 w-4" />
          Filtres
        </Button>
        <Button variant="outline" disabled>
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </motion.div>

      {/* État vide avec animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="overflow-hidden">
          <CardContent className="py-16 text-center relative">
            {/* Motif d'arrière-plan */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50" />
            
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="inline-block rounded-full bg-purple-100 p-6"
              >
                <Users className="h-16 w-16 text-purple-600" />
              </motion.div>
              
              <motion.h3 
                className="mt-6 text-xl font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Aucun employé pour le moment
              </motion.h3>
              
              <motion.p 
                className="mt-3 text-sm text-muted-foreground max-w-md mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Commencez par ajouter des employés à votre organisation. 
                Vous pourrez ensuite leur assigner des rôles et gérer leurs plannings.
              </motion.p>
              
              <motion.div 
                className="mt-8 flex items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un employé
                </Button>
                <Button variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Inviter par email
                </Button>
              </motion.div>

              <motion.div 
                className="mt-8 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-6 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <p className="text-sm text-blue-900 text-left">
                  <strong>💡 Astuce :</strong> Vous pouvez créer des profils d&apos;employés sans compte,
                  puis leur envoyer une invitation pour qu&apos;ils puissent accéder à l&apos;application
                  et faire des demandes de congés.
                </p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Note de développement avec animation */}
      <motion.div 
        className="mt-6 rounded-xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p className="text-sm text-yellow-900">
          <strong>🚧 En développement :</strong> La page complète de gestion des employés
          avec CRUD, recherche et filtres sera implémentée prochainement.
        </p>
      </motion.div>
    </div>
  )
}
