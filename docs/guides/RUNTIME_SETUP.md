# Solidarity Platform - Runtime Setup Guide

## Quick Setup (Windows)

Run the automated setup script:

```powershell
.\setup-runtime.ps1
```

**Or manually:**

### 1. Install Node.js (Required for JavaScript)
```powershell
winget install OpenJS.NodeJS.LTS
```
Or download from: https://nodejs.org/

### 2. Install Python (Required for DSP Processing)
```powershell
winget install Python.Python.3.11
```
Or download from: https://www.python.org/downloads/

### 3. Install npm Dependencies
```powershell
npm install
```

### 4. Install Python Dependencies
```powershell
pip install numpy scipy matplotlib
```

### 5. Install Ollama (Optional - for AI features)
Download from: https://ollama.ai/
```powershell
ollama pull llama3.2:3b
```

---

## Quick Setup (Linux/Mac)

Run the automated setup script:

```bash
chmod +x setup-runtime.sh
./setup-runtime.sh
```

**Or manually:**

### Mac (using Homebrew)
```bash
brew install node python
npm install
pip3 install numpy scipy matplotlib
```

### Linux (Ubuntu/Debian)
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python
sudo apt-get install -y python3 python3-pip

# Dependencies
npm install
pip3 install numpy scipy matplotlib
```

---

## Verify Installation

```powershell
# Check versions
node --version
python --version
npm --version

# Test core modules
node launcher.js
python bridging_anchor_systems/bridging_anchor_processor.py

# Run tests
npm test
```

---

## Quick Start Commands

After setup is complete:

### Run API Server
```powershell
npm start
```

### Run Quantum Demo
```powershell
npm run quantum:demo
```

### Test Bridging System
```powershell
npm run test:bridging
```

### Run Safety Coordinator Demo
```powershell
node bridgingSafetyCoordinator.js
```

---

## Troubleshooting

### "node is not recognized"
- Restart PowerShell/Terminal after installing Node.js
- Check PATH: `$env:PATH` (Windows) or `echo $PATH` (Linux/Mac)

### "python is not recognized"
- Restart PowerShell/Terminal after installing Python
- Windows: Use `python` not `python3`
- Linux/Mac: Use `python3`

### npm install fails
```powershell
# Clear cache and retry
npm cache clean --force
npm install
```

### Python packages fail
```powershell
# Upgrade pip first
python -m pip install --upgrade pip
pip install numpy scipy matplotlib
```

---

## Development Tools (Optional)

### VS Code Extensions
- ESLint
- Prettier
- Python
- Pylance
- GitLens
- GitHub Copilot

### Install via VS Code or:
```powershell
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-python.python
```

---

## System Requirements

- **OS**: Windows 10/11, macOS 10.15+, Ubuntu 20.04+
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 2GB free space
- **Node.js**: v18+ LTS
- **Python**: 3.9+
- **Git**: Any recent version

---

## Next Steps

1. **Read Documentation**: `README.md`, `COMPLETE_SYSTEM_DOCUMENTATION.md`
2. **Explore Examples**: `examples/` directory
3. **Run Tests**: `npm test`
4. **Start Developing**: Check `.github/copilot-instructions.md`

---

## Support

- **Issues**: https://github.com/CharlyOlson/-Solidarity-Clean/issues
- **Documentation**: Check `/docs` folder
- **Contact**: See `PROJECT_CONFIG.json` for owner information
