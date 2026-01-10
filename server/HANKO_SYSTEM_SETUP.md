# Hanko Stamp System - Server Integration Plan & Skeleton

## 1. Overview
This document and code skeleton outline all steps and connectors needed to deploy a full-featured Hanko stamp authentication system with a host server, multi-factor unlock, and recovery.

---

## 2. Steps Needed

### A. Server Setup
- [ ] Choose backend (Node.js/Express or Python/FastAPI/Flask)
- [ ] Set up REST API endpoints:
    - `/register` (user registration)
    - `/login` (user login)
    - `/generate-stamp` (create Hanko stamp)
    - `/download-stamp` (serve zip file)
    - `/unlock` (multi-factor unlock)
    - `/reset` (deactivate/reset credentials)
    - `/verify` (verify stamp/QR)
    - `/audit` (log/retrieve events)
- [ ] Connect to database (users, stamps, sessions, audit logs)

### B. CLI/Backend Integration
- [ ] Refactor CLI logic into importable Python modules
- [ ] Expose CLI functions as API endpoints (or via subprocess calls)
- [ ] Handle file uploads/downloads securely

### C. Multi-Factor Unlock
- [ ] Implement unlock logic (passcode, QR, daily code, USB, or combo)
- [ ] Store and check unlock attempts in DB/metadata
- [ ] Support one-time QR login and code rotation

### D. Recovery & Reset
- [ ] Full login required for reset
- [ ] Deactivate previous codes, generate new stamp/QR
- [ ] Notify user/admin on reset

### E. Security & Audit
- [ ] Enforce HTTPS, rate limiting, and input validation
- [ ] Log all actions (generation, unlock, reset, download)
- [ ] Provide admin tools for monitoring and revocation

### F. Frontend (Optional)
- [ ] Web UI for registration, login, download, unlock, and recovery
- [ ] QR code scanner and file upload support

---

## 3. Code Skeleton

### /server/app.py (Python FastAPI Example)

```python
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
import os

app = FastAPI()

@app.post("/register")
def register(username: str = Form(...), password: str = Form(...)):
    # TODO: Register user in DB
    return {"status": "registered"}

@app.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    # TODO: Authenticate user
    return {"status": "logged_in"}

@app.post("/generate-stamp")
def generate_stamp(username: str = Form(...), descriptor: str = Form(None)):
    # TODO: Call hanko_cli.py generate and store result
    return {"status": "stamp_generated"}

@app.get("/download-stamp/{username}")
def download_stamp(username: str):
    # TODO: Serve zip file for user
    return FileResponse(f"/path/to/{username}_stamp.zip")

@app.post("/unlock")
def unlock(username: str = Form(...), unlock_value: str = Form(...)):
    # TODO: Call hanko_cli.py unlock
    return {"status": "unlocked"}

@app.post("/reset")
def reset(username: str = Form(...)):
    # TODO: Call hanko_cli.py reset
    return {"status": "reset"}

@app.post("/verify")
def verify(stamp_id: str = Form(...)):
    # TODO: Verify stamp/QR
    return {"status": "verified"}

@app.get("/audit/{username}")
def audit(username: str):
    # TODO: Return audit log for user
    return {"log": []}
```

### /server/hanko_connector.py
```python
# Functions to call CLI or import logic directly
# Example: generate_stamp(), unlock_stamp(), reset_stamp(), etc.
```

### /server/requirements.txt
```
fastapi
uvicorn
python-multipart
# Add: pyminizip, cairosvg, pillow, etc.
```

---

## 4. Next Steps
- Fill in DB logic and secure file handling
- Connect endpoints to CLI logic
- Build minimal frontend or API client
- Test end-to-end flows

---

**This skeleton is ready for you to expand and connect all Hanko system features. Let me know if you want the Node.js/Express version or more detailed code for any part!**
