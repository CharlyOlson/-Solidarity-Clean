#!/usr/bin/env python3
"""
SOLIDARITY PLATFORM - HANKO CLI INTERFACE
==========================================

Simple CLI for Node.js integration with the modular hanko system.
Usage: python hanko_cli.py <command> <json_args>

Commands:
    generate - Generate new hanko stamp with advanced features
    verify   - Verify existing hanko stamp
    test     - Run self-test
"""

import sys
import json
import os
import base64
from uuid import UUID
from datetime import datetime

# Add hanko module to path
sys.path.insert(0, os.path.dirname(__file__))

try:
    from hanko import HankoEngine, UserProfile, verify_hanko
    from hanko.crypto import sha3_256
    from cryptography.hazmat.primitives.asymmetric import ed25519
    from cryptography.hazmat.primitives.serialization import (
        Encoding, PublicFormat, PrivateFormat, NoEncryption
    )
    CRYPTO_AVAILABLE = True
except ImportError as e:
    CRYPTO_AVAILABLE = False
    IMPORT_ERROR = str(e)


def load_or_create_keys():
    """Load or create server keys (salt and Ed25519 keypair)"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    salt_file = os.path.join(script_dir, ".hanko_salt")
    key_file = os.path.join(script_dir, ".hanko_key")
    
    if os.path.exists(salt_file):
        with open(salt_file, "rb") as f:
            server_salt = f.read()
    else:
        server_salt = os.urandom(32)
        with open(salt_file, "wb") as f:
            f.write(server_salt)
    
    if os.path.exists(key_file):
        with open(key_file, "rb") as f:
            key_data = f.read()
            signing_sk = ed25519.Ed25519PrivateKey.from_private_bytes(key_data)
    else:
        signing_sk = ed25519.Ed25519PrivateKey.generate()
        key_data = signing_sk.private_bytes(
            encoding=Encoding.Raw,
            format=PrivateFormat.Raw,
            encryption_algorithm=NoEncryption()
        )
        with open(key_file, "wb") as f:
            f.write(key_data)
    
    return server_salt, signing_sk


def cmd_generate(args):
    """Generate a new hanko stamp"""
    server_salt, signing_sk = load_or_create_keys()
    
    # Extract signing key bytes
    sk_bytes = signing_sk.private_bytes(
        encoding=Encoding.Raw,
        format=PrivateFormat.Raw,
        encryption_algorithm=NoEncryption()
    )
    
    engine = HankoEngine(server_salt, sk_bytes)
    
    # Create user profile
    user_id_str = args.get("user_id", "demo-user")
    try:
        user_id = UUID(user_id_str) if len(user_id_str) > 16 else UUID(int=int(user_id_str[:16], 36))
    except:
        user_id = UUID(int=abs(hash(user_id_str)) % (2**128))
    
    profile = UserProfile(
        user_id=user_id,
        legal_record_ref="",
        primary_device_root_id="demo-device"
    )
    
    # Device key (demo)
    device_key = args.get("device_pubkey_b64", "")
    if device_key:
        device_pubkey = base64.b64decode(device_key)
    else:
        device_pubkey = os.urandom(32)
    
    # Generate stamp
    hanko, svg = engine.generate_stamp(
        user_profile=profile,
        device_root_id=args.get("device_root_id", "demo-device"),
        device_public_key=device_pubkey,
        date=args.get("date", datetime.now().strftime("%Y-%m-%d")),
        daily_counter=args.get("daily_counter", 0),
        stamp_type=args.get("stamp_type", "personal"),
        algo_version=args.get("algo_version", "hanko-v1")
    )
    
    return {
        "stamp_id": hanko.stamp_id,
        "date": hanko.date,
        "svg": svg,
        "svg_hash_b64": base64.b64encode(hanko.svg_hash).decode("ascii"),
        "base_hash_b64": base64.b64encode(hanko.base_hash).decode("ascii"),
        "daily_hash_b64": base64.b64encode(hanko.daily_hash).decode("ascii"),
        "signature_b64": base64.b64encode(hanko.sig_ed25519).decode("ascii"),
        "stamp_type": args.get("stamp_type", "personal"),
        "algo_version": hanko.algo_version
    }


def cmd_test():
    """Run self-test"""
    server_salt, signing_sk = load_or_create_keys()
    sk_bytes = signing_sk.private_bytes(
        encoding=Encoding.Raw,
        format=PrivateFormat.Raw,
        encryption_algorithm=NoEncryption()
    )
    
    engine = HankoEngine(server_salt, sk_bytes)
    
    user_id = UUID(int=12345)
    profile = UserProfile(
        user_id=user_id,
        legal_record_ref="test-record",
        primary_device_root_id="test-device"
    )
    
    hanko, svg = engine.generate_stamp(
        user_profile=profile,
        device_root_id="test-device",
        device_public_key=b"test-key-32-bytes-long-enough!",
        date="2025-12-17",
        daily_counter=0,
        stamp_type="personal"
    )
    
    return {
        "success": True,
        "stamp_id": hanko.stamp_id,
        "svg_length": len(svg),
        "features": {
            "daily_strip": "48 segments" in svg or "Daily strip" in svg,
            "rgb_box": "rgb(" in svg,
            "qr_code": "path" in svg or "QR" in svg,
            "phi_ratio": "φ" in svg or "1.618" in svg
        }
    }


def main():
    if not CRYPTO_AVAILABLE:
        print(json.dumps({"error": f"Crypto library not available: {IMPORT_ERROR}"}))
        sys.exit(1)
    
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python hanko_cli.py <command> [json_args]"}))
        sys.exit(1)
    
    command = sys.argv[1]
    args = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
    
    try:
        if command == "generate":
            result = cmd_generate(args)
        elif command == "test":
            result = cmd_test()
        else:
            result = {"error": f"Unknown command: {command}"}
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e), "type": type(e).__name__}))
        sys.exit(1)


if __name__ == "__main__":
    main()
