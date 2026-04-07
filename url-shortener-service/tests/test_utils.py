import string
from utils import generate_code, CODE_LENGTH


def test_generate_code_length():
    assert len(generate_code()) == CODE_LENGTH


def test_generate_code_charset():
    allowed = set(string.ascii_letters + string.digits)
    for _ in range(50):
        code = generate_code()
        assert set(code).issubset(allowed), f"Unexpected chars in code: {code}"


def test_generate_code_varies():
    codes = {generate_code() for _ in range(20)}
    # With 62^6 possible codes the probability of 20 identical results is negligible
    assert len(codes) > 1
