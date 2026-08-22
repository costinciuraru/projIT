from functools import lru_cache

from supabase import Client, create_client

from src.config.env import get_settings


@lru_cache
def get_supabase_client() -> Client:
    """Server-side Supabase client, using the service role key (bypasses RLS).

    Never expose this client or its key to the frontend — it's for backend use only.
    """
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env"
        )
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_ai_credits(user_id: str) -> int:
    """Reads the current `profiles.ai_credits` for a user. Returns 0 if the profile
    (or the column, on a schema that hasn't been migrated yet) can't be read."""
    try:
        response = (
            get_supabase_client().table("profiles").select("ai_credits").eq("id", user_id).single().execute()
        )
    except Exception:
        return 0
    return (response.data or {}).get("ai_credits", 0)


def decrement_ai_credits(user_id: str, amount: int = 1) -> int:
    """Decrements `profiles.ai_credits` by `amount` (never below 0) and returns the new value.

    Not atomic (read-then-write) — fine for the current traffic level, but a concurrent
    request for the same user could under-count. Revisit with a Postgres RPC if that
    ever matters.
    """
    current = get_ai_credits(user_id)
    new_value = max(current - amount, 0)
    get_supabase_client().table("profiles").update({"ai_credits": new_value}).eq("id", user_id).execute()
    return new_value
