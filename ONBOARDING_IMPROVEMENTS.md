# Améliorations de l'onboarding

## Résumé

Les étapes manquantes de l'onboarding ont été implémentées pour permettre une configuration complète de l'organisation lors de sa création.

## Changements effectués

### 1. Page d'onboarding (`src/app/onboarding/page.tsx`)

#### Nouvelles étapes implémentées :

**Étape 2 - Configuration des jours ouvrés** ✅
- Sélection des jours d'ouverture (Lun-Dim)
- Configuration des segments horaires par jour
- Possibilité d'ajouter/supprimer des segments
- Modification des heures de début/fin de chaque segment

**Étape 3 - Personnalisation des rôles** ✅
- Création et modification des rôles/postes
- Sélection de la couleur (8 couleurs prédéfinies + picker)
- Définition du niveau hiérarchique (1-5)
- Ajout/suppression de rôles

**Étape 4 - Ajout d'employés initiaux** ✅
- Formulaire d'ajout d'employés (optionnel)
- Champs : Prénom, Nom, Type de contrat
- Assignation de rôles multiples par employé
- Interface visuelle avec badges colorés

**Étape 5 - Gabarits de planning** ⏸️
- Laissée en placeholder (fonctionnalité avancée)
- À implémenter dans une phase ultérieure

**Étape 6 - Récapitulatif** ✅ (mise à jour)
- Affichage complet de toutes les données configurées
- Informations générales (nom, industrie, fuseau horaire)
- Résumé des jours ouvrés et segments
- Liste des rôles avec couleurs
- Liste des employés ajoutés

#### Fonctionnalités ajoutées :

- **Initialisation automatique** : Valeurs par défaut basées sur l'industrie choisie
- **Réinitialisation intelligente** : Changement d'industrie met à jour les valeurs par défaut
- **Validation** : Vérification que les données obligatoires sont remplies
- **Types TypeScript** : Typage strict pour toutes les données

### 2. Cloud Function `createOrg` (`functions/src/org/createOrg.ts`)

#### Modifications :

- **Nouveaux schémas Zod** pour validation :
  - `timeSegmentSchema` - Validation des segments horaires
  - `openDaySchema` - Validation des jours ouvrés
  - `roleSchema` - Validation des rôles
  - `employeeSchema` - Validation des employés
  
- **Paramètres optionnels ajoutés** :
  - `openDays?: OpenDay[]` - Jours ouvrés personnalisés
  - `roles?: RoleData[]` - Rôles personnalisés
  - `employees?: EmployeeData[]` - Employés initiaux

- **Logique de création améliorée** :
  - Utilise les données fournies ou les valeurs par défaut
  - Crée les rôles personnalisés dans Firestore
  - Crée les employés initiaux avec liaison aux rôles
  - Convertit les indices de rôles en IDs Firestore réels
  - Logs audit enrichis avec compteurs

### 3. Client Firebase (`src/lib/firebase-client.ts`)

#### Modifications :

- **Types TypeScript ajoutés** :
  - `TimeSegment` - Structure d'un segment horaire
  - `OpenDay` - Structure d'un jour ouvré
  - `RoleData` - Structure d'un rôle
  - `EmployeeData` - Structure d'un employé

- **Signature de fonction mise à jour** :
  - `createOrg` accepte maintenant les nouveaux paramètres optionnels

## Flux de création d'organisation

### Avant
1. Étape 1 : Identité uniquement ✅
2. Étapes 2-5 : Placeholders vides ❌
3. Étape 6 : Récapitulatif minimal
4. Création : Organisation avec valeurs par défaut uniquement

### Après
1. **Étape 1 : Identité** ✅
   - Nom, industrie, fuseau horaire, langue
   
2. **Étape 2 : Jours ouvrés** ✅
   - Configuration personnalisée des horaires
   - Valeurs par défaut pré-remplies selon l'industrie
   
3. **Étape 3 : Rôles** ✅
   - Personnalisation complète des postes
   - Valeurs par défaut pré-remplies selon l'industrie
   
4. **Étape 4 : Employés** ✅ (optionnel)
   - Ajout d'employés initiaux
   - Possibilité de sauter cette étape
   
5. **Étape 5 : Gabarits** ⏸️
   - Placeholder pour fonctionnalité future
   
6. **Étape 6 : Validation** ✅
   - Récapitulatif complet et détaillé
   - Vérification avant création

7. **Création** ✅
   - Organisation créée avec toutes les données personnalisées
   - Rôles, employés et configuration sauvegardés

## Validation et sécurité

- ✅ Validation Zod côté serveur pour toutes les données
- ✅ Validation TypeScript côté client
- ✅ Vérification des champs obligatoires avant soumission
- ✅ Gestion d'erreurs avec messages utilisateur
- ✅ Transaction atomique pour la création (tout ou rien)

## Tests recommandés

### Tests manuels
1. ✅ Créer une organisation avec valeurs par défaut
2. ✅ Modifier les jours ouvrés et segments
3. ✅ Personnaliser les rôles (couleurs, niveaux)
4. ✅ Ajouter des employés avec plusieurs rôles
5. ✅ Changer d'industrie et vérifier la mise à jour des valeurs par défaut
6. ✅ Vérifier le récapitulatif avant création
7. ✅ Vérifier la création dans Firestore

### Tests automatisés à créer
- [ ] Test E2E du parcours complet d'onboarding
- [ ] Tests unitaires pour la Cloud Function `createOrg`
- [ ] Tests de validation des schémas Zod
- [ ] Tests d'intégration avec l'émulateur Firestore

## Améliorations futures possibles

1. **Étape 5 - Gabarits de planning**
   - Interface de création de templates hebdomadaires
   - Assignation de rôles par segment
   - Règles de rotation

2. **Étape 4 - Employés avancé**
   - Upload de photo de profil
   - Configuration d'indisponibilités
   - Import CSV d'employés

3. **Étape 2 - Jours ouvrés avancé**
   - Duplication de configuration entre jours
   - Jours fériés par région
   - Horaires saisonniers

4. **Navigation**
   - Sauvegarde automatique du brouillon
   - Possibilité de revenir en arrière sans perdre les données
   - Barre de progression persistante

## Notes techniques

- Les segments horaires sont stockés directement dans `settings.openDays` de l'organisation
- Les rôles sont créés dans la sous-collection `orgs/{orgId}/roles`
- Les employés sont créés dans la sous-collection `orgs/{orgId}/employees`
- Les indices de rôles (utilisés côté client) sont convertis en IDs Firestore côté serveur
- Les valeurs par défaut dépendent de l'industrie sélectionnée

## Statut

✅ **Implémentation terminée et fonctionnelle**

Les utilisateurs peuvent maintenant :
- Configurer complètement leur organisation à la création
- Personnaliser jours ouvrés, segments horaires, et rôles
- Ajouter des employés initiaux (optionnel)
- Visualiser un récapitulatif complet avant validation
