# 📊 État d'implémentation du Planificateur d'Employés

**Date** : 2025-11-06  
**Version** : MVP v0.1

## ✅ Fonctionnalités implémentées

### Infrastructure & Configuration
- [x] **Scaffolding complet** Next.js 14 avec App Router
- [x] **TypeScript** strict activé
- [x] **Tailwind CSS** + shadcn/ui configurés
- [x] **ESLint** + **Prettier** pour la qualité du code
- [x] **Firebase SDK** intégré (Auth, Firestore, Functions, Storage)
- [x] **React Query** pour la gestion du state
- [x] Configuration **Vercel** ready
- [x] Configuration **Firebase Emulators**

### Authentification & Sécurité
- [x] Firebase Auth (Email/Password)
- [x] Route guards pour pages protégées
- [x] Hook `useAuth()` personnalisé
- [x] Pages Login/Signup
- [x] **Firestore Rules** strictes par rôle
- [x] **Storage Rules** avec isolation par org
- [x] Système d'**invitations** sécurisé

### Modèle de données
- [x] **Types TypeScript** complets pour toutes les entités
- [x] Schéma Firestore documenté
- [x] Index Firestore optimisés
- [x] Collections :
  - Organizations
  - Memberships (multi-tenant)
  - Employees (profils internes)
  - Roles
  - Invites
  - LeaveRequests
  - Schedules + Days (sous-collection)
  - Policies
  - AuditLogs
  - Notifications (outbox)
  - Users (global)

### Cloud Functions
- [x] `createOrg` - Création d'organisation avec données par défaut
- [x] `inviteUser` - Invitation de nouveaux membres
- [x] `redeemInvite` - Acceptation d'invitation
- [x] `submitLeave` - Soumission de demande de congé
- [x] `decideLeave` - Approbation/refus de congé
- [x] `assignShift` - Affectation d'employé à un segment
- [x] `onUserCreated` - Trigger création profil utilisateur
- [x] `onLeaveRequestUpdate` - Trigger mise à jour congés
- [x] Utilitaires : slugify, auth helpers, defaults par industrie

### Interface Utilisateur

#### Composants UI de base (shadcn/ui)
- [x] Button
- [x] Input
- [x] Label
- [x] Card
- [x] Select
- [x] Badge
- [x] Dialog
- [x] Sheet (Drawer)
- [x] Toast/Toaster
- [x] Progress

#### Composants métier
- [x] `AuthGuard` - Protection des routes
- [x] `OrgSelector` - Sélecteur d'organisation
- [x] `OnboardingWizard` - Wizard en 6 étapes (étape 1 complète)
- [x] `EmployeeDrawer` - Fiche employé en sidebar
- [x] `InviteDialog` - Dialogue d'invitation
- [x] `LeavePanel` - Panneau de gestion des congés

#### Pages
- [x] `/login` - Connexion/Inscription
- [x] `/onboarding` - Wizard de création d'org
- [x] `/app` - Dashboard principal avec navigation
- [x] `/app/planning` - Vue hebdomadaire du planning (placeholder)
- [x] `/app/leaves` - Liste des demandes de congés
- [x] `/app/employees` - (à implémenter)
- [x] `/app/settings` - (à implémenter)

#### Hooks personnalisés
- [x] `useAuth()` - Gestion authentification
- [x] `useCurrentOrg()` - Organisation courante
- [x] `useUserMemberships()` - Liste des orgs de l'utilisateur
- [x] `useToast()` - Notifications toast

### Développement & Tests
- [x] **Script seed** pour émulateur Firebase
- [x] Configuration **Jest** pour tests unitaires
- [x] Configuration **Playwright** pour tests E2E
- [x] Tests de base pour Cloud Functions
- [x] Tests E2E pour onboarding
- [x] **README** complet avec instructions

### Documentation
- [x] Schéma Firestore détaillé
- [x] Cahier des charges intégré
- [x] README avec guide de démarrage
- [x] Document d'état d'implémentation

---

## 🚧 Fonctionnalités à compléter (Roadmap)

### Onboarding (Wizard)
- [x] **Étape 2** : Configuration avancée des jours ouvrés ✅
  - Sélection interactive des jours
  - Définition des segments horaires personnalisés
  - Ajout/suppression de segments dynamique
