"""
SOLIDARITY PLATFORM - HANKO CLI INTERFACE
==========================================

CLI for Hanko stamp generation and verification.
Usage: python hanko_cli.py <command> <json_args>
Commands: generate, verify, test, metrics, questions
"""

import sys
import json
import os
import base64
from datetime import datetime

sys.path.insert(0, os.path.dirname(__file__))

try:
    from hanko_engine import HankoEngine, IdentityProfile, HankoStamp
    from cryptography.hazmat.primitives.asymmetric import ed25519
    from cryptography.hazmat.primitives.serialization import (
        Encoding, PrivateFormat, NoEncryption
    )
    CRYPTO_AVAILABLE = True
except ImportError as e:
    CRYPTO_AVAILABLE = False
    IMPORT_ERROR = str(e)

def load_or_create_keys():
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

def main():
    if not CRYPTO_AVAILABLE: print(json.dumps({"error": f"Crypto library not available: {IMPORT_ERROR}"}))
        sys.exit(1)
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python hanko_cli.py <command> [json_args]"}))
        sys.exit(1)
    command = sys.argv[1]
    args = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
    try:
        server_salt, signing_sk = load_or_create_keys()
        engine = HankoEngine(server_salt, signing_sk)
        if command == "generate":
            # Profanity filter (simple, extend as needed)
            profane_words = [
                "fuck", "shit", "bitch", "asshole", "bastard", "dick", "cunt", "piss", "cock", "pussy", "fag", "slut", "whore", "nigger", "spic", "kike", "chink", "gook", "twat", "wank", "cum", "dildo", "faggot", "motherfucker", "nigga", "retard", "suck", "tit", "tits", "bollocks", "bugger", "arse", "wanker", "prick", "dyke", "tranny", "queer", "homo", "rape", "rapist", "molest", "molester", "anus", "fisting", "rimjob", "scat", "shithead", "shite", "tosser", "twat", "vagina", "penis", "testicle", "scrotum", "clit", "clitoris", "ejaculate", "jizz", "spunk", "spooge", "jackoff", "jerkoff", "handjob", "blowjob", "blow job", "cocksucker", "cocksuck", "douche", "douchebag", "dickhead", "dickweed", "dickwad", "dickface", "shitface", "shitfaced", "shithole", "shiteater", "asshat", "assclown", "asslick", "asslicker", "assmunch", "asswipe", "asswipes", "asshole", "buttfuck", "buttfucker", "buttplug", "buttsex", "buttcheek", "buttcheeks", "butthead", "butthole", "buttlick", "buttlicker", "buttmunch", "buttwipe", "crap", "crapper", "craphead", "crapola", "craptastic", "cumdumpster", "cumguzzler", "cumbubble", "cumshot", "cumslut", "cuntface", "cuntlick", "cuntlicker", "cuntmunch", "cuntmuncher", "cunts", "cuntwaffle", "dickbag", "dickbeaters", "dickbrain", "dickcheese", "dickforbrains", "dickhole", "dickjuice", "dickmilk", "dickslap", "dicksucker", "dicktickler", "dickwad", "dickweasel", "dickweed", "dickwod", "dildo", "dipshit", "douche", "douchebag", "douchebags", "douchefag", "douchewaffle", "dumbass", "dumbfuck", "dumshit", "fagbag", "fagfucker", "faggot", "faggots", "faggy", "fagott", "fagstrap", "fatass", "fuckass", "fuckbag", "fuckboy", "fuckbrain", "fuckbutt", "fuckdick", "fucked", "fucker", "fuckers", "fuckface", "fuckhead", "fuckhole", "fuckin", "fucking", "fucknut", "fucknutt", "fuckoff", "fucks", "fuckstick", "fucktard", "fuckup", "fuckwad", "fuckwit", "fuckwitt", "jizz", "jizzed", "jizzing", "jizzmopper", "jizzum", "knobend", "knobhead", "knobjockey", "knobslobber", "mothafucka", "mothafuckin", "motherfucker", "motherfucking", "muffdiver", "niglet", "numbnuts", "nutsack", "piss", "pissed", "pissflaps", "pissin", "pissing", "pissmidget", "pisspants", "pisspig", "pisswhistle", "prick", "pricks", "punani", "pussy", "pussies", "pussydick", "pussyfart", "pussylick", "pussylicker", "pussys", "queef", "queer", "queerbait", "queerhole", "rimjob", "shit", "shitass", "shitbag", "shitbagger", "shitbrains", "shitbreath", "shitcanned", "shitdick", "shitface", "shitfaced", "shithead", "shithole", "shithouse", "shitspitter", "shitstain", "shitter", "shittiest", "shitting", "shitty", "slut", "slutbag", "slutface", "sluts", "slutty", "spunk", "twat", "twatwaffle", "vag", "vaginal", "wank", "wanker", "whore", "whorebag", "whoreface", "whorehouse", "whorehopper", "whorelick", "whorelicker", "whoreman", "whoremeister", "whorenugget", "whorepants", "whorepocket", "whorester", "whoretard", "whorewhore", "wop", "wuss", "wussy"
            ]
            descriptor = args.get("descriptor", "")
            if descriptor:
                desc_lower = descriptor.lower()
                if any(bad in desc_lower for bad in profane_words):
                    print(json.dumps({"error": "Descriptor contains inappropriate language."}))
                    sys.exit(1)
            profile = IdentityProfile(
                user_id=args["user_id"],
                device_pubkey_b64=args.get("device_pubkey_b64", base64.b64encode(os.urandom(32)).decode("ascii"))
            )
            # Pass descriptor to stamp if supported, else just include in result
            stamp = engine.generate_stamp(
                profile,
                date=args.get("date"),
                daily_counter=args.get("daily_counter", 0),
                grid_size=args.get("grid_size", 3),
                stamp_type=args.get("stamp_type", "personal")
            )
            # Sudoku point shape outline identifier (stub, extend as needed)
            sudoku_outline = {
                "type": "sudoku_point_shape",
                "grid_size": args.get("grid_size", 3),
                "outline": "square" if args.get("grid_size", 3) == 3 else "custom"
            }
            # Username and daily rotating segment
            username = args.get("username", "user")
            date_str = args.get("date") or datetime.now().strftime("%Y-%m-%d")
            # Daily segment: hash of username+date, first 8 chars
            import hashlib
            daily_segment = hashlib.sha256((username + date_str).encode()).hexdigest()[:8]
            # QR code data: encode username, date, daily_segment
            qr_data = {
                "username": username,
                "date": date_str,
                "daily_segment": daily_segment,
                "stamp_id": stamp.stamp_id
            }
            # Optionally, encode as a string for QR code
            qr_code_string = json.dumps(qr_data)
            import zipfile
            import random
            import string
            import tempfile
            import shutil
            from datetime import datetime as dt
            # Save .chd, .jpeg, and metadata.json
            out_dir = tempfile.mkdtemp()
            chd_path = os.path.join(out_dir, f"{username}_hanko.chd")
            with open(chd_path, "w", encoding="utf-8") as f:
                f.write(stamp.svg)
            jpeg_path = os.path.join(out_dir, f"{username}_hanko.jpg")
            try:
                import cairosvg
                from PIL import Image
                cairosvg.svg2png(bytestring=stamp.svg.encode("utf-8"), write_to=jpeg_path+".png")
                img = Image.open(jpeg_path+".png")
                rgb_img = img.convert('RGB')
                rgb_img.save(jpeg_path, "JPEG")
                os.remove(jpeg_path+".png")
            except Exception:
                with open(jpeg_path, "w", encoding="utf-8") as f:
                    f.write(stamp.svg)
            passcode = ''.join(random.choices(string.digits, k=4))
            now = dt.now()
            zip_name = f"{username}sHankoStamp-{now.strftime('%m-%d-%y-%I-%M%p')}.zip"
            zip_path = os.path.join(os.getcwd(), zip_name)
            # Geolocation (optional)
            geolocation = args.get("geolocation", None)
            # Multi-factor unlock methods
            unlock_methods = {
                "passcode": passcode,
                "qr_code": daily_segment,
                "daily_code": daily_segment,
                "usb": args.get("usb_id", None)
            }
            # Metadata
            metadata = {
                "username": username,
                "date": date_str,
                "stamp_id": stamp.stamp_id,
                "descriptor": descriptor,
                "geolocation": geolocation,
                "unlock_methods": {k: v for k, v in unlock_methods.items() if v},
                "status": "active",
                "last_login": now.isoformat(),
                "login_history": [],
                "qr_code_data": qr_code_string,
                "sudoku_outline": sudoku_outline
            }
            meta_path = os.path.join(out_dir, f"{username}_metadata.json")
            with open(meta_path, "w", encoding="utf-8") as f:
                json.dump(metadata, f, indent=2)
            # Create password-protected zip (pyminizip if available)
            try:
                import pyminizip
                pyminizip.compress_multiple([chd_path, jpeg_path, meta_path], [], zip_path, passcode, 5)
            except Exception:
                with zipfile.ZipFile(zip_path, 'w') as zf:
                    zf.write(chd_path, os.path.basename(chd_path))
                    zf.write(jpeg_path, os.path.basename(jpeg_path))
                    zf.write(meta_path, os.path.basename(meta_path))
            shutil.rmtree(out_dir)
            result = {
                "stamp_id": stamp.stamp_id,
                "date": stamp.date,
                "svg": stamp.svg,
                "svg_hash_b64": stamp.svg_hash_b64,
                "base_hash_b64": stamp.base_hash_b64,
                "signature_b64": stamp.signature_b64,
                "stamp_type": stamp.stamp_type,
                "algo_version": stamp.algo_version,
                "descriptor": descriptor,
                "sudoku_outline": sudoku_outline,
                "username": username,
                "daily_segment": daily_segment,
                "qr_code_data": qr_code_string,
                "download_zip": zip_path,
                "zip_passcode": passcode,
                "zip_note": "If pyminizip is not installed, the zip is not password protected.",
                "metadata": metadata
            }
            print(json.dumps(result))

        elif command == "unlock":
            # Unlock logic: user provides any valid unlock method (passcode, qr, daily, usb)
            meta_path = args.get("metadata_path")
            if not meta_path or not os.path.exists(meta_path):
                print(json.dumps({"error": "metadata.json not found"}))
                sys.exit(1)
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
            provided = args.get("unlock_value")
            allowed = meta.get("unlock_methods", {})
            if provided and provided in allowed.values():
                print(json.dumps({"unlocked": True, "method": [k for k, v in allowed.items() if v == provided][0]}))
            else:
                print(json.dumps({"unlocked": False, "reason": "Invalid unlock value"}))

        elif command == "reset":
            # Reset logic: require full login, deactivate previous codes, generate new QR/daily code
            meta_path = args.get("metadata_path")
            if not meta_path or not os.path.exists(meta_path):
                print(json.dumps({"error": "metadata.json not found"}))
                sys.exit(1)
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
            meta["status"] = "deactivated"
            meta["deactivated_at"] = dt.now().isoformat()
            # Save deactivated metadata
            with open(meta_path, "w", encoding="utf-8") as f:
                json.dump(meta, f, indent=2)
            print(json.dumps({"reset": True, "message": "Previous codes deactivated. Please log in fully to generate a new stamp."}))
        elif command == "verify":
            profile = IdentityProfile(
                user_id=args["user_id"],
                device_pubkey_b64=args["device_pubkey_b64"]
            )
            stamp = HankoStamp(
                stamp_id=args["stamp_id"],
                date=args["date"],
                svg=args["svg"],
                svg_hash_b64=args["svg_hash_b64"],
                base_hash_b64=args["base_hash_b64"],
                signature_b64=args["signature_b64"],
                stamp_type=args.get("stamp_type", "personal"),
                algo_version=args.get("algo_version", "hanko-v1")
            )
            valid = engine.verify_stamp(
                profile,
                stamp,
                daily_counter_window=range(0, args.get("counter_window", 100))
            )
            print(json.dumps({"valid": valid}))
        elif command == "metrics":
            # Example: output metrics about stamp creation (stub, extend as needed)
            metrics = {
                "supported_stamp_types": ["personal", "registered", "bank", "company"],
                "default_grid_size": 3,
                "max_daily_counter": 9999,
                "algo_version": "hanko-v1"
            }
            print(json.dumps(metrics))
        elif command == "questions":
            # Example: output available question options (stub, extend as needed)
            questions = [
                "What is a Hanko stamp?",
                "How do I generate a stamp?",
                "How do I verify a stamp?",
                "What are the supported stamp types?",
                "How do I use the CLI with Node.js?"
            ]
            print(json.dumps({"questions": questions}))
        else:
            print(json.dumps({"error": f"Unknown command: {command}"}))
            sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
