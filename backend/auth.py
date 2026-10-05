"""Password hashing and session tokens for Campus Customs.

Passwords are never stored in plain text. We hash them with PBKDF2-HMAC-SHA256,
a slow, salted algorithm built for passwords, using a fresh random salt per user.
The stored string is self-describing:

    pbkdf2_sha256$<iterations>$<salt_hex>$<hash_hex>

The login verifier also accepts the pre-existing 3-part fixtures
(pbkdf2_sha256$<salt>$<hash>, with no iteration count encoded).
"""

import hashlib
import hmac
import json
import os
import secrets
import time
from base64 import urlsafe_b64decode, urlsafe_b64encode
from pathlib import Path

from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv(usecwd=True))

ALGORITHM = "pbkdf2_sha256"
ITERATIONS = 390_000  # deliberately slow, so guessing stolen hashes is expensive
SALT_BYTES = 16
# Legacy fixtures store no iteration count; this was the course default when they were made.
LEGACY_ITERATIONS = 390_000

# Signing key for session tokens. Loaded from the environment, or generated and
# persisted locally so logins survive a backend restart. Never commit this file.
_SECRET_PATH = Path(__file__).resolve().parent / ".session_secret"


def _load_secret() -> bytes:
    env = os.environ.get("SESSION_SECRET")
    if env:
        return env.encode()
    if _SECRET_PATH.exists():
        return _SECRET_PATH.read_text().strip().encode()
    generated = secrets.token_hex(32)
    _SECRET_PATH.write_text(generated)
    return generated.encode()


_SECRET = _load_secret()
TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60  # one week


# ---------- Password hashing ----------

def hash_password(password: str) -> str:
    salt = secrets.token_hex(SALT_BYTES)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), ITERATIONS).hex()
    return f"{ALGORITHM}${ITERATIONS}${salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    try:
        parts = stored.split("$")
        if len(parts) == 4:
            _, iterations, salt, digest = parts
            iterations = int(iterations)
        elif len(parts) == 3:  # legacy fixture, no iteration count stored
            _, salt, digest = parts
            iterations = LEGACY_ITERATIONS
        else:
            return False
    except (ValueError, AttributeError):
        return False
    computed = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), iterations).hex()
    # Constant-time compare so timing can't reveal how much of the hash matched.
    return hmac.compare_digest(computed, digest)


# ---------- Session tokens (signed, stateless) ----------

def _b64(raw: bytes) -> str:
    return urlsafe_b64encode(raw).decode().rstrip("=")


def _unb64(text: str) -> bytes:
    return urlsafe_b64decode(text + "=" * (-len(text) % 4))


def create_token(user_id: int) -> str:
    payload = json.dumps({"uid": user_id, "exp": int(time.time()) + TOKEN_TTL_SECONDS})
    body = _b64(payload.encode())
    signature = _b64(hmac.new(_SECRET, body.encode(), hashlib.sha256).digest())
    return f"{body}.{signature}"


def verify_token(token: str) -> int | None:
    """Return the user id if the token is valid and unexpired, else None."""
    try:
        body, signature = token.split(".")
    except (ValueError, AttributeError):
        return None
    expected = _b64(hmac.new(_SECRET, body.encode(), hashlib.sha256).digest())
    if not hmac.compare_digest(signature, expected):  # tampered or wrong key
        return None
    try:
        data = json.loads(_unb64(body))
    except (ValueError, json.JSONDecodeError):
        return None
    if data.get("exp", 0) < time.time():
        return None
    return data.get("uid")
