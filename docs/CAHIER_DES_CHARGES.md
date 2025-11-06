# Cahier des charges — Planificateur d'employés multi‑entreprises

Ce document est une **copie de référence** du cahier des charges original fourni par l'utilisateur.

Voir le contenu complet dans le message initial de la conversation.

**Stack cible** : 
- Frontend : Next.js/React + Tailwind + shadcn/ui (Vercel)
- Backend : Firebase (Auth, Firestore, Functions, Storage, Cloud Scheduler)
- Notifications : Firebase Extensions / SMTP

## Vision produit

Construire un **outil de gestion de planning** universel, pensé d'abord pour la restauration mais **adaptable à tout type d'entreprise** (retail, soins, agences, événementiel).

## Principes clés

1. **Multi-tenant** : Isolation stricte entre organisations
2. **Comptes optionnels** : Les employés peuvent avoir un compte pour les demandes, mais l'inclusion dans un planning est contrôlée par l'organisation
3. **Invitation uniquement** : Pas de découverte globale des utilisateurs
4. **Sécurité first** : Toute logique critique côté serveur (Cloud Functions)
5. **Mobile-first** : Interface responsive et accessible

## Sections principales

1. **Parcours d'onboarding** (6 étapes)
2. **Modèle de données** (Firestore)
3. **Authentification & rôles**
4. **Règles de sécurité**
5. **Logique métier** (planning, congés, publication)
6. **Interfaces & UX**
7. **Architecture & déploiement**
8. **Notifications**
9. **Internationalisation**
10. **Conformité & RGPD**
11. **Tests & qualité**
12. **Roadmap**

Pour le détail complet, se référer au message initial de la conversation ou aux documents d'implémentation.

---

**Date de création** : 2025-11-06  
**Statut** : MVP en développement  
**Licence** : MIT
