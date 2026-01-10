# hanko/crypto.py
import hashlib
import hmac
from typing import ByteString


def sha3_512(data: ByteString) -> bytes:
    return hashlib.sha3_512(data).digest()


def sha3_256(data: ByteString) -> bytes:
    return hashlib.sha3_256(data).digest()


def const_eq(a: bytes, b: bytes) -> bool:
    return hmac.compare_digest(a, b)


# === Ed25519 wrappers ===

def ed25519_sign(sk: bytes, msg: bytes) -> bytes:
    """
    Ed25519 signing using cryptography library
    """
    try:
        from cryptography.hazmat.primitives.asymmetric import ed25519
        key = ed25519.Ed25519PrivateKey.from_private_bytes(sk)
        return key.sign(msg)
    except ImportError:
        raise NotImplementedError("Install: pip install cryptography")


def ed25519_verify(pk: bytes, msg: bytes, sig: bytes) -> bool:
    """
    Ed25519 verification using cryptography library
    """
    try:
        from cryptography.hazmat.primitives.asymmetric import ed25519
        key = ed25519.Ed25519PublicKey.from_public_bytes(pk)
        key.verify(sig, msg)
        return True
    except Exception:
        return False


# === PQ signature placeholders ===

def pq_sign(sk: bytes, msg: bytes) -> bytes:
    """
    TODO: integrate SPHINCS+ or XMSS implementation.
    For now, returns empty bytes as PQ is optional.
    """
    return b""


def pq_verify(pk: bytes, msg: bytes, sig: bytes) -> bool:
    """
    TODO: integrate PQ verification here.
    For now, returns True if sig is empty (not used).
    """
    return len(sig) == 0
