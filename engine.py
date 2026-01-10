# hanko/engine.py
import os
import base64
from typing import Dict, Any
from uuid import UUID

from .crypto import sha3_512, sha3_256, ed25519_sign, pq_sign
from .models import UserProfile, HankoStamp
from .svg_renderer import HankoSVGRenderer


class HankoEngine:
    """
    Quantum-resistant hanko stamp generator with:
    - SHA-3 hashing
    - Ed25519 + optional PQ signatures
    - Daily strip, RGB box, QR code integration
    - φ-ratio (1.618) harmonic system
    """
    
    def __init__(self, server_salt: bytes, ed25519_sk: bytes, pq_sk: bytes | None = None):
        self.server_salt = server_salt
        self.ed25519_sk = ed25519_sk
        self.pq_sk = pq_sk
        self.renderer = HankoSVGRenderer(size_px=512)

    def generate_stamp(
        self,
        user_profile: UserProfile,
        device_root_id: str,
        device_public_key: bytes,
        date: str,
        daily_counter: int,
        timepass_key: bytes = b"",
        context_hash: bytes = b"",
        stamp_type: str = "personal",
        algo_version: str = "hanko-v1",
    ) -> tuple[HankoStamp, str]:
        """
        Generate a cryptographically-bound hanko stamp
        
        Returns: (HankoStamp, svg_string)
        """
        stamp_id_bytes = os.urandom(32)
        stamp_id = self._b64url(stamp_id_bytes)

        # Base hash: deterministic from user, device, date, counter
        base_hash = sha3_512(
            user_profile.user_id.bytes
            + device_public_key
            + date.encode("ascii")
            + daily_counter.to_bytes(4, "big")
            + timepass_key
            + self.server_salt
        )

        # Daily hash: changes every day for visual variation
        daily_hash = sha3_256(
            stamp_id_bytes + date.encode("ascii") + base_hash
        )

        # Context hash: empty if not provided
        if not context_hash:
            context_hash = sha3_256(b"default_context")

        params = self._derive_visual_params(base_hash, stamp_type)

        svg = self.renderer.render(
            profile=user_profile,
            date=date,
            stamp_id=stamp_id,
            params=params,
            base_hash=base_hash,
            daily_hash=daily_hash,
            algo_version=algo_version,
        )

        svg_bytes = svg.encode("utf-8")
        svg_hash = sha3_256(svg_bytes)

        # Sign: stamp_id + date + base_hash + svg_hash + context_hash
        payload = (
            stamp_id_bytes
            + date.encode("ascii")
            + base_hash
            + svg_hash
            + context_hash
        )

        sig_ed = ed25519_sign(self.ed25519_sk, payload)
        sig_pq = pq_sign(self.pq_sk, payload) if self.pq_sk else b""

        hanko = HankoStamp(
            stamp_id=stamp_id,
            user_id=user_profile.user_id,
            device_root_id=device_root_id,
            date=date,
            daily_counter=daily_counter,
            base_hash=base_hash,
            daily_hash=daily_hash,
            svg_hash=svg_hash,
            context_hash=context_hash,
            algo_version=algo_version,
            sig_ed25519=sig_ed,
            sig_pq=sig_pq or None,
        )
        return hanko, svg

    def _derive_visual_params(self, base_hash: bytes, stamp_type: str) -> Dict[str, Any]:
        """
        Derive visual parameters from base_hash for future grid/wheel rendering
        """
        return {
            'stamp_type': stamp_type,
            'base_hash': base_hash,
        }

    @staticmethod
    def _b64url(data: bytes) -> str:
        return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")
