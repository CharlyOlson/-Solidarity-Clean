# hanko/verify.py
from typing import Optional, Any
from .crypto import sha3_512, sha3_256, ed25519_verify, pq_verify, const_eq
from .models import HankoStamp, DeviceProfile
from .svg_renderer import HankoSVGRenderer


class VerificationResult:
    """Result of hanko verification"""
    
    def __init__(self, ok: bool, reason: str = "", details: Optional[dict] = None):
        self.ok = ok
        self.reason = reason
        self.details = details or {}


def verify_hanko(
    hanko: HankoStamp,
    user_profile: Any,
    device_profile: DeviceProfile,
    date: str,
    timepass_key: bytes,
    context_payload: bytes,
    server_salt: bytes,
    ed25519_pk: bytes,
    pq_pk: bytes = b"",
    presence_score: float = 100.0,
) -> VerificationResult:
    """
    Verify a hanko stamp through cryptographic and context checks
    
    Steps:
    1. Device binding check
    2. Presence score check (optional)
    3. Recompute base_hash and SVG via counter window
    4. Context binding check
    5. Signature verification (Ed25519 + optional PQ)
    """
    
    # 1. Device binding
    if hanko.device_root_id != device_profile.device_root_id:
        return VerificationResult(False, "wrong_device")

    # 2. Presence score (optional check)
    if presence_score < 70.0:
        return VerificationResult(False, "insufficient_presence", {"score": presence_score})

    # 3. Recompute base_hash and SVG via counter window
    renderer = HankoSVGRenderer(size_px=512)
    base_found = None

    # Small window around stored daily_counter
    for delta in range(-3, 4):
        c = hanko.daily_counter + delta
        if c < 0:
            continue

        base_candidate = sha3_512(
            user_profile.user_id.bytes
            + device_profile.device_public_key
            + hanko.date.encode("ascii")
            + c.to_bytes(4, "big")
            + timepass_key
            + server_salt
        )
        daily_candidate = sha3_256(
            hanko.stamp_id.encode("ascii") + hanko.date.encode("ascii") + base_candidate
        )
        
        params = {'stamp_type': 'personal'}  # TODO: store stamp_type in HankoStamp
        svg_candidate = renderer.render(
            profile=user_profile,
            date=hanko.date,
            stamp_id=hanko.stamp_id,
            params=params,
            base_hash=base_candidate,
            daily_hash=daily_candidate,
            algo_version=hanko.algo_version,
        )
        
        if const_eq(sha3_256(svg_candidate.encode("utf-8")), hanko.svg_hash):
            base_found = base_candidate
            break

    if base_found is None:
        return VerificationResult(False, "svg_hash_mismatch")

    # 4. Context binding
    ctx_now = sha3_256(context_payload)
    if not const_eq(ctx_now, hanko.context_hash):
        return VerificationResult(False, "context_mismatch")

    # 5. Signature checks
    payload = (
        hanko.stamp_id.encode("ascii")
        + hanko.date.encode("ascii")
        + base_found
        + hanko.svg_hash
        + hanko.context_hash
    )

    if not ed25519_verify(ed25519_pk, payload, hanko.sig_ed25519):
        return VerificationResult(False, "ed25519_invalid")

    if hanko.sig_pq and pq_pk and not pq_verify(pq_pk, payload, hanko.sig_pq):
        return VerificationResult(False, "pq_invalid")

    return VerificationResult(True, "ok", details={"counter_used": c})
