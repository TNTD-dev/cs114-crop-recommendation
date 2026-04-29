"""
API Router — POST /api/predict
Nhận thông số đất + danh sách model, trả về kết quả dự đoán so sánh.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.model_loader import model_loader
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
        default_factory=lambda: ["naive_bayes", "knn", "logistic_regression", "random_forest", "svm"],
        description="Danh sách model key cần dự đoán",
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
    Nhận 7 thông số đất/khí hậu + danh sách model muốn dùng.
    Trả về kết quả dự đoán của từng model và thống kê tổng hợp.
    """
    # Validate model keys
    available_keys = {m["key"] for m in model_loader.available}
    invalid = [k for k in req.models if k not in available_keys]
    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"Model(s) không hợp lệ: {invalid}. Có thể dùng: {list(available_keys)}"
        )

    if not req.models:
        raise HTTPException(status_code=400, detail="Phải chọn ít nhất 1 model.")

    # Lấy display name
    key_to_name = {m["key"]: m["name"] for m in model_loader.available}

    # Chạy dự đoán
    raw_results = predict_with_models(
        N=req.N, P=req.P, K=req.K,
        temperature=req.temperature,
        humidity=req.humidity,
        ph=req.ph,
        rainfall=req.rainfall,
        selected_model_keys=req.models,
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
