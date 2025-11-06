# 📅 Planificateur d'Employés Multi-Entreprises

Application de gestion de planning complète construite avec **Next.js**, **Firebase** et **Tailwind CSS**.

## 🎯 Fonctionnalités

- ✅ **Multi-tenant** : Isolation stricte entre organisations
- 👥 **Gestion d'équipe** : Employés, rôles, contrats
- 📆 **Planning** : Création et gestion des horaires par segments
- 🏖️ **Congés** : Demandes et approbation d'absences
- 🔐 **Authentification** : Firebase Auth avec rôles (owner, manager, employee)
- 📧 **Invitations** : Système d'invitation sécurisé
- 🎨 **UI moderne** : shadcn/ui + Tailwind CSS
- 📱 **Mobile-first** : Interface responsive

## 🏗️ Architecture

### Frontend
- **Next.js 14** (App Router)
- **TypeScript** strict
- **Tailwind CSS** + **shadcn/ui**
- **React Query** pour le state management
- **Firebase SDK** (client)

### Backend
- **Firebase Auth** : Authentification
- **Firestore** : Base de données NoSQL
- **Cloud Functions** : Logique métier serveur
- **Storage** : Stockage de fichiers
- **Cloud Scheduler** : Tâches périodiques

## 📦 Prérequis

- Node.js 18+
- npm ou yarn
- Compte Firebase (plan Blaze pour Cloud Functions)
- Firebase CLI : `npm install -g firebase-tools`

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd employee-scheduler
```

### 2. Installer les dépendances

```bash
# Frontend
npm install

# Functions
cd functions
npm install
cd ..
```

### 3. Configuration Firebase

1. Créer un projet Firebase sur [console.firebase.google.com](https://console.firebase.google.com)

2. Activer les services :
   - Authentication (Email/Password)
   - Firestore Database
   - Storage
   - Functions

3. Récupérer la configuration web :
   - Projet Settings > General > Your apps
   - Copier la configuration Firebase

4. Créer le fichier `.env.local` à la racine :

```bash
cp .env.example .env.local
```

5. Remplir les variables :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

6. Se connecter à Firebase CLI :

```bash
firebase login
firebase use --add
```

## 🧪 Développement avec émulateurs

### Démarrer les émulateurs Firebase

```bash
# Terminal 1 : Émulateurs Firebase
npm run emulators
```

### Seed des données de test

```bash
# Terminal 2 : Seed
npm run seed
```

Cela crée :
- Un utilisateur : `demo@example.com` / `password123`
- Une organisation : "Demo Bistro"
- 4 employés avec différents rôles
- 1 demande de congés en attente

### Démarrer le frontend

```bash
# Terminal 3 : Next.js dev server
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Interfaces utiles

- **Frontend** : http://localhost:3000
- **Emulator UI** : http://localhost:4000
- **Firestore Emulator** : http://localhost:8080
- **Auth Emulator** : http://localhost:9099
- **Functions Emulator** : http://localhost:5001

## 📝 Structure du projet

```
/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── login/             # Page de connexion
│   │   ├── onboarding/        # Wizard de création d'org
│   │   └── app/               # Dashboard principal
│   │       ├── planning/      # Gestion du planning
│   │       ├── employees/     # Gestion des employés
│   │       ├── leaves/        # Gestion des congés
│   │       └── settings/      # Paramètres
│   ├── components/            # Composants React
│   │   ├── ui/               # Composants shadcn/ui
│   │   └── auth/             # Guards d'authentification
│   ├── hooks/                 # Hooks personnalisés
│   ├── lib/                   # Utilitaires
│   └── types/                 # Types TypeScript
├── functions/                 # Cloud Functions
│   └── src/
│       ├── org/              # Fonctions organisations
│       ├── leave/            # Fonctions congés
│       ├── schedule/         # Fonctions planning
│       └── triggers/         # Triggers Firestore
├── docs/                      # Documentation
├── scripts/                   # Scripts utilitaires
├── firestore.rules           # Règles de sécurité Firestore
├── firestore.indexes.json    # Index Firestore
└── storage.rules             # Règles de sécurité Storage
```

