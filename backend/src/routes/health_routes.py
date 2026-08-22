from fastapi import APIRouter
from fastapi.responses import JSONResponse

from src.services.supabase_service import get_supabase_client

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/db-check")
def db_check():
    """Confirms the backend can reach the Supabase project and query a real table.

    Returns 200 with the row count on success. If the connection fails or the
    `profiles` table doesn't exist yet (schema not applied, wrong credentials, etc.),
    returns 503 with a clear message instead of raising an unhandled exception.
    """
    try:
        client = get_supabase_client()
        response = client.table("profiles").select("id", count="exact").limit(1).execute()
        return {
            "status": "ok",
            "table": "profiles",
            "rowCount": response.count,
        }
    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "message": f"Could not query Supabase (table 'profiles'): {exc}",
            },
        )
