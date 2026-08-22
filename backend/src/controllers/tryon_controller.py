from src.services import huggingface_service, supabase_service

MIN_CREDITS_REQUIRED = 1


def _resolve_garment_image_url(
    supabase, garment_item_id: str | None, garment_image_url: str | None
) -> str:
    if garment_image_url:
        return garment_image_url

    item = (
        supabase.table("garment_items")
        .select("image_url")
        .eq("id", garment_item_id)
        .single()
        .execute()
    )
    if not item.data:
        raise ValueError(f"garmentItemId '{garment_item_id}' not found.")
    return item.data["image_url"]


def create_session(
    user_id: str,
    user_photo_url: str,
    garment_item_id: str | None = None,
    garment_image_url: str | None = None,
) -> dict:
    supabase = supabase_service.get_supabase_client()

    if supabase_service.get_ai_credits(user_id) < MIN_CREDITS_REQUIRED:
        raise ValueError("Not enough AI credits to start a try-on session.")

    resolved_garment_image_url = _resolve_garment_image_url(supabase, garment_item_id, garment_image_url)

    inserted = (
        supabase.table("tryon_sessions")
        .insert(
            {
                "user_id": user_id,
                "user_photo_url": user_photo_url,
                "garment_image_url": resolved_garment_image_url,
                "garment_item_id": garment_item_id,
                "status": "processing",
            }
        )
        .execute()
    )
    session = inserted.data[0]
    return {"sessionId": session["id"], "status": session["status"], "garmentImageUrl": resolved_garment_image_url}


async def run_and_update(
    session_id: str,
    user_id: str,
    user_photo_url: str,
    garment_image_url: str,
    garment_description: str,
) -> None:
    """Runs in the background (see routes/tryon_routes.py) so the initial request
    doesn't block for the 5-30s+ the model call can take."""
    supabase = supabase_service.get_supabase_client()

    try:
        result_image_url = await huggingface_service.run_virtual_tryon(
            user_photo_url, garment_image_url, garment_description
        )

        supabase.table("tryon_sessions").update(
            {"status": "done", "result_image_url": result_image_url, "credits_used": 1}
        ).eq("id", session_id).execute()

        # Only spend a credit once the session actually succeeds — a failed generation
        # (bad image, HF/ZeroGPU error, etc.) shouldn't cost the user anything.
        supabase_service.decrement_ai_credits(user_id, amount=1)
    except Exception:
        supabase.table("tryon_sessions").update({"status": "failed"}).eq("id", session_id).execute()


def get_session(session_id: str) -> dict | None:
    try:
        response = (
            supabase_service.get_supabase_client()
            .table("tryon_sessions")
            .select("id, status, result_image_url, credits_used")
            .eq("id", session_id)
            .single()
            .execute()
        )
    except Exception:
        # .single() raises when no row matches (or the id is malformed) — treat that
        # as "not found" rather than a 500.
        return None
    return response.data
