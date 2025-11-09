# 🧪 Test en Local (sans déployer)

## Option pour tester sans passer au plan Blaze

### 1. Démarrer les émulateurs Firebase

```bash
# Terminal 1 : Émulateurs
cd "C:\Users\KING TITOUNE\.cursor\Planningv1"
npm run emulators
# ou
firebase emulators:start
```

**Cela va démarrer** :
- Functions Emulator sur http://localhost:5001
- Firestore Emulator sur http://localhost:8080
- Auth Emulator sur http://localhost:9099

### 2. Démarrer le frontend en mode dev

```bash
# Terminal 2 : Frontend
cd "C:\Users\KING TITOUNE\.cursor\Planningv1"
npm run dev
```

### 3. Tester

1. Ouvrir http://localhost:3000
2. Se connecter
3. Aller sur /onboarding
4. Créer une organisation

**✅ Cela devrait fonctionner localement !**

Les émulateurs utilisent automatiquement le code local avec les corrections CORS.

---

## Différence Local vs Production

| Aspect | Local (Émulateurs) | Production (Déployé) |
|--------|-------------------|---------------------|
| **Coût** | ✅ Gratuit | Requires Blaze plan |
| **Données** | ⚠️ Temporaires | ✅ Persistantes |
| **URL** | localhost:3000 | planningv1.vercel.app |
| **Accès** | 🏠 Vous uniquement | 🌍 Tout le monde |

---

## Pour passer en PRODUCTION ensuite

Vous devrez quand même passer au plan Blaze pour déployer.

**Mais** : Vous pouvez développer et tester entièrement en local d'abord !

