# START PATCHED SOLIDARITY SERVER
# ================================

Write-Host "Starting Solidarity Platform (PATCHED VERSION)" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor DarkGray
Write-Host ""

# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "   Please install from: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Display Node version
$nodeVersion = node --version
Write-Host "Node.js: $nodeVersion" -ForegroundColor Green

# Check if dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Dependency installation failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Dependencies installed" -ForegroundColor Green
Write-Host ""

# Create database directory if it does not exist
if (!(Test-Path "database")) {
    New-Item -Path "database" -ItemType Directory -Force | Out-Null
    Write-Host "Created database directory" -ForegroundColor Green
}

Write-Host ("=" * 70) -ForegroundColor DarkGray
Write-Host "Starting patched API server..." -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor DarkGray
Write-Host ""

# Start the patched server
node src/api/server_patched.js
