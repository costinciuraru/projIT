import json

from openai import OpenAI

from src.config.env import get_settings

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        settings = get_settings()
        if not settings.azure_openai_api_key:
            raise RuntimeError("Missing API_KEY (Azure OpenAI / GPT-5 mini) in backend/.env")
        # The Azure AI Foundry endpoint in backend/.env is an OpenAI-compatible /openai/v1
        # base URL, so the standard `openai` SDK works unmodified via `base_url=`.
        _client = OpenAI(api_key=settings.azure_openai_api_key, base_url=settings.azure_openai_endpoint)
    return _client


def chat_json(messages: list[dict], *, max_tokens: int = 2000) -> dict:
    """Sends a chat completion request expecting a JSON object back, and parses it.

    gpt-5-mini is a reasoning model — part of `max_completion_tokens` is spent on
    hidden reasoning tokens before any visible content is emitted, so this needs a
    higher budget than a plain chat model or the response can come back empty.
    """
    settings = get_settings()
    client = _get_client()

    response = client.chat.completions.create(
        model=settings.azure_openai_model,
        messages=messages,
        response_format={"type": "json_object"},
        max_completion_tokens=max_tokens,
    )
    content = response.choices[0].message.content
    if not content:
        finish_reason = response.choices[0].finish_reason
        raise RuntimeError(
            f"OpenAI returned no content (finish_reason={finish_reason!r}); "
            "try increasing max_completion_tokens."
        )
    return json.loads(content)
