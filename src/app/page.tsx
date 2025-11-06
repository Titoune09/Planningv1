import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirection vers l'onboarding ou dashboard selon l'état d'auth
  redirect('/login')
}
