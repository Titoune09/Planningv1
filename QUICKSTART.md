# 🚀 Démarrage Rapide — Planificateur d'Employés

Guide ultra-rapide pour démarrer le projet en **5 minutes**.

## ⚡ Installation Express

```bash
# 1. Cloner et installer
git clone <url-du-repo>
cd employee-scheduler
npm install
cd functions && npm install && cd ..

# 2. Créer le fichier .env.local
cp .env.example .env.local
# → Éditer .env.local avec vos clés Firebase

# 3. Se connecter à Firebase
firebase login
firebase use --add
```

## 🧪 Mode Développement (Émulateurs)

### Terminal 1 : Émulateurs Firebase
```bash
npm run emulators
```

Attend que tous les émulateurs soient démarrés (Auth, Firestore, Functions, Storage).

### Terminal 2 : Seed des données
```bash
npm run seed
```

Cela crée :
- ✅ Utilisateur : `demo@example.com` / `password123`
- ✅ Organisation : "Demo Bistro"
- ✅ 4 employés
- ✅ Demande de congés en attente

### Terminal 3 : Frontend Next.js
```bash
npm run dev
```

## 🌐 Accéder à l'application

- **Frontend** : http://localhost:3000
- **Emulator UI** : http://localhost:4000

## 🔐 Se connecter

1. Aller sur http://localhost:3000/login
2. Email : `demo@example.com`
3. Mot de passe : `password123`
4. Cliquer sur "Se connecter"

Vous êtes dans l'app ! 🎉

## 📦 Structure rapide

```
src/
├── app/              # Pages Next.js
│   ├── login/       # Connexion
│   ├── onboarding/  # Création d'org
│   └── app/         # Dashboard
├── components/       # Composants React
├── hooks/           # Hooks (useAuth, useOrg)
├── lib/             # Config Firebase
└── types/           # Types TypeScript

functions/src/
├── org/             # CF organisations
├── leave/           # CF congés
├── schedule/        # CF planning
└── triggers/        # Triggers Firestore
```

## 🔥 Cloud Functions disponibles

- `createOrg` - Créer une organisation
- `inviteUser` - Inviter un membre
- `redeemInvite` - Accepter une invitation
- `submitLeave` - Demander un congé
- `decideLeave` - Approuver/refuser un congé
- `assignShift` - Affecter un employé à un segment

## 🎯 Tester rapidement

### Créer une organisation
1. S'inscrire avec un nouveau compte
2. Suivre le wizard d'onboarding
3. Remplir le nom → Terminer
4. Vous êtes sur le dashboard !

### Voir les demandes de congés
1. Se connecter avec `demo@example.com`
2. Aller sur "Congés" dans le menu
3. Voir la demande en attente
4. L'approuver ou la refuser

### Voir le planning
1. Aller sur "Planning"
2. Voir la vue hebdomadaire
3. (Le drag & drop sera implémenté plus tard)

## 🛠️ Commandes utiles

```bash
# Dev
npm run dev              # Frontend
npm run emulators       # Émulateurs Firebase
npm run seed            # Peupler l'émulateur

# Build
npm run build           # Build Next.js
npm run functions:build # Build Functions

# Quality
npm run lint            # ESLint
npm run type-check     # TypeScript
npm run format         # Prettier

# Tests
npm test               # Jest
npm run test:e2e      # Playwright
```

## 🐛 Problèmes courants

### "Firebase not initialized"
→ Vérifier que `.env.local` contient toutes les variables

### "Error connecting to emulators"
→ S'assurer que les émulateurs sont démarrés (`npm run emulators`)

### "User not found"
→ Exécuter `npm run seed` pour créer les données de test

### Port déjà utilisé
→ Changer les ports dans `firebase.json` (emulators section)

## 📚 Documentation complète

- [README principal](./README.md)
- [Cahier des charges](./docs/CAHIER_DES_CHARGES.md)
- [Schéma Firestore](./docs/FIRESTORE_SCHEMA.md)
- [État d'implémentation](./docs/IMPLEMENTATION_STATUS.md)

## 🚢 Déploiement sur Vercel

### Prérequis
1. Compte Vercel (gratuit)
2. Projet Firebase configuré en production
3. Variables d'environnement Firebase prêtes

### Étapes de déploiement

#### 1. Connecter le projet à Vercel
```bash
# Installer Vercel CLI (si nécessaire)
npm i -g vercel

# Se connecter
vercel login

# Lier le projet
vercel link
```

#### 2. Configurer les variables d'environnement sur Vercel

**Option A : Via le Dashboard Vercel**
1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet
3. Aller dans Settings → Environment Variables
4. Ajouter les variables suivantes :

```
NEXT_PUBLIC_FIREBASE_API_KEY=votre-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre-projet-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=votre-app-id
NEXT_PUBLIC_ENV=production
```

**Option B : Via CLI**
```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
vercel env add NEXT_PUBLIC_ENV production
```

#### 3. Déployer

**Automatique (recommandé)**
```bash
git push origin main
# Vercel déploie automatiquement via GitHub/GitLab
```

**Manuel**
```bash
# Build local
npm run build

# Deploy
vercel --prod
```

#### 4. Déployer Firebase Functions
```bash
# Build les functions
npm run functions:build

# Deploy sur Firebase
firebase deploy --only functions
```

### ⚠️ Problèmes courants de déploiement

#### Erreur 404 : NOT_FOUND
**Causes possibles :**
- ❌ Variables d'environnement manquantes ou incorrectes
- ❌ Build échoué silencieusement
- ❌ Dépendances incorrectes (ex: firebase-admin dans le projet principal)

**Solutions :**
1. Vérifier les logs de build Vercel
2. S'assurer que toutes les variables d'environnement sont configurées
3. Vérifier que `firebase-admin` n'est PAS dans les dependencies du package.json principal
4. Redéployer après avoir corrigé les problèmes

#### Build qui échoue
**Vérifier :**
```bash
# Tester le build localement
npm run build

# Vérifier les types
npm run type-check

# Vérifier le lint
npm run lint
```

#### Firebase Functions qui ne répondent pas
**Solutions :**
1. Vérifier que les functions sont déployées : `firebase functions:list`
2. Vérifier les logs : `firebase functions:log`
3. S'assurer que la région est correcte dans le code

### 📊 Vérifier le déploiement

1. **Frontend** : Accéder à votre URL Vercel
2. **Page d'accueil** : Devrait afficher la landing page
3. **Login** : Tester `/login`
4. **Fonctionnalités** : Tester la création d'org, invitations, etc.

### 🔄 Mises à jour

```bash
# 1. Faire vos changements
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push

# 2. Vercel redéploie automatiquement

# 3. Si vous avez modifié les Functions :
npm run functions:build
firebase deploy --only functions
```

---

**Besoin d'aide ?** Ouvrir une issue sur GitHub !

**Prêt à coder ?** Let's go ! 🚀
