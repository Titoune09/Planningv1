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

## 🚢 Déploiement (plus tard)

```bash
# 1. Build
npm run build

# 2. Deploy Vercel (Frontend)
vercel --prod

# 3. Deploy Firebase (Backend)
firebase deploy
```

---

**Besoin d'aide ?** Ouvrir une issue sur GitHub !

**Prêt à coder ?** Let's go ! 🚀
