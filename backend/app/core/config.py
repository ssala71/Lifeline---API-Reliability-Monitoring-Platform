from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Lifeline API"
    environment: str = "development"
    frontend_url: str = "http://localhost:5173"
    database_url: str = (
        "postgresql+psycopg://lifeline:lifeline_password"
        "@localhost:5432/lifeline"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()