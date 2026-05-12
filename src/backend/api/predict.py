"""
API Router — POST /api/predict
Nhận thông số đất và trả về kết quả dự đoán từ best model.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.model_loader import BEST_MODEL_KEY, model_loader
from services.predictor import predict_with_models

router = APIRouter()


class PredictRequest(BaseModel):
    N: float = Field(..., ge=0, le=200, description="Hàm lượng Nitrogen (mg/kg)")
    P: float = Field(..., ge=0, le=200, description="Hàm lượng Phosphorus (mg/kg)")
    K: float = Field(..., ge=0, le=200, description="Hàm lượng Potassium (mg/kg)")
    temperature: float = Field(..., ge=0, le=50, description="Nhiệt độ (°C)")
    humidity: float = Field(..., ge=0, le=100, description="Độ ẩm (%)")
    ph: float = Field(..., ge=0, le=14, description="Độ pH của đất")
    rainfall: float = Field(..., ge=0, le=500, description="Lượng mưa (mm)")
    models: list[str] = Field(
        default_factory=lambda: ["best_model"],
        description="Giữ để tương thích client cũ; backend luôn dùng best_model",
    )


class ModelResult(BaseModel):
    model_key: str
    model_name: str
    crop: str
    confidence: float
    probabilities: dict[str, float]


class PredictResponse(BaseModel):
    results: list[ModelResult]
    consensus: str | None  # Cây được nhiều model đồng thuận nhất
    best_model: str | None  # Model key có confidence cao nhất


@router.post("/predict", response_model=PredictResponse, summary="Dự đoán loại cây trồng")
def predict(req: PredictRequest):
    """
    Nhận 7 thông số đất/khí hậu và trả về kết quả dự đoán từ best model.
    """
    if BEST_MODEL_KEY not in model_loader.models:
        raise HTTPException(status_code=503, detail="best_model chưa được load.")

    # Lấy display name
    key_to_name = {m["key"]: m["name"] for m in model_loader.available}

    # Chạy dự đoán
    raw_results = predict_with_models(
        N=req.N, P=req.P, K=req.K,
        temperature=req.temperature,
        humidity=req.humidity,
        ph=req.ph,
        rainfall=req.rainfall,
        selected_model_keys=[BEST_MODEL_KEY],
    )

    # Tính consensus (cây được gợi ý nhiều nhất)
    from collections import Counter
    crop_votes = Counter(r["crop"] for r in raw_results)
    consensus_crop = crop_votes.most_common(1)[0][0] if crop_votes else None

    # Model có confidence cao nhất
    best = max(raw_results, key=lambda r: r["confidence"]) if raw_results else None
    best_model_key = best["model_key"] if best else None

    # Build response
    results = [
        ModelResult(
            model_key=r["model_key"],
            model_name=key_to_name.get(r["model_key"], r["model_key"]),
            crop=r["crop"],
            confidence=r["confidence"],
            probabilities=r["probabilities"],
        )
        for r in raw_results
    ]

    return PredictResponse(
        results=results,
        consensus=consensus_crop,
        best_model=best_model_key,
    )
