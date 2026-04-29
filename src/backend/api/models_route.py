"""
API Router — GET /api/models
Trả về danh sách các model khả dụng trong hệ thống.
"""
from fastapi import APIRouter
from services.model_loader import model_loader

router = APIRouter()


@router.get("/models", summary="Lấy danh sách ML models khả dụng")
def get_available_models():
    """
    Trả về danh sách models đã được load thành công khi startup.
    """
    return {
        "models": model_loader.available,
        "count": len(model_loader.available),
    }
