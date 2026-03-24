#!/usr/bin/env pwsh
# SOLIDARITY PLATFORM - FRONTEND LAUNCH SCRIPT
# Starts the complete integrated system

Write-Host "🌟 Solidarity Platform - Starting Complete System..." -ForegroundColor Cyan
Write-Host ""
Write-Host "φ = 1.618033988749895" -ForegroundColor Yellow
Write-Host "Safety Baseline = 0.618" -ForegroundColor Green
Write-Host ""

# Change to project directory
Set-Location $PSScriptRoot

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Display startup information
Write-Host ""
Write-Host "🚀 Starting API Server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend Components:" -ForegroundColor Green
Write-Host "  Lock Gate UI (Omega Lock Gate)" -ForegroundColor White
Write-Host "  Fractal Diagnostics (Barnsley Fern IFS)" -ForegroundColor White
Write-Host "  Device Exchange (A/B Swap)" -ForegroundColor White
Write-Host "  Sacred Geometry Dashboard" -ForegroundColor White
Write-Host "  Harmonic Phrase Processor" -ForegroundColor White
Write-Host ""
Write-Host "API Endpoints:" -ForegroundColor Green
Write-Host "  /api/mathematical/* - Golden ratio operations" -ForegroundColor White
Write-Host "  /api/lockgate/* - Lock Gate and HMAC verification" -ForegroundColor White
Write-Host "  /devices/* - Device exchange and balance" -ForegroundColor White
Write-Host "  /api/health - System health check" -ForegroundColor White
Write-Host ""
Write-Host "Server will start at: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the server
node src/api/server.js
