from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request

from src.controllers import tryon_controller
from src.middleware.auth_middleware import get_current_user
from src.middleware.rate_limiter import limiter
from src.models.schemas import CurrentUser, TryOnRequest, TryOnResponse, TryOnStatusResponse

router = APIRouter(prefix="/api/tryon", tags=["try-on"])


@router.post("", status_code=202, response_model=TryOnResponse)
@limiter.limit("20/hour")
def create_tryon_session(
    request: Request,
    payload: TryOnRequest,
    background_tasks: BackgroundTasks,
    current_user: CurrentUser = Depends(get_current_user),
):
    try:
        session = tryon_controller.create_session(
            user_id=current_user.id,
            user_photo_url=payload.userPhotoUrl,
            garment_item_id=payload.garmentItemId,
            garment_image_url=payload.garmentImageUrl,
        )
    except ValueError as exc:
        raise HTTPException(status_code=402, detail=str(exc)) from exc

    background_tasks.add_task(
        tryon_controller.run_and_update,
        session["sessionId"],
        current_user.id,
        payload.userPhotoUrl,
        session["garmentImageUrl"],
        payload.garmentDescription,
    )
    return {"sessionId": session["sessionId"], "status": session["status"]}


@router.get("/{session_id}", response_model=TryOnStatusResponse)
def get_tryon_session(session_id: str, current_user: CurrentUser = Depends(get_current_user)):
    session = tryon_controller.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Try-on session not found.")

    return {
        "sessionId": session["id"],
        "status": session["status"],
        "resultImageUrl": session.get("result_image_url"),
        "creditsUsed": session.get("credits_used"),
    }
