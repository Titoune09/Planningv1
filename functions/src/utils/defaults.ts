import type { Industry } from '../types'

export interface DefaultRole {
  name: string
  color: string
  level?: number
}

export interface DefaultSegment {
  name: string
  start: string
  end: string
}

/**
 * Rôles par défaut selon l'industrie
 */
export function getDefaultRoles(industry: Industry): DefaultRole[] {
  switch (industry) {
    case 'restaurant':
      return [
        { name: 'Serveur', color: '#3b82f6', level: 1 },
        { name: 'Chef', color: '#ef4444', level: 3 },
        { name: 'Commis', color: '#8b5cf6', level: 1 },
        { name: 'Manager', color: '#10b981', level: 4 },
      ]
    case 'retail':
      return [
        { name: 'Vendeur', color: '#3b82f6', level: 1 },
        { name: 'Caissier', color: '#8b5cf6', level: 1 },
        { name: 'Manager', color: '#10b981', level: 3 },
      ]
    case 'healthcare':
      return [
        { name: 'Infirmier', color: '#3b82f6', level: 2 },
        { name: 'Aide-soignant', color: '#8b5cf6', level: 1 },
        { name: 'Médecin', color: '#ef4444', level: 4 },
      ]
    default:
      return [
        { name: 'Employé', color: '#3b82f6', level: 1 },
        { name: 'Manager', color: '#10b981', level: 2 },
      ]
  }
}

/**
 * Segments horaires par défaut selon l'industrie
 */
export function getDefaultSegments(industry: Industry): DefaultSegment[] {
  switch (industry) {
    case 'restaurant':
      return [
        { name: 'Midi', start: '11:30', end: '15:00' },
        { name: 'Soir', start: '18:30', end: '23:00' },
      ]
    case 'retail':
      return [
        { name: 'Matin', start: '09:00', end: '13:00' },
        { name: 'Après-midi', start: '13:00', end: '18:00' },
      ]
    case 'healthcare':
      return [
        { name: 'Matin', start: '06:00', end: '14:00' },
        { name: 'Après-midi', start: '14:00', end: '22:00' },
        { name: 'Nuit', start: '22:00', end: '06:00' },
      ]
    default:
      return [
        { name: 'Journée', start: '09:00', end: '17:00' },
      ]
  }
}

/**
 * Configuration des jours ouverts par défaut
 */
export function getDefaultOpenDays(industry: Industry) {
  const segments = getDefaultSegments(industry)

  return [
    { day: 1, isOpen: true, segments }, // Lundi
    { day: 2, isOpen: true, segments }, // Mardi
    { day: 3, isOpen: true, segments }, // Mercredi
    { day: 4, isOpen: true, segments }, // Jeudi
    { day: 5, isOpen: true, segments }, // Vendredi
    { day: 6, isOpen: true, segments }, // Samedi
    { day: 0, isOpen: industry === 'restaurant', segments }, // Dimanche
  ]
}
