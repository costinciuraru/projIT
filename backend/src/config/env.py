from functools import lru_cache
from typing import Any

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @model_validator(mode="before")
    @classmethod
    def _blank_env_values_fall_back_to_defaults(cls, data: Any) -> Any:
        # A variable left as `KEY=` in .env (no value) should behave as "not set",
        # not as an explicit empty string — otherwise int fields like `port` crash.
        if isinstance(data, dict):
            return {key: value for key, value in data.items() if value != ""}
        return data

    port: int = 4000
    frontend_origin: str = "http://localhost:5173"

    hf_api_key: str | None = None
    hf_tryon_space: str = "yisol/IDM-VTON"
    hf_tryon_endpoint_url: str | None = None

    supabase_url: str | None = None
    supabase_service_role_key: str | None = None

    # backend/.env has these as MODEL_NAME / API_KEY / AZURE_ENDPOINT (Azure AI Foundry
    # deployment of GPT-5 mini) instead of the generic OPENAI_* names from
    # backend_architecture.md — bound here via alias rather than renamed in .env.
    azure_openai_model: str = Field(default="gpt-5-mini", validation_alias="MODEL_NAME")
    azure_openai_api_key: str | None = Field(default=None, validation_alias="API_KEY")
    azure_openai_endpoint: str | None = Field(default=None, validation_alias="AZURE_ENDPOINT")


@lru_cache
def get_settings() -> Settings:
    return Settings()


def get_missing_config() -> list[str]:
    """Names of feature-gating config values that are still unset. Never includes
    the actual values — safe to print/log."""
    settings = get_settings()
    checks = {
        "HF_API_KEY or HF_TRYON_ENDPOINT_URL": bool(settings.hf_api_key or settings.hf_tryon_endpoint_url),
        "API_KEY (Azure OpenAI / GPT-5 mini)": bool(settings.azure_openai_api_key),
        "AZURE_ENDPOINT": bool(settings.azure_openai_endpoint),
        "SUPABASE_URL": bool(settings.supabase_url),
        "SUPABASE_SERVICE_ROLE_KEY": bool(settings.supabase_service_role_key),
    }
    return [name for name, is_set in checks.items() if not is_set]
