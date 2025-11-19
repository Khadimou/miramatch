# Script PowerShell pour demarrer MIRA MATCH en mode developpement

Write-Host "🚀 Demarrage de MIRA MATCH..." -ForegroundColor Cyan
Write-Host ""

# Verifier si le fichier .env du backend existe
if (-Not (Test-Path "backend\.env")) {
    Write-Host "⚠️  Le fichier backend\.env n'existe pas!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Creation du fichier backend\.env..." -ForegroundColor Green
    
    $envContent = @"
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiZTQzYTAzMDYtMzFhNS00MmNmLTg3ZTEtODQ5OTA3YTM1ODNkIiwidGVuYW50X2lkIjoiYTNlZGQ2Y2ExYzgzODMyNDdlZjgwMzJhNjUxODg2NmZmZjZlMDNlYjJlOTI0ZGMwNjlmNWYyZWU2YThkYzFjZiIsImludGVybmFsX3NlY3JldCI6IjY2MzI2NWQ0LTY3YjItNDJlYy1iZmY4LThiZjlhY2Q5ZWRlMyJ9.p3jdlGP4CLjSMeDExCosrUY8cACdBZBspnMmB3rl4Nc"
PULSE_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiOGI1NWEyNzYtNzRjYS00NGMyLTk2ZWMtYWNlMTFiNDM0MzU0IiwidGVuYW50X2lkIjoiYTNlZGQ2Y2ExYzgzODMyNDdlZjgwMzJhNjUxODg2NmZmZjZlMDNlYjJlOTI0ZGMwNjlmNWYyZWU2YThkYzFjZiIsImludGVybmFsX3NlY3JldCI6IjY2MzI2NWQ0LTY3YjItNDJlYy1iZmY4LThiZjlhY2Q5ZWRlMyJ9.RW6AiPfkKWTu4ybRr3vDHSPH4b7FJFFhvwmqukju9S0"
JWT_SECRET="miramatch-secret-key-change-in-production"
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8081
"@
    
    $envContent | Out-File -FilePath "backend\.env" -Encoding UTF8
    Write-Host "✅ Fichier backend\.env cree!" -ForegroundColor Green
    Write-Host ""
}

# Verifier si le fichier .env du frontend existe
if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  Le fichier .env (frontend) n'existe pas!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Creation du fichier .env..." -ForegroundColor Green
    
    $envContent = @"
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Fichier .env cree!" -ForegroundColor Green
    Write-Host ""
}

# Verifier si node_modules existe dans backend
if (-Not (Test-Path "backend\node_modules")) {
    Write-Host "📦 Installation des dependances du backend..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    npm run prisma:generate
    Set-Location ..
    Write-Host "✅ Dependances du backend installees!" -ForegroundColor Green
    Write-Host ""
}

# Verifier si node_modules existe dans le projet principal
if (-Not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dependances du frontend..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependances du frontend installees!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🎯 Lancement de l'application..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Frontend: Un nouveau terminal va s'ouvrir pour Expo" -ForegroundColor Green
Write-Host "🔧 Backend: Un nouveau terminal va s'ouvrir pour le serveur API" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Conseil: Gardez les deux terminaux ouverts pendant le developpement" -ForegroundColor Yellow
Write-Host ""

# Demarrer le backend dans un nouveau terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🔧 Backend API - MIRA MATCH' -ForegroundColor Cyan; npm run dev"

# Attendre 3 secondes pour que le backend demarre
Start-Sleep -Seconds 3

# Demarrer le frontend dans un nouveau terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '📱 Frontend Expo - MIRA MATCH' -ForegroundColor Cyan; npm start"

Write-Host "✅ Application lancee!" -ForegroundColor Green
Write-Host ""
Write-Host "📖 Consultez START_HERE.md pour plus d'informations" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer cette fenetre..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
