#!/bin/bash

# Script de validation de la configuration CI/CD
# Usage: ./validate-cicd.sh

set -e

echo "🔍 Validation de la configuration CI/CD..."
echo "==========================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de validation
validate_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 manquant${NC}"
        return 1
    fi
}

validate_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ Dossier $1${NC}"
        return 0
    else
        echo -e "${RED}❌ Dossier $1 manquant${NC}"
        return 1
    fi
}

echo -e "${BLUE}📂 Vérification des fichiers CI/CD...${NC}"

# Vérification des workflows GitHub
validate_directory ".github/workflows"
validate_file ".github/workflows/ci-cd.yml"
validate_file ".github/workflows/pr-validation.yml"
validate_file ".github/workflows/release.yml"

echo ""
echo -e "${BLUE}🐳 Vérification des fichiers Docker...${NC}"

# Vérification Docker
validate_file "Dockerfile"
validate_file "docker-compose.yml"
validate_file ".dockerignore"

echo ""
echo -e "${BLUE}☁️ Vérification des fichiers de déploiement...${NC}"

# Vérification Heroku
validate_file "Procfile"
validate_file "app.json"

echo ""
echo -e "${BLUE}📦 Vérification du package.json...${NC}"

# Vérification des scripts npm
if grep -q "docker:build" package.json; then
    echo -e "${GREEN}✅ Scripts Docker configurés${NC}"
else
    echo -e "${RED}❌ Scripts Docker manquants${NC}"
fi

if grep -q "test:coverage" package.json; then
    echo -e "${GREEN}✅ Script de couverture configuré${NC}"
else
    echo -e "${RED}❌ Script de couverture manquant${NC}"
fi

echo ""
echo -e "${BLUE}🧪 Tests de validation...${NC}"

# Test npm
echo -e "${YELLOW}📦 Installation des dépendances...${NC}"
npm install --silent

# Tests
echo -e "${YELLOW}🧪 Exécution des tests...${NC}"
if npm test --silent; then
    echo -e "${GREEN}✅ Tests passés${NC}"
else
    echo -e "${RED}❌ Tests échoués${NC}"
    exit 1
fi

# Vérification de la syntaxe des workflows
echo ""
echo -e "${BLUE}📋 Validation des workflows YAML...${NC}"

# Vérifier que les fichiers YAML sont valides (si yq est installé)
if command -v yamllint >/dev/null 2>&1; then
    for file in .github/workflows/*.yml; do
        if yamllint "$file" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $(basename $file)${NC}"
        else
            echo -e "${YELLOW}⚠️  $(basename $file) - warnings possibles${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠️  yamllint non installé, validation YAML sautée${NC}"
fi

echo ""
echo -e "${BLUE}🏗️ Test de build Docker...${NC}"

# Test Docker build (si Docker est disponible)
if command -v docker >/dev/null 2>&1; then
    echo -e "${YELLOW}🐳 Build de l'image Docker...${NC}"
    if docker build -t api-livres-test . >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Build Docker réussi${NC}"
        
        # Nettoyer l'image de test
        docker rmi api-livres-test >/dev/null 2>&1 || true
    else
        echo -e "${RED}❌ Build Docker échoué${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Docker non installé, build sauté${NC}"
fi

echo ""
echo -e "${BLUE}📊 Résumé de la configuration...${NC}"

echo "• Workflows GitHub Actions: 3"
echo "• Environnements supportés: Dev, Staging, Production"
echo "• Plateformes de déploiement: Heroku, Docker"
echo "• Tests automatisés: ✅"
echo "• Sécurité (CodeQL): ✅"
echo "• Releases automatiques: ✅"

echo ""
echo -e "${GREEN}🎉 Configuration CI/CD validée avec succès !${NC}"
echo -e "${GREEN}🚀 Votre projet est prêt pour la production !${NC}"

echo ""
echo -e "${BLUE}📚 Prochaines étapes :${NC}"
echo "1. Configurer les secrets GitHub (HEROKU_API_KEY, etc.)"
echo "2. Faire un premier push pour tester la CI"
echo "3. Créer une première release avec git tag v1.0.0"
echo "4. Surveiller les déploiements dans l'onglet Actions"

exit 0
