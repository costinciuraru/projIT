from fastapi import APIRouter, Depends, HTTPException, Request

from src.controllers import tagging_controller
from src.middleware.auth_middleware import get_current_user
from src.middleware.rate_limiter import limiter
from src.models.schemas import CurrentUser, TaggingRequest, TaggingResponse

router = APIRouter(prefix="/api", tags=["tagging"])


@router.post("/tagging", response_model=TaggingResponse)
@limiter.limit("20/hour")
def suggest_tags(request: Request, payload: TaggingRequest, current_user: CurrentUser = Depends(get_current_user)):
    try:
        return tagging_controller.suggest_tags(payload.imageUrl, payload.descriptionHint)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Tagging failed: {exc}") from exc