- [x] **Étape 3** : Création/édition des rôles ✅
  - Formulaire de rôle avec couleur picker
  - Configuration du niveau hiérarchique
  - 8 couleurs prédéfinies + sélecteur personnalisé
- [x] **Étape 4** : Ajout d'employés initiaux ✅ (optionnel)
  - Formulaire d'employé complet
  - Assignation de rôles multiples
  - Sélection du type de contrat
- [x] **Étape 6** : Récapitulatif amélioré ✅
  - Affichage détaillé de toutes les données
  - Validation visuelle avant création
- [ ] **Étape 5** : Gabarits d'horaires (reporté - fonctionnalité avancée)
  - Matrice jour × segment
  - Affectation par rôle ou par employé
  - Règles de rotation
- [ ] Génération automatique du premier planning

### Planning
- [ ] **CalendarGrid** complet avec :
  - Affichage des segments configurés
  - Liste des employés disponibles
  - **Glisser-déposer** des employés sur les segments
  - Indicateurs visuels de conflits
  - Badges pour effectif min/max
- [ ] **Détection de conflits** :
  - Chevauchement d'horaires
  - Absences approuvées
  - Indisponibilités déclarées
  - Dépassement quota hebdo
- [ ] **Publication de planning** :
  - Changement de statut draft → published
  - Verrouillage de segments
  - Notification automatique par email
- [ ] **Historique & versions**
- [ ] **Templates** - Application d'un gabarit sur une semaine

### Gestion d'équipe
- [ ] Page **/app/employees** complète :
  - Table avec recherche/filtres
  - Création/édition d'employé
  - Suppression (soft delete)
  - Invitation via email
  - Liaison compte ↔ employé
- [ ] Page employé individuelle avec :
  - Historique de shifts
  - Statistiques heures travaillées
  - Liste des absences
  - Documents attachés

### Congés (améliorations)
- [ ] Page de **création de demande** (`/app/leaves/new`) :
  - Sélecteur de dates
  - Choix du type de congé
  - Upload de justificatif (Storage)
  - Prévisualisation impact sur planning
- [ ] **Tableau de bord congés** pour managers :
  - Filtres par employé/statut/période
  - Statistiques (jours restants, etc.)
  - Export CSV
- [ ] **Calcul automatique** des soldes de congés
- [ ] **Notifications email** automatiques
- [ ] **Calendrier des absences** de l'équipe

### Paramètres
- [ ] Page **/app/settings** :
  - Informations générales de l'org
  - Modification du slug
  - Jours ouvrés & segments
  - Gestion des rôles
  - Politiques de congés
  - Paramètres de notification
  - Danger zone (suppression org)
- [ ] Gestion des **membres** :
  - Liste des memberships
  - Changement de rôle
  - Désactivation/réactivation
  - Historique des invitations

### Notifications
- [ ] **Extension Firebase** ou **Cloud Function** pour envoi d'emails :
  - Templates MJML/Handlebars
  - Trigger sur création notification
  - Rendu côté serveur
- [ ] **Push notifications** (PWA) :
  - Service Worker
  - Firebase Cloud Messaging
  - Abonnement par utilisateur

### Exports & Rapports
- [ ] **Export PDF** :
  - Planning individuel (mois)
  - Planning équipe (semaine)
  - Récapitulatif heures
- [ ] **Export CSV** :
  - Pour paie
  - Pour comptabilité
  - Listing des absences
- [ ] **Statistiques** :
  - Dashboard analytics
  - Heures par rôle/employé
  - Taux de présence

### Fonctionnalités avancées
- [ ] **Pointeuse** (heures réelles vs prévues)
- [ ] **Mode hors-ligne** (PWA + sync)
- [ ] **Équilibrage automatique** des effectifs
- [ ] **Règles métier** configurables :
  - Repos obligatoires
  - Rotation des week-ends
  - Limites horaires (mineurs, etc.)
- [ ] **Multi-sites** pour une même org
- [ ] **Intégrations** :
  - Paie (exports dédiés)
  - RH (SIRH)
  - Webhooks sortants
- [ ] **Applications mobiles natives** (Capacitor)

