from fastapi import APIRouter, Depends, HTTPException, Request

from src.controllers import recommendations_controller
from src.middleware.auth_middleware import get_current_user
from src.middleware.rate_limiter import limiter
from src.models.schemas import CurrentUser, RecommendationsRequest, RecommendationsResponse

router = APIRouter(prefix="/api", tags=["recommendations"])


@router.post("/recommendations", response_model=RecommendationsResponse)
@limiter.limit("20/hour")
def get_recommendations(
    request: Request,
    payload: RecommendationsRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    try:
        recommendations = recommendations_controller.get_recommendations(
            mood=payload.mood,
            occasion=payload.occasion,
            budget_min=payload.budgetMin,
            budget_max=payload.budgetMax,
            style=payload.style,
        )
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Recommendations failed: {exc}") from exc

    return {"recommendations": recommendations}
