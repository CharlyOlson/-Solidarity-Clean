"""
SOLIDARITY PLATFORM - QUANTUM-RESISTANT HANKO STAMP ENGINE
===========================================================

TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
Owner: Scott Charles Olson
DOB: March 31, 1997
Phone: +1 (913) 548-5715
Location: Kansas, USA 66210
Trademark: TRADEMARKED BY SCOTT CHARLES OLSON

This module implements a cryptographically-secure, quantum-resistant
hanko (Japanese seal) generation and verification system using:
- SHA-3 hashing for quantum resistance
- Ed25519 signatures (upgradable to post-quantum schemes)
- Deterministic visual generation from hash-based keys
- Daily-rotating, device-bound stamps
- φ-ratio (1.618) harmonic integration for Solidarity Platform
"""

import base64
import hashlib
import hmac
import os
import sys
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict, Any

from cryptography.hazmat.primitives.asymmetric import ed25519
import cryptography.hazmat.primitives.serialization as serialization  # type: ignore[reportUnknownVariableType]
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF


# ---------- Data classes ----------

@dataclass
class IdentityProfile:
    """User identity profile for hanko generation."""
    user_id: str          # UUID or opaque id
    device_pubkey_b64: str
    # PII stays server-side; do not embed in hanko


@dataclass
class HankoStamp:
    """Complete hanko stamp with cryptographic proof."""
    stamp_id: str
    date: str             # YYYY-MM-DD
    svg: str              # SVG string
    svg_hash_b64: str
    base_hash_b64: str
    signature_b64: str
    algo_version: str = "hanko-v1"
    stamp_type: str = "personal"  # personal, registered, bank, company


# ---------- Hanko Engine ----------

class HankoEngine:
    """
    Deterministic, hash-based hanko generator & verifier.
    All secrets (server_salt, signing_key) must be kept in HSM / secure vault.
    
    Integrates with Solidarity Platform's φ-ratio (1.618) harmonic system.
    """

    def __init__(self, server_salt: bytes, signing_sk: ed25519.Ed25519PrivateKey) -> None:
        """
        Initialize the HankoEngine with server salt and signing key.
        """
        def _render_svg(
            self,
            profile: 'IdentityProfile',
            date: str,
            stamp_id: str,
            params: dict,
            algo_version: str = "hanko-v1",
            size_px: int = 512,
        ) -> str:
            from .svg_renderer import HankoSVGRenderer
            renderer = HankoSVGRenderer(self.PHI, self.PHI_RECIPROCAL)
            return renderer.render_svg(profile, date, stamp_id, params, algo_version, size_px)
                    f'stroke="#111" stroke-width="0.5" fill="#ffffff"/>'
                )
                # Fill style based on digit
                if d >= 7:
                    # solid
                    svg_parts.append(
                        f'<rect x="{cx+1}" y="{cy+1}" width="{cell-2}" height="{cell-2}" '
                        f'fill="{palette[d % len(palette)]}" opacity="0.85"/>'
                    )
                elif 4 <= d <= 6:
                    # hatched diagonal
                    svg_parts.append(
                        f'<path d="M {cx} {cy+cell} L {cx+cell} {cy} " '
                        f'stroke="{palette[(d+1) % len(palette)]}" stroke-width="1.2"/>'
                    )
                else:
                    # dot
                    svg_parts.append(
                        f'<circle cx="{cx + cell/2}" cy="{cy + cell/2}" r="{cell*0.15}" '
                        f'fill="{palette[(d+2) % len(palette)]}"/>'
                    )

        # Central radial wheel (φ-ratio based)
        svg_parts.append(
            f'<circle cx="{half}" cy="{half}" r="{radius}" stroke="#111" stroke-width="3" fill="none"/>'
        )

        import math
        for i in range(spokes):
            angle_deg = rotation + (360.0 / spokes) * i
            angle_rad = math.radians(angle_deg)
            # inner radius & outer radius modulated with φ-ratio
            inner = radius * 0.15 * radial[i % len(radial)] * self.PHI_RECIPROCAL
            outer = radius * (0.6 + 0.05 * (radial[i % len(radial)])) * self.PHI
            x1 = half + inner * math.cos(angle_rad)
            y1 = half + inner * math.sin(angle_rad)
            x2 = half + outer * math.cos(angle_rad)
            y2 = half + outer * math.sin(angle_rad)
            width = 1.0 + thick[i % len(thick)]
            color = palette[i % len(palette)]
            svg_parts.append(
                f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
                f'stroke="{color}" stroke-width="{width}" stroke-linecap="round"/>'
            )

        # Stamp type indicator (top-right corner)
        type_icons = {
            'personal': '個',
            'registered': '実',
            'bank': '銀',
            'company': '社'
        }
        type_icon = type_icons.get(stamp_type, '個')
        svg_parts.append(
            f'<text x="{size_px-40}" y="40" text-anchor="middle" '
            f'font-family="serif" font-size="32" fill="{palette[1]}" font-weight="bold">{type_icon}</text>'
        )

        # Micro-text band at bottom edge
        short_user = profile.user_id[:8]
        short_stamp = stamp_id[:8]
        meta_text = f"{short_user} {date} {algo_version} {short_stamp}"
        svg_parts.append(
            f'<text x="{size_px/2}" y="{size_px-20}" text-anchor="middle" '
            f'font-family="monospace" font-size="10" fill="#333">{meta_text}</text>'
        )

        # φ-ratio watermark (subtle)
        svg_parts.append(
            f'<text x="{size_px/2}" y="{half + 10}" text-anchor="middle" '
            f'font-family="serif" font-size="8" fill="#cccccc" opacity="0.3">φ 1.618</text>'
        )

        svg_parts.append("</svg>")
        return "".join(svg_parts)

    # ---- Public API: generate / verify ----

    def generate_stamp(
        self,
        profile: IdentityProfile,
        date: str | None = None,
        daily_counter: int = 0,
        grid_size: int = 3,
        stamp_type: str = "personal"
    ) -> HankoStamp:
        """
        Generate a hanko for a given identity, date, and counter.
        """
        if date is None:
            date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        base_hash = self._derive_base_hash(profile, date, daily_counter)
        params = self._derive_visual_params(base_hash, grid_size=grid_size, stamp_type=stamp_type)

        # Stamp ID: independent random to avoid leaking base_hash directly
        stamp_id_bytes = os.urandom(32)
        stamp_id = base64.urlsafe_b64encode(stamp_id_bytes).decode("ascii").rstrip("=")

        svg = self._render_svg(profile, date, stamp_id, params)
        svg_hash = self._sha3_256(svg.encode("utf-8"))

        # Signature over (stamp_id || date || base_hash || svg_hash)
        signed_payload = (
            stamp_id_bytes + date.encode("ascii") + base_hash + svg_hash
        )
        signature = self._signing_sk.sign(signed_payload)

        return HankoStamp(
            stamp_id=stamp_id,
            date=date,
            svg=svg,
            svg_hash_b64=base64.b64encode(svg_hash).decode("ascii"),
            base_hash_b64=base64.b64encode(base_hash).decode("ascii"),
            signature_b64=base64.b64encode(signature).decode("ascii"),
            stamp_type=stamp_type
        )

    def verify_stamp(
        self,
        profile: IdentityProfile,
        stamp: HankoStamp,
        daily_counter_window: range,
    ) -> bool:
        """
        Verify that a stamp was generated for `profile` on `stamp.date`
        with some daily_counter in the given window.
        Steps:
          1. Recompute base_hash for counters in window until match.
          2. Rebuild svg from base_hash; compare svg hash.
          3. Verify ed25519 signature.
        """
        date = stamp.date
        target_base_hash = base64.b64decode(stamp.base_hash_b64)
        svg_bytes = stamp.svg.encode("utf-8")
        provided_svg_hash = base64.b64decode(stamp.svg_hash_b64)

        # Check svg hash first
        if self._sha3_256(svg_bytes) != provided_svg_hash:
            return False

        # Recover stamp_id bytes
        padded = stamp.stamp_id + "=="
        stamp_id_bytes = base64.urlsafe_b64decode(padded.encode("ascii"))

        # Try to reconstruct base_hash and SVG
        matched = False
        for c in daily_counter_window:
            bh = self._derive_base_hash(profile, date, c)
            if hmac.compare_digest(bh, target_base_hash):
                params = self._derive_visual_params(bh, grid_size=3, stamp_type=stamp.stamp_type)
                expected_svg = self._render_svg(profile, date, stamp.stamp_id, params)
                expected_hash = self._sha3_256(expected_svg.encode("utf-8"))
                if hmac.compare_digest(expected_hash, provided_svg_hash):
                    matched = True
                    break

        if not matched:
            return False

        # Verify signature
        signature = base64.b64decode(stamp.signature_b64)
        payload = stamp_id_bytes + date.encode("ascii") + target_base_hash + provided_svg_hash
        try:
            self._signing_pk.verify(signature, payload)
        except Exception:
            return False

        return True