### Tests
- [ ] **Tests unitaires** complets pour Cloud Functions
- [ ] **Tests E2E** pour tous les parcours critiques :
  - Création d'organisation complète
  - Création/publication planning
  - Workflow congés (soumission + décision)
  - Invitation + acceptation
- [ ] **Tests d'intégration** avec émulateurs
- [ ] **Tests de performance** (Lighthouse)
- [ ] **Tests de sécurité** (Firestore Rules)

### DevOps & Production
- [ ] **CI/CD** (GitHub Actions) :
  - Lint + TypeCheck
  - Tests unitaires
  - Tests E2E
  - Build
  - Deploy Vercel + Firebase
- [ ] **Monitoring** :
  - Sentry pour erreurs frontend
  - Firebase Performance Monitoring
  - Alertes Cloud Functions
- [ ] **Backup** automatique Firestore
- [ ] **Logs structurés** avec niveaux
- [ ] **Rate limiting** sur CF
- [ ] **Gestion des secrets** (Google Secret Manager)

---

## 🎯 Prochaines étapes prioritaires

### Phase 1 (MVP fonctionnel)
1. ✅ **Onboarding complet** (étapes 1-4 + 6) → **TERMINÉ** 🎉
   - Étape 5 (gabarits) reportée pour Phase 3
2. Implémenter le **drag & drop** dans le planning
3. Détection de **conflits** de base
4. Page **/app/employees** avec CRUD complet
5. Formulaire de **demande de congés** (/app/leaves/new)
6. **Notifications email** basiques (via Extension Firebase)

### Phase 2 (Production Ready)
1. Tests E2E complets
2. CI/CD automatisé
3. Documentation utilisateur
4. Monitoring & alertes
5. Performance optimization
6. Gestion des erreurs robuste

### Phase 3 (Fonctionnalités avancées)
1. Exports PDF/CSV
2. Statistiques & analytics
3. Pointeuse (heures réelles)
4. Mode hors-ligne
5. Équilibrage automatique
6. Applications mobiles

---

## 📦 Dépendances & Stack technique

### Frontend
- Next.js 14.1.0
- React 18.2.0
- TypeScript 5.3.3
- Tailwind CSS 3.4.1
- Radix UI (composants)
- React Query 5.17.19
- date-fns 3.0.6
- Zustand 4.4.7 (si besoin)

### Backend
- Firebase Admin 12.0.0
- Firebase Functions v2
- Zod 3.22.4 (validation)
- nanoid 5.0.4 (tokens)

### Dev & Tests
- Jest 29.7.0
- Playwright 1.40.1
- ESLint 8.56.0
- Prettier 3.1.1
- tsx 4.7.0

### Services Firebase
- Authentication
- Firestore
- Cloud Functions (Gen 2)
- Storage
- Cloud Scheduler

---

## 🔗 Liens utiles

- [Cahier des charges complet](./CAHIER_DES_CHARGES.md)
- [Schéma Firestore](./FIRESTORE_SCHEMA.md)
- [README principal](../README.md)
- [Firebase Console](https://console.firebase.google.com)
- [Vercel Dashboard](https://vercel.com)

---

## 👥 Notes pour les développeurs

### Conventions de code
- **Commits** : messages clairs en français
- **Branches** : `feature/nom-feature`, `fix/nom-bug`
- **PR** : obligatoires avec review
- **Types** : strictement typé, pas de `any`
- **Components** : nommage PascalCase
- **Hooks** : préfixe `use`
- **Utils** : camelCase

### Architecture
- **Client-side** : Jamais de logique critique côté client
- **Server-side** : Toute validation dans Cloud Functions
- **Security** : Firestore Rules + CF validation (double check)
- **State** : React Query pour async, Zustand pour local si besoin
- **Errors** : Toujours catcher et logger
- **Performance** : Lazy loading, code splitting, memoization

### Bonnes pratiques
- Tester sur émulateurs avant prod
- Documenter les fonctions complexes
- Éviter les N+1 queries Firestore
- Utiliser les index composites
- Minimiser les reads/writes Firestore
- Préférer batch/transactions
- Audit logs pour actions critiques

---

**Construit avec ❤️ — Prêt pour le développement !**
