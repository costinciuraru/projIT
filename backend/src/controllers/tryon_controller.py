from src.services import huggingface_service, supabase_service

MIN_CREDITS_REQUIRED = 1


def create_session(
    user_id: str,
    user_photo_url: str,
    garment_image_url: str,
    garment_item_id: str | None = None,
) -> dict:
    supabase = supabase_service.get_supabase_client()

    profile = supabase.table("profiles").select("ai_credits").eq("id", user_id).single().execute()
    credits = (profile.data or {}).get("ai_credits", 0)
    if credits < MIN_CREDITS_REQUIRED:
        raise ValueError("Not enough AI credits to start a try-on session.")

    inserted = (
        supabase.table("tryon_sessions")
        .insert(
            {
                "user_id": user_id,
                "user_photo_url": user_photo_url,
                "garment_image_url": garment_image_url,
                "garment_item_id": garment_item_id,
                "status": "processing",
            }
        )
        .execute()
    )
    session = inserted.data[0]
    return {"sessionId": session["id"], "status": session["status"]}


def run_and_update(
    session_id: str,
    user_id: str,
    user_photo_url: str,
    garment_image_url: str,
    garment_description: str,
) -> None:
    """Runs in the background (see routes/tryon_routes.py) so the initial request
    doesn't block for the 5-30s the model call can take."""
    supabase = supabase_service.get_supabase_client()

    try:
        result_image_url = huggingface_service.run_virtual_tryon(
            user_photo_url, garment_image_url, garment_description
        )

        supabase.table("tryon_sessions").update(
            {"status": "done", "result_image_url": result_image_url, "credits_used": 1}
        ).eq("id", session_id).execute()

        profile = (
            supabase.table("profiles").select("ai_credits").eq("id", user_id).single().execute()
        )
        current_credits = (profile.data or {}).get("ai_credits", 0)
        supabase.table("profiles").update(
            {"ai_credits": max(current_credits - 1, 0)}
        ).eq("id", user_id).execute()
    except Exception:
        supabase.table("tryon_sessions").update({"status": "failed"}).eq("id", session_id).execute()


def get_session(session_id: str) -> dict | None:
    response = (
        supabase_service.get_supabase_client()
        .table("tryon_sessions")
        .select("id, status, result_image_url, credits_used")
        .eq("id", session_id)
        .single()
        .execute()
    )
    return response.data