## 🔐 Modèle de données

### Collections principales

- **`/orgs`** : Organisations
- **`/orgs/{orgId}/memberships`** : Membres d'une org
- **`/orgs/{orgId}/employees`** : Employés (profils internes)
- **`/orgs/{orgId}/roles`** : Rôles/postes
- **`/orgs/{orgId}/schedules`** : Plannings
- **`/orgs/{orgId}/leaveRequests`** : Demandes de congés
- **`/orgs/{orgId}/invites`** : Invitations en attente
- **`/users`** : Profils utilisateurs globaux

Voir [docs/FIRESTORE_SCHEMA.md](docs/FIRESTORE_SCHEMA.md) pour le schéma complet.

## 🛠️ Scripts disponibles

```bash
# Développement
npm run dev                    # Démarrer Next.js en mode dev
npm run emulators             # Démarrer les émulateurs Firebase
npm run seed                  # Peupler l'émulateur avec des données de test

# Production
npm run build                 # Build Next.js
npm start                     # Démarrer en production
npm run functions:build       # Compiler les Cloud Functions
npm run functions:deploy      # Déployer les Functions

# Qualité
npm run lint                  # ESLint
npm run type-check           # TypeScript
npm run format               # Prettier

# Tests
npm test                     # Tests unitaires (Jest)
npm run test:watch          # Tests en mode watch
npm run test:e2e            # Tests E2E (Playwright)
```

## 🚢 Déploiement

### 1. Build et déploiement Vercel (Frontend)

```bash
# Via CLI Vercel
npm i -g vercel
vercel

# Ou via Git (recommandé)
git push origin main
# → Auto-déployé sur Vercel
```

Configurer les variables d'environnement sur Vercel :
- Settings > Environment Variables
- Copier toutes les variables de `.env.local`

### 2. Déploiement Firebase (Backend)

```bash
# Déployer les règles Firestore
firebase deploy --only firestore:rules

# Déployer les index Firestore
firebase deploy --only firestore:indexes

# Déployer les Cloud Functions
npm run functions:deploy

# Tout déployer
firebase deploy
```

## 🔒 Sécurité

- ✅ Règles Firestore strictes par rôle
- ✅ Validation côté serveur (Cloud Functions)
- ✅ Isolation multi-tenant
- ✅ Authentification obligatoire
- ✅ System d'invitations sécurisé
- ✅ Audit logs pour traçabilité

## 📱 Fonctionnalités principales

### Onboarding
1. Identité de l'organisation
2. Configuration des jours ouvrés
3. Création des rôles
4. Ajout des employés
5. Gabarits d'horaires
6. Validation

### Dashboard Manager
- Vue hebdomadaire du planning
- Glisser-déposer des affectations
- Gestion des demandes de congés
- Gestion de l'équipe
- Invitations de nouveaux membres

### Interface Employé
- Consultation du planning
- Demande de congés
- Suivi des demandes

## 🧪 Tests

### Tests unitaires (Cloud Functions)

```bash
cd functions
npm test
```

### Tests E2E (Playwright)

```bash
npm run test:e2e
```

## 📚 Documentation complémentaire

- [Schéma Firestore](docs/FIRESTORE_SCHEMA.md)
- [Cahier des charges complet](docs/CAHIER_DES_CHARGES.md)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

MIT

## 💡 Roadmap

- [ ] Compléter les 6 étapes du wizard d'onboarding
- [ ] Implémenter le glisser-déposer dans le planning
- [ ] Exports PDF/CSV
- [ ] Notifications push (PWA)
- [ ] Mode hors-ligne
- [ ] Intégrations externes (paie, RH)
- [ ] Application mobile (Capacitor)
- [ ] Pointeuse (heures réelles vs prévues)

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation Firebase
- Vérifier les logs dans Firebase Console

---

**Construit avec ❤️ en France**
