"""
Model Loader — Load và cache best model từ saved_models/
"""
import sys
import joblib
from pathlib import Path

# Pickle serializes classes with their original module path (e.g. __main__).
# We must inject our transformer classes into sys.modules under those names
# BEFORE calling joblib.load(), so pickle's unpickler can find them.
import services.transformers as _transformers

# The notebook defined these in __main__, uvicorn runs under uvicorn.__main__
# Inject into both so pickle resolves correctly regardless of runtime
_mod_names = ["__main__", "uvicorn.__main__", "services.transformers"]
for _mod_name in _mod_names:
    if _mod_name not in sys.modules:
        sys.modules[_mod_name] = _transformers  # type: ignore
    else:
        # Patch the existing module object with our classes
        for _attr in ["ColumnSchemaEnforcer", "TypeCaster", "FeatureEngineer", "QuantileClipper"]:
            if not hasattr(sys.modules[_mod_name], _attr):
                setattr(sys.modules[_mod_name], _attr, getattr(_transformers, _attr))


# Đường dẫn đến thư mục saved_models (tính từ gốc project)
MODELS_DIR = Path(__file__).resolve().parents[3] / "saved_models"

BEST_MODEL_KEY = "best_model"
BEST_MODEL_DISPLAY_NAME = "Best Model"


class ModelLoader:
    """Singleton chứa tất cả models đã load."""

    def __init__(self):
        self.models: dict = {}          # key: model_key, value: sklearn model
        self.preprocessor = None       # sklearn ColumnTransformer / Pipeline
        self.label_encoder = None      # sklearn LabelEncoder
        self.available: list[dict] = []  # danh sách metadata trả cho frontend

    def load_all(self):
        """Load preprocessor, label encoder và best_model.pkl."""
        self.models.clear()
        self.available.clear()

        # Load preprocessor
        preprocessor_path = MODELS_DIR / "preprocessor.pkl"
        if preprocessor_path.exists():
            self.preprocessor = joblib.load(preprocessor_path)
            print(f"  📦 Loaded preprocessor")
        else:
            print(f"  ⚠️  Không tìm thấy preprocessor.pkl")

        # Load label encoder
        label_enc_path = MODELS_DIR / "label_encoder.pkl"
        if label_enc_path.exists():
            self.label_encoder = joblib.load(label_enc_path)
            print(f"  📦 Loaded label_encoder ({len(self.label_encoder.classes_)} classes)")
        else:
            print(f"  ⚠️  Không tìm thấy label_encoder.pkl")

        # Load best model only
        best_model_path = MODELS_DIR / "best_model.pkl"
        if best_model_path.exists():
            self.models[BEST_MODEL_KEY] = joblib.load(best_model_path)
            self.available.append({"key": BEST_MODEL_KEY, "name": BEST_MODEL_DISPLAY_NAME})
            print(f"  📦 Loaded {BEST_MODEL_DISPLAY_NAME} ({best_model_path.name})")
        else:
            print(f"  ⚠️  Không tìm thấy best_model.pkl")


# Singleton instance — import từ đây ở các file khác
model_loader = ModelLoader()
