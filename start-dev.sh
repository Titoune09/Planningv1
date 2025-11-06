#!/bin/bash

# Script de démarrage pour le développement
# Usage: ./start-dev.sh

set -e

echo "🚀 Démarrage du Planificateur d'Employés en mode développement"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    echo "Installer Node.js depuis https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) détecté${NC}"

# Vérifier les dépendances racine
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installation des dépendances (racine)...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dépendances racine OK${NC}"
fi

# Vérifier les dépendances functions
if [ ! -d "functions/node_modules" ]; then
    echo -e "${BLUE}📦 Installation des dépendances (functions)...${NC}"
    cd functions
    npm install
    cd ..
else
    echo -e "${GREEN}✅ Dépendances functions OK${NC}"
fi

# Compiler les functions
echo -e "${BLUE}🔨 Compilation des Cloud Functions...${NC}"
cd functions
npm run build
cd ..
echo -e "${GREEN}✅ Functions compilées${NC}"

# Vérifier le fichier .firebaserc
if [ ! -f ".firebaserc" ]; then
    echo -e "${BLUE}📝 Création du fichier .firebaserc...${NC}"
    echo '{
  "projects": {
    "default": "demo-employee-scheduler"
  }
}' > .firebaserc
    echo -e "${GREEN}✅ .firebaserc créé${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ Configuration terminée !${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Prochaines étapes :"
echo ""
echo -e "${BLUE}1. Dans ce terminal, démarrer les émulateurs Firebase :${NC}"
echo "   npm run emulators"
echo ""
echo -e "${BLUE}2. Dans un NOUVEAU terminal, démarrer Next.js :${NC}"
echo "   npm run dev"
echo ""
echo -e "${BLUE}3. Ouvrir dans le navigateur :${NC}"
echo "   Application : http://localhost:3000"
echo "   Emulator UI : http://localhost:4000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Voulez-vous démarrer les émulateurs maintenant ? (o/n)${NC}"
read -r response

if [[ "$response" =~ ^([oO][uU][iI]|[oO])$ ]]; then
    echo ""
    echo -e "${GREEN}🚀 Démarrage des émulateurs...${NC}"
    echo ""
    npx firebase emulators:start
else
    echo ""
    echo -e "${BLUE}Pour démarrer manuellement :${NC}"
    echo "  npm run emulators"
    echo ""
fi
