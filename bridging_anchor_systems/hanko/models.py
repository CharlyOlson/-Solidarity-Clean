# hanko/models.py
from dataclasses import dataclass
from typing import List, Optional
from uuid import UUID
from datetime import datetime


@dataclass
class DeviceVersion:
    version_id: str
    first_seen: datetime
    last_seen: datetime
    fingerprint_hash: bytes
    evidence_log_refs: List[str]


@dataclass
class DeviceProfile:
    device_root_id: str
    device_public_key: bytes
    device_fingerprint_hash: bytes
    behavior_baseline_id: str
    versions: List[DeviceVersion]


@dataclass
class UserProfile:
    user_id: UUID
    legal_record_ref: str
    primary_device_root_id: str
    visual_profile_id: Optional[str] = None


@dataclass
class HankoStamp:
    stamp_id: str
    user_id: UUID
    device_root_id: str
    date: str
    daily_counter: int
    base_hash: bytes
    daily_hash: bytes
    svg_hash: bytes
    context_hash: bytes
    algo_version: str
    sig_ed25519: bytes
    sig_pq: Optional[bytes] = None


@dataclass
class PresenceScore:
    session_id: str
    device_root_id: str
    score: float
    last_update: datetime
