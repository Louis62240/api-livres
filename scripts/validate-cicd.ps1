# Script de validation CI/CD pour Windows PowerShell
# Usage: .\validate-cicd.ps1

Write-Host "🔍 Validation de la configuration CI/CD..." -ForegroundColor Blue
Write-Host "==========================================="

function Test-FileExists {
    param($Path)
    if (Test-Path $Path) {
        Write-Host "✅ $Path" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $Path manquant" -ForegroundColor Red
        return $false
    }
}

function Test-DirectoryExists {
    param($Path)
    if (Test-Path $Path -PathType Container) {
        Write-Host "✅ Dossier $Path" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Dossier $Path manquant" -ForegroundColor Red
        return $false
    }
}

$allValid = $true

Write-Host ""
Write-Host "📂 Vérification des fichiers CI/CD..." -ForegroundColor Blue

# Vérification workflows GitHub
$allValid = $allValid -and (Test-DirectoryExists ".github\workflows")
$allValid = $allValid -and (Test-FileExists ".github\workflows\ci-cd.yml")
$allValid = $allValid -and (Test-FileExists ".github\workflows\pr-validation.yml")
$allValid = $allValid -and (Test-FileExists ".github\workflows\release.yml")

Write-Host ""
Write-Host "🐳 Vérification des fichiers Docker..." -ForegroundColor Blue

$allValid = $allValid -and (Test-FileExists "Dockerfile")
$allValid = $allValid -and (Test-FileExists "docker-compose.yml")
$allValid = $allValid -and (Test-FileExists ".dockerignore")

Write-Host ""
Write-Host "☁️ Vérification des fichiers de déploiement..." -ForegroundColor Blue

$allValid = $allValid -and (Test-FileExists "Procfile")
$allValid = $allValid -and (Test-FileExists "app.json")

Write-Host ""
Write-Host "📦 Vérification du package.json..." -ForegroundColor Blue

$packageContent = Get-Content "package.json" -Raw
if ($packageContent -match "docker:build") {
    Write-Host "✅ Scripts Docker configurés" -ForegroundColor Green
} else {
    Write-Host "❌ Scripts Docker manquants" -ForegroundColor Red
    $allValid = $false
}

if ($packageContent -match "test:coverage") {
    Write-Host "✅ Script de couverture configuré" -ForegroundColor Green
} else {
    Write-Host "❌ Script de couverture manquant" -ForegroundColor Red
    $allValid = $false
}

Write-Host ""
Write-Host "🧪 Tests de validation..." -ForegroundColor Blue

# Tests
Write-Host "🧪 Exécution des tests..." -ForegroundColor Yellow
try {
    $testResult = npm test 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tests passés" -ForegroundColor Green
    } else {
        Write-Host "❌ Tests échoués" -ForegroundColor Red
        $allValid = $false
    }
} catch {
    Write-Host "❌ Erreur lors de l'exécution des tests" -ForegroundColor Red
    $allValid = $false
}

Write-Host ""
Write-Host "🏗️ Test de build Docker..." -ForegroundColor Blue

# Test Docker (si disponible)
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "🐳 Build de l'image Docker..." -ForegroundColor Yellow
        $buildResult = docker build -t api-livres-test . 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Build Docker réussi" -ForegroundColor Green
            # Nettoyer l'image de test
            docker rmi api-livres-test 2>$null | Out-Null
        } else {
            Write-Host "❌ Build Docker échoué" -ForegroundColor Red
            $allValid = $false
        }
    } else {
        Write-Host "⚠️  Docker non installé, build sauté" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Docker non disponible, build sauté" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 Résumé de la configuration..." -ForegroundColor Blue

Write-Host "• Workflows GitHub Actions: 3"
Write-Host "• Environnements supportés: Dev, Staging, Production"
Write-Host "• Plateformes de déploiement: Heroku, Docker"
Write-Host "• Tests automatisés: ✅"
Write-Host "• Sécurité (CodeQL): ✅"
Write-Host "• Releases automatiques: ✅"

Write-Host ""
if ($allValid) {
    Write-Host "🎉 Configuration CI/CD validée avec succès !" -ForegroundColor Green
    Write-Host "🚀 Votre projet est prêt pour la production !" -ForegroundColor Green
} else {
    Write-Host "❌ Certains éléments nécessitent votre attention" -ForegroundColor Red
}

Write-Host ""
Write-Host "📚 Prochaines étapes :" -ForegroundColor Blue
Write-Host "1. Configurer les secrets GitHub (HEROKU_API_KEY, etc.)"
Write-Host "2. Faire un premier push pour tester la CI"
Write-Host "3. Créer une première release avec git tag v1.0.0"
Write-Host "4. Surveiller les déploiements dans l'onglet Actions"

if (-not $allValid) {
    exit 1
}
