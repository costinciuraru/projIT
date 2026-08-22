from typing import Literal

from pydantic import BaseModel, model_validator


class TryOnRequest(BaseModel):
    userPhotoUrl: str
    garmentItemId: str | None = None
    garmentImageUrl: str | None = None
    garmentDescription: str = ""

    @model_validator(mode="after")
    def _require_garment_reference(self) -> "TryOnRequest":
        if not self.garmentItemId and not self.garmentImageUrl:
            raise ValueError("Provide either garmentItemId or garmentImageUrl.")
        return self


class TryOnResponse(BaseModel):
    sessionId: str
    status: Literal["processing"]


class TryOnStatusResponse(BaseModel):
    sessionId: str
    status: Literal["processing", "done", "failed"]
    resultImageUrl: str | None = None
    creditsUsed: int | None = None
