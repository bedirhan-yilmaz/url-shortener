import pytest
from pydantic import ValidationError
from models import ShortenRequest, ShortenResponse


# ---------------------------------------------------------------------------
# ShortenRequest
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("url", [
    "http://example.com",
    "https://example.com",
    "http://example.com/path?q=1",
    "https://sub.domain.org:8080/a/b/c",
])
def test_shorten_request_valid_urls(url):
    req = ShortenRequest(url=url)
    assert str(req.url).startswith(("http://", "https://"))


@pytest.mark.parametrize("url", [
    "ftp://example.com",
    "file:///etc/passwd",
    "mailto:user@example.com",
])
def test_shorten_request_rejects_non_http(url):
    with pytest.raises(ValidationError):
        ShortenRequest(url=url)


def test_shorten_request_rejects_plain_string():
    with pytest.raises(ValidationError):
        ShortenRequest(url="not-a-url")


def test_shorten_request_rejects_missing_field():
    with pytest.raises(ValidationError):
        ShortenRequest()


# ---------------------------------------------------------------------------
# ShortenResponse
# ---------------------------------------------------------------------------

def test_shorten_response_fields():
    resp = ShortenResponse(short_url="short/abc123", code="abc123")
    assert resp.short_url == "short/abc123"
    assert resp.code == "abc123"
