# Solidarity Platform - Enhanced Server Launcher
# ===============================================

Write-Host ""
Write-Host "SOLIDARITY PLATFORM - ENHANCED SERVER" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor DarkGray
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Create database directory if it doesn't exist
if (!(Test-Path "database")) {
    Write-Host "📁 Creating database directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "database" | Out-Null
}

# Initialize empty data files if they don't exist
$dataFiles = @{
    "database/activity_logs.json" = "[]"
    "database/security_status.json" = '{"intrusionAttempts":0,"attempts":[],"recentScan":false,"burnProtocolNeeded":false}'
    "database/devices.json" = "[]"
}

foreach ($file in $dataFiles.Keys) {
    if (!(Test-Path $file)) {
        Write-Host "📄 Creating $file..." -ForegroundColor Yellow
        Set-Content -Path $file -Value $dataFiles[$file]
    }
}

Write-Host ""
Write-Host "LAUNCHING ENHANCED API SERVER..." -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor DarkGray
Write-Host ""
Write-Host "📡 Server will be available at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "🌐 API Base URL: http://localhost:3000/api" -ForegroundColor Yellow
Write-Host ""
Write-Host "NEW FEATURES:" -ForegroundColor Green
Write-Host "  - QuipNotes Secure Browser" -ForegroundColor White
Write-Host "  - User Logs (Activity Tracking)" -ForegroundColor White
Write-Host "  - LockGate Security Overlay" -ForegroundColor White
Write-Host "  - Hanko Stamps Management" -ForegroundColor White
Write-Host "  - Ollama AI Homepage" -ForegroundColor White
Write-Host "  - Device Auto-Pairing" -ForegroundColor White
Write-Host "  - Live Market Data Integration" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ("=" * 60) -ForegroundColor DarkGray
Write-Host ""

# Start the enhanced server
node src/api/server_enhanced.js
