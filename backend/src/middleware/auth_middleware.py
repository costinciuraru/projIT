from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.models.schemas import CurrentUser
from src.services.supabase_service import get_supabase_client

# auto_error=False so a missing header raises our own 401 (with a clear message)
# instead of FastAPI's default 403 for this scheme.
_bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> CurrentUser:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Missing Authorization: Bearer <token> header.")

    token = credentials.credentials
    supabase = get_supabase_client()

    try:
        auth_response = supabase.auth.get_user(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token.") from exc

    user = getattr(auth_response, "user", None)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    account_type = (user.user_metadata or {}).get("account_type")
    if not account_type:
        # The applied schema (supabase/migrations/0001_init_schema.sql) doesn't have an
        # account_type column on `profiles` yet — fall back to "user" instead of failing.
        try:
            profile = (
                supabase.table("profiles").select("account_type").eq("id", user.id).single().execute()
            )
            account_type = (profile.data or {}).get("account_type")
        except Exception:
            account_type = None

    return CurrentUser(id=user.id, account_type=account_type or "user")
