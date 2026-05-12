"""
CropSmart Backend — FastAPI application
"""
import os

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from api.predict import router as predict_router
from api.models_route import router as models_router
from services.model_loader import model_loader


def get_cors_origins() -> list[str]:
    """Read allowed frontend origins from CORS_ORIGINS, with local dev defaults."""
    raw_origins = os.getenv("CORS_ORIGINS")
    if raw_origins:
        return [
            origin.strip().rstrip("/")
            for origin in raw_origins.split(",")
            if origin.strip()
        ]

    return ["http://localhost:5173", "http://127.0.0.1:5173"]


app = FastAPI(
    title="CropSmart API",
    description="API dự đoán loại cây trồng dựa trên các thông số đất và khí hậu",
    version="1.0.0",
)

# CORS — cấu hình qua CORS_ORIGINS khi deploy Render/Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load best model khi startup
@app.on_event("startup")
async def startup_event():
    model_loader.load_all()
    print(f"✅ Đã load {len(model_loader.models)} model(s): {list(model_loader.models.keys())}")


app.include_router(predict_router, prefix="/api")
app.include_router(models_router, prefix="/api")


@app.get("/healthz")
def healthz():
    return {"status": "ok", "models_loaded": len(model_loader.models)}


@app.head("/healthz", include_in_schema=False)
def healthz_head():
    return Response(status_code=200)


@app.get("/")
def root():
    return {"message": "CropSmart API đang chạy!", "docs": "/docs"}
