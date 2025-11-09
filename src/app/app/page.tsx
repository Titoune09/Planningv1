'use client'

import { useCurrentOrg } from '@/hooks/use-org'
import { Button } from '@/components/ui/button'
import { Calendar, Users, FileText, Settings, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export const dynamic = 'force-dynamic'

export default function AppHomePage() {
  const { currentOrg, isLoading } = useCurrentOrg()

  if (isLoading) {
    return <div className="container py-8">Chargement...</div>
  }

  if (!currentOrg) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Bienvenue !</h2>
          <p className="mt-2 text-muted-foreground">
            Vous n&apos;avez pas encore d&apos;organisation.
          </p>
          <Button asChild className="mt-4">
            <Link href="/onboarding">Créer une organisation</Link>
          </Button>
        </div>
      </div>
    )
  }

  const stats = [
    { 
      label: 'Employés actifs', 
      value: '0', 
      icon: Users, 
      trend: '+0%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Demandes en attente', 
      value: '0', 
      icon: AlertCircle, 
      trend: '0',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    { 
      label: 'Heures planifiées', 
      value: '0h', 
      icon: Clock, 
      trend: '+0%',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
  ]

  const quickActions = [
    {
      href: '/app/planning',
      icon: Calendar,
      title: 'Planning',
      description: 'Créer et gérer les horaires',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      href: '/app/employees',
      icon: Users,
      title: 'Employés',
      description: 'Gérer votre équipe',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      href: '/app/leaves',
      icon: FileText,
      title: 'Congés',
      description: 'Demandes d\'absence',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      href: '/app/settings',
      icon: Settings,
      title: 'Paramètres',
      description: 'Configuration',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  ]

  return (
    <div className="container py-8">
      {/* Header animé */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {currentOrg.name}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Bienvenue dans votre espace de gestion 👋
        </p>
      </motion.div>

      {/* Statistiques rapides avec animations */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                <div className="mt-1 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-600">{stat.trend}</p>
                </div>
              </div>
              <div className={`rounded-full p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions rapides avec animations améliorées */}
      <div>
        <motion.h3 
          className="mb-6 text-xl font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Actions rapides
        </motion.h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Link
                href={action.href}
                className="block rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className={`inline-flex rounded-lg p-3 ${action.bgColor}`}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <h3 className="mt-4 font-semibold text-lg">{action.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {action.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Message d'encouragement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-blue-100 p-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900">Commencez à optimiser votre gestion</h4>
            <p className="mt-1 text-sm text-blue-700">
              Ajoutez vos employés, configurez vos horaires et créez votre premier planning en quelques clics !
            </p>
            <div className="mt-4 flex gap-3">
              <Button asChild size="sm">
                <Link href="/app/employees">Ajouter des employés</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/app/planning">Créer un planning</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
