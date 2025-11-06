# 🔧 Fix : Problème de création d'organisation

## 📋 Diagnostic

Le problème "On ne peut pas créer d'organisation" est dû à **l'absence de l'émulateur Firebase en cours d'exécution** en mode développement.

### Analyse du code

✅ **Le code est correct :**
- La Cloud Function `createOrg` est correctement implémentée
- La validation Zod fonctionne ✅ (testé)
- Les exports sont corrects ✅
- Les règles Firestore sont correctes ✅
- L'interface d'onboarding est complète ✅

❌ **Le problème réel :**
En mode développement (`NODE_ENV=development`), l'application se connecte automatiquement aux émulateurs Firebase (voir `src/lib/firebase.ts` lignes 24-42).

Si les émulateurs ne sont pas démarrés, **tous les appels aux Cloud Functions échouent silencieusement**.

## 🎯 Solution

### Option 1 : Script automatique (Recommandé)

```bash
./start-dev.sh
```

Ce script :
1. Vérifie les dépendances
2. Compile les Cloud Functions
3. Démarre les émulateurs Firebase
4. Guide pour démarrer Next.js

### Option 2 : Manuel (2 terminaux requis)

#### Terminal 1 : Émulateurs
```bash
# S'assurer que tout est installé
npm run setup

# Démarrer les émulateurs
npm run emulators:start
```

Attendre de voir :
```
✔  All emulators ready!
```

#### Terminal 2 : Next.js
```bash
npm run dev
```

Ouvrir : http://localhost:3000

## ✅ Vérification

### 1. Vérifier que les émulateurs fonctionnent

Ouvrir : http://localhost:4000 (Emulator UI)

Dans l'onglet "Functions", vous devriez voir :
- ✅ `createOrg`
- ✅ `inviteUser`
- ✅ `redeemInvite`
- ✅ `submitLeave`
- ✅ `decideLeave`
- ✅ `createSchedule`
- ✅ `assignShift`
- ✅ `onUserCreated` (trigger)
- ✅ `onLeaveRequestUpdate` (trigger)

### 2. Vérifier que l'application se connecte aux émulateurs

Dans la console du navigateur (DevTools), vous devriez voir :
```
✅ Connected to Firebase Emulators
```

### 3. Tester la création d'organisation

1. Aller sur http://localhost:3000/login
2. Créer un compte test
3. Aller sur http://localhost:3000/onboarding
4. Remplir les 6 étapes :
   - **Étape 1** : Nom et industrie
   - **Étape 2** : Jours ouvrés (pré-remplis)
   - **Étape 3** : Rôles (pré-remplis)
   - **Étape 4** : Employés (optionnel)
   - **Étape 5** : Gabarits (skip)
   - **Étape 6** : Validation
5. Cliquer sur "Terminer"

✅ Vous devriez voir : "Organisation créée !"

### 4. Vérifier dans Firestore

Dans l'Emulator UI (http://localhost:4000), onglet "Firestore", vous devriez voir :
- Collection `orgs` avec votre organisation
- Sous-collections :
  - `memberships` (votre membership owner)
  - `roles` (les rôles créés)
  - `employees` (si vous en avez ajouté)
  - `policies` (politique de congés par défaut)
  - `auditLogs` (log de création)

## 🐛 Dépannage

### Erreur : "Cannot connect to emulator"

**Cause** : Émulateur pas démarré

**Solution** :
```bash
# Terminal séparé
npm run emulators:start
```

### Erreur : "Function createOrg not found"

**Cause** : Functions pas compilées

**Solution** :
```bash
cd functions
npm run build
cd ..
# Redémarrer l'émulateur
```

### Erreur : "Unauthenticated"

**Cause** : Pas connecté

**Solution** : Se connecter sur /login d'abord

### Erreur : Port 8080 (ou autre) déjà utilisé

**Solution** :
```bash
# Linux/Mac
lsof -ti:9099,5001,8080,9199,4000 | xargs kill -9

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

## 📝 Modifications apportées

### Fichiers créés :
1. `/.firebaserc` - Configuration du projet Firebase
2. `/DEMARRAGE_RAPIDE.md` - Guide complet de démarrage
3. `/FIX_CREATION_ORG.md` - Ce document
4. `/start-dev.sh` - Script de démarrage automatique
5. `/.env.example` - Template de configuration

### Fichiers modifiés :
1. `/package.json` - Ajout de scripts `setup` et `emulators:start`

## 🎓 Pourquoi ce problème survient

En développement, Firebase utilise des **émulateurs locaux** pour :
- Éviter d'impacter la production
- Permettre le développement hors-ligne
- Tester sans coûts
- Reset rapide des données

L'application est configurée pour se connecter automatiquement aux émulateurs en mode dev (voir `src/lib/firebase.ts`).

**Sans émulateurs = Pas de Cloud Functions = Impossible de créer une organisation**

## ✨ Résultat attendu

Après avoir suivi ces étapes, vous devriez pouvoir :
- ✅ Créer un compte utilisateur
- ✅ Compléter l'onboarding en 6 étapes
- ✅ Créer une organisation avec configuration complète
- ✅ Voir l'organisation dans Firestore
- ✅ Accéder au dashboard de l'application

## 📚 Documentation

- Guide complet : `/DEMARRAGE_RAPIDE.md`
- README principal : `/README.md`
- Cahier des charges : `/docs/CAHIER_DES_CHARGES.md`
- Schéma Firestore : `/docs/FIRESTORE_SCHEMA.md`

## 🚀 Prochaines étapes

Une fois l'organisation créée :
1. Inviter des membres (`/app/settings`)
2. Créer un planning (`/app/planning`)
3. Gérer les employés (`/app/employees`)
4. Traiter les demandes de congés (`/app/leaves`)

Bon développement ! 🎉
