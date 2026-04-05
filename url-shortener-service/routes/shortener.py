from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
import asyncpg

from database import get_pool
from models import ShortenRequest, ShortenResponse
from utils import generate_code

router = APIRouter()

_MAX_RETRIES = 5


@router.post("/api/shorten", response_model=ShortenResponse, status_code=201)
async def shorten_url(body: ShortenRequest) -> ShortenResponse:
    pool = get_pool()
    long_url = str(body.url)

    for _ in range(_MAX_RETRIES):
        code = generate_code()
        try:
            async with pool.acquire() as conn:
                await conn.execute(
                    "INSERT INTO urls (code, long_url) VALUES ($1, $2)",
                    code,
                    long_url,
                )
            return ShortenResponse(short_url=f"short/{code}", code=code)
        except asyncpg.UniqueViolationError:
            continue

    raise HTTPException(
        status_code=503,
        detail="Could not generate a unique short code. Please retry.",
    )


@router.get("/short/{code}", status_code=307)
async def redirect(code: str) -> RedirectResponse:
    if len(code) != 6 or not code.isalnum():
        raise HTTPException(status_code=400, detail="Invalid code format")

    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT long_url FROM urls WHERE code = $1", code
        )

    if row is None:
        raise HTTPException(status_code=404, detail="Short URL not found")

    return RedirectResponse(url=row["long_url"], status_code=307)
