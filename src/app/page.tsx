'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.push('/app')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">Planneo</span>
          </div>
          <Button onClick={() => router.push('/login')} variant="outline">
            Se connecter
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl">
            Gérez vos plannings
            <span className="block text-primary">en toute simplicité</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Planneo vous aide à organiser les horaires de vos équipes, gérer les
            congés et optimiser votre planning. Simple, intuitif et efficace.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="text-lg"
              onClick={() => router.push('/login')}
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg"
              onClick={() => {
                document
                  .getElementById('features')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              En savoir plus
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-lg text-gray-600">
            Des fonctionnalités pensées pour simplifier votre quotidien
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Planning intuitif
            </h3>
            <p className="text-gray-600">
              Créez et modifiez vos plannings en quelques clics avec une interface
              drag-and-drop simple et efficace.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex rounded-lg bg-green-100 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Gestion d&apos;équipe
            </h3>
            <p className="text-gray-600">
              Gérez plusieurs équipes et organisations depuis un seul compte. Idéal
              pour les multi-sites.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex rounded-lg bg-purple-100 p-3">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Suivi des congés
            </h3>
            <p className="text-gray-600">
              Gérez les demandes de congés, validez ou refusez en un clic, et
              gardez une vue claire sur les absences.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex rounded-lg bg-orange-100 p-3">
              <CheckCircle className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Validation automatique
            </h3>
            <p className="text-gray-600">
              Les demandes sont automatiquement traitées selon vos règles et
              notifiées en temps réel.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="rounded-xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex rounded-lg bg-pink-100 p-3">
              <svg
                className="h-6 w-6 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Mobile friendly
            </h3>
            <p className="text-gray-600">
              Accédez à vos plannings depuis n&apos;importe où, sur mobile, tablette ou
              ordinateur.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="rounded-xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex rounded-lg bg-cyan-100 p-3">
              <svg
                className="h-6 w-6 text-cyan-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Sécurisé
            </h3>
            <p className="text-gray-600">
              Vos données sont protégées avec Firebase. Authentification sécurisée
              et sauvegarde automatique.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-16 text-center text-white shadow-xl">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Prêt à simplifier votre gestion de planning ?
          </h2>
          <p className="mb-8 text-lg text-blue-100">
            Rejoignez les entreprises qui font confiance à Planneo
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg"
            onClick={() => router.push('/login')}
          >
            Commencer maintenant
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2024 Planneo. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
