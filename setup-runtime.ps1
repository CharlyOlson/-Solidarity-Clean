# Solidarity Platform - Runtime Setup Script
# Automated installation of Node.js, Python, and all dependencies

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  SOLIDARITY PLATFORM - RUNTIME SETUP" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

$ErrorActionPreference = "Continue"

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[WARN] Not running as administrator. Some installations may require elevation." -ForegroundColor Yellow
}

# Function to check if command exists
function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) { return $true }
    } catch { return $false }
}

# Step 1: Check/Install Winget (Windows Package Manager)
Write-Host "[STEP 1] Checking Windows Package Manager (winget)..." -ForegroundColor Yellow
if (Test-Command "winget") {
    Write-Host "[OK] winget is installed" -ForegroundColor Green
} else {
    Write-Host "[INFO] winget not found. Please install from Microsoft Store: 'App Installer'" -ForegroundColor Yellow
    Write-Host "       Or visit: https://github.com/microsoft/winget-cli" -ForegroundColor Yellow
}

# Step 2: Install Node.js
Write-Host "`n[STEP 2] Checking Node.js..." -ForegroundColor Yellow
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js already installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "[INSTALL] Installing Node.js LTS..." -ForegroundColor Cyan
    if (Test-Command "winget") {
        winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
        Write-Host "[OK] Node.js installed. Please restart PowerShell/VS Code." -ForegroundColor Green
    } else {
        Write-Host "[MANUAL] Download Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    }
}

# Step 3: Install Python
Write-Host "`n[STEP 3] Checking Python..." -ForegroundColor Yellow
if (Test-Command "python") {
    $pythonVersion = python --version
    Write-Host "[OK] Python already installed: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "[INSTALL] Installing Python 3.11..." -ForegroundColor Cyan
    if (Test-Command "winget") {
        winget install Python.Python.3.11 --silent --accept-package-agreements --accept-source-agreements
        Write-Host "[OK] Python installed. Please restart PowerShell/VS Code." -ForegroundColor Green
    } else {
        Write-Host "[MANUAL] Download Python from: https://www.python.org/downloads/" -ForegroundColor Yellow
    }
}

# Step 4: Install npm packages (if Node.js available)
Write-Host "`n[STEP 4] Checking npm packages..." -ForegroundColor Yellow
if (Test-Command "npm") {
    Write-Host "[INSTALL] Installing npm dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] npm packages installed successfully" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] npm install failed. Run manually: npm install" -ForegroundColor Red
    }
} else {
    Write-Host "[SKIP] Node.js/npm not available yet. Run this script again after restart." -ForegroundColor Yellow
}

# Step 5: Install Python packages (if Python available)
Write-Host "`n[STEP 5] Checking Python packages..." -ForegroundColor Yellow
if (Test-Command "python") {
    Write-Host "[INSTALL] Installing Python dependencies..." -ForegroundColor Cyan
    python -m pip install --upgrade pip
    python -m pip install numpy scipy matplotlib
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Python packages installed successfully" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] pip install failed. Run manually: pip install numpy scipy matplotlib" -ForegroundColor Red
    }
} else {
    Write-Host "[SKIP] Python not available yet. Run this script again after restart." -ForegroundColor Yellow
}

# Step 6: Install Ollama (optional for AI features)
Write-Host "`n[STEP 6] Checking Ollama (Local AI)..." -ForegroundColor Yellow
if (Test-Command "ollama") {
    Write-Host "[OK] Ollama is installed" -ForegroundColor Green
    ollama list
} else {
    Write-Host "[INFO] Ollama not installed (optional for AI features)" -ForegroundColor Yellow
    Write-Host "       Download from: https://ollama.ai/" -ForegroundColor Yellow
    Write-Host "       After install, run: ollama pull llama3.2:3b" -ForegroundColor Yellow
}

# Step 7: Verify installation
Write-Host "`n[STEP 7] Verification..." -ForegroundColor Yellow
$verificationResults = @{
    "Node.js" = Test-Command "node"
    "npm" = Test-Command "npm"
    "Python" = Test-Command "python"
    "pip" = Test-Command "pip"
    "Git" = Test-Command "git"
    "Ollama (Optional)" = Test-Command "ollama"
}

Write-Host "`nInstallation Status:" -ForegroundColor Cyan
foreach ($tool in $verificationResults.GetEnumerator() | Sort-Object Name) {
    if ($tool.Value) {
        Write-Host "  [OK] $($tool.Key)" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $($tool.Key)" -ForegroundColor Red
    }
}

# Step 8: Quick functionality test
Write-Host "`n[STEP 8] Quick Functionality Test..." -ForegroundColor Yellow
if ((Test-Command "node") -and (Test-Path "package.json")) {
    Write-Host "[TEST] Running syntax validation..." -ForegroundColor Cyan
    $testFiles = @("launcher.js", "correctedSolidaritySystem.js", "bridgingSafetyCoordinator.js")
    foreach ($file in $testFiles) {
        if (Test-Path $file) {
            node --check $file 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [OK] $file - syntax valid" -ForegroundColor Green
            } else {
                Write-Host "  [ERROR] $file - syntax errors" -ForegroundColor Red
            }
        }
    }
}

# Final Summary
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

$allInstalled = $verificationResults["Node.js"] -and $verificationResults["Python"]
if ($allInstalled) {
    Write-Host "[SUCCESS] All core dependencies installed!" -ForegroundColor Green
    Write-Host "`nNext Steps:" -ForegroundColor Yellow
    Write-Host "  1. Restart PowerShell/VS Code (if you just installed Node/Python)" -ForegroundColor White
    Write-Host "  2. Run: npm test" -ForegroundColor White
    Write-Host "  3. Run: node launcher.js" -ForegroundColor White
    Write-Host "  4. Run: python bridging_anchor_systems/bridging_anchor_processor.py" -ForegroundColor White
} else {
    Write-Host "[ACTION REQUIRED] Some dependencies missing." -ForegroundColor Yellow
    Write-Host "`nManual Installation Links:" -ForegroundColor Yellow
    if (-not $verificationResults["Node.js"]) {
        Write-Host "  Node.js: https://nodejs.org/" -ForegroundColor White
    }
    if (-not $verificationResults["Python"]) {
        Write-Host "  Python: https://www.python.org/downloads/" -ForegroundColor White
    }
    Write-Host "`nAfter installation, restart and run this script again." -ForegroundColor Yellow
}

Write-Host "`n"
