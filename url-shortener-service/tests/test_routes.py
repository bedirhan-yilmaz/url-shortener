"""
Route-level unit tests for routes/shortener.py.

The database pool is mocked throughout so no real Postgres instance is needed.
"""
import pytest
import asyncpg
from unittest.mock import AsyncMock, MagicMock, patch
from httpx import AsyncClient, ASGITransport

import database
from main import app


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_pool(fetchrow_return=None, execute_side_effect=None):
    """Return a mock asyncpg pool whose context manager yields a mock conn."""
    conn = AsyncMock()
    conn.fetchrow = AsyncMock(return_value=fetchrow_return)
    if execute_side_effect:
        conn.execute = AsyncMock(side_effect=execute_side_effect)
    else:
        conn.execute = AsyncMock(return_value=None)

    pool = MagicMock()
    pool.acquire.return_value.__aenter__ = AsyncMock(return_value=conn)
    pool.acquire.return_value.__aexit__ = AsyncMock(return_value=False)
    return pool, conn


@pytest.fixture
def mock_pool(monkeypatch):
    """Patch database._pool with a fresh mock pool; yield (pool, conn)."""
    pool, conn = _make_pool()
    monkeypatch.setattr(database, "_pool", pool)
    return pool, conn


# ---------------------------------------------------------------------------
# POST /api/shorten
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_shorten_url_success(mock_pool):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/shorten", json={"url": "https://example.com"}
        )

    assert response.status_code == 201
    data = response.json()
    assert "code" in data
    assert data["short_url"] == f"short/{data['code']}"
    assert len(data["code"]) == 6
    assert data["code"].isalnum()


@pytest.mark.asyncio
async def test_shorten_url_retries_on_collision(monkeypatch):
    """UniqueViolationError on first 4 attempts succeeds on the 5th."""
    pool, conn = _make_pool()
    # Raise UniqueViolationError 4 times, then succeed
    conn.execute = AsyncMock(
        side_effect=[
            asyncpg.UniqueViolationError("duplicate"),
            asyncpg.UniqueViolationError("duplicate"),
            asyncpg.UniqueViolationError("duplicate"),
            asyncpg.UniqueViolationError("duplicate"),
            None,
        ]
    )
    monkeypatch.setattr(database, "_pool", pool)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/shorten", json={"url": "https://example.com"}
        )

    assert response.status_code == 201


@pytest.mark.asyncio
async def test_shorten_url_503_after_max_retries(monkeypatch):
    """Exhausting all 5 retries returns 503."""
    pool, conn = _make_pool(
        execute_side_effect=asyncpg.UniqueViolationError("duplicate")
    )
    monkeypatch.setattr(database, "_pool", pool)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/shorten", json={"url": "https://example.com"}
        )

    assert response.status_code == 503
    assert "unique short code" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_shorten_url_rejects_invalid_body(mock_pool):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/api/shorten", json={"url": "not-a-url"})

    assert response.status_code == 422


# ---------------------------------------------------------------------------
# GET /short/{code}
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_redirect_valid_code(monkeypatch):
    pool, conn = _make_pool(fetchrow_return={"long_url": "https://example.com"})
    monkeypatch.setattr(database, "_pool", pool)

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
        follow_redirects=False,
    ) as client:
        response = await client.get("/short/abc123")

    assert response.status_code == 307
    assert response.headers["location"] == "https://example.com"


@pytest.mark.asyncio
async def test_redirect_404_for_unknown_code(monkeypatch):
    pool, conn = _make_pool(fetchrow_return=None)
    monkeypatch.setattr(database, "_pool", pool)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/short/zzz999")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.parametrize("bad_code", [
    "abc12",        # too short (5 chars)
    "abc1234",      # too long  (7 chars)
    "abc!23",       # non-alnum character
    "abc 23",       # space
])
@pytest.mark.asyncio
async def test_redirect_400_for_invalid_code_format(mock_pool, bad_code):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(f"/short/{bad_code}")

    assert response.status_code == 400
    assert "invalid code" in response.json()["detail"].lower()
