import secrets
import string

_ALPHABET = string.ascii_letters + string.digits
CODE_LENGTH = 6


def generate_code() -> str:
    return "".join(secrets.choice(_ALPHABET) for _ in range(CODE_LENGTH))
