import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from src.config.env import get_missing_config, get_settings
from src.middleware.rate_limiter import limiter
from src.routes.health_routes import router as health_router
from src.routes.recommendations_routes import router as recommendations_router
from src.routes.tagging_routes import router as tagging_router
from src.routes.tryon_routes import router as tryon_router

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    missing = get_missing_config()
    if missing:
        print("⚠  backend/.env: missing values for: " + ", ".join(missing), file=sys.stderr, flush=True)
        print(
            "   Server is starting anyway — the features that depend on them will fail until set.",
            file=sys.stderr,
            flush=True,
        )
    yield


app = FastAPI(title="DressCode Backend", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(tryon_router)
app.include_router(recommendations_router)
app.include_router(tagging_router)


@app.get("/health")
def health():
    return {"status": "ok"}
