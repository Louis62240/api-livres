# Script simplifie de validation CI/CD
Write-Host "Validation de la configuration CI/CD..." -ForegroundColor Green

# Test des fichiers essentiels
$files = @(
    ".github\workflows\ci-cd.yml",
    ".github\workflows\pr-validation.yml", 
    ".github\workflows\release.yml",
    "Dockerfile",
    "docker-compose.yml",
    "Procfile",
    "app.json"
)

$allValid = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file manquant" -ForegroundColor Red
        $allValid = $false
    }
}

# Test des scripts npm
$packageJson = Get-Content "package.json" -Raw
if ($packageJson -match "docker:build") {
    Write-Host "✅ Scripts Docker OK" -ForegroundColor Green
} else {
    Write-Host "❌ Scripts Docker manquants" -ForegroundColor Red
}

Write-Host ""
if ($allValid) {
    Write-Host "🎉 Configuration CI/CD complete!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Quelques elements manquent" -ForegroundColor Yellow
}
