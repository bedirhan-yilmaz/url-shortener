from pydantic import BaseModel, AnyHttpUrl, field_validator


class ShortenRequest(BaseModel):
    url: AnyHttpUrl

    @field_validator("url")
    @classmethod
    def require_http_or_https(cls, v: AnyHttpUrl) -> AnyHttpUrl:
        if v.scheme not in ("http", "https"):
            raise ValueError("Only http and https URLs are accepted")
        return v


class ShortenResponse(BaseModel):
    short_url: str
    code: str
