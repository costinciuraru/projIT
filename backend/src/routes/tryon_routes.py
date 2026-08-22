from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

from src.controllers import tryon_controller

router = APIRouter(prefix="/api/tryon", tags=["try-on"])


class TryOnRequest(BaseModel):
    # TODO: once auth_middleware.py verifies the Supabase JWT, take userId from
    # the verified token instead of trusting it from the request body.
    userId: str
    userPhotoUrl: str
    garmentImageUrl: str
    garmentItemId: str | None = None
    garmentDescription: str = ""


@router.post("", status_code=202)
def create_tryon_session(payload: TryOnRequest, background_tasks: BackgroundTasks):
    try:
        session = tryon_controller.create_session(
            user_id=payload.userId,
            user_photo_url=payload.userPhotoUrl,
            garment_image_url=payload.garmentImageUrl,
            garment_item_id=payload.garmentItemId,
        )
    except ValueError as exc:
        raise HTTPException(status_code=402, detail=str(exc)) from exc

    background_tasks.add_task(
        tryon_controller.run_and_update,
        session["sessionId"],
        payload.userId,
        payload.userPhotoUrl,
        payload.garmentImageUrl,
        payload.garmentDescription,
    )
    return session


@router.get("/{session_id}")
def get_tryon_session(session_id: str):
    session = tryon_controller.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Try-on session not found.")

    return {
        "sessionId": session["id"],
        "status": session["status"],
        "resultImageUrl": session.get("result_image_url"),
        "creditsUsed": session.get("credits_used"),
    }
