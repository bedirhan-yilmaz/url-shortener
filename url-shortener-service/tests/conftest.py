"""
conftest.py — shared pytest configuration.

Patches database.init_db and database.close_db so the FastAPI lifespan
does not attempt a real Postgres connection during tests.
"""
import pytest
from unittest.mock import AsyncMock, patch


@pytest.fixture(autouse=True)
def patch_lifespan_db():
    """Replace init_db / close_db with no-ops for every test."""
    with (
        patch("main.init_db", new=AsyncMock()),
        patch("main.close_db", new=AsyncMock()),
    ):
        yield
