# 🧪 Guide de Test Rapide

## ✅ Corrections Appliquées

### 1. Problème CORS Résolu ✔️

**Ce qui a été fait** :
- ✅ Mise à jour de `firebase-functions` v4 → v5
- ✅ Ajout de `cors: true` sur toutes les Cloud Functions
- ✅ Compilation réussie des functions

**Pour tester** :
```bash
# 1. Déployer les functions
cd "C:\Users\KING TITOUNE\.cursor\Planningv1\functions"
npm run build
firebase deploy --only functions

# 2. Tester dans le navigateur
# Aller sur https://planneo.vercel.app/onboarding
# Essayer de créer une organisation
```

### 2. UI/UX Améliorée avec Animations ✔️

**Pages améliorées** :
- ✨ **Dashboard** (`/app`) - Animations d'entrée, gradients, cards interactives
- 👥 **Employés** (`/app/employees`) - Design moderne, état vide engageant
- 📅 **Planning** (`/app/planning`) - Calendrier animé, jour actuel mis en valeur

**Nouvelles fonctionnalités visuelles** :
- Gradients de texte colorés
- Animations d'entrée fluides (fade-in, scale)
- Effets hover sur tous les boutons et cards
- Transitions fluides entre les pages
- États vides avec illustrations et call-to-action

---

## 🚀 Déploiement (3 étapes)

### Étape 1 : Déployer les Cloud Functions

```bash
# Dans PowerShell
cd "C:\Users\KING TITOUNE\.cursor\Planningv1"

# Compiler les functions
cd functions
npm run build

# Déployer
firebase deploy --only functions
```

**Résultat attendu** :
```
✔  functions[createOrg]: Successful update operation.
✔  functions[inviteUser]: Successful update operation.
...
```

### Étape 2 : Déployer le Frontend

```bash
# Retour à la racine
cd "C:\Users\KING TITOUNE\.cursor\Planningv1"

# Option A : Via Git (si configuré)
git add .
git commit -m "fix: Correction CORS + Amélioration UI/UX"
git push origin main
# → Vercel déploiera automatiquement

# Option B : Via Vercel CLI
vercel --prod
```

### Étape 3 : Vérifier

1. **Ouvrir l'application** : https://planneo.vercel.app
2. **Se connecter ou créer un compte**
3. **Tester la création d'organisation** :
   - Aller sur `/onboarding`
   - Remplir le formulaire
   - Cliquer sur "Terminer"
   - ✅ **DOIT FONCTIONNER** sans erreur CORS

4. **Admirer les animations** 😎 :
   - Dashboard : animations d'entrée
   - Hover sur les cards
   - Transitions fluides

---

## 🔧 Si ça ne marche pas

### Erreur CORS persiste ?

1. **Vider le cache du navigateur** :
   - Chrome : `Ctrl + Shift + Delete` → Cocher "Images et fichiers en cache"
   - Ou utiliser mode navigation privée

2. **Vérifier les functions sont déployées** :
   ```bash
   firebase functions:list
   ```

3. **Voir les logs en temps réel** :
   ```bash
   firebase functions:log --only createOrg
   ```

4. **Tester en local d'abord** :
   ```bash
   # Terminal 1 : Émulateurs
   firebase emulators:start

   # Terminal 2 : Frontend
   npm run dev

   # Ouvrir http://localhost:3000
   ```

### Les animations ne s'affichent pas ?

1. **Vérifier que framer-motion est installé** :
   ```bash
   npm list framer-motion
   # Doit afficher : framer-motion@X.X.X
   ```

2. **Rebuild l'app** :
   ```bash
   npm run build
   npm start
   ```

3. **Vérifier la console du navigateur** (F12) :
   - Pas d'erreurs JavaScript ?
   - Les modules sont bien chargés ?

---

## 📋 Checklist de Test

### Tests Fonctionnels

- [ ] **Authentification** : Connexion / Inscription
- [ ] **Onboarding** : Créer une organisation (TEST PRINCIPAL)
- [ ] **Dashboard** : Voir les statistiques et actions rapides
- [ ] **Employés** : Voir la page (même si vide)
- [ ] **Planning** : Navigation entre les semaines
- [ ] **Congés** : Voir la liste des demandes
- [ ] **Paramètres** : Voir les infos de l'organisation

### Tests Visuels

- [ ] **Animations d'entrée** : Les éléments apparaissent progressivement
- [ ] **Hover effects** : Les cards se soulèvent au survol
- [ ] **Gradients** : Les titres ont des gradients de couleur
- [ ] **Transitions** : Navigation fluide entre les pages
- [ ] **Responsive** : L'interface s'adapte sur mobile

---

## 🎯 Test Principal : Création d'Organisation

### Procédure de test

1. **Ouvrir** : https://planneo.vercel.app
2. **Se connecter** (ou créer un compte)
3. **Aller sur** : `/onboarding`
4. **Remplir les 6 étapes** :
   - Étape 1 : Nom + Type d'activité
   - Étape 2 : Jours ouvrés (laisser les valeurs par défaut)
   - Étape 3 : Rôles (laisser les valeurs par défaut)
   - Étape 4 : Employés (optionnel, peut passer)
   - Étape 5 : Gabarits (optionnel, peut passer)
   - Étape 6 : Validation
5. **Cliquer sur "Terminer"**

### ✅ Résultat attendu

```
✔️ Toast de succès : "Organisation créée !"
✔️ Redirection vers /app
✔️ Voir le dashboard avec le nom de l'organisation
✔️ AUCUNE erreur CORS dans la console (F12)
```

### ❌ Si erreur

**Ouvrir la console** (F12) et chercher :
- ❌ `ERR_FAILED` → Fonctions pas déployées
- ❌ `CORS policy` → Cache du navigateur ou functions non mises à jour
- ❌ `internal` → Erreur serveur, voir `firebase functions:log`

---

## 📞 Support

**Logs utiles** :
```bash
# Logs des functions
firebase functions:log

# Logs d'une function spécifique
firebase functions:log --only createOrg

# Statut des deployments Vercel
vercel logs
```

**Fichiers importants modifiés** :
- ✅ `functions/package.json` - Version firebase-functions
- ✅ `functions/src/org/createOrg.ts` - Configuration CORS
- ✅ `src/app/app/page.tsx` - Animations dashboard
- ✅ `src/app/app/employees/page.tsx` - Animations employés
- ✅ `src/app/app/planning/page.tsx` - Animations planning

---

**Bon test ! 🚀**

Si tout fonctionne, vous devriez maintenant :
1. ✅ Pouvoir créer des organisations sans erreur CORS
2. ✅ Profiter d'une interface moderne et animée
3. ✅ Avoir une base solide pour développer les fonctionnalités restantes

**Prochaines étapes suggérées** :
- Implémenter le CRUD complet des employés
- Ajouter le système de drag & drop pour le planning
- Compléter le workflow des demandes de congés

