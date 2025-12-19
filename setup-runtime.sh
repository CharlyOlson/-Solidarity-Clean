#!/bin/bash
# Solidarity Platform - Runtime Setup Script (Linux/Mac)
# Automated installation of Node.js, Python, and all dependencies

echo ""
echo "============================================"
echo "  SOLIDARITY PLATFORM - RUNTIME SETUP"
echo "============================================"
echo ""

# Detect OS
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo "[INFO] Detected OS: $MACHINE"

# Step 1: Install Node.js
echo ""
echo "[STEP 1] Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "[OK] Node.js already installed: $NODE_VERSION"
else
    echo "[INSTALL] Installing Node.js..."
    if [ "$MACHINE" == "Mac" ]; then
        if command -v brew &> /dev/null; then
            brew install node
        else
            echo "[ERROR] Homebrew not found. Install from: https://brew.sh/"
            exit 1
        fi
    elif [ "$MACHINE" == "Linux" ]; then
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
fi

# Step 2: Install Python
echo ""
echo "[STEP 2] Checking Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "[OK] Python already installed: $PYTHON_VERSION"
else
    echo "[INSTALL] Installing Python..."
    if [ "$MACHINE" == "Mac" ]; then
        brew install python
    elif [ "$MACHINE" == "Linux" ]; then
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip
    fi
fi

# Step 3: Install npm packages
echo ""
echo "[STEP 3] Installing npm packages..."
if command -v npm &> /dev/null; then
    npm install
    echo "[OK] npm packages installed"
else
    echo "[ERROR] npm not available"
fi

# Step 4: Install Python packages
echo ""
echo "[STEP 4] Installing Python packages..."
if command -v python3 &> /dev/null; then
    python3 -m pip install --upgrade pip
    python3 -m pip install numpy scipy matplotlib
    echo "[OK] Python packages installed"
else
    echo "[ERROR] Python not available"
fi

# Step 5: Install Ollama (optional)
echo ""
echo "[STEP 5] Checking Ollama (Local AI)..."
if command -v ollama &> /dev/null; then
    echo "[OK] Ollama is installed"
    ollama list
else
    echo "[INFO] Ollama not installed (optional)"
    echo "       Download from: https://ollama.ai/"
fi

# Step 6: Verification
echo ""
echo "[STEP 6] Verification..."
echo ""
echo "Installation Status:"
command -v node &> /dev/null && echo "  [OK] Node.js" || echo "  [MISSING] Node.js"
command -v npm &> /dev/null && echo "  [OK] npm" || echo "  [MISSING] npm"
command -v python3 &> /dev/null && echo "  [OK] Python" || echo "  [MISSING] Python"
command -v pip3 &> /dev/null && echo "  [OK] pip" || echo "  [MISSING] pip"
command -v git &> /dev/null && echo "  [OK] Git" || echo "  [MISSING] Git"
command -v ollama &> /dev/null && echo "  [OK] Ollama (Optional)" || echo "  [INFO] Ollama (Optional)"

# Final Summary
echo ""
echo "============================================"
echo "  SETUP COMPLETE"
echo "============================================"
echo ""
echo "Next Steps:"
echo "  1. Run: npm test"
echo "  2. Run: node launcher.js"
echo "  3. Run: python3 bridging_anchor_systems/bridging_anchor_processor.py"
echo ""
