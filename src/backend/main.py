"""
CropSmart Backend — FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.predict import router as predict_router
from api.models_route import router as models_router
from services.model_loader import model_loader

app = FastAPI(
    title="CropSmart API",
    description="API dự đoán loại cây trồng dựa trên các thông số đất và khí hậu",
    version="1.0.0",
)

# CORS — cho phép frontend dev server gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load tất cả models khi startup
@app.on_event("startup")
async def startup_event():
    model_loader.load_all()
    print(f"✅ Đã load {len(model_loader.models)} model(s): {list(model_loader.models.keys())}")


app.include_router(predict_router, prefix="/api")
app.include_router(models_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "CropSmart API đang chạy!", "docs": "/docs"}