# ---------- CLI Interface for Node.js Integration ----------

def main():
    """
    CLI interface for Node.js to call Python hanko engine.
    Usage: python hanko_engine.py <command> <json_args>
    
    Commands:
        generate: Generate a new hanko stamp
        verify: Verify an existing hanko stamp
    """
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python hanko_engine.py <command> <json_args>"}))
        sys.exit(1)
    
    command = sys.argv[1]
    args = json.loads(sys.argv[2])
    
    try:
        # Load or generate server secrets (in production, use secure vault)
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
                encoding=serialization.Encoding.Raw,
                format=serialization.PrivateFormat.Raw,
                encryption_algorithm=serialization.NoEncryption()
            )
            with open(key_file, "wb") as f:
                f.write(key_data)
        
        engine = HankoEngine(server_salt, signing_sk)
        
        if command == "generate":
            # Generate stamp
            profile = IdentityProfile(
                user_id=args["user_id"],
                device_pubkey_b64=args.get("device_pubkey_b64", base64.b64encode(os.urandom(32)).decode("ascii"))
            )
            stamp = engine.generate_stamp(
                profile,
                date=args.get("date"),
                daily_counter=args.get("daily_counter", 0),
                grid_size=args.get("grid_size", 3),
                stamp_type=args.get("stamp_type", "personal")
            )
            result = {
                "stamp_id": stamp.stamp_id,
                "date": stamp.date,
                "svg": stamp.svg,
                "svg_hash_b64": stamp.svg_hash_b64,
                "base_hash_b64": stamp.base_hash_b64,
                "signature_b64": stamp.signature_b64,
                "stamp_type": stamp.stamp_type,
                "algo_version": stamp.algo_version
            }
            print(json.dumps(result))
        
        elif command == "verify":
            # Verify stamp
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
        
        else:
            print(json.dumps({"error": f"Unknown command: {command}"}))
            sys.exit(1)
    
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    print("[hanko_engine.py] This module is not intended to be run directly. Use hanko_cli.py for CLI operations.")
