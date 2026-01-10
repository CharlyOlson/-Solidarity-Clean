# Hanko Server Skeleton - Python FastAPI

# app.py
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

# hanko_connector.py
# Functions to call CLI or import logic directly
# Example: generate_stamp(), unlock_stamp(), reset_stamp(), etc.

# requirements.txt
# fastapi
# uvicorn
# python-multipart
# pyminizip, cairosvg, pillow, etc.
