# 🚀 Guide de démarrage rapide

## Problème : "On ne peut pas créer d'organisation"

Ce problème survient généralement parce que **l'émulateur Firebase n'est pas démarré** en mode développement.

## ✅ Solution : Démarrer l'émulateur Firebase

### Étape 1 : Vérifier que les dépendances sont installées

```bash
# À la racine du projet
npm install

# Dans le dossier functions
cd functions
npm install
cd ..
```

### Étape 2 : Compiler les Cloud Functions

```bash
cd functions
npm run build
cd ..
```

### Étape 3 : Démarrer l'émulateur Firebase

**Option A : Démarrer les émulateurs seuls**
```bash
npx firebase emulators:start
```

**Option B : Utiliser le script npm (avec import/export de données)**
```bash
npm run emulators
```

Vous devriez voir :
```
✔  All emulators ready!
┌─────────────────────────────────┬────────────────┐
│ Emulator                        │ Port           │
├─────────────────────────────────┼────────────────┤
│ Authentication                  │ 9099           │
│ Functions                       │ 5001           │
│ Firestore                       │ 8080           │
│ Storage                         │ 9199           │
│ Emulator UI                     │ 4000           │
└─────────────────────────────────┴────────────────┘
```

### Étape 4 : Dans un NOUVEAU terminal, démarrer Next.js

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

### Étape 5 : Tester la création d'organisation

1. Ouvrir `http://localhost:3000`
2. Créer un compte ou se connecter
3. Aller sur `/onboarding`
4. Suivre les 6 étapes de création d'organisation
5. Valider la création

## 🔍 Vérifier que tout fonctionne

### Vérifier les émulateurs

Ouvrir l'interface des émulateurs : `http://localhost:4000`

Vous devriez voir :
- **Authentication** : Liste des utilisateurs
- **Firestore** : Collections et documents
- **Functions** : Liste des fonctions déployées
  - `createOrg` ✅
  - `inviteUser` ✅
  - `redeemInvite` ✅
  - etc.

### Vérifier les logs

Dans le terminal où les émulateurs sont démarrés, vous devriez voir les logs des fonctions quand vous les appelez.

Exemple lors de la création d'une organisation :
```
i  functions: Beginning execution of "createOrg"
i  functions: Finished "createOrg" in ~1s
```

## ⚠️ Erreurs courantes

### Erreur 1 : "Cannot connect to emulator"

**Cause** : L'émulateur n'est pas démarré

**Solution** : Démarrer l'émulateur dans un terminal séparé

### Erreur 2 : "Function not found"

**Cause** : Les fonctions ne sont pas compilées

**Solution** :
```bash
cd functions
npm run build
cd ..
# Redémarrer l'émulateur
```

### Erreur 3 : "Unauthenticated"

**Cause** : L'utilisateur n'est pas connecté

**Solution** : Se connecter d'abord sur `/login`

### Erreur 4 : "Port already in use"

**Cause** : Les ports des émulateurs sont déjà utilisés

**Solution** :
```bash
# Trouver et tuer les processus
lsof -ti:9099,5001,8080,9199,4000 | xargs kill -9

# Puis redémarrer
npm run emulators
```

## 📝 Flux de développement recommandé

### Terminal 1 : Émulateurs Firebase
```bash
npm run emulators
```
Laisser tourner en permanence pendant le développement

### Terminal 2 : Next.js Dev Server
```bash
npm run dev
```

### Terminal 3 : Watch mode pour les Functions (optionnel)
```bash
cd functions
npm run watch
cd ..
```
Recompile automatiquement les fonctions lors des modifications

## 🎯 Données de test

Pour pré-remplir l'émulateur avec des données de test :

```bash
npm run seed
```

Cela créera :
- Un utilisateur de test
- Une organisation de test
- Des rôles
- Des employés
- Un planning de base

## 🔄 Reset complet

Si vous voulez repartir de zéro :

```bash
# Arrêter les émulateurs (Ctrl+C)
# Supprimer les données exportées
rm -rf firebase-data
# Redémarrer
npm run emulators
```

## ✅ Checklist de vérification

Avant de signaler un bug, vérifier que :

- [ ] Les dépendances sont installées (racine + functions)
- [ ] Les functions sont compilées (`cd functions && npm run build`)
- [ ] L'émulateur Firebase est démarré ET affiche toutes les fonctions
- [ ] Next.js dev server est démarré
- [ ] Vous êtes connecté avec un compte utilisateur
- [ ] Vous voyez bien l'interface Emulator UI sur http://localhost:4000
- [ ] Les logs du terminal émulateur ne montrent pas d'erreurs

## 🐛 Toujours un problème ?

Si après avoir suivi ces étapes vous ne pouvez toujours pas créer d'organisation :

1. **Vérifier les logs du navigateur** (Console DevTools)
2. **Vérifier les logs de l'émulateur** (terminal)
3. **Vérifier les logs de Next.js** (terminal)
4. **Essayer en mode incognito** (problème de cache)
5. **Vider le cache et recharger** (Cmd+Shift+R / Ctrl+Shift+R)

Si le problème persiste, créer une issue avec :
- Les logs d'erreur complets
- Les étapes pour reproduire
- La version de Node.js utilisée
